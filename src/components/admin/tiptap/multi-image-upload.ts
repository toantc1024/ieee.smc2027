import type { Editor } from "@tiptap/core";
import type { SelectionBookmark } from "@tiptap/pm/state";

export interface StagedImage {
  id: string;
  file: File;
  preview: string;
  alt: string;
  caption: string;
  credit: string;
  url?: string;
  error?: string;
}

/** Keep uploaded URLs across retries, preserve order, and limit concurrent requests. */
export async function uploadStagedImages(images: StagedImage[], upload: (file: File) => Promise<string>): Promise<StagedImage[]> {
  const result = images.map((image) => ({ ...image }));
  let next = 0;
  const worker = async () => {
    while (next < result.length) {
      const index = next++;
      const image = result[index];
      if (image.url) continue;
      try {
        const url = await upload(image.file);
        if (!url) throw new Error("Upload returned no image URL.");
        result[index] = { ...image, url, error: undefined };
      } catch (error) {
        result[index] = { ...image, error: error instanceof Error ? error.message : "Upload failed. Please try again." };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(3, result.length) }, worker));
  return result;
}

/** Insert all successfully uploaded images as one editor operation at the saved selection. */
export function insertStagedImages(editor: Editor, bookmark: SelectionBookmark, images: StagedImage[]): boolean {
  if (!images.length || images.some((image) => !image.url)) return false;
  const selection = bookmark.resolve(editor.state.doc);
  editor.view.dispatch(editor.state.tr.setSelection(selection));
  return editor.chain().focus().insertContent(images.map((image) => ({
    type: "imageBlock",
    attrs: { src: image.url, alt: image.alt, caption: image.caption, credit: image.credit, width: 100, alignment: "center", layoutMode: "inline" },
  }))).run();
}
