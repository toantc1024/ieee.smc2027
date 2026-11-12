import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EmbedBlockView } from "./embed-block-view";
import { blockLayoutAttributes, renderBlockLayoutAttrs } from "./block-layout";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embedBlock: {
      setEmbedBlock: (attrs?: {
        code?: string;
        html?: string;
        css?: string;
        js?: string;
        height?: number;
      }) => ReturnType;
    };
  }
}

function decodeB64(b64: string): string {
  try {
    return decodeURIComponent(escape(atob(b64)));
  } catch {
    return "";
  }
}

export const EmbedBlock = Node.create({
  name: "embedBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      // Legacy single code field (backward compat)
      code: {
        default: "",
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-code": attributes.code || "" }),
        parseHTML: (element: HTMLElement) => {
          const b64 = element.getAttribute("data-code-b64");
          if (b64) return decodeB64(b64);
          return element.getAttribute("data-code") || "";
        },
      },
      html: {
        default: "",
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-html": attributes.html || "" }),
        parseHTML: (element: HTMLElement) => {
          const b64 = element.getAttribute("data-html-b64");
          if (b64) return decodeB64(b64);
          return element.getAttribute("data-html") || "";
        },
      },
      css: {
        default: "",
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-css": attributes.css || "" }),
        parseHTML: (element: HTMLElement) => {
          const b64 = element.getAttribute("data-css-b64");
          if (b64) return decodeB64(b64);
          return element.getAttribute("data-css") || "";
        },
      },
      js: {
        default: "",
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-js": attributes.js || "" }),
        parseHTML: (element: HTMLElement) => {
          const b64 = element.getAttribute("data-js-b64");
          if (b64) return decodeB64(b64);
          return element.getAttribute("data-js") || "";
        },
      },
      height: {
        default: 400,
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-height": attributes.height || 400 }),
        parseHTML: (element: HTMLElement) => {
          const h = element.getAttribute("data-height");
          return h ? parseInt(h, 10) : 400;
        },
      },
      fullHeight: {
        default: true,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-full-height") !== "false",
        renderHTML: (attributes: Record<string, unknown>) => {
          if (attributes.fullHeight === false) return { "data-full-height": "false" };
          return { "data-full-height": "true" };
        },
      },
      caption: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-caption") || "",
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.caption) return {};
          return { "data-caption": attributes.caption as string };
        },
      },
      ...blockLayoutAttributes,
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed-block"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { layout, blockWidth, ...rest } = HTMLAttributes;
    const layoutAttrs = renderBlockLayoutAttrs({ layout, blockWidth });
    return [
      "div",
      mergeAttributes(rest, { "data-type": "embed-block" }, layoutAttrs),
      ["iframe", {
        title: "Embedded content",
        sandbox: "allow-scripts allow-popups allow-forms",
        srcdoc: `<!doctype html><html><head><meta charset="utf-8"><style>${String(node.attrs.css || "")}</style></head><body>${String(node.attrs.html || node.attrs.code || "")}<script>${String(node.attrs.js || "")}</script></body></html>`,
        style: `width:100%;height:${Math.min(1200, Math.max(100, Number(node.attrs.height) || 400))}px;border:0;`,
      }],
      ...(node.attrs.caption ? [["p", { style: "text-align:center;font-size:.875rem;color:#64748b" }, String(node.attrs.caption)] as [string, Record<string, string>, string]] : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedBlockView, {
      stopEvent: ({ event }) => {
        const target = event.target as HTMLElement;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target.closest("button")
        ) {
          return true;
        }
        return false;
      },
    });
  },

  addCommands() {
    return {
      setEmbedBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              code: attrs?.code ?? "",
              html: attrs?.html ?? "",
              css: attrs?.css ?? "",
              js: attrs?.js ?? "",
              height: attrs?.height ?? 200,
            },
          });
        },
    };
  },

});
