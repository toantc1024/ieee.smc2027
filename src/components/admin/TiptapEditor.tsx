"use client";

import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image as TiptapImage } from "@tiptap/extension-image";
import { Link } from "@tiptap/extension-link";
import { Underline } from "@tiptap/extension-underline";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import type { SelectionBookmark, Transaction } from "@tiptap/pm/state";
import "katex/dist/katex.min.css";

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
  Images,
  Link2,
  Table as TableIcon,
  Table2,
  FileText,
  AlertCircle,
  RemoveFormatting,
  MousePointerClick,
  Sigma,
  GitBranch,
  BarChart3,
  Braces,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { LinkModal } from "./tiptap/LinkModal";
import { ImageInsertModal } from "./tiptap/ImageInsertModal";
import { ImageBlockExtension } from "./tiptap/image-block-extension";
import { SheetBlockExtension } from "./tiptap/sheet-block-extension";
import { FileAttachmentExtension } from "./tiptap/file-attachment-extension";
import { CalloutBlockExtension } from "./tiptap/callout-block-extension";
import { ButtonBlock } from "./tiptap/button-block-extension";
import { MathBlock } from "./tiptap/hcmute/math-block-extension";
import { MathInline } from "./tiptap/hcmute/math-inline-extension";
import { MermaidBlock } from "./tiptap/hcmute/mermaid-block-extension";
import { ChartBlock } from "./tiptap/hcmute/chart-block-extension";
import { EmbedBlock } from "./tiptap/hcmute/embed-block-extension";
import { InsertBetween } from "./tiptap/insert-between-extension";
import { InsertionMenu } from "./tiptap/insertion-menu";
import { TextStyle, Highlight, TextAlignment } from "./tiptap/text-formatting";
import { LayoutContainer, LayoutColumn } from "./tiptap/hcmute/layout-container-extension";
import { DragHandle } from "./tiptap/drag-handle-extension";
import { MultiImageStagingDialog } from "./tiptap/multi-image-staging-dialog";
import { insertStagedImages } from "./tiptap/multi-image-upload";
import { TableContextMenu } from "./tiptap/table-context-menu";
import { TableEdgeControls } from "./tiptap/table-edge-controls";
import { TableWidthConstraint } from "./tiptap/table-width-constraint-extension";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface TiptapEditorHandle {
  insertImage: (src: string, alt?: string) => boolean;
}

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: string;
  documentStyle?: boolean;
  className?: string;
  toolbarExtra?: React.ReactNode;
  editorRef?: React.Ref<TiptapEditorHandle>;
}

export function TiptapEditor({
  content,
  onChange,
  minHeight = "360px",
  documentStyle = false,
  className,
  toolbarExtra,
  editorRef,
}: TiptapEditorProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [multiImageOpen, setMultiImageOpen] = useState(false);
  const imageSelectionRef = useRef<SelectionBookmark | null>(null);
  const [tableMenuOpen, setTableMenuOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),
      Underline,
      TextStyle,
      Highlight,
      TextAlignment,
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
      ImageBlockExtension,
      SheetBlockExtension,
      FileAttachmentExtension,
      CalloutBlockExtension,
      ButtonBlock,
      MathBlock,
      MathInline,
      MermaidBlock,
      ChartBlock,
      EmbedBlock,
      InsertBetween,
      LayoutContainer,
      LayoutColumn,
      DragHandle,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TableWidthConstraint,
    ],
    content,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: documentStyle
          ? "prose prose-slate max-w-none focus:outline-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed min-h-[600px]"
          : `prose max-w-none focus:outline-none p-5 text-slate-800 text-sm leading-relaxed min-h-[${minHeight}]`,
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useImperativeHandle(editorRef, () => ({
    insertImage: (src, alt = "") => editor?.chain().focus().insertImageBlock({ src, alt, caption: alt, width: 100, alignment: "center", layoutMode: "inline" }).run() ?? false,
  }), [editor]);

  useEffect(() => {
    if (!editor) return;
    const mapSelection = ({ transaction }: { transaction: Transaction }) => {
      if (imageSelectionRef.current) imageSelectionRef.current = imageSelectionRef.current.map(transaction.mapping);
    };
    editor.on("transaction", mapSelection);
    return () => { editor.off("transaction", mapSelection); };
  }, [editor]);

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
    editor
      .chain()
      .focus()
      .insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: false })
      .run();
    setTableMenuOpen(false);
  };

  return (
    <div
      className={
        documentStyle
          ? cn(
              "flex flex-col w-full h-full min-h-0 overflow-hidden bg-background",
              className
            )
          : cn(
              "border border-slate-200 rounded-xl overflow-hidden bg-white",
              className
            )
      }
    >
      {/* ── Main Toolbar ── */}
      <div
        className={cn(
          "flex flex-wrap items-center gap-1 p-2 bg-slate-50/80 border-b border-slate-200 text-slate-700",
          documentStyle && "sticky top-0 z-10 bg-white shadow-none"
        )}
      >
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

        <select aria-label="Font size" title="Font size" value={editor.getAttributes("textStyle").fontSize || ""} onChange={(event) => { const value = event.target.value; if (value) editor.chain().focus().setFontSize(value).run(); else editor.chain().focus().unsetFontSize().run(); }} className="h-7 max-w-20 rounded border border-slate-200 bg-white px-1 text-xs text-slate-700">
          <option value="">Size</option>{[12, 14, 16, 18, 20, 24, 28, 32, 36, 48].map((size) => <option key={size} value={`${size}px`}>{size}px</option>)}
        </select>
        <label title="Text color" className="flex h-7 items-center gap-1 rounded px-1 text-xs font-semibold text-slate-700 hover:bg-slate-200/60">Text<input aria-label="Text color" type="color" value={/^#[0-9a-f]{6}$/i.test(editor.getAttributes("textStyle").color || "") ? editor.getAttributes("textStyle").color : "#1e293b"} onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" /></label>
        <label title="Highlight color" className="flex h-7 items-center gap-1 rounded px-1 text-xs font-semibold text-slate-700 hover:bg-slate-200/60">Highlight<input aria-label="Highlight color" type="color" value={/^#[0-9a-f]{6}$/i.test(editor.getAttributes("highlight").color || "") ? editor.getAttributes("highlight").color : "#fef08a"} onChange={(event) => editor.chain().focus().setMark("highlight", { color: event.target.value }).run()} className="h-5 w-6 cursor-pointer border-0 bg-transparent p-0" /></label>
        <button type="button" title="Remove highlight" aria-label="Remove highlight" onClick={() => editor.chain().focus().unsetHighlight().run()} className="h-7 rounded px-1 text-xs text-slate-500 hover:bg-slate-200/60">×</button>
        <select aria-label="Text alignment" title="Text alignment" value={(["center", "right", "justify"] as const).find((alignment) => editor.isActive({ textAlign: alignment })) || "left"} onChange={(event) => editor.chain().focus().setTextAlign(event.target.value).run()} className="h-7 rounded border border-slate-200 bg-white px-1 text-xs text-slate-700"><option value="left">Align left</option><option value="center">Center</option><option value="right">Align right</option><option value="justify">Justify</option></select>
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
          <span>Link</span>
        </button>

        {/* Image Block Button */}
        <button
          type="button"
          onClick={() => setImageModalOpen(true)}
          className="h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          title="Insert Image Block (resizable, layout, caption)"
        >
          <ImageIcon className="size-3.5 text-[#115eff]" />
          <span>Image Block</span>
        </button>

        {/* Sheet / Data Table Block Button */}
        <button type="button" onClick={() => { imageSelectionRef.current = editor.state.selection.getBookmark(); setMultiImageOpen(true); }} className="h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer" title="Upload and insert multiple images"><Images className="size-3.5 text-blue-600" /><span>Multiple images</span></button>

        {/* Sheet / Data Table Block Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().insertSheetBlock().run()}
          className="h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors cursor-pointer"
          title="Insert Interactive Sheet / Data Table Block"
        >
          <Table2 className="size-3.5 text-emerald-600" />
          <span>Sheet Block</span>
        </button>

        {/* Document / PDF Block Button */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().insertFileAttachmentBlock().run()
          }
          className="h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
          title="Insert PDF / Document Attachment Block"
        >
          <FileText className="size-3.5 text-[#115eff]" />
          <span>PDF / File</span>
        </button>

        {/* Callout Block Button */}
        <button
          type="button"
          onClick={() => editor.chain().focus().insertCalloutBlock().run()}
          className="h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer"
          title="Insert Callout / Notice Box Block"
        >
          <AlertCircle className="size-3.5 text-amber-600" />
          <span>Callout</span>
        </button>

        <button type="button" onClick={() => editor.chain().focus().setButtonBlock().run()} className="h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer" title="Insert button link"><MousePointerClick className="size-3.5 text-blue-600" /><span>Button</span></button>

        <DropdownMenu><DropdownMenuTrigger asChild><button type="button" title="Insert advanced block" className="h-7 rounded px-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/60">More blocks ▾</button></DropdownMenuTrigger><DropdownMenuContent align="start" className="w-52 p-1">
          <button type="button" onClick={() => editor.chain().focus().setMathBlock().run()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-100"><Sigma className="size-4" /> Display equation</button>
          <button type="button" onClick={() => editor.chain().focus().setMathInline().run()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-100"><Sigma className="size-4" /> Inline equation</button>
          <button type="button" onClick={() => editor.chain().focus().setChartBlock().run()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-100"><BarChart3 className="size-4" /> Chart</button>
          <button type="button" onClick={() => editor.chain().focus().setMermaidBlock().run()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-100"><GitBranch className="size-4" /> Mermaid diagram</button>
          <button type="button" onClick={() => editor.chain().focus().setEmbedBlock().run()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-100"><Braces className="size-4" /> HTML / CSS / JS embed</button>
          <button type="button" onClick={() => editor.chain().focus().setLayoutContainer({ cols: 2 }).run()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-100"><Table2 className="size-4" /> Two columns</button>
          <button type="button" onClick={() => editor.chain().focus().setLayoutContainer({ cols: 3 }).run()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-100"><Table2 className="size-4" /> Three columns</button>
          <button type="button" onClick={() => editor.chain().focus().setLayoutContainer({ cols: 4 }).run()} className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-xs hover:bg-slate-100"><Table2 className="size-4" /> Four columns</button>
        </DropdownMenuContent></DropdownMenu>

        {/* Standard Table Button */}
        <DropdownMenu open={tableMenuOpen} onOpenChange={setTableMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button type="button" title="Insert table" className={`h-7 px-2 rounded flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer ${isTableActive ? "bg-slate-200 text-[#115eff]" : "text-slate-700 hover:bg-slate-200/60"}`}>
              <TableIcon className="size-3.5 text-orange-500" /><span>Table</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 p-3">
            <p className="mb-2 text-xs font-medium text-slate-500">Table size</p>
            <div className="flex items-end gap-2" onKeyDown={(event) => event.stopPropagation()}>
              <label className="space-y-1 text-[10px] text-slate-500">Rows<input aria-label="Table rows" type="number" min={1} max={20} value={tableRows} onChange={(event) => setTableRows(Math.min(20, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))} onKeyDown={(event) => { if (event.key === "Enter") handleInsertTable(); }} className="block h-8 w-14 rounded border border-slate-200 px-1 text-center text-xs text-slate-900" /></label>
              <span className="pb-2 text-xs text-slate-400">×</span>
              <label className="space-y-1 text-[10px] text-slate-500">Columns<input aria-label="Table columns" type="number" min={1} max={20} value={tableCols} onChange={(event) => setTableCols(Math.min(20, Math.max(1, Number.parseInt(event.target.value, 10) || 1)))} onKeyDown={(event) => { if (event.key === "Enter") handleInsertTable(); }} className="block h-8 w-14 rounded border border-slate-200 px-1 text-center text-xs text-slate-900" /></label>
              <button type="button" onClick={handleInsertTable} className="h-8 rounded bg-blue-600 px-3 text-xs font-semibold text-white hover:bg-blue-700">Insert</button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Formatting */}
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
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

        {toolbarExtra && (
          <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-2">
            {toolbarExtra}
          </div>
        )}
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
      {documentStyle ? (
        <div ref={contentContainerRef} className="relative flex-1 min-h-0 overflow-y-auto bg-slate-100/70 dark:bg-[#070b14] p-4 sm:p-6 md:p-8 flex justify-center">
          <TableContextMenu editor={editor} containerRef={contentContainerRef} />
          <TableEdgeControls editor={editor} containerRef={contentContainerRef} />
          <div
            className="relative w-full max-w-[850px] bg-white dark:bg-card text-card-foreground border border-slate-200/90 dark:border-slate-800 rounded-xl min-h-[900px] p-8 sm:p-12 md:p-16 shadow-none cursor-text flex flex-col"
            onClick={(e) => {
              if (e.target === e.currentTarget && editor && !editor.isFocused) {
                editor.commands.focus("end");
              }
            }}
          >
            <EditorContent
              editor={editor}
              className="flex-1 flex flex-col tiptap-content-wrapper"
            />
          </div>
        </div>
      ) : (
        <div ref={contentContainerRef} className="tiptap-content-wrapper relative min-h-[360px] bg-white">
          <TableContextMenu editor={editor} containerRef={contentContainerRef} />
          <TableEdgeControls editor={editor} containerRef={contentContainerRef} />
          <EditorContent editor={editor} />
        </div>
      )}

      {/* Link Dialog Modal */}
      <InsertionMenu editor={editor} />
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

      {/* Image Block Insert / Upload / Crop Modal */}
      {imageModalOpen && (
        <ImageInsertModal
          open={imageModalOpen}
          onClose={() => setImageModalOpen(false)}
          onInsertImage={(src, alt) => {
            editor
              .chain()
              .focus()
              .insertImageBlock({
                src,
                alt: alt || "",
                caption: alt || "",
                width: 100,
                alignment: "center",
                layoutMode: "inline",
              })
              .run();
          }}
        />
      )}
      {multiImageOpen && <MultiImageStagingDialog onClose={() => { imageSelectionRef.current = null; setMultiImageOpen(false); }} onInsert={(images) => {
        const bookmark = imageSelectionRef.current;
        if (!bookmark || editor.isDestroyed) return false;
        imageSelectionRef.current = null;
        try {
          const inserted = insertStagedImages(editor, bookmark, images);
          if (!inserted) imageSelectionRef.current = editor.state.selection.getBookmark();
          return inserted;
        } catch (error) {
          imageSelectionRef.current = bookmark;
          throw error;
        }
      }} />}
    </div>
  );
}

export default TiptapEditor;
