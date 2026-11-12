import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SheetBlockView } from "./sheet-block-view";
import {
  type BlockAlignment,
  type BlockLayoutMode,
  normalizeAlignment,
  normalizeLayoutMode,
} from "./block-layout";

export interface SheetBlockAttrs {
  title?: string;
  dataJson?: string;
  hasHeader?: boolean;
  striped?: boolean;
  caption?: string;
  credit?: string;
  width?: number;
  alignment?: BlockAlignment;
  layoutMode?: BlockLayoutMode;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    sheetBlock: {
      insertSheetBlock: (attrs?: Partial<SheetBlockAttrs>) => ReturnType;
    };
  }
}

const DEFAULT_SHEET_DATA = JSON.stringify([
  ["Column 1", "Column 2", "Column 3"],
  ["", "", ""],
]);

export const SheetBlockExtension = Node.create({
  name: "sheetBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      title: { default: "Data Sheet" },
      dataJson: { default: DEFAULT_SHEET_DATA },
      hasHeader: { default: true },
      striped: { default: true },
      caption: { default: "" },
      credit: { default: "" },
      width: { default: 100 },
      alignment: { default: "center" },
      layoutMode: { default: "inline" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-sheet-block]",
        getAttrs: (el) => {
          const dom = el as HTMLElement;
          return {
            title: dom.getAttribute("data-title") || "Data Sheet",
            dataJson: dom.getAttribute("data-json") || DEFAULT_SHEET_DATA,
            hasHeader: dom.getAttribute("data-header") !== "false",
            striped: dom.getAttribute("data-striped") !== "false",
            caption: dom.getAttribute("data-caption") || "",
            credit: dom.getAttribute("data-credit") || "",
            width: Number(dom.getAttribute("data-width") || 100),
            alignment: normalizeAlignment(dom.getAttribute("data-align")),
            layoutMode: normalizeLayoutMode(dom.getAttribute("data-layout")),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const title = HTMLAttributes.title || "";
    const dataJson = HTMLAttributes.dataJson || DEFAULT_SHEET_DATA;
    const hasHeader = HTMLAttributes.hasHeader !== false;
    const striped = HTMLAttributes.striped !== false;
    const caption = HTMLAttributes.caption || "";
    const credit = HTMLAttributes.credit || "";
    const width = Number(HTMLAttributes.width) || 100;
    const alignment = normalizeAlignment(HTMLAttributes.alignment);
    const layoutMode = normalizeLayoutMode(HTMLAttributes.layoutMode);

    let rows: string[][] = [];
    try {
      rows = JSON.parse(dataJson);
    } catch {
      rows = [];
    }

    const trElements: any[] = rows.map((row, rIdx) => {
      const isHeader = hasHeader && rIdx === 0;
      const cellTag = isHeader ? "th" : "td";
      const rowBg = isHeader
        ? "background:#004776;color:#ffffff;font-weight:700;"
        : striped && rIdx % 2 === 1
          ? "background:#f8fafc;"
          : "background:#ffffff;";

      return [
        "tr",
        { style: rowBg },
        ...row.map((cell) => [
          cellTag,
          {
            style:
              "padding:0.625rem 0.875rem;border:1px solid #e2e8f0;text-align:left;font-size:0.875rem;",
          },
          String(cell ?? ""),
        ]),
      ];
    });

    const children: any[] = [];
    if (title) {
      children.push([
        "div",
        {
          style:
            "font-weight:700;font-size:1rem;color:#004776;margin-bottom:0.5rem;",
        },
        title,
      ]);
    }

    children.push([
      "table",
      {
        style:
          "width:100%;border-collapse:collapse;border:1px solid #cbd5e1;border-radius:0.5rem;overflow:hidden;",
      },
      ["tbody", {}, ...trElements],
    ]);

    if (caption || credit) {
      children.push([
        "div",
        {
          style:
            "font-size:0.75rem;color:#64748b;margin-top:0.375rem;text-align:center;",
        },
        caption ? `${caption}${credit ? ` (${credit})` : ""}` : credit,
      ]);
    }

    return [
      "div",
      mergeAttributes({
        "data-sheet-block": "true",
        "data-title": title,
        "data-json": dataJson,
        "data-header": String(hasHeader),
        "data-striped": String(striped),
        "data-caption": caption,
        "data-credit": credit,
        "data-width": String(width),
        "data-align": alignment,
        "data-layout": layoutMode,
        style: `width:${width}%;max-width:100%;margin:1.25rem auto;overflow-x:auto;`,
      }),
      ...children,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SheetBlockView);
  },

  addCommands() {
    return {
      insertSheetBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              title: attrs.title || "Data Sheet",
              dataJson: attrs.dataJson || DEFAULT_SHEET_DATA,
              hasHeader: attrs.hasHeader ?? true,
              striped: attrs.striped ?? true,
              caption: attrs.caption || "",
              credit: attrs.credit || "",
              width: attrs.width ?? 100,
              alignment: attrs.alignment || "center",
              layoutMode: attrs.layoutMode || "inline",
            },
          });
        },
    };
  },
});
