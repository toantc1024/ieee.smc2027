import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MermaidBlockView } from "./mermaid-block-view";
import { blockLayoutAttributes, renderBlockLayoutAttrs } from "./block-layout";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mermaidBlock: {
      setMermaidBlock: (attrs?: {
        code?: string;
        theme?: string;
      }) => ReturnType;
    };
  }
}

function decodeB64(b64: string): string {
  try {
    if (typeof atob === "function") {
      return decodeURIComponent(escape(atob(b64)));
    }
    return Buffer.from(b64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export const MermaidBlock = Node.create({
  name: "mermaidBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      code: {
        default: "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Result 1]\n  B -->|No| D[Result 2]",
        parseHTML: (element: HTMLElement) => {
          const b64 = element.getAttribute("data-code-b64");
          if (b64) return decodeB64(b64);
          return element.getAttribute("data-code") || element.textContent || "";
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.code) return {};
          return { "data-code": attributes.code as string };
        },
      },
      theme: {
        default: "default",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-theme") || "default",
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.theme || attributes.theme === "default") return {};
          return { "data-theme": attributes.theme as string };
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
      svg: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-svg") || "",
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-svg": attributes.svg || "" }),
      },
      svgSource: {
        default: "",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-svg-source") || "",
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-svg-source": attributes.svgSource || "" }),
      },
      ...blockLayoutAttributes,
    };
  },

  parseHTML() {
    return [
      { tag: 'div[data-type="mermaid-block"]' },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { layout, blockWidth, ...rest } = HTMLAttributes;
    const layoutAttrs = renderBlockLayoutAttrs({ layout, blockWidth });
    return [
      "div",
      mergeAttributes(rest, { "data-type": "mermaid-block" }, layoutAttrs),
      ...(node.attrs.svg && node.attrs.svgSource === JSON.stringify([node.attrs.code, node.attrs.theme])
        ? [["iframe", { title: "Diagram", sandbox: "", srcdoc: `<!doctype html><html><head><style>body{margin:0}svg{max-width:100%;height:auto;display:block;margin:auto}</style></head><body>${String(node.attrs.svg)}</body></html>`, style: "width:100%;height:400px;border:0;" }] as [string, Record<string, string>]]
        : [["pre", {}, String(node.attrs.code || "")] as [string, Record<string, string>, string]]),
      ...(node.attrs.caption ? [["p", { style: "text-align:center;font-size:.875rem;color:#64748b" }, String(node.attrs.caption)] as [string, Record<string, string>, string]] : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidBlockView, {
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
      setMermaidBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              code: attrs?.code ?? "graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Result 1]\n  B -->|No| D[Result 2]",
              theme: attrs?.theme ?? "default",
            },
          });
        },
    };
  },

});
