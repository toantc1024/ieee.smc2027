import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { storageService } from "@/services";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const searchParams = request.nextUrl.searchParams;

  const rawPath = pathSegments.join("/");
  if (rawPath.includes("..") || rawPath.includes(":") || rawPath.startsWith("/")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const width = searchParams.get("w") ? parseInt(searchParams.get("w")!, 10) : undefined;
  const height = searchParams.get("h") ? parseInt(searchParams.get("h")!, 10) : undefined;
  const quality = searchParams.get("q")
    ? Math.min(100, Math.max(10, parseInt(searchParams.get("q")!, 10)))
    : 80;
  const blurParam = searchParams.get("blur");
  const format = searchParams.get("format") || "webp";

  let inputBuffer: Buffer | null = null;
  let contentType = "application/octet-stream";
  let sourceEtag = "";

  // 1. Try local public asset first for static assets, otherwise fetch from MinIO storageService
  const publicDir = path.join(process.cwd(), "public");
  const fullPath = path.resolve(publicDir, rawPath);

  if (fullPath.startsWith(publicDir)) {
    try {
      const fileStat = await fs.stat(fullPath);
      if (fileStat.isFile()) {
        inputBuffer = await fs.readFile(fullPath);
        sourceEtag = `${fileStat.mtimeMs}-${fileStat.size}`;
        const ext = path.extname(fullPath).toLowerCase();
        const mimeTypes: Record<string, string> = {
          ".jpg": "image/jpeg",
          ".jpeg": "image/jpeg",
          ".png": "image/png",
          ".webp": "image/webp",
          ".svg": "image/svg+xml",
          ".gif": "image/gif",
          ".avif": "image/avif",
        };
        contentType = mimeTypes[ext] || contentType;
      }
    } catch {
      // Not found on local disk; fall through to MinIO
    }
  }

  if (!inputBuffer) {
    try {
      const minioObj = await storageService.getFileBuffer(rawPath);
      inputBuffer = minioObj.buffer;
      contentType = minioObj.contentType;
      sourceEtag = minioObj.etag || `${inputBuffer.byteLength}`;
    } catch {
      return new NextResponse("Not Found", { status: 404 });
    }
  }

  const etag = `"${sourceEtag}-${width || 0}-${height || 0}-${quality}-${blurParam || 0}-${format}"`;

  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
      },
    });
  }

  if (!width && !height && !blurParam && !searchParams.get("format")) {
    return new NextResponse(new Uint8Array(inputBuffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
      },
    });
  }

  try {
    let pipeline = sharp(inputBuffer);

    if (width || height) {
      pipeline = pipeline.resize(width, height, {
        fit: "cover",
        withoutEnlargement: true,
      });
    }

    if (blurParam) {
      const blurSigma =
        blurParam === "true" || blurParam === "1"
          ? 5
          : Math.min(50, Math.max(0.3, parseFloat(blurParam)));
      pipeline = pipeline.blur(blurSigma);
    }

    if (format === "webp") {
      pipeline = pipeline.webp({ quality });
    } else if (format === "avif") {
      pipeline = pipeline.avif({ quality });
    } else if (format === "jpeg" || format === "jpg") {
      pipeline = pipeline.jpeg({ quality, progressive: true });
    } else if (format === "png") {
      pipeline = pipeline.png({ compressionLevel: 8 });
    }

    const outputBuffer = await pipeline.toBuffer();

    return new NextResponse(new Uint8Array(outputBuffer), {
      headers: {
        "Content-Type": `image/${format === "jpg" ? "jpeg" : format}`,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: etag,
      },
    });
  } catch (err) {
    console.error("Image proxy error:", err);
    return new NextResponse("Error processing image", { status: 500 });
  }
}
