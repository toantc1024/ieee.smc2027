import { Node, mergeAttributes, InputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { MathInlineView } from "./math-inline-view";
import { publicMath } from "./public-math";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    mathInline: {
      setMathInline: (attrs?: { formula?: string }) => ReturnType;
    };
  }
}

/**
 * Inline Math node for $...$ equations.
 * Renders inline KaTeX using a DOM-based NodeView (no React needed for inline).
 */
export const MathInline = Node.create({
  name: "mathInline",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return {
      formula: {
        default: "",
        parseHTML: (element: HTMLElement) => {
          const annotation = element.querySelector(
            'annotation[encoding="application/x-tex"]',
          );
          if (annotation) return annotation.textContent || "";
          return (
            element.getAttribute("data-formula") ||
            element.textContent ||
            ""
          );
        },
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'span[data-type="math-inline"]' },
      { tag: "span.math.math-inline" },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { formula, ...rest } = HTMLAttributes;
    return [
      "span",
      mergeAttributes(rest, {
        "data-type": "math-inline",
        "data-formula": formula || "",
      }),
      publicMath(String(formula || ""), false),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MathInlineView, {
      as: "span",
      className: "math-inline-wrapper",
    });
  },

  addCommands() {
    return {
      setMathInline:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { formula: attrs?.formula ?? "" },
          });
        },
    };
  },

  // $formula$ shortcut — type $, formula, then closing $ to auto-create inline math
  addInputRules() {
    return [
      new InputRule({
        // Match $...$ but NOT $$ (which is block math)
        find: /(?<!\$)\$([^$\n]+)\$$/,
        handler: ({ state, range, match }) => {
          const formula = match[1];
          if (!formula) return;
          const { tr } = state;
          tr.replaceWith(
            range.from,
            range.to,
            this.type.create({ formula }),
          );
        },
      }),
    ];
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: { write: (s: string) => void; esc: (s: string) => string }, node: { attrs: { formula: string } }) {
          const formula = node.attrs.formula || "";
          // Use inline HTML so tiptap-markdown can roundtrip via parseHTML().
          // Previously $..$ format was used but tiptap-markdown doesn't parse it.
          const escaped = formula
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
          state.write(`<span data-type="math-inline" data-formula="${escaped}"></span>`);
        },
        parse: {},
      },
    };
  },
});
