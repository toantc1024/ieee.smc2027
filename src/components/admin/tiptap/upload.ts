export async function uploadPostMedia(file: File, signal?: AbortSignal): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch("/api/admin/upload", { method: "POST", body, signal });
  const result = await response.json();
  const url = result.data?.proxyUrl || result.proxyUrl || result.data?.url || result.url;
  if (!response.ok || typeof url !== "string" || !url) {
    throw new Error(typeof result.error === "string" ? result.error : "Upload failed. Please try again.");
  }
  return url;
}
