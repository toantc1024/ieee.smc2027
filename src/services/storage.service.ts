/**
 * Storage Service (MinIO S3 Object Storage + Sharp Image Processing)
 * Handles public CMS assets, delegate avatars, private passport scans,
 * PDF payment receipts, and Visa Support Letters.
 */

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import env from "@/config/env";
import minioClient from "@/lib/minio";
import type { StorageFolder, UploadFileInput, UploadFileResult } from "@/types";

export class StorageService {
  private bucketInitialized = false;

  private sanitizeFilename(filename: string): { stem: string; ext: string } {
    const ext = path.extname(filename).toLowerCase() || ".bin";
    const base = path.basename(filename, path.extname(filename));
    const safeBase = base.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64) || "file";
    return {
      stem: `${Date.now()}-${safeBase}`,
      ext,
    };
  }

  private async extractImageMetadata(buffer: Buffer): Promise<{
    width?: number;
    height?: number;
    blurDataURL?: string;
  }> {
    try {
      const metadata = await sharp(buffer).metadata();
      const blurBuffer = await sharp(buffer)
        .resize(16, 16, { fit: "inside" })
        .webp({ quality: 20 })
        .toBuffer();

      return {
        width: metadata.width,
        height: metadata.height,
        blurDataURL: `data:image/webp;base64,${blurBuffer.toString("base64")}`,
      };
    } catch {
      return {};
    }
  }

  public async uploadFile(input: UploadFileInput): Promise<UploadFileResult> {
    const folder: StorageFolder = input.folder || "public/uploads";
    const { stem, ext } = this.sanitizeFilename(input.filename);
    const filename = `${stem}${ext}`;
    const objectKey = `${folder}/${filename}`;

    const imageMeta =
      input.generateBlur !== false && input.mimeType.startsWith("image/")
        ? await this.extractImageMetadata(input.buffer)
        : {};

    // Primary: Upload to MinIO Object Storage
    try {
      if (!this.bucketInitialized) {
        await minioClient.ensureBucket();
        this.bucketInitialized = true;
      }

      await minioClient.putObject(objectKey, input.buffer, input.mimeType);

      const url = minioClient.getPublicUrl(objectKey);
      const proxyUrl = `/api/images/${objectKey}`;

      return {
        key: objectKey,
        bucket: minioClient.defaultBucket,
        url,
        proxyUrl,
        size: input.buffer.byteLength,
        mimeType: input.mimeType,
        ...imageMeta,
        storageDriver: "minio",
      };
    } catch (minioError) {
      if (env.isProd) {
        throw minioError;
      }

      // Development fallback to local public directory if MinIO container is offline
      const localRelativeDir = folder.startsWith("public/")
        ? folder.replace(/^public\//, "")
        : path.join("uploads", folder);
      const targetDir = path.join(process.cwd(), "public", localRelativeDir);
      await fs.mkdir(targetDir, { recursive: true });

      const fullLocalPath = path.join(targetDir, filename);
      await fs.writeFile(fullLocalPath, input.buffer);

      const publicPath = `/${localRelativeDir}/${filename}`.replace(/\\/g, "/");
      return {
        key: objectKey,
        bucket: minioClient.defaultBucket,
        url: publicPath,
        proxyUrl: `/api/images${publicPath}`,
        size: input.buffer.byteLength,
        mimeType: input.mimeType,
        ...imageMeta,
        storageDriver: "local-fallback",
      };
    }
  }

  public async getFileBuffer(objectKey: string): Promise<{
    buffer: Buffer;
    contentType: string;
    etag?: string | null;
  }> {
    try {
      return await minioClient.getObject(objectKey);
    } catch (err) {
      // Fallback to local public directory
      const cleanPath = objectKey.replace(/^public\//, "").replace(/^\/+/, "");
      const localPath = path.join(process.cwd(), "public", cleanPath);
      const buffer = await fs.readFile(localPath);
      const ext = path.extname(localPath).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
      };
      return {
        buffer,
        contentType: mimeMap[ext] || "application/octet-stream",
        etag: null,
      };
    }
  }

  public async deleteFile(objectKey: string): Promise<boolean> {
    try {
      return await minioClient.deleteObject(objectKey);
    } catch {
      return false;
    }
  }

  public getPresignedDownloadUrl(objectKey: string, expiresInSeconds = 3600): string {
    return minioClient.getPresignedUrl("GET", objectKey, expiresInSeconds);
  }
}

export const storageService = new StorageService();
export default storageService;
