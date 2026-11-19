/**
 * Storage Service (MinIO S3 Object Storage + PostgreSQL MediaFile Catalog + Sharp Image Processing)
 * Handles public CMS assets, delegate avatars, private passport scans,
 * IEEE/Student proof documents, PDF payment receipts, and Visa Support Letters.
 */

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import env from "@/config/env";
import prisma from "@/lib/prisma";
import minioClient from "@/lib/minio";
import { sanitizeFilename } from "@/lib/utils";
import { resolveMimeType } from "@/lib/media-types";
import type { StorageFolder, UploadFileInput, UploadFileResult } from "@/types";

export class StorageService {
  private bucketInitialized = false;

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
    const { fullName: filename } = sanitizeFilename(input.filename);
    const objectKey = `${folder}/${filename}`;
    const resolvedMimeType = resolveMimeType(input.filename, input.mimeType);

    const imageMeta =
      input.generateBlur !== false &&
      resolvedMimeType.startsWith("image/") &&
      resolvedMimeType !== "image/svg+xml"
        ? await this.extractImageMetadata(input.buffer)
        : {};

    let url = "";
    let proxyUrl = "";
    let storageDriver: "minio" | "local-fallback" = "minio";

    try {
      if (!this.bucketInitialized) {
        await minioClient.ensureBucket();
        this.bucketInitialized = true;
      }

      await minioClient.putObject(objectKey, input.buffer, resolvedMimeType);

      url = minioClient.getPublicUrl(objectKey);
      proxyUrl = `/api/images/${objectKey}`;
      storageDriver = "minio";
    } catch (minioError) {
      console.warn("MinIO upload failed, falling back to local file storage:", minioError);

      try {
        const localRelativeDir = folder.startsWith("public/")
          ? folder.replace(/^public\//, "")
          : path.join("uploads", folder);
        const targetDir = path.join(process.cwd(), "public", localRelativeDir);
        await fs.mkdir(targetDir, { recursive: true });

        const fullLocalPath = path.join(targetDir, filename);
        await fs.writeFile(fullLocalPath, input.buffer);

        const publicPath = `/${localRelativeDir}/${filename}`.replace(/\\/g, "/");
        url = publicPath;
        proxyUrl = `/api/images${publicPath}`;
        storageDriver = "local-fallback";
      } catch (fallbackError) {
        console.error("Local storage fallback failed:", fallbackError);
        throw minioError;
      }
    }

    const category = resolvedMimeType.startsWith("image/") ? "IMAGE" : "DOCUMENT";

    const mediaRecord = await prisma.mediaFile
      .upsert({
        where: { key: objectKey },
        update: {
          filename,
          originalName: input.filename,
          url,
          proxyUrl,
          mimeType: resolvedMimeType,
          size: input.buffer.byteLength,
          folder,
          category,
          width: imageMeta.width ?? null,
          height: imageMeta.height ?? null,
          blurDataURL: imageMeta.blurDataURL ?? null,
          uploadedById: input.uploadedById ?? null,
        },
        create: {
          key: objectKey,
          filename,
          originalName: input.filename,
          url,
          proxyUrl,
          mimeType: resolvedMimeType,
          size: input.buffer.byteLength,
          folder,
          category,
          width: imageMeta.width ?? null,
          height: imageMeta.height ?? null,
          blurDataURL: imageMeta.blurDataURL ?? null,
          uploadedById: input.uploadedById ?? null,
        },
      })
      .catch((err) => {
        console.warn("MediaFile DB catalog insert warning:", err);
        return null;
      });

    return {
      id: mediaRecord?.id,
      key: objectKey,
      bucket: minioClient.defaultBucket,
      url,
      proxyUrl,
      filename: input.filename,
      size: input.buffer.byteLength,
      mimeType: resolvedMimeType,
      folder,
      ...imageMeta,
      storageDriver,
      createdAt: mediaRecord?.createdAt?.toISOString(),
    };
  }

  public async listMediaFiles(params?: {
    folder?: string;
    search?: string;
    mimePrefix?: string;
    category?: "IMAGE" | "DOCUMENT";
    uploadedById?: string;
    includePrivate?: boolean;
    limit?: number;
  }) {
    const where: Record<string, unknown> = {};

    if (params?.folder && params.folder !== "all") {
      where.folder = params.folder;
    } else if (!params?.includePrivate) {
      where.folder = { startsWith: "public/" };
    }

    if (params?.mimePrefix) {
      where.mimeType = { startsWith: params.mimePrefix };
    }

    if (params?.category) {
      where.category = params.category;
    }

    if (params?.uploadedById) {
      where.uploadedById = params.uploadedById;
    }

    if (params?.search?.trim()) {
      where.OR = [
        { filename: { contains: params.search.trim(), mode: "insensitive" } },
        { originalName: { contains: params.search.trim(), mode: "insensitive" } },
        { key: { contains: params.search.trim(), mode: "insensitive" } },
      ];
    }

    return prisma.mediaFile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: params?.limit || 100,
    });
  }

  public async deleteMediaFile(id: string): Promise<boolean> {
    const file = await prisma.mediaFile.findUnique({ where: { id } });
    if (!file) return false;

    await this.deleteFile(file.key);
    await prisma.mediaFile.delete({ where: { id } });
    return true;
  }

  public async getFileBuffer(objectKey: string): Promise<{
    buffer: Buffer;
    contentType: string;
    etag?: string | null;
  }> {
    try {
      return await minioClient.getObject(objectKey);
    } catch {
      const cleanPath = objectKey.replace(/^public\//, "").replace(/^\/+/, "");
      const localPath = path.join(process.cwd(), "public", cleanPath);
      const buffer = await fs.readFile(localPath);
      return {
        buffer,
        contentType: resolveMimeType(localPath),
        etag: null,
      };
    }
  }

  public async deleteFile(objectKey: string): Promise<boolean> {
    let deleted = false;
    try {
      deleted = await minioClient.deleteObject(objectKey);
    } catch {
      // Ignore MinIO failure and attempt local fallback cleanup
    }
    try {
      const publicDir = path.join(process.cwd(), "public");
      const cleanPath = objectKey.replace(/^public\//, "").replace(/^\/+/, "");
      const localPath = path.resolve(publicDir, cleanPath);
      if (localPath.startsWith(publicDir + path.sep)) {
        await fs.unlink(localPath);
        deleted = true;
      }
    } catch {
      // Local file may not exist
    }
    return deleted;
  }

  public getPresignedDownloadUrl(objectKey: string, expiresInSeconds = 3600): string {
    return minioClient.getPresignedUrl("GET", objectKey, expiresInSeconds);
  }
}

export const storageService = new StorageService();
export default storageService;
