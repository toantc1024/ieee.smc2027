/**
 * Shared media/file type rules, MIME inference, accept-spec matching,
 * and download URL helpers for both client uploaders and server API routes.
 */

export const MAX_MEDIA_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const EXTENSION_TO_MIME: Record<string, string> = {
  // Images
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",

  // Documents
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".md": "text/markdown",

  // Academic / LaTeX
  ".tex": "application/x-tex",
  ".cls": "text/plain",
  ".bst": "text/plain",
  ".bib": "text/plain",

  // Archives
  ".zip": "application/zip",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".tgz": "application/gzip",
  ".7z": "application/x-7z-compressed",
  ".rar": "application/vnd.rar",
};

export const ALLOWED_MEDIA_MIME_TYPES = new Set<string>([
  ...Object.values(EXTENSION_TO_MIME),
  // Browser variants for ZIP and archives
  "application/x-zip-compressed",
  "application/x-zip",
  "multipart/x-zip",
  "application/x-gzip",
  "application/x-rar-compressed",
  "text/x-tex",
]);

export const ALLOWED_MEDIA_EXTENSIONS = new Set<string>(
  Object.keys(EXTENSION_TO_MIME)
);

export const ARCHIVE_EXTENSIONS = new Set<string>([
  ".zip",
  ".tar",
  ".gz",
  ".tgz",
  ".7z",
  ".rar",
]);

export const DEFAULT_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,.jpg,.jpeg,.png,.webp,.gif,.svg";

export const DEFAULT_FILE_ACCEPT = [
  ".zip",
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".tex",
  ".cls",
  ".bst",
  ".tar",
  ".gz",
  ".tgz",
  ".7z",
  ".rar",
  "application/zip",
  "application/x-zip-compressed",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
].join(",");

export const DEFAULT_ALL_MEDIA_ACCEPT = `${DEFAULT_IMAGE_ACCEPT},${DEFAULT_FILE_ACCEPT}`;

export function getFileExtension(filename: string): string {
  const clean = filename.split(/[?#]/)[0] || "";
  const dot = clean.lastIndexOf(".");
  if (dot <= 0) return "";
  return clean.slice(dot).toLowerCase();
}

/**
 * Resolve a reliable MIME type from browser-provided type and filename extension.
 * Browsers often report `.zip` or `.docx` as `""` or `"application/octet-stream"`.
 */
export function resolveMimeType(
  filename: string,
  rawMimeType?: string | null
): string {
  const normalized = (rawMimeType || "").trim().toLowerCase();
  const ext = getFileExtension(filename);

  if (
    !normalized ||
    normalized === "application/octet-stream" ||
    normalized === "binary/octet-stream"
  ) {
    return EXTENSION_TO_MIME[ext] || "application/octet-stream";
  }

  // Normalize non-standard ZIP MIME types to canonical application/zip
  if (
    normalized === "application/x-zip-compressed" ||
    normalized === "application/x-zip" ||
    normalized === "multipart/x-zip"
  ) {
    return "application/zip";
  }

  return normalized;
}

export function isAllowedMediaFile(
  filename: string,
  rawMimeType?: string | null
): boolean {
  const ext = getFileExtension(filename);
  const resolved = resolveMimeType(filename, rawMimeType);

  if (ext && ALLOWED_MEDIA_EXTENSIONS.has(ext)) {
    return true;
  }

  return ALLOWED_MEDIA_MIME_TYPES.has(resolved);
}

/**
 * Match a browser File against an HTML `accept` string, supporting
 * MIME types, wildcards (`image/*`), and file extensions (`.zip`, `.docx`),
 * even when `file.type` is empty or `application/octet-stream`.
 */
export function matchesAcceptSpec(
  file: { name: string; type?: string | null },
  accept: string
): boolean {
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  if (tokens.length === 0 || tokens.includes("*/*")) {
    return true;
  }

  const ext = getFileExtension(file.name);
  const rawType = (file.type || "").trim().toLowerCase();
  const resolvedType = resolveMimeType(file.name, rawType);

  return tokens.some((token) => {
    if (token.startsWith(".")) {
      return ext === token;
    }
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1);
      return rawType.startsWith(prefix) || resolvedType.startsWith(prefix);
    }
    return rawType === token || resolvedType === token;
  });
}

export function isArchiveFile(
  filenameOrUrl: string,
  mimeType?: string | null
): boolean {
  const ext = getFileExtension(filenameOrUrl);
  if (ARCHIVE_EXTENSIONS.has(ext)) return true;
  const mime = (mimeType || "").toLowerCase();
  return (
    mime.includes("zip") ||
    mime.includes("tar") ||
    mime.includes("gzip") ||
    mime.includes("rar") ||
    mime.includes("7z")
  );
}

export function getFileBadgeLabel(
  filenameOrUrl: string,
  mimeType?: string | null
): string {
  const ext = getFileExtension(filenameOrUrl);
  if (ext) {
    const clean = ext.slice(1).toUpperCase();
    if (clean === "TEX" || clean === "CLS" || clean === "BST") return "LATEX";
    return clean;
  }
  const mime = (mimeType || "").toLowerCase();
  if (mime.includes("zip")) return "ZIP";
  if (mime === "application/pdf") return "PDF";
  if (mime.includes("wordprocessingml")) return "DOCX";
  if (mime === "application/msword") return "DOC";
  if (mime.includes("presentationml")) return "PPTX";
  if (mime.includes("spreadsheetml")) return "XLSX";
  if (mime.startsWith("image/")) return "IMAGE";
  return "FILE";
}

export function extractFilenameFromUrl(url: string): string {
  if (!url) return "";
  try {
    const withoutQuery = url.split(/[?#]/)[0] || "";
    const lastSegment = withoutQuery.split("/").pop() || "";
    return decodeURIComponent(lastSegment);
  } catch {
    return url.split("/").pop() || url;
  }
}

/**
 * Build a download URL for uploaded files.
 * For internal `/api/images/...` proxy URLs, appends `?download=1`
 * (and optional `&filename=...`) so the server sets `Content-Disposition: attachment`.
 */
export function buildDownloadUrl(url: string, filename?: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed || trimmed === "#") return "";

  if (trimmed.startsWith("/api/images/")) {
    const [base, existingQuery = ""] = trimmed.split("?");
    const params = new URLSearchParams(existingQuery);
    params.set("download", "1");
    if (filename?.trim()) {
      params.set("filename", filename.trim());
    }
    return `${base}?${params.toString()}`;
  }

  return trimmed;
}

export function sanitizeDownloadFilename(name: string): string {
  return name
    .replace(/[/\\?%*:|"<>]/g, "-")
    .replace(/[\r\n]/g, "")
    .trim() || "download";
}

