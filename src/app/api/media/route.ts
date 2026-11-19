import { storageService } from "@/services";
import { getCurrentUser, apiSuccess, apiError } from "@/lib";
import {
  isAllowedMediaFile,
  MAX_MEDIA_FILE_SIZE_BYTES,
  resolveMimeType,
} from "@/lib/media-types";
import type { StorageFolder } from "@/types";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder") || "all";
    const search = searchParams.get("search") || "";
    const mimePrefix = searchParams.get("mimePrefix") || "";
    const category = searchParams.get("category") || "";
    const scope = searchParams.get("scope") || "all";

    const isAdmin = user?.role === "ADMIN";

    const files = await storageService.listMediaFiles({
      folder,
      search,
      mimePrefix: mimePrefix || undefined,
      category: category === "IMAGE" || category === "DOCUMENT" ? category : undefined,
      uploadedById:
        scope === "mine" && user?.id
          ? user.id
          : undefined,
      includePrivate: isAdmin,
      limit: 120,
    });

    return apiSuccess({
      files,
      total: files.length,
      data: {
        files,
        total: files.length,
      },
    });
  } catch (error: unknown) {
    return apiError(error, 500, "Failed to load media library");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const rawFolder = (formData.get("folder") as string | null) || "public/uploads";

    if (!file) {
      return apiError("No file provided", 400);
    }

    if (file.size > MAX_MEDIA_FILE_SIZE_BYTES) {
      return apiError("File size exceeds 50MB limit", 400);
    }

    const mimeType = resolveMimeType(file.name, file.type);
    if (!isAllowedMediaFile(file.name, file.type)) {
      return apiError(
        "Unsupported file format. Allowed: ZIP, PDF, DOC/DOCX, PPT/PPTX, XLS/XLSX, LaTeX, JPG, PNG, WEBP, GIF, SVG",
        400
      );
    }

    const allowedDelegateFolders: StorageFolder[] = [
      "public/avatars",
      "public/proofs",
      "public/uploads",
      "private/passports",
    ];

    const folder: StorageFolder =
      user?.role === "ADMIN"
        ? (rawFolder as StorageFolder)
        : allowedDelegateFolders.includes(rawFolder as StorageFolder)
          ? (rawFolder as StorageFolder)
          : "public/uploads";

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isRasterImage =
      mimeType.startsWith("image/") && mimeType !== "image/svg+xml";

    const uploaded = await storageService.uploadFile({
      buffer,
      filename: file.name,
      mimeType,
      folder,
      generateBlur: isRasterImage,
      uploadedById: user?.id || null,
    });

    return apiSuccess({
      file: uploaded,
      url: uploaded.url,
      proxyUrl: uploaded.proxyUrl,
      data: {
        file: uploaded,
        url: uploaded.url,
        proxyUrl: uploaded.proxyUrl,
      },
    });
  } catch (error: unknown) {
    console.error("Media upload error:", error);
    return apiError(error, 500, "Failed to upload file");
  }
}
