import { NextResponse } from "next/server";
import { storageService } from "@/services";
import { requireAdminRequest, apiSuccess, apiError } from "@/lib";
import type { StorageFolder } from "@/types";

export async function POST(request: Request) {
  const { user, errorResponse } = await requireAdminRequest();
  if (errorResponse) return errorResponse;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as StorageFolder | null) || "public/uploads";

    if (!file) {
      return apiError("No file provided", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await storageService.uploadFile({
      buffer,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      folder,
      generateBlur: true,
      uploadedById: user.id,
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      proxyUrl: result.proxyUrl,
      data: {
        id: result.id,
        key: result.key,
        bucket: result.bucket,
        url: result.url,
        proxyUrl: result.proxyUrl,
        blurDataURL: result.blurDataURL || "",
        width: result.width || 0,
        height: result.height || 0,
        size: result.size,
        storageDriver: result.storageDriver,
      },
    });
  } catch (error: unknown) {
    console.error("MinIO Upload error:", error);
    return apiError(error, 500, "Upload failed");
  }
}
