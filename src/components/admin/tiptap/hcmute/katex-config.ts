import type { KatexOptions } from "katex";

export const SECURE_KATEX_BLOCK_OPTIONS: KatexOptions = { displayMode: true, throwOnError: false, errorColor: "#ef4444", trust: false };
export const SECURE_KATEX_INLINE_OPTIONS: KatexOptions = { ...SECURE_KATEX_BLOCK_OPTIONS, displayMode: false };

export function sanitizeKaTeXContainer(container: HTMLElement | null): void {
  container?.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!/^(?:https?:|mailto:|tel:|\/[^/\\]|#)/i.test(href)) link.removeAttribute("href");
  });
}
