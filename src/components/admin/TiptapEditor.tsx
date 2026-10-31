"use client";

import React, { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  ImageIcon,
  Link2,
  Unlink,
  Table as TableIcon,
  Plus,
  Trash2,
  Columns,
  Rows,
  RemoveFormatting,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { LinkModal } from "./tiptap/LinkModal";
import { ImageInsertModal } from "./tiptap/ImageInsertModal";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Write article content here...",
  minHeight = "360px",
}: TiptapEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TiptapImage.configure({
        inline: true,
        allowBase64: true,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `prose max-w-none focus:outline-none p-5 text-slate-800 text-sm leading-relaxed min-h-[${minHeight}]`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Skeleton loading state while editor initializes — strictly NO rotating spinners!
  if (!editor) {
    return (
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        {/* Toolbar Skeleton */}
        <div className="p-2 border-b border-slate-200 bg-slate-50/70 flex items-center gap-1.5">
          <Skeleton className="h-7 w-20 rounded-md" />
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <div className="w-px h-5 bg-slate-200 mx-1" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
          <div className="w-px h-5 bg-slate-200 mx-1 ml-auto" />
          <Skeleton className="size-7 rounded-md" />
          <Skeleton className="size-7 rounded-md" />
        </div>

        {/* Content Skeleton */}
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4 rounded-md" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <div className="pt-4 space-y-2">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  const isTableActive = editor.isActive("table");

  // Format Heading Level or Paragraph
  const handleHeadingChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "p") {
      editor.chain().focus().setParagraph().run();
    } else if (val === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (val === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (val === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    } else if (val === "h4") {
      editor.chain().focus().toggleHeading({ level: 4 }).run();
    }
  };

  const getHeadingValue = () => {
    if (editor.isActive("heading", { level: 1 })) return "h1";
    if (editor.isActive("heading", { level: 2 })) return "h2";
    if (editor.isActive("heading", { level: 3 })) return "h3";
    if (editor.isActive("heading", { level: 4 })) return "h4";
    return "p";
  };

  // Insert Table
  const handleInsertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* ── Main Toolbar ── */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/80 border-b border-slate-200 text-slate-700">
        {/* Paragraph / Heading Selector */}
        <select
          value={getHeadingValue()}
          onChange={handleHeadingChange}
          className="h-7 text-xs px-2 bg-white border border-slate-200 rounded-md font-medium text-slate-700 focus:outline-none focus:border-[#115eff]"
        >
          <option value="p">Paragraph</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

        {/* Bold */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`size-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            editor.isActive("bold")
              ? "bg-slate-200/90 text-[#115eff] font-bold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="size-3.5" />
        </button>

        {/* Italic */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`size-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            editor.isActive("italic")
              ? "bg-slate-200/90 text-[#115eff] font-bold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="size-3.5" />
        </button>

        {/* Underline */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`size-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            editor.isActive("underline")
              ? "bg-slate-200/90 text-[#115eff] font-bold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="size-3.5" />
        </button>

        {/* Strikethrough */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`size-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            editor.isActive("strike")
              ? "bg-slate-200/90 text-[#115eff] font-bold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="size-3.5" />
        </button>

        {/* Inline Code */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`size-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            editor.isActive("code")
              ? "bg-slate-200/90 text-[#115eff] font-bold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
          title="Inline Code"
        >
          <Code className="size-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

        {/* Bullet List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`size-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            editor.isActive("bulletList")
              ? "bg-slate-200/90 text-[#115eff] font-bold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
          title="Bullet List"
        >
          <List className="size-3.5" />
        </button>

        {/* Ordered List */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`size-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            editor.isActive("orderedList")
              ? "bg-slate-200/90 text-[#115eff] font-bold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
          title="Numbered List"
        >
          <ListOrdered className="size-3.5" />
        </button>

        {/* Blockquote */}
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`size-7 rounded flex items-center justify-center transition-colors cursor-pointer ${
            editor.isActive("blockquote")
              ? "bg-slate-200/90 text-[#115eff] font-bold"
              : "text-slate-600 hover:bg-slate-200/60"
          }`}
          title="Blockquote"
        >
          <Quote className="size-3.5" />
        </button>

        {/* Horizontal Divider */}
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="size-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Horizontal Rule"
        >
          <Minus className="size-3.5" />
        </button>

        <div className="w-px h-5 bg-slate-200 mx-1 shrink-0" />

        {/* Link Button */}
        <button
          type="button"
          onClick={() => setLinkModalOpen(true)}
          className={`h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            editor.isActive("link")
              ? "bg-slate-200 text-[#115eff]"
              : "text-slate-700 hover:bg-slate-200/60"
          }`}
          title={editor.isActive("link") ? "Edit link" : "Insert link"}
        >
          <Link2 className="size-3.5 text-[#115eff]" />
          <span>{editor.isActive("link") ? "Link" : "Insert Link"}</span>
        </button>

        {/* Image Insert Button */}
        <button
          type="button"
          onClick={() => setImageModalOpen(true)}
          className="h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Insert image (upload or URL)"
        >
          <ImageIcon className="size-3.5 text-[#115eff]" />
          <span>Insert Image</span>
        </button>

        {/* Table Button */}
        <button
          type="button"
          onClick={handleInsertTable}
          className={`h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${
            isTableActive
              ? "bg-slate-200 text-[#115eff]"
              : "text-slate-700 hover:bg-slate-200/60"
          }`}
          title="Insert 3x3 Table"
        >
          <TableIcon className="size-3.5 text-[#115eff]" />
          <span>Table</span>
        </button>

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          className="size-7 rounded flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
          title="Clear Formatting"
        >
          <RemoveFormatting className="size-3.5" />
        </button>

        {/* Right: Undo / Redo */}
        <div className="w-px h-5 bg-slate-200 mx-1 ml-auto shrink-0" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="size-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 transition-colors cursor-pointer"
          title="Undo"
        >
          <Undo2 className="size-3.5" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="size-7 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200/60 disabled:opacity-30 transition-colors cursor-pointer"
          title="Redo"
        >
          <Redo2 className="size-3.5" />
        </button>
      </div>

      {/* ── Contextual Table Toolbar (When inside table) ── */}
      {isTableActive && (
        <div className="flex flex-wrap items-center gap-1 px-3 py-1.5 bg-slate-100/90 border-b border-slate-200 text-[11px] text-slate-700">
          <span className="font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <TableIcon className="size-3 text-[#115eff]" />
            Table:
          </span>

          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 font-medium transition-colors"
          >
            + Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 font-medium transition-colors text-rose-600"
          >
            - Row
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 font-medium transition-colors"
          >
            + Column
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="px-2 py-0.5 rounded bg-white hover:bg-slate-50 border border-slate-200 font-medium transition-colors text-rose-600"
          >
            - Column
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="px-2 py-0.5 rounded bg-rose-50 hover:bg-rose-100 border border-rose-200 font-semibold text-rose-700 transition-colors ml-auto"
          >
            Delete Table
          </button>
        </div>
      )}

      {/* ── Editor Editable Area ── */}
      <div className="tiptap-content-wrapper min-h-[360px] bg-white">
        <EditorContent editor={editor} />
      </div>

      {/* Link Dialog Modal */}
      {linkModalOpen && (
        <LinkModal
          open={linkModalOpen}
          onClose={() => setLinkModalOpen(false)}
          initialUrl={editor.getAttributes("link").href || ""}
          hasSelection={!editor.state.selection.empty}
          isLinked={editor.isActive("link")}
          onApply={(url, text, openInNewTab) => {
            if (editor.state.selection.empty && text) {
              editor
                .chain()
                .focus()
                .insertContent(
                  `<a href="${url}" target="${openInNewTab ? "_blank" : "_self"}">${text}</a>`
                )
                .run();
            } else {
              editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({
                  href: url,
                  target: openInNewTab ? "_blank" : "_self",
                })
                .run();
            }
          }}
          onUnlink={() => editor.chain().focus().unsetLink().run()}
        />
      )}

      {/* Image Insert / Upload / Crop Modal */}
      {imageModalOpen && (
        <ImageInsertModal
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          onInsertImage={(src, alt) => {
            editor.chain().focus().setImage({ src, alt: alt || "" }).run();
          }}
        />
      )}
    </div>
  );
}

export default TiptapEditor;
