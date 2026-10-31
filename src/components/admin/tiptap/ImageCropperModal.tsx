"use client";

import React, { useState, useCallback } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { X, ZoomIn, ZoomOut, RotateCcw, Crop as CropIcon } from "lucide-react";
import { toast } from "sonner";

interface ImageCropperModalProps {
  open: boolean;
  onClose: () => void;
  imageSrc: string;
  onCroppedAndUploaded: (url: string) => void;
}

const ASPECT_RATIOS = [
  { label: "16:9 Banner", value: 16 / 9 },
  { label: "4:3 Standard", value: 4 / 3 },
  { label: "1:1 Square", value: 1 },
  { label: "Free", value: undefined },
];

async function createCroppedBlob(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.src = imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = (err) => reject(err);
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Unable to create 2d canvas context");
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas toBlob failed"));
          return;
        }
        resolve(blob);
      },
      "image/jpeg",
      0.92
    );
  });
}

export function ImageCropperModal({
  open,
  onClose,
  imageSrc,
  onCroppedAndUploaded,
}: ImageCropperModalProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(16 / 9);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  if (!open || !imageSrc) return null;

  const handleApplyCrop = async () => {
    if (!croppedAreaPixels) return;

    setUploading(true);
    try {
      const blob = await createCroppedBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], `cropped-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      const uploadedUrl = data.url || data.data?.url || data.data?.proxyUrl;

      if (uploadedUrl) {
        toast.success("Image cropped and uploaded successfully");
        onCroppedAndUploaded(uploadedUrl);
        onClose();
      } else {
        toast.error(data.error || "Failed to upload cropped image");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to crop image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-12 px-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <CropIcon className="size-4 text-[#115eff]" />
            <h3 className="text-xs font-bold text-slate-800">
              Crop Image
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

        {/* Cropper Canvas Viewport */}
        <div className="relative w-full h-[380px] bg-slate-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls Footer */}
        <div className="p-4 border-t border-slate-200 bg-white flex flex-col gap-3">
          {/* Aspect Ratios & Zoom Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Aspect Presets */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 mr-1">
                Ratio:
              </span>
              {ASPECT_RATIOS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setAspect(item.value)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors border ${
                    aspect === item.value
                      ? "bg-[#115eff] text-white border-[#115eff]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2">
              <ZoomOut className="size-3.5 text-slate-400" />
              <input
                type="range"
                min={1}
                max={3}
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-28 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#115eff]"
              />
              <ZoomIn className="size-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setCrop({ x: 0, y: 0 });
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
                title="Reset zoom"
              >
                <RotateCcw className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="h-8 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApplyCrop}
              disabled={uploading}
              className="h-8 px-4 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] text-xs font-semibold text-white transition-colors disabled:opacity-50"
            >
              {uploading ? "Cropping & Uploading..." : "Apply & Insert"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
