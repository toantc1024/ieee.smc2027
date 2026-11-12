import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { Fragment, type Node as ProseMirrorNode, type Schema } from "@tiptap/pm/model";
import LayoutContainerView from "./layout-container-view";

/**
 * LayoutContainer — Notion-style columns block.
 *
 * Schema (two-level, like Notion):
 *   layoutContainer (cols: 2|3|4, gap: sm|md|lg, ratio, customTemplate)
 *     └── layoutColumn+
 *           └── block+
 *
 * Deliberately isolated from BlockWrapper: the container has its own minimal
 * chrome (header controls) and CSS overrides force inner blocks
 * to fill their cell (max-width:none !important, float:none !important).
 *
 * Layout is driven by data-cols / data-gap attributes + pure CSS rules in
 * styles.css — never by Tailwind utility classes, to dodge the v4 JIT
 * dead-token issue with bare `grid-cols-N`.
 */

export type LayoutCols = 2 | 3 | 4;
export type LayoutGap = "sm" | "md" | "lg";
export type LayoutRatio =
  | "equal"
  | "2-1"
  | "1-2"
  | "3-1"
  | "1-3"
  | "3-2"
  | "2-3"
  | "1-2-1"
  | "2-1-1"
  | "1-1-2"
  | "2-1-1-1"
  | "1-1-1-2"
  | "custom";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    layoutContainer: {
      setLayoutContainer: (attributes?: {
        cols?: LayoutCols;
        gap?: LayoutGap;
        ratio?: LayoutRatio;
        customTemplate?: string;
      }) => ReturnType;
    };
  }
}

export const LAYOUT_RATIOS_BY_COLS: Record<LayoutCols, LayoutRatio[]> = {
  2: ["equal", "2-1", "1-2", "3-1", "1-3", "3-2", "2-3", "custom"],
  3: ["equal", "2-1-1", "1-2-1", "1-1-2", "custom"],
  4: ["equal", "2-1-1-1", "1-1-1-2", "custom"],
};

const RATIO_TEMPLATES: Partial<Record<LayoutRatio, string>> = {
  "2-1": "2fr 1fr",
  "1-2": "1fr 2fr",
  "3-1": "3fr 1fr",
  "1-3": "1fr 3fr",
  "3-2": "3fr 2fr",
  "2-3": "2fr 3fr",
  "2-1-1": "2fr 1fr 1fr",
  "1-2-1": "1fr 2fr 1fr",
  "1-1-2": "1fr 1fr 2fr",
  "2-1-1-1": "2fr 1fr 1fr 1fr",
  "1-1-1-2": "1fr 1fr 1fr 2fr",
};

const clampCols = (n: unknown): LayoutCols => {
  const v = typeof n === "string" ? parseInt(n, 10) : (n as number);
  if (v === 3) return 3;
  if (v === 4) return 4;
  return 2;
};

const clampGap = (g: unknown): LayoutGap => {
  if (g === "sm" || g === "lg") return g;
  return "md";
};

export const clampRatio = (ratio: unknown, cols: LayoutCols): LayoutRatio => {
  const valid = LAYOUT_RATIOS_BY_COLS[cols];
  return valid.includes(ratio as LayoutRatio) ? (ratio as LayoutRatio) : "equal";
};

export function sanitizeCustomTemplate(value: unknown, cols: LayoutCols): string {
  if (typeof value !== "string") return "";
  const parts = value
    .replace(/fr/g, "")
    .split(/[\s,/|:;-]+/)
    .map((part) => Number(part.trim()))
    .filter((part) => Number.isFinite(part) && part > 0 && part <= 12);

  if (parts.length !== cols) return "";
  return parts.map((part) => `${Number(part.toFixed(2))}fr`).join(" ");
}

export function getLayoutTemplate(
  cols: LayoutCols,
  ratio: LayoutRatio,
  customTemplate?: string,
) {
  if (ratio === "custom") {
    return sanitizeCustomTemplate(customTemplate, cols);
  }
  return RATIO_TEMPLATES[ratio] || "";
}

/** Preserve blocks from removed columns by appending them to the last remaining column. */
export function resizeLayoutContainer(node: ProseMirrorNode, schema: Schema, cols: LayoutCols): ProseMirrorNode {
  const columns = Array.from({ length: node.childCount }, (_, index) => node.child(index));
  if (cols < columns.length) {
    const kept = columns.slice(0, cols);
    const contents = columns.slice(cols).flatMap((column) => column.content.content);
    const last = kept[kept.length - 1];
    kept[kept.length - 1] = last.copy(last.content.append(Fragment.fromArray(contents)));
    columns.splice(0, columns.length, ...kept);
  }
  while (columns.length < cols) columns.push(schema.nodes.layoutColumn.create(null, schema.nodes.paragraph.create()));
  return node.type.create({ ...node.attrs, cols, ratio: "equal", customTemplate: "" }, Fragment.fromArray(columns));
}

export const LayoutContainer = Node.create({
  name: "layoutContainer",
  group: "block",
  content: "layoutColumn+",
  defining: true,
  isolating: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      cols: {
        default: 2 as LayoutCols,
        parseHTML: (el) => clampCols(el.getAttribute("data-cols")),
        renderHTML: (attrs) => ({ "data-cols": String(clampCols(attrs.cols)) }),
      },
      gap: {
        default: "md" as LayoutGap,
        parseHTML: (el) => clampGap(el.getAttribute("data-gap")),
        renderHTML: (attrs) => ({ "data-gap": clampGap(attrs.gap) }),
      },
      ratio: {
        default: "equal" as LayoutRatio,
        parseHTML: (el) => {
          const cols = clampCols(el.getAttribute("data-cols"));
          return clampRatio(el.getAttribute("data-ratio"), cols);
        },
        renderHTML: (attrs) => {
          const cols = clampCols(attrs.cols);
          const ratio = clampRatio(attrs.ratio, cols);
          return ratio === "equal" ? {} : { "data-ratio": ratio };
        },
      },
      customTemplate: {
        default: "",
        parseHTML: (el) => {
          const cols = clampCols(el.getAttribute("data-cols"));
          return sanitizeCustomTemplate(el.getAttribute("data-custom-template"), cols);
        },
        renderHTML: (attrs) => {
          const cols = clampCols(attrs.cols);
          const ratio = clampRatio(attrs.ratio, cols);
          const customTemplate = sanitizeCustomTemplate(attrs.customTemplate, cols);
          return ratio === "custom" && customTemplate
            ? { "data-custom-template": customTemplate }
            : {};
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="layout-container"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const template = sanitizeCustomTemplate(HTMLAttributes["data-custom-template"], clampCols(HTMLAttributes["data-cols"]));
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "layout-container", ...(template ? { style: `--layout-template:${template}` } : {}) }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(LayoutContainerView);
  },

  addCommands() {
    return {
      setLayoutContainer:
        (attrs) =>
        ({ chain, state }) => {
          // Prevent nesting: Do not allow inserting layoutContainer inside another layoutContainer/layoutColumn
          let isNested = false;
          for (let i = state.selection.$from.depth; i > 0; i--) {
            const node = state.selection.$from.node(i);
            if (node.type.name === this.name || node.type.name === "layoutColumn") {
              isNested = true;
              break;
            }
          }
          if (isNested) {
            return false;
          }

          const cols = clampCols(attrs?.cols ?? 2);
          const gap = clampGap(attrs?.gap ?? "md");
          const ratio = clampRatio(attrs?.ratio ?? "equal", cols);
          const customTemplate =
            ratio === "custom" ? sanitizeCustomTemplate(attrs?.customTemplate, cols) : "";
          return chain()
            .insertContent([
              {
                type: this.name,
                attrs: { cols, gap, ratio, customTemplate },
                content: Array.from({ length: cols }, () => ({
                  type: "layoutColumn",
                  content: [{ type: "paragraph" }],
                })),
              },
              { type: "paragraph" },
            ])
            .run();
        },
    };
  },
});

/**
 * LayoutColumn — a single cell inside a LayoutContainer.
 * No React NodeView: plain renderHTML keeps the DOM flat and avoids
 * @tiptap/react auto-injecting an extra [data-node-view-content-react]
 * wrapper inside the cell. Children render as direct DOM children of the
 * column div, which keeps the BlockWrapper-override CSS selectors simple.
 */
export const LayoutColumn = Node.create({
  name: "layoutColumn",
  content: "block+",
  isolating: true,
  defining: true,

  parseHTML() {
    return [{ tag: 'div[data-type="layout-column"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "layout-column" }),
      0,
    ];
  },

});
