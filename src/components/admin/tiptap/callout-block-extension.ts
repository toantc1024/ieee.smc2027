import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CalloutBlockView } from "./callout-block-view";

export type CalloutVariant = "info" | "warning" | "success" | "danger";

export interface CalloutBlockAttrs {
  variant?: CalloutVariant;
  title?: string;
  text?: string;
  width?: number;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    calloutBlock: {
      insertCalloutBlock: (attrs?: Partial<CalloutBlockAttrs>) => ReturnType;
    };
  }
}

export const CalloutBlockExtension = Node.create({
  name: "calloutBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      variant: { default: "info" },
      title: { default: "Important Notice" },
      text: {
        default:
          "All submitted manuscripts must follow the standard IEEE two-column template.",
      },
      width: { default: 100 },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-callout-block]",
        getAttrs: (el) => {
          const dom = el as HTMLElement;
          return {
            variant:
              (dom.getAttribute("data-variant") as CalloutVariant) || "info",
            title: dom.getAttribute("data-title") || "Important Notice",
            text: dom.getAttribute("data-text") || "",
            width: Number(dom.getAttribute("data-width") || 100),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const variant = HTMLAttributes.variant || "info";
    const title = HTMLAttributes.title || "";
    const text = HTMLAttributes.text || "";
    const width = Number(HTMLAttributes.width) || 100;

    const bgMap: Record<string, string> = {
      info: "background:#eff6ff;border-left:4px solid #115eff;",
      warning: "background:#fffbeb;border-left:4px solid #f59e0b;",
      success: "background:#ecfdf5;border-left:4px solid #10b981;",
      danger: "background:#fff1f2;border-left:4px solid #f43f5e;",
    };

    return [
      "div",
      mergeAttributes({
        "data-callout-block": "true",
        "data-variant": variant,
        "data-title": title,
        "data-text": text,
        "data-width": String(width),
        style: `width:${width}%;max-width:100%;margin:1rem auto;padding:1rem 1.25rem;border-radius:0.75rem;${bgMap[variant] || bgMap.info}`,
      }),
      [
        "div",
        { style: "font-weight:700;font-size:0.95rem;color:#0f172a;margin-bottom:0.25rem;" },
        title,
      ],
      [
        "div",
        { style: "font-size:0.875rem;color:#334155;line-height:1.6;" },
        text,
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutBlockView);
  },

  addCommands() {
    return {
      insertCalloutBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              variant: attrs.variant || "info",
              title: attrs.title || "Important Notice",
              text:
                attrs.text ||
                "All submitted manuscripts must follow the standard IEEE two-column template.",
              width: attrs.width ?? 100,
            },
          });
        },
    };
  },
});
