"use client";

import React, { useState, useRef } from "react";
import { ImageIcon, Upload, Crop, X, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { ImageCropperModal } from "./ImageCropperModal";

interface ImageInsertModalProps {
  open: boolean;
  onClose: () => void;
  onInsertImage: (src: string, alt?: string) => void;
}

export function ImageInsertModal({
  open,
  onClose,
  onInsertImage,
}: ImageInsertModalProps) {
  const [activeTab, setActiveTab] = useState<"upload" | "url">("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const uploadedUrl = data.url || data.data?.url || data.data?.proxyUrl;

      if (uploadedUrl) {
        toast.success("Image uploaded successfully");
        onInsertImage(uploadedUrl, altText.trim() || file.name);
        onClose();
      } else {
        toast.error(data.error || "Image upload failed");
      }
    } catch {
      toast.error("Unable to upload image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCropFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRawImageForCrop(reader.result as string);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = "";
  };

  const handleInsertFromUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) return;
    onInsertImage(imageUrl.trim(), altText.trim());
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-slate-200 w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="h-11 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <ImageIcon className="size-4 text-[#115eff]" />
              <h3 className="text-xs font-bold text-slate-800">
                Insert Image
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-slate-200 bg-slate-50/60 p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "upload"
                  ? "bg-white text-[#115eff] border border-slate-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Upload className="size-3.5" />
              <span>Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("url")}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                activeTab === "url"
                  ? "bg-white text-[#115eff] border border-slate-200 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <LinkIcon className="size-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          <div className="p-4 space-y-4">
            {activeTab === "upload" ? (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <label
                  htmlFor="crop-file-input"
                  className="hidden"
                >
                  <input
                    id="crop-file-input"
                    type="file"
                    accept="image/*"
                    onChange={handleCropFileSelected}
                  />
                </label>

                {/* Direct Upload Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-[#115eff] rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-blue-50/30 flex flex-col items-center justify-center gap-2"
                >
                  <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <Upload className="size-5 text-[#115eff]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      {uploading ? "Uploading image to server..." : "Click to select and upload"}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      PNG, JPG, WEBP, GIF up to 10MB
                    </p>
                  </div>
                </div>

                {/* Optional Crop & Upload Button */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500">
                    Want to crop before inserting?
                  </span>
                  <label
                    htmlFor="crop-file-input"
                    className="h-7 px-2.5 rounded-lg border border-slate-200 hover:border-slate-300 text-[11px] font-semibold text-slate-700 bg-white hover:bg-slate-50 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Crop className="size-3.5 text-[#115eff]" />
                    <span>Crop & Upload</span>
                  </label>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInsertFromUrl} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Image Address
                  </label>
                  <input
                    type="url"
                    autoFocus
                    placeholder="https://images.unsplash.com/..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full h-8 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#115eff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">
                    Alt description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description for accessibility..."
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full h-8 px-3 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#115eff]"
                  />
                </div>

                {imageUrl && (
                  <div className="w-full h-32 rounded-lg border border-slate-200 bg-slate-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!imageUrl.trim()}
                    className="h-8 px-4 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] text-xs font-semibold text-white transition-colors disabled:opacity-50"
                  >
                    Insert Image
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {cropperOpen && rawImageForCrop && (
        <ImageCropperModal
          open={cropperOpen}
          imageSrc={rawImageForCrop}
          onClose={() => {
            setCropperOpen(false);
            setRawImageForCrop(null);
          }}
          onCroppedAndUploaded={(url) => {
            onInsertImage(url);
            onClose();
          }}
        />
      )}
    </>
  );
}
