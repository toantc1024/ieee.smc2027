import type { Editor } from "@tiptap/core";

export type NodeViewGetPos = (() => number | undefined) | boolean;

export function getNodeViewPosition(getPos: NodeViewGetPos): number | null {
  if (typeof getPos !== "function") return null;
  const pos = getPos();
  return typeof pos === "number" && Number.isFinite(pos) ? pos : null;
}

export function isNodeViewInsideLayoutColumn(
  editor: Editor | null | undefined,
  getPos: NodeViewGetPos,
): boolean {
  const pos = getNodeViewPosition(getPos);
  if (!editor || pos === null) return false;

  try {
    const resolved = editor.state.doc.resolve(pos);
    for (let depth = resolved.depth; depth > 0; depth -= 1) {
      if (resolved.node(depth).type.name === "layoutColumn") {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}
 
export function isEditorReviewOnly(editor: Editor | null | undefined): boolean {
  if (!editor) return false;
  return Boolean((editor.storage as unknown as Record<string, unknown> | undefined)?.reviewOnly);
}

/**
 * Checks if an element is currently visible inside its scroll container (or viewport)
 */
export function isElementInView(
  element: HTMLElement | null,
  container?: HTMLElement | null,
  thresholdMargin = 20,
): boolean {
  if (!element || typeof window === "undefined") return false;
  const rect = element.getBoundingClientRect();
  const cRect = container
    ? container.getBoundingClientRect()
    : {
        top: 0,
        bottom: window.innerHeight || 800,
        left: 0,
        right: window.innerWidth || 1200,
      };

  return (
    rect.top >= cRect.top + thresholdMargin &&
    rect.bottom <= cRect.bottom - thresholdMargin
  );
}

/**
 * Smoothly scrolls a node view block into view, ensuring it remains visible
 * and comfortably positioned after operations like saving caption or closing settings.
 */
export function scrollBlockIntoView(
  element: HTMLElement | null,
  options?: {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
  },
): void {
  if (!element || typeof window === "undefined") return;

  const prefersReducedMotion =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const behavior: ScrollBehavior =
    options?.behavior ?? (prefersReducedMotion ? "auto" : "smooth");

  // Find nearest scrollable container ancestor
  let scrollContainer: HTMLElement | null = element.parentElement;
  while (scrollContainer && scrollContainer !== document.body) {
    const style = window.getComputedStyle(scrollContainer);
    if (
      style.overflowY === "auto" ||
      style.overflowY === "scroll" ||
      scrollContainer.classList.contains("overflow-y-auto")
    ) {
      break;
    }
    scrollContainer = scrollContainer.parentElement;
  }

  const containerHeight = scrollContainer
    ? scrollContainer.clientHeight
    : window.innerHeight || 800;

  const rect = element.getBoundingClientRect();
  const isTall = rect.height > containerHeight * 0.8;
  const targetBlock: ScrollLogicalPosition =
    options?.block ?? (isTall ? "start" : "center");

  if (typeof element.scrollIntoView === "function") {
    try {
      element.scrollIntoView({
        behavior,
        block: targetBlock,
        inline: "nearest",
      });
      return;
    } catch {
      try {
        element.scrollIntoView();
        return;
      } catch {
        // Fall through to container scroll if native scrollIntoView completely fails
      }
    }
  }

  if (scrollContainer) {
    const cRect = scrollContainer.getBoundingClientRect();
    const relativeTop = rect.top - cRect.top + scrollContainer.scrollTop;
    const targetScrollTop = isTall
      ? Math.max(0, relativeTop - 24)
      : Math.max(0, relativeTop - (containerHeight - rect.height) / 2);
    scrollContainer.scrollTo({ top: targetScrollTop, behavior });
  }
}

