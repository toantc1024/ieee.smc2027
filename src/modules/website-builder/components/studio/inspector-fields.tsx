"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronsDownUp,
  ChevronsUpDown,
  FileText,
  FolderOpen,
  GripVertical,
  ImagePlus,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MediaLibraryModal } from "@/components/media/MediaLibraryModal";
import type { FieldDefinition } from "../../types";
import { RichTextField } from "./rich-text-field";
import { UnifiedColorPicker } from "./unified-color-picker";
import { uploadEditorMedia } from "../../utils/upload-media";
import { cn } from "@/lib/utils";

export type FieldPath = (string | number)[];

interface InspectorFieldProps {
  field: FieldDefinition;
  value: unknown;
  path: FieldPath;
  onChange: (path: FieldPath, value: unknown) => void;
  disabled?: boolean;
  onBusyChange: (path: string, busy: boolean) => void;
}

export function createFieldDefault(field: FieldDefinition): unknown {
  if (field.defaultValue !== undefined) return structuredClone(field.defaultValue);
  if (field.type === "switch") return false;
  if (field.type === "number") return field.min ?? 0;
  if (field.type === "array") return [];
  if (field.type === "object") {
    return Object.fromEntries(
      Object.entries(field.fields || {}).map(([key, child]) => [key, createFieldDefault(child)])
    );
  }
  if (field.type === "select") return field.options?.[0]?.value ?? "";
  return "";
}

function UploadField({ field, value, path, onChange, disabled, onBusyChange }: InspectorFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const id = useId();
  const url = typeof value === "string" ? value : "";
  const isImage = field.type === "image";
  const isLogoLike = /logo|icon|badge/i.test(String(path[path.length - 1] || field.label));
  const accept =
    field.accept ||
    (isImage ? "image/jpeg,image/png,image/webp,image/gif,image/svg+xml" : "application/pdf");
  const busyKey = JSON.stringify(path);

  useEffect(() => () => {
    controllerRef.current?.abort();
  }, []);

  async function upload(file: File) {
    if (uploading || disabled) return;
    const allowed = accept.split(",").map((type) => type.trim());
    if (
      !allowed.some((type) =>
        type.endsWith("/*") ? file.type.startsWith(type.slice(0, -1)) : type === file.type
      )
    ) {
      setError(
        isImage ? "Choose a JPG, PNG, WebP, GIF, or SVG image." : "Choose a PDF document."
      );
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Choose a file smaller than 10 MB.");
      return;
    }
    const controller = new AbortController();
    controllerRef.current = controller;
    setUploading(true);
    onBusyChange(busyKey, true);
    setError("");
    try {
      const uploadedUrl = await uploadEditorMedia(file, controller.signal);
      if (!controller.signal.aborted) {
        setBrokenUrl(null);
        setError("");
        onChange(path, uploadedUrl);
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        let msg = err instanceof Error ? err.message : "Upload failed. Please try again.";
        if (msg.includes("<Message>")) {
          const match = msg.match(/<Message>(.*?)<\/Message>/);
          if (match) msg = match[1];
        }
        setError(msg);
      }
    } finally {
      onBusyChange(busyKey, false);
      if (!controller.signal.aborted) setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled && !uploading && !dragging) setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setDragging(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void upload(file);
  };

  const hasValidImage = isImage && Boolean(url) && brokenUrl !== url;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-semibold text-slate-700">
          {field.label}
        </Label>
        {url && (
          <button
            type="button"
            aria-label={`Clear ${field.label}`}
            disabled={disabled || uploading}
            onClick={() => {
              setBrokenUrl(null);
              onChange(path, "");
            }}
            className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 cursor-pointer"
            title="Remove media"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {hasValidImage ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "group relative aspect-video w-full overflow-hidden rounded-xl border bg-slate-100/70 transition-colors",
            dragging ? "border-blue-600 ring-2 ring-blue-500/20" : "border-slate-200"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={`${field.label} preview`}
            onError={() => setBrokenUrl(url)}
            className={cn(
              "h-full w-full",
              isLogoLike ? "object-contain p-3" : "object-cover"
            )}
          />

          {/* Center-Hover Action Overlay */}
          {!uploading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 p-3 opacity-0 backdrop-blur-[1px] transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button
                type="button"
                disabled={disabled || uploading}
                aria-label={`Replace ${field.label}`}
                onClick={() => inputRef.current?.click()}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-xs font-semibold text-slate-900 shadow-md transition-colors hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
              >
                <Upload className="size-3.5 text-blue-600" />
                <span>Change</span>
              </button>
              <button
                type="button"
                disabled={disabled || uploading}
                aria-label={`Choose ${field.label} from library`}
                onClick={() => setLibraryOpen(true)}
                className="flex h-8 items-center gap-1.5 rounded-lg bg-white/95 px-2.5 text-xs font-semibold text-slate-900 shadow-md transition-colors hover:bg-blue-50 hover:text-blue-700 cursor-pointer"
              >
                <FolderOpen className="size-3.5 text-blue-600" />
                <span>Library</span>
              </button>
              <button
                type="button"
                disabled={disabled || uploading}
                aria-label={`Remove ${field.label}`}
                onClick={() => {
                  setBrokenUrl(null);
                  onChange(path, "");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white shadow-md transition-colors hover:bg-rose-700 cursor-pointer"
                title="Remove"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          )}

          {uploading && (
            <div
              role="status"
              className="absolute inset-0 flex items-center justify-center gap-2 bg-white/90 text-xs font-semibold text-blue-700"
            >
              <Loader2 className="size-4 animate-spin" />
              <span>Uploading…</span>
            </div>
          )}
        </div>
      ) : !isImage && url ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className="group relative flex items-center justify-between gap-2.5 rounded-xl border border-slate-200/85 bg-white p-3.5"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#115eff] text-white shadow-xs">
              <FileText className="size-4" />
            </div>
            <span className="truncate text-sm font-bold text-slate-900">
              {url.split("/").pop() || url}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              disabled={disabled || uploading}
              aria-label={`Replace ${field.label}`}
              onClick={() => inputRef.current?.click()}
              className="h-8 rounded-lg border border-slate-200/85 bg-white px-3 text-xs font-bold text-slate-800 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Change
            </button>
            <button
              type="button"
              disabled={disabled || uploading}
              aria-label={`Choose ${field.label} from library`}
              onClick={() => setLibraryOpen(true)}
              className="h-8 rounded-lg border border-slate-200/85 bg-white px-3 text-xs font-bold text-slate-800 hover:border-slate-300 hover:bg-slate-50 cursor-pointer"
            >
              Library
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            "relative flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors",
            dragging
              ? "border-[#115eff] bg-blue-50/40 ring-1 ring-[#115eff]/30"
              : "border-slate-200/85 bg-white hover:border-slate-300",
            isImage ? "min-h-32" : "min-h-24"
          )}
        >
          <div className="space-y-0.5">
            <p className="text-sm font-bold text-slate-800">
              {url ? "Select a replacement" : isImage ? "Select or drop image" : "Select or drop PDF"}
            </p>
            <p className="text-xs text-slate-400">
              Max 10 MB
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              type="button"
              disabled={disabled || uploading}
              aria-label={`${url ? "Replace" : "Upload"} ${field.label}`}
              aria-busy={uploading}
              onClick={() => inputRef.current?.click()}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] px-4 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              <Upload className="size-3.5" />
              <span>Upload</span>
            </button>
            <button
              type="button"
              disabled={disabled || uploading}
              aria-label={`Choose ${field.label} from library`}
              onClick={() => setLibraryOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200/85 bg-white hover:border-slate-300 px-4 text-xs font-bold text-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <FolderOpen className="size-3.5 text-slate-600" />
              <span>Library</span>
            </button>
          </div>

          {uploading && (
            <div
              role="status"
              className="absolute inset-0 flex items-center justify-center gap-2 rounded-xl bg-white/95 text-xs font-bold text-[#004776]"
            >
              <Loader2 className="size-4 animate-spin" />
              <span>Uploading…</span>
            </div>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        aria-label={`Choose file for ${field.label}`}
        className="hidden"
        disabled={disabled || uploading}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />

      <Input
        id={id}
        value={url}
        disabled={disabled || uploading}
        placeholder={isImage ? "Or paste image URL" : "Or paste document URL"}
        onChange={(event) => {
          setError("");
          setBrokenUrl(null);
          onChange(path, event.target.value);
        }}
        className="h-10 bg-white text-sm font-medium border-slate-200/85 rounded-lg px-3"
      />

      {field.description && (
        <p className="text-xs leading-relaxed text-slate-500">{field.description}</p>
      )}
      {error && (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      )}

      {libraryOpen && (
        <MediaLibraryModal
          open={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          onSelect={(selectedUrl) => {
            setError("");
            setBrokenUrl(null);
            onChange(path, selectedUrl);
          }}
          defaultFolder="public/uploads"
          accept={accept}
          title={`Select ${field.label}`}
        />
      )}
    </div>
  );
}

function ArrayField(props: InspectorFieldProps) {
  const { field, value, path, onChange, disabled } = props;
  const items = Array.isArray(value) ? value : [];
  const fields = field.itemFields || field.arrayFields || {};
  const [expandedSet, setExpandedSet] = useState<Set<number>>(() => new Set([0]));
  const itemLabel = field.itemLabel || "item";

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dropPosition, setDropPosition] = useState<"before" | "after" | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const didDragRef = useRef(false);

  const arrayPathKey = path.join(".");

  useEffect(() => {
    if (draggedIndex === null) return;
    let clientY: number | null = null;
    let frameId = 0;

    const findScrollParent = (el: HTMLElement | null): HTMLElement | null => {
      let cur = el?.parentElement || null;
      while (cur) {
        const style = window.getComputedStyle(cur);
        if (/(auto|scroll)/.test(style.overflowY) && cur.scrollHeight > cur.clientHeight) {
          return cur;
        }
        cur = cur.parentElement;
      }
      return null;
    };

    const handleWindowDragOver = (event: DragEvent) => {
      clientY = event.clientY;
    };

    const tick = () => {
      if (clientY !== null) {
        const scrollParent = findScrollParent(listRef.current);
        if (scrollParent) {
          const rect = scrollParent.getBoundingClientRect();
          const threshold = 72;
          if (clientY < rect.top + threshold) {
            const intensity = (rect.top + threshold - clientY) / threshold;
            scrollParent.scrollTop -= Math.max(2, Math.round(intensity * 14));
          } else if (clientY > rect.bottom - threshold) {
            const intensity = (clientY - (rect.bottom - threshold)) / threshold;
            scrollParent.scrollTop += Math.max(2, Math.round(intensity * 14));
          }
        }
      }
      frameId = requestAnimationFrame(tick);
    };

    window.addEventListener("dragover", handleWindowDragOver);
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      cancelAnimationFrame(frameId);
    };
  }, [draggedIndex]);

  const name = (item: Record<string, unknown>, index: number) => {
    const raw =
      item?.[field.itemLabelKey || "title"] ||
      item?.name ||
      item?.label ||
      item?.question ||
      item?.groupName ||
      item?.dateStr ||
      item?.category;
    if (typeof raw === "string" && raw.trim()) return raw;
    if (raw && typeof raw === "object" && "en" in raw && typeof (raw as { en?: string }).en === "string") {
      return (raw as { en: string }).en;
    }
    return `${itemLabel} ${index + 1}`;
  };

  function toggleIndex(idx: number) {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  function move(index: number, offset: number) {
    const next = [...items];
    const target = index + offset;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(path, next);
    setExpandedSet(new Set([target]));
  }

  function handleDragStart(e: React.DragEvent, index: number) {
    if (disabled) return;
    didDragRef.current = true;
    e.dataTransfer.setData("text/plain", String(index));
    e.dataTransfer.setData("application/x-builder-array-path", arrayPathKey);
    e.dataTransfer.effectAllowed = "move";
    const headerEl = e.currentTarget.parentElement;
    if (headerEl && e.dataTransfer.setDragImage) {
      e.dataTransfer.setDragImage(headerEl, 18, 20);
    }
    setDraggedIndex(index);
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    if (draggedIndex === null || draggedIndex === index || disabled) return;
    const dragSourcePath = e.dataTransfer.getData("application/x-builder-array-path");
    if (dragSourcePath && dragSourcePath !== arrayPathKey) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const pos: "before" | "after" = e.clientY < midY ? "before" : "after";
    setDragOverIndex(index);
    setDropPosition(pos);
  }

  function handleDragLeave(e: React.DragEvent, index: number) {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverIndex === index) {
      setDragOverIndex(null);
      setDropPosition(null);
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDropPosition(null);
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        didDragRef.current = false;
      });
    } else {
      didDragRef.current = false;
    }
  }

  function handleDrop(e: React.DragEvent, targetIndex: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex || disabled) {
      handleDragEnd();
      return;
    }

    const from = draggedIndex;
    let target = targetIndex;
    if (dropPosition === "after" && from > targetIndex) {
      target = targetIndex + 1;
    } else if (dropPosition === "before" && from < targetIndex) {
      target = targetIndex - 1;
    }

    const next = [...items];
    const [moved] = next.splice(from, 1);
    const clamped = Math.max(0, Math.min(next.length, target));
    next.splice(clamped, 0, moved);
    onChange(path, next);

    setExpandedSet((prev) => {
      const nextSet = new Set<number>();
      prev.forEach((idx) => {
        if (idx === from) {
          nextSet.add(clamped);
        } else {
          let updated = idx;
          if (from < clamped && idx > from && idx <= clamped) updated = idx - 1;
          else if (from > clamped && idx >= clamped && idx < from) updated = idx + 1;
          nextSet.add(updated);
        }
      });
      return nextSet;
    });

    handleDragEnd();
  }

  const allExpanded = items.length > 0 && expandedSet.size >= items.length;

  return (
    <div ref={listRef} className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h5 className="text-base font-bold text-slate-900">{field.label}</h5>
          <span className="rounded-md bg-[#115eff] px-2 py-0.5 text-xs font-bold text-white shadow-xs">
            {items.length}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {items.length > 1 && (
            <button
              type="button"
              onClick={() =>
                setExpandedSet(allExpanded ? new Set() : new Set(items.map((_, i) => i)))
              }
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
              title={allExpanded ? "Collapse all" : "Expand all"}
            >
              {allExpanded ? (
                <ChevronsDownUp className="size-3.5" />
              ) : (
                <ChevronsUpDown className="size-3.5" />
              )}
            </button>
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              const item =
                field.defaultItem !== undefined
                  ? structuredClone(field.defaultItem)
                  : Object.fromEntries(
                      Object.entries(fields).map(([key, child]) => [key, createFieldDefault(child)])
                    );
              if ("id" in fields) item.id = crypto.randomUUID();
              onChange(path, [...items, item]);
              setExpandedSet(new Set([items.length]));
            }}
            className="flex items-center gap-1.5 rounded-lg bg-[#115eff] hover:bg-[#0a4de6] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add {itemLabel}</span>
          </button>
        </div>
      </div>

      {field.description && (
        <p className="text-xs leading-relaxed text-slate-500">{field.description}</p>
      )}

      {items.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200/85 bg-white px-3 py-6 text-center text-sm font-medium text-slate-500">
          No {field.label.toLowerCase()} yet. Click Add {itemLabel} to create one.
        </div>
      )}

      {items.map((item, index) => {
        const title = name(item, index);
        const open = expandedSet.has(index);
        const isDraggingThis = draggedIndex === index;
        const isTargetingThis = dragOverIndex === index;
        const thumbnail =
          typeof item?.image === "string" && item.image
            ? item.image
            : typeof item?.photo === "string" && item.photo
              ? item.photo
              : typeof item?.logo === "string" && item.logo
                ? item.logo
                : "";

        return (
          <div
            key={index}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={(e) => handleDragLeave(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            className="relative"
          >
            {/* Blue drop indicator seam above */}
            {isTargetingThis && dropPosition === "before" && (
              <div className="absolute -top-1.5 left-0 right-0 z-30 h-1 bg-[#115eff] rounded-full shadow-xs pointer-events-none" />
            )}

            <div
              className={cn(
                "group/item overflow-hidden rounded-xl border transition-all",
                isDraggingThis
                  ? "opacity-40 border-dashed border-[#115eff] bg-blue-50/30 scale-[0.99]"
                  : open
                    ? "border-[#115eff] bg-white shadow-xs ring-1 ring-[#115eff]/20"
                    : "border-slate-200/85 bg-white hover:border-slate-300"
              )}
            >
              <div className="flex items-center gap-1 pr-1.5 bg-white">
                {/* Left-side Drag handle (visible on hover; click toggles accordion) */}
                <div
                  draggable={!disabled}
                  onMouseDown={() => {
                    didDragRef.current = false;
                  }}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (!didDragRef.current) toggleIndex(index);
                  }}
                  className={cn(
                    "p-2 text-slate-400 hover:text-[#004776] hover:bg-slate-100 rounded-l cursor-grab active:cursor-grabbing transition-opacity shrink-0 flex items-center justify-center",
                    isDraggingThis
                      ? "opacity-100"
                      : "opacity-0 group-hover/item:opacity-100 focus-within:opacity-100"
                  )}
                  title="Drag to reorder position"
                  aria-label={`Drag to reorder ${title}`}
                >
                  <GripVertical className="size-4" />
                </div>

                <button
                  type="button"
                  aria-expanded={open}
                  onClick={() => toggleIndex(index)}
                  className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 pr-2 text-left focus-visible:outline-2 focus-visible:outline-[#004776] cursor-pointer"
                >
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md bg-slate-100 border border-slate-200/80 px-1 text-xs font-bold text-slate-800">
                    #{index + 1}
                  </span>
                  {thumbnail && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={thumbnail}
                      alt=""
                      className="size-7 shrink-0 rounded-md border border-slate-200/80 bg-slate-100 object-cover"
                    />
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-slate-900">
                    {title}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-slate-400 transition-transform",
                      open && "rotate-180 text-slate-900"
                    )}
                  />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${title} up`}
                  disabled={disabled || index === 0}
                  onClick={() => move(index, -1)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-25 cursor-pointer"
                  title="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${title} down`}
                  disabled={disabled || index === items.length - 1}
                  onClick={() => move(index, 1)}
                  className="rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-25 cursor-pointer"
                  title="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${title}`}
                  disabled={disabled}
                  onClick={() => {
                    onChange(
                      path,
                      items.filter((_, i) => i !== index)
                    );
                    setExpandedSet((prev) => {
                      const next = new Set<number>();
                      prev.forEach((v) => {
                        if (v < index) next.add(v);
                        else if (v > index) next.add(v - 1);
                      });
                      return next;
                    });
                  }}
                  className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-25 cursor-pointer"
                  title="Remove"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>

              {open && (
                <div className="space-y-4 border-t border-slate-200 p-4 bg-white">
                  {Object.entries(fields)
                    .filter(([key]) => key !== "id")
                    .map(([key, child]) => (
                      <InspectorField
                        {...props}
                        key={key}
                        field={child}
                        value={item?.[key] ?? createFieldDefault(child)}
                        path={[...path, index, key]}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Blue drop indicator seam below */}
            {isTargetingThis && dropPosition === "after" && (
              <div className="absolute -bottom-1.5 left-0 right-0 z-30 h-1 bg-[#115eff] rounded-full shadow-xs pointer-events-none" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function InspectorField(props: InspectorFieldProps) {
  const { field, value, path, onChange, disabled } = props;
  const id = useId();
  const descriptionId = `${id}-description`;
  const localized =
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    ("vi" in value || "en" in value) &&
    ["text", "textarea", "richtext"].includes(field.type)
      ? (value as Record<string, unknown>)
      : null;
  const currentValue = localized ? localized.en : value;
  const textValue =
    typeof currentValue === "string" || typeof currentValue === "number" ? currentValue : "";
  const changeText = (next: string) =>
    onChange(path, localized ? { ...localized, en: next } : next);

  if (field.type === "array") return <ArrayField {...props} />;
  if (field.type === "image" || field.type === "file") return <UploadField {...props} />;

  if (field.type === "color") {
    return (
      <div className="space-y-1">
        <UnifiedColorPicker
          label={field.label}
          value={String(textValue)}
          onChange={(next) => onChange(path, next)}
          allowGradient={/background|gradient/i.test(field.label)}
        />
        {field.description && (
          <p className="text-xs leading-relaxed text-slate-500">{field.description}</p>
        )}
      </div>
    );
  }

  if (field.type === "object") {
    return (
      <fieldset className="space-y-3 rounded-xl border border-slate-200/85 bg-white p-4">
        <legend className="px-1.5 text-sm font-bold text-slate-700">{field.label}</legend>
        {Object.entries(field.fields || {}).map(([key, child]) => (
          <InspectorField
            {...props}
            key={key}
            field={child}
            value={(value as Record<string, unknown> | null)?.[key] ?? createFieldDefault(child)}
            path={[...path, key]}
          />
        ))}
      </fieldset>
    );
  }

  if (field.type === "switch") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200/85 bg-white px-4 py-3">
        <div className="min-w-0">
          <Label htmlFor={id} className="text-sm font-bold text-slate-900 cursor-pointer">
            {field.label}
          </Label>
          {field.description && (
            <p id={descriptionId} className="mt-0.5 text-xs text-slate-500">
              {field.description}
            </p>
          )}
        </div>
        <Switch
          id={id}
          checked={Boolean(value)}
          disabled={disabled}
          aria-describedby={field.description ? descriptionId : undefined}
          onCheckedChange={(checked) => onChange(path, checked)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-bold text-slate-900">
        {field.label}
      </Label>
      {field.type === "richtext" ? (
        <RichTextField id={id} content={String(textValue)} onChange={changeText} />
      ) : field.type === "textarea" ? (
        <Textarea
          id={id}
          value={textValue}
          disabled={disabled}
          placeholder={field.placeholder}
          aria-describedby={field.description ? descriptionId : undefined}
          onChange={(event) => changeText(event.target.value)}
          className="min-h-24 resize-y bg-white text-sm font-medium leading-relaxed border-slate-200/85 rounded-lg p-3"
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={textValue}
          disabled={disabled}
          onChange={(event) => {
            const option = field.options?.find(
              (opt) => String(opt.value) === event.target.value
            );
            onChange(path, option?.value ?? event.target.value);
          }}
          className="h-10 w-full rounded-lg border border-slate-200/85 bg-white px-3 text-sm font-medium text-slate-900 focus:border-[#115eff] focus:outline-none focus:ring-2 focus:ring-[#115eff]/15"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={id}
          type={field.type === "number" ? "number" : "text"}
          value={textValue}
          disabled={disabled}
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          placeholder={field.placeholder}
          aria-describedby={field.description ? descriptionId : undefined}
          onChange={(event) =>
            field.type === "number"
              ? onChange(path, event.target.value === "" ? "" : Number(event.target.value))
              : changeText(event.target.value)
          }
          className="h-10 min-w-0 bg-white text-sm font-medium border-slate-200/85 rounded-lg px-3"
        />
      )}
      {field.description && (
        <p id={descriptionId} className="text-xs leading-relaxed text-slate-500">
          {field.description}
        </p>
      )}
    </div>
  );
}
