import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FileAttachmentView } from "./file-attachment-view";
import {
  type BlockAlignment,
  type BlockLayoutMode,
  normalizeAlignment,
  normalizeLayoutMode,
} from "./block-layout";

export interface FileAttachmentAttrs {
  src: string;
  title?: string;
  fileType?: string;
  showPreview?: boolean;
  height?: number;
  width?: number;
  alignment?: BlockAlignment;
  layoutMode?: BlockLayoutMode;
  caption?: string;
  credit?: string;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileAttachmentBlock: {
      insertFileAttachmentBlock: (
        attrs?: Partial<FileAttachmentAttrs>
      ) => ReturnType;
    };
  }
}

export const FileAttachmentExtension = Node.create({
  name: "fileAttachmentBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      title: { default: "Document" },
      fileType: { default: "PDF" },
      showPreview: { default: true },
      height: { default: 460 },
      width: { default: 100 },
      alignment: { default: "center" },
      layoutMode: { default: "inline" },
      caption: { default: "" },
      credit: { default: "" },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-file-block]",
        getAttrs: (el) => {
          const dom = el as HTMLElement;
          return {
            src: dom.getAttribute("data-src") || "",
            title: dom.getAttribute("data-title") || "Document",
            fileType: dom.getAttribute("data-filetype") || "PDF",
            showPreview: dom.getAttribute("data-preview") !== "false",
            height: Number(dom.getAttribute("data-height") || 460),
            width: Number(dom.getAttribute("data-width") || 100),
            alignment: normalizeAlignment(dom.getAttribute("data-align")),
            layoutMode: normalizeLayoutMode(dom.getAttribute("data-layout")),
            caption: dom.getAttribute("data-caption") || "",
            credit: dom.getAttribute("data-credit") || "",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src || "";
    const title = HTMLAttributes.title || "Document";
    const fileType = HTMLAttributes.fileType || "PDF";
    const showPreview = HTMLAttributes.showPreview !== false;
    const height = Number(HTMLAttributes.height) || 460;
    const width = Number(HTMLAttributes.width) || 100;
    const alignment = normalizeAlignment(HTMLAttributes.alignment);
    const layoutMode = normalizeLayoutMode(HTMLAttributes.layoutMode);
    const caption = HTMLAttributes.caption || "";
    const credit = HTMLAttributes.credit || "";

    const children: any[] = [
      [
        "div",
        {
          style:
            "display:flex;align-items:center;justify-content:space-between;gap:1rem;padding:1rem;border:1px solid #e2e8f0;border-radius:0.75rem;background:#f8fafc;",
        },
        [
          "div",
          { style: "font-weight:700;color:#0f172a;font-size:0.9375rem;" },
          `${title} (${fileType})`,
        ],
        ...(src ? [[
          "a",
          {
            href: src,
            target: "_blank",
            rel: "noopener noreferrer",
            style:
              "padding:0.5rem 1rem;border-radius:0.5rem;background:#115eff;color:#ffffff;font-weight:700;font-size:0.8125rem;text-decoration:none;",
          },
          "Download",
        ]] : []),
      ],
    ];

    if (showPreview && src.toLowerCase().endsWith(".pdf")) {
      children.push([
        "iframe",
        {
          src,
          title,
          style: `width:100%;height:${height}px;border:1px solid #e2e8f0;border-radius:0.75rem;margin-top:0.5rem;`,
        },
      ]);
    }

    return [
      "div",
      mergeAttributes({
        "data-file-block": "true",
        "data-src": src,
        "data-title": title,
        "data-filetype": fileType,
        "data-preview": String(showPreview),
        "data-height": String(height),
        "data-width": String(width),
        "data-align": alignment,
        "data-layout": layoutMode,
        "data-caption": caption,
        "data-credit": credit,
        style: `width:${width}%;max-width:100%;margin:1rem auto;`,
      }),
      ...children,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView);
  },

  addCommands() {
    return {
      insertFileAttachmentBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: attrs.src ?? "",
              title: attrs.title ?? "Document",
              fileType: attrs.fileType || "PDF",
              showPreview: attrs.showPreview ?? true,
              height: attrs.height ?? 460,
              width: attrs.width ?? 100,
              alignment: attrs.alignment || "center",
              layoutMode: attrs.layoutMode || "inline",
              caption: attrs.caption || "",
              credit: attrs.credit || "",
            },
          });
        },
    };
  },
});
