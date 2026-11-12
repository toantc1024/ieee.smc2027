export async function uploadEditorMedia(file: File, signal?: AbortSignal): Promise<string> {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", "public/uploads");
  const response = await fetch("/api/media", { method: "POST", body, signal });
  const result = await response.json();
  const url = result.proxyUrl || result.file?.proxyUrl || result.data?.proxyUrl || result.data?.file?.proxyUrl || result.url || result.file?.url || result.data?.url || result.data?.file?.url;
  if (!response.ok || typeof url !== "string" || !url) {
    throw new Error(result.error || "Upload failed. Please try again.");
  }
  return url;
}
