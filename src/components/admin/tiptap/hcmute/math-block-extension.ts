import { Node, mergeAttributes, InputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MathBlockView } from "./math-block-view";
import { blockLayoutAttributes, renderBlockLayoutAttrs } from "./block-layout";
import { publicMath } from "./public-math";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathBlock: {
      setMathBlock: (attrs?: { formula?: string }) => ReturnType;
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

export const MathBlock = Node.create({
  name: "mathBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      formula: {
        default: "",
        parseHTML: (element: HTMLElement) => {
          // From base64 encoding (our markdown serialization format)
          const b64 = element.getAttribute("data-formula-b64");
          if (b64) return decodeB64(b64);
          // From data attribute
          const dataFormula = element.getAttribute("data-formula");
          if (dataFormula) return dataFormula;
          // From KaTeX rendered output (display math)
          const annotation = element.querySelector(
            'annotation[encoding="application/x-tex"]',
          );
          if (annotation) return annotation.textContent || "";
          return element.textContent || "";
        },
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.formula) return {};
          return { "data-formula": attributes.formula as string };
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
    return [
      { tag: 'div[data-type="math-block"]' },
      { tag: "div.math.math-display" },
      {
        tag: "div.math-display",
        getAttrs: (element: HTMLElement) => {
          const annotation = element.querySelector(
            'annotation[encoding="application/x-tex"]',
          );
          if (annotation) return { formula: annotation.textContent || "" };
          return {};
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "math-block",
        ...renderBlockLayoutAttrs(node.attrs),
      }),
      publicMath(String(node.attrs.formula || ""), true),
      ...(node.attrs.caption ? [["p", { style: "text-align:center;font-size:.875rem;color:#64748b" }, String(node.attrs.caption)] as [string, Record<string, string>, string]] : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathBlockView, {
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
      setMathBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { formula: attrs?.formula ?? "" },
          });
        },
    };
  },

  // $$ shortcut — type $$ at the start of a line to create a math block
  addInputRules() {
    return [
      new InputRule({
        find: /^\$\$\s?$/,
        handler: ({ state, range }) => {
          const { tr } = state;
          tr.replaceWith(
            range.from,
            range.to,
            this.type.create({ formula: "" }),
          );
        },
      }),
    ];
  },

});
