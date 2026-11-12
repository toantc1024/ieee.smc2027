import type { CSSProperties } from "react";
import type { PageBlock } from "../types";

export function isBlockHidden(block: PageBlock): boolean {
  return typeof block.hidden === "boolean" ? block.hidden : block.props?.hidden === true;
}

/** Accept HCMUTE's top-level styles and this project's existing _styles overrides. */
export function getBlockPresentation(block: PageBlock): { className: string; style: CSSProperties } {
  const legacy = block.styles && typeof block.styles === "object" ? block.styles : {};
  const overrides = block.props?._styles && typeof block.props._styles === "object" ? block.props._styles : {};
  const styles = { ...legacy, ...overrides } as Record<string, string | boolean | undefined>;
  const classes = [styles.className, styles.customClass];
  const style: CSSProperties = {};
  const spacing = ["paddingTop", "paddingBottom", "paddingLeft", "paddingRight", "marginTop", "marginBottom"] as const;
  for (const key of spacing) {
    const value = styles[key];
    if (typeof value !== "string" || !value) continue;
    if (/^-?(?:pt|pb|pl|pr|mt|mb|ml|mr)-/.test(value)) classes.push(value);
    else style[key] = value;
  }
  const properties = ["textColor", "borderWidth", "borderColor", "borderRadius", "maxWidth", "textAlign"] as const;
  for (const key of properties) {
    const value = styles[key];
    if (typeof value !== "string" || !value) continue;
    if (key === "textColor") style.color = value;
    else if (key === "textAlign") {
      if (value === "left" || value === "center" || value === "right" || value === "justify") style.textAlign = value;
    } else style[key] = value;
  }
  const bgGradient =
    (typeof styles.backgroundGradient === "string" && styles.backgroundGradient) ||
    (typeof styles.backgroundImage === "string" && styles.backgroundImage) ||
    (typeof styles.backgroundColor === "string" && styles.backgroundColor.includes("gradient(") ? styles.backgroundColor : "");
  if (bgGradient) {
    style.background = bgGradient;
  } else if (typeof styles.backgroundColor === "string" && styles.backgroundColor) {
    style.backgroundColor = styles.backgroundColor;
  }
  if (typeof styles.shadow === "string" && styles.shadow) style.boxShadow = styles.shadow;
  if (style.borderWidth) style.borderStyle = "solid";
  const hideSideBorders = styles.hideTwoSideBorders ?? block.props?.hideTwoSideBorders;
  if (hideSideBorders === true) {
    classes.push("[&>*]:border-x-0");
  } else if (hideSideBorders === false) {
    const color = typeof styles.borderColor === "string" && styles.borderColor ? styles.borderColor : "var(--border)";
    style.borderLeft = `1px solid ${color}`;
    style.borderRight = `1px solid ${color}`;
  }
  return { className: classes.filter((value): value is string => typeof value === "string" && Boolean(value)).join(" "), style };
}
