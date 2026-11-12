import { Extension, Mark, mergeAttributes } from "@tiptap/core";

function safeColor(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const color = value.trim();
  return /^(?:#[0-9a-f]{3,4}|#[0-9a-f]{6}|#[0-9a-f]{8}|(?:rgb|hsl)a?\([\d\s.,%+\-/]+\)|[a-z]{3,20})$/i.test(color) ? color : null;
}
function safeFontSize(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const size = value.trim();
  const match = /^(\d+(?:\.\d+)?)(px|pt|em|rem|%)$/i.exec(size);
  if (!match || Number(match[1]) <= 0 || Number(match[1]) > 500) return null;
  return size;
}
const alignments = ["left", "center", "right", "justify"] as const;
type TextAlignmentValue = typeof alignments[number];

/** TextStyle combines color and font size on one span, as in the HCMUTE editor. */
export const TextStyle = Mark.create({
  name: "textStyle",
  addAttributes() {
    return {
      color: { default: null, parseHTML: (element: HTMLElement) => safeColor(element.style.color) },
      fontSize: { default: null, parseHTML: (element: HTMLElement) => safeFontSize(element.style.fontSize) },
    };
  },
  parseHTML() { return [{ tag: "span", getAttrs: (element) => { const style = (element as HTMLElement).style; return style.color || style.fontSize ? {} : false; } }]; },
  renderHTML({ HTMLAttributes }) {
    const color = safeColor(HTMLAttributes.color);
    const fontSize = safeFontSize(HTMLAttributes.fontSize);
    const style = [color && `color: ${color}`, fontSize && `font-size: ${fontSize}`].filter(Boolean).join("; ");
    return ["span", style ? { style } : {}, 0];
  },
  addCommands() {
    return {
      setColor: (value) => ({ commands }) => { const color = safeColor(value); return color ? commands.setMark(this.name, { color }) : false; },
      unsetColor: () => ({ commands }) => commands.setMark(this.name, { color: null }),
      setFontSize: (value) => ({ commands }) => { const fontSize = safeFontSize(value); return fontSize ? commands.setMark(this.name, { fontSize }) : false; },
      unsetFontSize: () => ({ commands }) => commands.setMark(this.name, { fontSize: null }),
    };
  },
});

/** The original editor uses a multicolor highlight represented by a mark tag. */
export const Highlight = Mark.create({
  name: "highlight",
  addAttributes() {
    return { color: { default: null, parseHTML: (element: HTMLElement) => safeColor(element.getAttribute("data-color") || element.style.backgroundColor) } };
  },
  parseHTML() { return [{ tag: "mark" }]; },
  renderHTML({ HTMLAttributes }) {
    const color = safeColor(HTMLAttributes.color);
    return ["mark", mergeAttributes(color ? { "data-color": color, style: `background-color: ${color}; color: inherit` } : {}), 0];
  },
  addCommands() {
    return {
      toggleHighlight: (attributes = {}) => ({ commands }) => {
        const color = attributes.color ? safeColor(attributes.color) : null;
        if (attributes.color && !color) return false;
        return commands.toggleMark(this.name, color ? { color } : {});
      },
      unsetHighlight: () => ({ commands }) => commands.unsetMark(this.name),
    };
  },
});

export const TextAlignment = Extension.create({
  name: "textAlignment",
  addGlobalAttributes() {
    return [{ types: ["heading", "paragraph"], attributes: { textAlign: {
      default: null,
      parseHTML: (element: HTMLElement) => alignments.includes(element.style.textAlign as TextAlignmentValue) ? element.style.textAlign : null,
      renderHTML: (attributes: Record<string, unknown>) => alignments.includes(attributes.textAlign as TextAlignmentValue) ? { style: `text-align: ${attributes.textAlign}` } : {},
    } } }];
  },
  addCommands() {
    return {
      setTextAlign: (alignment) => ({ commands }) => {
        if (!alignments.includes(alignment as TextAlignmentValue)) return false;
        return ["heading", "paragraph"].map((type) => commands.updateAttributes(type, { textAlign: alignment })).some(Boolean);
      },
      unsetTextAlign: () => ({ commands }) => ["heading", "paragraph"].map((type) => commands.resetAttributes(type, "textAlign")).some(Boolean),
    };
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textStyle: { setColor: (color: string) => ReturnType; unsetColor: () => ReturnType; setFontSize: (size: string) => ReturnType; unsetFontSize: () => ReturnType };
    highlight: { toggleHighlight: (attributes?: { color?: string }) => ReturnType; unsetHighlight: () => ReturnType };
    textAlignment: { setTextAlign: (alignment: string) => ReturnType; unsetTextAlign: () => ReturnType };
  }
}
