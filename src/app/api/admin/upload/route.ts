import { NextResponse } from "next/server";
import { authService, storageService } from "@/services";
import type { StorageFolder } from "@/types";

export async function POST(request: Request) {
  const user = await authService.getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as StorageFolder | null) || "public/uploads";

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await storageService.uploadFile({
      buffer,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      folder,
      generateBlur: true,
    });

    return NextResponse.json({
      success: true,
      key: result.key,
      bucket: result.bucket,
      url: result.url,
      proxyUrl: result.proxyUrl,
      blurDataURL: result.blurDataURL || "",
      width: result.width || 0,
      height: result.height || 0,
      size: result.size,
      storageDriver: result.storageDriver,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("MinIO Upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
