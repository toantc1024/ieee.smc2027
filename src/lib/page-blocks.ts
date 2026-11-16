import type { PageBlock } from "@/modules/website-builder/types";

/**
 * Extract the canonical ordered block list from a CMS page record.
 * Prefers `content.content` (Builder AST) when present, falling back to `blocks`.
 */
export function extractPageBlocks(
  page: { content?: unknown; blocks?: unknown } | null | undefined
): PageBlock[] {
  if (!page) return [];
  const rawContent = page.content as { content?: unknown } | null | undefined;
  if (
    rawContent &&
    typeof rawContent === "object" &&
    Array.isArray(rawContent.content)
  ) {
    if (rawContent.content.length > 0 || !Array.isArray(page.blocks) || page.blocks.length === 0) {
      return rawContent.content as PageBlock[];
    }
  }
  if (Array.isArray(page.blocks)) {
    return page.blocks as PageBlock[];
  }
  return [];
}
