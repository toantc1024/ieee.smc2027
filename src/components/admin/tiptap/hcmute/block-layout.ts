/**
 * Shared layout system for all custom block nodes.
 * Provides Word-style layout attributes (block, wrap-left, wrap-right, wide, full)
 * and width control that can be added to any TipTap block extension.
 */

export type BlockLayout =
  | "block" // In line with text — full block, text above/below only
  | "wrap-left" // Float left, text wraps on right
  | "wrap-right" // Float right, text wraps on left
  | "half-left"
  | "half-right"
  | "wide" // 75% centered block
  | "full"; // 100% full-width block

/** Default layout attribute definitions for addAttributes() */
export const blockLayoutAttributes = {
  layout: {
    default: "block" as BlockLayout,
    parseHTML: (element: HTMLElement) =>
      (element.getAttribute("data-layout") as BlockLayout) || "block",
    renderHTML: (attributes: Record<string, unknown>) => ({
      "data-layout": (attributes.layout as string) || "block",
    }),
  },
  blockWidth: {
    default: "100%",
    parseHTML: (element: HTMLElement) =>
      element.getAttribute("data-block-width") ||
      element.getAttribute("data-width") ||
      "100%",
    renderHTML: (attributes: Record<string, unknown>) => ({
      "data-block-width": (attributes.blockWidth as string) || "100%",
    }),
  },
  blockHeight: {
    default: null as string | null,
    parseHTML: (element: HTMLElement) =>
      element.getAttribute("data-block-height"),
    renderHTML: (attributes: Record<string, unknown>) => {
      const value = attributes.blockHeight as string | null | undefined;
      if (!value) return {};
      return { "data-block-height": value };
    },
  },
};

/** Legacy layout value mapping */
const LAYOUT_MAP: Record<string, BlockLayout> = {
  center: "block",
  left: "wrap-left",
  right: "wrap-right",
};

/** Parse layout from an HTML element, handling legacy values */
export function parseBlockLayout(element: HTMLElement): {
  layout: BlockLayout;
  blockWidth: string;
  blockHeight: string | null;
} {
  const rawLayout = element.getAttribute("data-layout") || "block";
  const layout = (LAYOUT_MAP[rawLayout] || rawLayout) as BlockLayout;
  const blockWidth =
    element.getAttribute("data-block-width") ||
    element.getAttribute("data-width") ||
    "100%";
  const blockHeight = element.getAttribute("data-block-height");
  return { layout, blockWidth, blockHeight };
}

/** Build renderHTML attributes for layout */
export function renderBlockLayoutAttrs(attrs: Record<string, unknown>): Record<string, string> {
  const layout = (attrs.layout as string) || "block";
  const blockWidth = (attrs.blockWidth as string) || "100%";
  const blockHeight = attrs.blockHeight as string | null | undefined;

  const result: Record<string, string> = {
    "data-layout": layout,
    "data-block-width": blockWidth,
  };
  if (blockHeight) {
    result["data-block-height"] = blockHeight;
  }

  // Add layout CSS class
  result.class = `layout-${layout}`;

  const align = (attrs.align as string) || "center";
  if (align && align !== "center") {
    result["data-align"] = align;
  }

  // Add inline style for wrapping layouts
  if (layout === "wrap-left" || layout === "wrap-right") {
    const rawWidth = blockWidth && blockWidth !== "100%" ? parseInt(blockWidth) || 40 : 40;
    result.style = `max-width: ${rawWidth}%; width: fit-content; float: ${layout === "wrap-left" ? "left" : "right"}; margin-${layout === "wrap-left" ? "right" : "left"}: 1rem; margin-bottom: 0.5rem; margin-top: 0;`;
  } else if (layout === "wide") {
    result.style = `max-width: 75%; margin-left: auto; margin-right: auto;`;
  } else if (layout === "full") {
    result.style = `max-width: 100%; margin-left: 0; margin-right: 0;`;
  } else if (blockWidth !== "100%") {
    const marginStyle =
      align === "left"
        ? "margin-left: 0; margin-right: auto;"
        : align === "right"
          ? "margin-left: auto; margin-right: 0;"
          : "margin-left: auto; margin-right: auto;";
    result.style = `max-width: ${blockWidth}; ${marginStyle}`;
  } else {
    result.style = `max-width: ${blockWidth || "100%"};`;
  }

  if (blockHeight) {
    const heightPx = parseInt(blockHeight, 10);
    if (Number.isFinite(heightPx) && heightPx > 0) {
      result.style = `${result.style || ""} min-height: ${heightPx}px;`;
    }
  }

  return result;
}

/** Get wrapper CSS classes for the block in the editor (NodeViewWrapper) */
export function getBlockLayoutWrapperClasses(layout: BlockLayout): string {
  const classes: string[] = [`layout-${layout}`];

  if (layout === "full") {
    classes.push("!rounded-none", "!my-0", "!border-x-0");
  }
  if (layout === "wrap-left" || layout === "wrap-right") {
    classes.push("!my-1");
  }

  return classes.join(" ");
}

/** Get wrapper inline styles for the block in the editor */
export function getBlockLayoutWrapperStyle(
  layout: BlockLayout,
  widthPct: number,
  align: "left" | "center" | "right" = "center",
): React.CSSProperties | undefined {
  if (layout === "wrap-left" || layout === "wrap-right") {
    const effectiveWidth = widthPct >= 100 ? 40 : widthPct;
    return { maxWidth: `${effectiveWidth}%`, width: "fit-content" };
  }
  if (layout === "wide") {
    return { maxWidth: "75%", marginLeft: "auto", marginRight: "auto" };
  }
  if (layout === "full") {
    return { maxWidth: "100%", width: "100%", marginLeft: 0, marginRight: 0 };
  }
  if (layout === "block" && widthPct < 100) {
    if (align === "left") {
      return { maxWidth: `${widthPct}%`, marginLeft: 0, marginRight: "auto" };
    }
    if (align === "right") {
      return { maxWidth: `${widthPct}%`, marginLeft: "auto", marginRight: 0 };
    }
    return { maxWidth: `${widthPct}%`, marginLeft: "auto", marginRight: "auto" };
  }
  return undefined;
}

/** Parse width percentage from string like "50%" */
export function parseWidthPct(width: string | undefined): number {
  if (!width) return 100;
  if (typeof width === "string" && width.endsWith("%")) {
    return parseInt(width) || 100;
  }
  return 100;
}

/** Parse height in px from a string value */
export function parseHeightPx(height: string | null | undefined): number | null {
  if (!height) return null;
  const parsed = parseInt(height, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}
