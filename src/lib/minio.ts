/**
 * MinIO S3-Compatible Object Storage Client (AWS Signature V4)
 * Zero external native dependencies — built on Node crypto & Web Fetch API.
 */

import crypto from "crypto";
import env from "@/config/env";

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: Buffer | string): string {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function getSigningKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service = "s3"
): Buffer {
  const kDate = hmacSha256(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

function formatAmzDate(date = new Date()): { amzDate: string; dateStamp: string } {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate: iso,
    dateStamp: iso.slice(0, 8),
  };
}

function encodeS3URI(pathStr: string): string {
  return pathStr
    .split("/")
    .map((segment) =>
      encodeURIComponent(segment).replace(/[!'()*]/g, (c) =>
        `%${c.charCodeAt(0).toString(16).toUpperCase()}`
      )
    )
    .join("/");
}

export class MinioClient {
  private readonly endpoint: string;
  private readonly port: number;
  private readonly useSSL: boolean;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly region: string;
  public readonly defaultBucket: string;

  constructor() {
    this.endpoint = env.minio.endpoint;
    this.port = env.minio.port;
    this.useSSL = env.minio.useSSL;
    this.accessKey = env.minio.accessKey;
    this.secretKey = env.minio.secretKey;
    this.region = env.minio.region;
    this.defaultBucket = env.minio.bucket;
  }

  public getBaseOrigin(): string {
    const protocol = this.useSSL ? "https" : "http";
    const isStandardPort =
      (this.useSSL && this.port === 443) || (!this.useSSL && this.port === 80);
    return isStandardPort
      ? `${protocol}://${this.endpoint}`
      : `${protocol}://${this.endpoint}:${this.port}`;
  }

  public getHostHeader(): string {
    const isStandardPort =
      (this.useSSL && this.port === 443) || (!this.useSSL && this.port === 80);
    return isStandardPort ? this.endpoint : `${this.endpoint}:${this.port}`;
  }

  private signRequest(
    method: string,
    canonicalUri: string,
    queryString: string,
    payloadHash: string,
    extraHeaders: Record<string, string> = {}
  ): Record<string, string> {
    const { amzDate, dateStamp } = formatAmzDate();
    const host = this.getHostHeader();

    const headers: Record<string, string> = {
      host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
      ...extraHeaders,
    };

    const sortedHeaderKeys = Object.keys(headers)
      .map((k) => k.toLowerCase())
      .sort();

    const canonicalHeaders = sortedHeaderKeys
      .map((k) => `${k}:${headers[k].trim()}\n`)
      .join("");
    const signedHeaders = sortedHeaderKeys.join(";");

    const canonicalRequest = [
      method.toUpperCase(),
      canonicalUri,
      queryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;
    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = getSigningKey(this.secretKey, dateStamp, this.region, "s3");
    const signature = crypto
      .createHmac("sha256", signingKey)
      .update(stringToSign, "utf8")
      .digest("hex");

    return {
      ...headers,
      Authorization: `AWS4-HMAC-SHA256 Credential=${this.accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    };
  }

  public async ensureBucket(bucket = this.defaultBucket): Promise<boolean> {
    const uri = encodeS3URI(`/${bucket}`);
    const payloadHash = sha256Hex("");
    const headHeaders = this.signRequest("HEAD", uri, "", payloadHash);

    const headRes = await fetch(`${this.getBaseOrigin()}${uri}`, {
      method: "HEAD",
      headers: headHeaders,
      signal: AbortSignal.timeout(3000),
    });

    if (headRes.ok) return true;

    if (headRes.status === 404) {
      const putHeaders = this.signRequest("PUT", uri, "", payloadHash);
      const putRes = await fetch(`${this.getBaseOrigin()}${uri}`, {
        method: "PUT",
        headers: putHeaders,
        signal: AbortSignal.timeout(3000),
      });
      return putRes.ok || putRes.status === 409;
    }

    return false;
  }

  public async putObject(
    key: string,
    buffer: Buffer,
    contentType = "application/octet-stream",
    bucket = this.defaultBucket
  ): Promise<{ etag: string | null; key: string; bucket: string }> {
    const cleanKey = key.replace(/^\/+/, "");
    const uri = encodeS3URI(`/${bucket}/${cleanKey}`);
    const payloadHash = sha256Hex(buffer);

    const headers = this.signRequest("PUT", uri, "", payloadHash, {
      "content-type": contentType,
      "content-length": String(buffer.byteLength),
    });

    const response = await fetch(`${this.getBaseOrigin()}${uri}`, {
      method: "PUT",
      headers,
      body: new Uint8Array(buffer),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => response.statusText);
      throw new Error(`MinIO PUT failed (${response.status}): ${errText}`);
    }

    return {
      etag: response.headers.get("etag"),
      key: cleanKey,
      bucket,
    };
  }

  public async getObject(
    key: string,
    bucket = this.defaultBucket
  ): Promise<{ buffer: Buffer; contentType: string; etag: string | null }> {
    const cleanKey = key.replace(/^\/+/, "");
    const uri = encodeS3URI(`/${bucket}/${cleanKey}`);
    const payloadHash = sha256Hex("");
    const headers = this.signRequest("GET", uri, "", payloadHash);

    const response = await fetch(`${this.getBaseOrigin()}${uri}`, {
      method: "GET",
      headers,
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`MinIO GET failed (${response.status})`);
    }

    const arrayBuf = await response.arrayBuffer();
    return {
      buffer: Buffer.from(arrayBuf),
      contentType:
        response.headers.get("content-type") || "application/octet-stream",
      etag: response.headers.get("etag"),
    };
  }

  public async deleteObject(
    key: string,
    bucket = this.defaultBucket
  ): Promise<boolean> {
    const cleanKey = key.replace(/^\/+/, "");
    const uri = encodeS3URI(`/${bucket}/${cleanKey}`);
    const payloadHash = sha256Hex("");
    const headers = this.signRequest("DELETE", uri, "", payloadHash);

    const response = await fetch(`${this.getBaseOrigin()}${uri}`, {
      method: "DELETE",
      headers,
      signal: AbortSignal.timeout(5000),
    });

    return response.ok || response.status === 204;
  }

  public getPresignedUrl(
    method: "GET" | "PUT",
    key: string,
    expiresInSeconds = 3600,
    bucket = this.defaultBucket
  ): string {
    const cleanKey = key.replace(/^\/+/, "");
    const uri = encodeS3URI(`/${bucket}/${cleanKey}`);
    const { amzDate, dateStamp } = formatAmzDate();
    const host = this.getHostHeader();
    const credentialScope = `${dateStamp}/${this.region}/s3/aws4_request`;

    const queryParams = new URLSearchParams({
      "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
      "X-Amz-Credential": `${this.accessKey}/${credentialScope}`,
      "X-Amz-Date": amzDate,
      "X-Amz-Expires": String(expiresInSeconds),
      "X-Amz-SignedHeaders": "host",
    });

    const sortedQuery = Array.from(queryParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join("&");

    const canonicalRequest = [
      method,
      uri,
      sortedQuery,
      `host:${host}\n`,
      "host",
      "UNSIGNED-PAYLOAD",
    ].join("\n");

    const stringToSign = [
      "AWS4-HMAC-SHA256",
      amzDate,
      credentialScope,
      sha256Hex(canonicalRequest),
    ].join("\n");

    const signingKey = getSigningKey(this.secretKey, dateStamp, this.region, "s3");
    const signature = crypto
      .createHmac("sha256", signingKey)
      .update(stringToSign, "utf8")
      .digest("hex");

    return `${this.getBaseOrigin()}${uri}?${sortedQuery}&X-Amz-Signature=${signature}`;
  }

  public getPublicUrl(key: string): string {
    const cleanKey = key.replace(/^\/+/, "");
    return `${env.minio.publicUrl.replace(/\/$/, "")}/${cleanKey}`;
  }
}

export const minioClient = new MinioClient();
export default minioClient;
