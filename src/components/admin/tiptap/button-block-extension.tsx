"use client";

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import { ExternalLink } from "lucide-react";
import { PostLinkPicker } from "./post-link-picker";

type ButtonVariant = "primary" | "secondary" | "outline";

// Links saved with the post are rendered as HTML on the public website.
function safeHref(value: unknown): string {
  const href = typeof value === "string" ? value.trim() : "";
  if (/^(?:https?:|mailto:|tel:)/i.test(href) || /^(?:\/[^/\\]|#|\?)/.test(href)) return href;
  return "#";
}

function ButtonBlockView({ node, updateAttributes, editor }: NodeViewProps) {
  const { href, label, variant } = node.attrs as { href: string; label: string; variant: ButtonVariant };
  return <NodeViewWrapper className="my-3" contentEditable={false}>
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      {editor.isEditable && <div className="grid w-full gap-2">
        <label className="text-xs font-semibold text-slate-600">Button label<input value={label ?? ""} onChange={(event) => updateAttributes({ label: event.target.value })} placeholder="Button label" className="mt-1 block h-8 w-full rounded border border-slate-200 bg-white px-2 text-sm font-normal" /></label>
        <div className="flex items-end gap-2"><label className="min-w-0 flex-1 text-xs font-semibold text-slate-600">Link URL<input value={href ?? ""} onChange={(event) => updateAttributes({ href: event.target.value })} placeholder="https://... or /news/..." className="mt-1 block h-8 w-full rounded border border-slate-200 bg-white px-2 text-sm font-normal" /></label><PostLinkPicker onSelectPost={({ url, title }) => updateAttributes({ href: url, ...(!label ? { label: title } : {}) })} /></div>
        <label className="text-xs font-semibold text-slate-600">Style<select value={variant} onChange={(event) => updateAttributes({ variant: event.target.value })} className="ml-2 rounded border border-slate-200 bg-white px-2 py-1 font-normal"><option value="primary">Primary</option><option value="secondary">Secondary</option><option value="outline">Outline</option></select></label>
      </div>}
      <span className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium ${variant === "outline" ? "border border-slate-400 bg-white text-slate-800" : variant === "secondary" ? "bg-slate-200 text-slate-900" : "bg-blue-700 text-white"}`}>{label || "Button"}<ExternalLink className="size-3.5" /></span>
    </div>
  </NodeViewWrapper>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    buttonBlock: { setButtonBlock: (attributes?: { href?: string; label?: string; variant?: ButtonVariant }) => ReturnType };
  }
}

export const ButtonBlock = Node.create({
  name: "buttonBlock",
  group: "block",
  atom: true,
  draggable: true,
  addAttributes() {
    return { href: { default: "#" }, label: { default: "Button" }, variant: { default: "primary" } };
  },
  parseHTML() {
    return [{ tag: 'div[data-type="button-block"]', getAttrs: (element) => {
      const el = element as HTMLElement;
      return { href: el.getAttribute("data-href") ?? el.getAttribute("href") ?? "#", label: el.getAttribute("data-label") ?? el.getAttribute("label") ?? "Button", variant: el.getAttribute("data-variant") ?? el.getAttribute("variant") ?? "primary" };
    } }];
  },
  renderHTML({ HTMLAttributes }) {
    const { href, label, variant } = HTMLAttributes;
    const style = variant === "outline" ? "background:#fff;color:#1e293b;border:1px solid #94a3b8;" : variant === "secondary" ? "background:#e2e8f0;color:#0f172a;" : "background:#1d4ed8;color:#fff;";
    return ["div", mergeAttributes({ "data-type": "button-block", "data-href": href, "data-label": label, "data-variant": variant, style: "text-align:center;margin:1rem 0;" }), ["a", { href: safeHref(href), target: "_blank", rel: "noopener noreferrer", style: `display:inline-block;border-radius:9999px;padding:0.625rem 1.5rem;text-decoration:none;font-weight:600;${style}` }, label || "Button"]];
  },
  addNodeView() { return ReactNodeViewRenderer(ButtonBlockView); },
  addCommands() { return { setButtonBlock: (attributes = {}) => ({ commands }) => commands.insertContent({ type: this.name, attrs: attributes }) }; },
});
