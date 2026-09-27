"use client";

import React, { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  ImageIcon,
  Upload,
  Link as LinkIcon,
  Code,
} from "lucide-react";

interface TiptapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Viết nội dung bài viết ở đây...",
}: TiptapEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrlModal, setImageUrlModal] = useState(false);
  const [customImageUrl, setCustomImageUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none focus:outline-none min-h-[300px] p-4 text-slate-800 text-sm leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[300px] bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
        Đang khởi động trình soạn thảo Tiptap...
      </div>
    );
  }

  // Handle local file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert(data.error || "Lỗi tải ảnh lên");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Không thể tải ảnh lên máy chủ");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!customImageUrl) return;
    editor.chain().focus().setImage({ src: customImageUrl }).run();
    setCustomImageUrl("");
    setImageUrlModal(false);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer ${
            editor.isActive("bold") ? "bg-[#115eff] text-white hover:bg-[#115eff]" : ""
          }`}
          title="In đậm (Bold)"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer ${
            editor.isActive("italic") ? "bg-[#115eff] text-white hover:bg-[#115eff]" : ""
          }`}
          title="In nghiêng (Italic)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer ${
            editor.isActive("strike") ? "bg-[#115eff] text-white hover:bg-[#115eff]" : ""
          }`}
          title="Gạch ngang (Strikethrough)"
        >
          <Strikethrough className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer ${
            editor.isActive("heading", { level: 2 })
              ? "bg-[#115eff] text-white hover:bg-[#115eff]"
              : ""
          }`}
          title="Tiêu đề H2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer ${
            editor.isActive("heading", { level: 3 })
              ? "bg-[#115eff] text-white hover:bg-[#115eff]"
              : ""
          }`}
          title="Tiêu đề H3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-1" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer ${
            editor.isActive("bulletList") ? "bg-[#115eff] text-white hover:bg-[#115eff]" : ""
          }`}
          title="Danh sách dấu chấm"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer ${
            editor.isActive("orderedList") ? "bg-[#115eff] text-white hover:bg-[#115eff]" : ""
          }`}
          title="Danh sách số"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer ${
            editor.isActive("blockquote") ? "bg-[#115eff] text-white hover:bg-[#115eff]" : ""
          }`}
          title="Trích dẫn"
        >
          <Quote className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-slate-200/80 transition-colors cursor-pointer"
          title="Đường kẻ ngang"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-1" />

        {/* Upload Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-blue-50 text-[#115eff] hover:bg-blue-100 transition-colors text-xs font-bold cursor-pointer"
          title="Tải ảnh từ máy tính"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{uploading ? "Đang tải..." : "Tải ảnh lên"}</span>
        </button>

        {/* Image URL Button */}
        <button
          type="button"
          onClick={() => setImageUrlModal(true)}
          className="p-1.5 rounded hover:bg-slate-200/80 text-slate-600 transition-colors cursor-pointer"
          title="Chèn ảnh từ link URL"
        >
          <ImageIcon className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-5 bg-slate-200 mx-1 ml-auto" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-slate-200/80 disabled:opacity-40 transition-colors cursor-pointer"
          title="Hoàn tác (Undo)"
        >
          <Undo2 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-slate-200/80 disabled:opacity-40 transition-colors cursor-pointer"
          title="Làm lại (Redo)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />

      {/* Modal Chèn Ảnh Từ URL */}
      {imageUrlModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 p-5 w-full max-w-sm space-y-4">
            <h4 className="font-bold text-[#004776] text-sm">Chèn Ảnh từ Đường Dẫn (URL)</h4>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={customImageUrl}
              onChange={(e) => setCustomImageUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-[#115eff]"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setImageUrlModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="px-3 py-1.5 text-xs bg-[#115eff] text-white font-bold rounded hover:bg-[#0a4de6] cursor-pointer"
              >
                Chèn Ảnh
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TiptapEditor;
