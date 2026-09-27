import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Không tìm thấy file" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save into public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const safeStem = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_").replace(/\.[^/.]+$/, "")}`;
    const ext = path.extname(file.name).toLowerCase() || ".png";
    const originalFilename = `${safeStem}${ext}`;
    const filePath = path.join(uploadsDir, originalFilename);

    await fs.writeFile(filePath, buffer);

    let blurDataURL = "";
    let width = 0;
    let height = 0;

    // Generate low-size blur data placeholder using Sharp
    try {
      const metadata = await sharp(buffer).metadata();
      width = metadata.width || 0;
      height = metadata.height || 0;

      const blurBuffer = await sharp(buffer)
        .resize(16, 16, { fit: "inside" })
        .webp({ quality: 20 })
        .toBuffer();

      blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`;
    } catch {
      // Non-image or sharp unsupported format (e.g. svg, doc)
    }

    const publicUrl = `/uploads/${originalFilename}`;
    const proxyUrl = `/api/images/uploads/${originalFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      proxyUrl,
      blurDataURL,
      width,
      height,
      size: buffer.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    console.error("Upload error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
