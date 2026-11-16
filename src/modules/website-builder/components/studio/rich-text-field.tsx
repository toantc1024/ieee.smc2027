"use client";

import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Underline as UnderlineIcon, Link2, Unlink, List, ListOrdered, Heading3, Pilcrow } from "lucide-react";

export function RichTextField({ id, content, onChange }: { id: string; content: string; onChange: (html: string) => void }) {
  const [linkPromptOpen, setLinkPromptOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-[#115eff] underline font-medium" },
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: { attributes: { id, role: "textbox", "aria-multiline": "true", class: "min-h-40 max-h-80 overflow-y-auto p-3 text-sm leading-relaxed text-slate-700 outline-none [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h3]:text-base [&_h3]:font-bold [&_p+p]:mt-2 [&_a]:text-[#115eff] [&_a]:underline" } },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    shouldRerenderOnTransaction: true,
  });

  useEffect(() => {
    if (editor && editor.getHTML() !== content) editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);

  if (!editor) return <div className="h-48 animate-pulse rounded-lg bg-slate-100" />;
  const controls = [
    { label: "Bold", icon: Bold, active: editor.isActive("bold"), run: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: editor.isActive("italic"), run: () => editor.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: UnderlineIcon, active: editor.isActive("underline"), run: () => editor.chain().focus().toggleUnderline().run() },
    { label: "Heading", icon: Heading3, active: editor.isActive("heading"), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    { label: "Paragraph", icon: Pilcrow, active: editor.isActive("paragraph"), run: () => editor.chain().focus().setParagraph().run() },
    { label: "Bullet list", icon: List, active: editor.isActive("bulletList"), run: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: editor.isActive("orderedList"), run: () => editor.chain().focus().toggleOrderedList().run() },
    {
      label: "Link",
      icon: Link2,
      active: editor.isActive("link"),
      run: () => {
        const existing = editor.getAttributes("link").href || "";
        setLinkUrl(existing);
        setLinkPromptOpen((prev) => !prev);
      },
    },
    ...(editor.isActive("link")
      ? [{ label: "Remove link", icon: Unlink, active: false, run: () => editor.chain().focus().unsetLink().run() }]
      : []),
  ];

  const applyLink = () => {
    const trimmed = linkUrl.trim();
    if (!trimmed) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: trimmed }).run();
    }
    setLinkPromptOpen(false);
  };

  return <div className="overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-blue-400">
    <div role="toolbar" aria-label="Text formatting" className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-1.5">{controls.map(({ label, icon: Icon, active, run }) => <button key={label} type="button" aria-label={label} title={label} aria-pressed={active} onClick={run} className={`rounded p-1.5 cursor-pointer ${active ? "bg-blue-100 text-blue-700" : "text-slate-500 hover:bg-slate-200"}`}><Icon className="size-3.5" /></button>)}</div>
    {linkPromptOpen && (
      <div className="flex items-center gap-1.5 border-b border-slate-200 bg-blue-50/40 px-2 py-1.5">
        <input
          type="text"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              applyLink();
            }
          }}
          placeholder="https://... or /submissions"
          className="h-7 flex-1 rounded border border-blue-200 bg-white px-2 text-xs text-slate-900 focus:border-[#115eff] focus:outline-none"
        />
        <button type="button" onClick={applyLink} className="h-7 rounded bg-[#115eff] px-2.5 text-xs font-bold text-white cursor-pointer">
          Apply
        </button>
      </div>
    )}
    <EditorContent editor={editor} />
  </div>;
}
