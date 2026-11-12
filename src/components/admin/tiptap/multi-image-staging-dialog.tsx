"use client";
/* eslint-disable @next/next/no-img-element -- Local file previews use object URLs. */

import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowDown, ArrowUp, Images, Plus, Trash2, Upload, X } from "lucide-react";
import { uploadPostMedia } from "./upload";
import { uploadStagedImages, type StagedImage } from "./multi-image-upload";

interface Props {
  onClose: () => void;
  onInsert: (images: StagedImage[]) => boolean;
}

/** Stage captions and photo credits before uploading and inserting images. */
export function MultiImageStagingDialog({ onClose, onInsert }: Props) {
  const [images, setImages] = useState<StagedImage[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const previews = useRef(new Set<string>());
  const aborter = useRef<AbortController | null>(null);
  const uploading = useRef(false);
  useEffect(() => {
    const urls = previews.current;
    return () => { aborter.current?.abort(); urls.forEach((url) => URL.revokeObjectURL(url)); urls.clear(); };
  }, []);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const incoming = Array.from(files);
    const selected = incoming.filter((file) => file.type.startsWith("image/"));
    const added = selected.map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.add(preview);
      return { id: crypto.randomUUID(), file, preview, alt: file.name.replace(/\.[^/.]+$/, ""), caption: "", credit: "" };
    });
    setImages((current) => [...current, ...added]);
    setMessage(incoming.length !== selected.length ? "Only image files can be added." : "");
    if (input.current) input.current.value = "";
  }
  function update(id: string, changes: Partial<StagedImage>) { setImages((current) => current.map((image) => image.id === id ? { ...image, ...changes } : image)); }
  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const destination = index + direction;
      if (destination < 0 || destination >= current.length) return current;
      const next = [...current];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }
  function remove(image: StagedImage) {
    URL.revokeObjectURL(image.preview);
    previews.current.delete(image.preview);
    setImages((current) => current.filter((item) => item.id !== image.id));
  }
  async function uploadAndInsert() {
    if (uploading.current || !images.length) return;
    uploading.current = true;
    const controller = new AbortController();
    aborter.current = controller;
    setBusy(true);
    setMessage("");
    try {
      const results = await uploadStagedImages(images, (file) => uploadPostMedia(file, controller.signal));
      if (controller.signal.aborted) return;
      setImages(results);
      const failed = results.filter((image) => !image.url).length;
      if (failed) {
        setMessage(`${failed} ${failed === 1 ? "image could" : "images could"} not be uploaded. Retry or remove the failed ${failed === 1 ? "image" : "images"}.`);
        return;
      }
      if (!onInsert(results)) { setMessage("Could not insert the images at the saved position. Please try again."); return; }
      onClose();
    } catch (error) {
      if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Unable to insert images.");
    } finally {
      uploading.current = false;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  return <Dialog.Root open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950/55 backdrop-blur-sm" />
      <Dialog.Content onEscapeKeyDown={(event) => { if (busy) event.preventDefault(); }} onPointerDownOutside={(event) => { if (busy) event.preventDefault(); }} className="fixed left-1/2 top-1/2 z-[101] flex max-h-[90dvh] w-[min(940px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl focus:outline-none">
        <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4"><div className="rounded-xl bg-blue-50 p-2 text-blue-700"><Images className="size-5" /></div><div className="min-w-0 flex-1"><Dialog.Title className="text-base font-bold text-slate-900">Insert multiple images</Dialog.Title><Dialog.Description className="mt-1 text-xs text-slate-500">Choose images, set captions and credits, then arrange their order.</Dialog.Description></div><Dialog.Close disabled={busy} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 disabled:opacity-40"><X className="size-5" /></Dialog.Close></div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <input ref={input} type="file" accept="image/*" multiple className="sr-only" onChange={(event) => addFiles(event.target.files)} />
          <button type="button" disabled={busy} onClick={() => input.current?.click()} className="inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50"><Plus className="size-4" />Choose images</button>
          {images.length === 0 && <div className="mt-4 flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center text-sm text-slate-500"><Images className="mb-2 size-7 text-slate-400" />Choose one or more images to begin.</div>}
          <div className="mt-4 space-y-3">{images.map((image, index) => <div key={image.id} className="grid gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-[140px_minmax(0,1fr)_auto]">
            <div className="flex min-h-28 items-center justify-center overflow-hidden rounded-lg bg-slate-200"><img src={image.preview} alt="" className="max-h-36 w-full object-contain" /></div>
            <div className="min-w-0 space-y-2"><p className="truncate text-xs font-semibold text-slate-700" title={image.file.name}>{index + 1}. {image.file.name}{image.url && <span className="ml-2 text-emerald-700">Uploaded</span>}</p><div className="grid gap-2 sm:grid-cols-2"><label className="text-[11px] font-semibold text-slate-600">Alt text<input disabled={busy} value={image.alt} onChange={(event) => update(image.id, { alt: event.target.value })} className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-normal" /></label><label className="text-[11px] font-semibold text-slate-600">Photo credit<input disabled={busy} value={image.credit} onChange={(event) => update(image.id, { credit: event.target.value })} className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-normal" /></label></div><label className="block text-[11px] font-semibold text-slate-600">Caption<input disabled={busy} value={image.caption} onChange={(event) => update(image.id, { caption: event.target.value })} className="mt-1 h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-xs font-normal" /></label>{image.error && <p role="alert" className="text-xs text-red-700">{image.error}</p>}</div>
            <div className="flex gap-1 sm:flex-col"><button type="button" aria-label={`Move ${image.file.name} up`} disabled={busy || index === 0} onClick={() => move(index, -1)} className="rounded-md p-2 text-slate-500 hover:bg-white disabled:opacity-30"><ArrowUp className="size-4" /></button><button type="button" aria-label={`Move ${image.file.name} down`} disabled={busy || index === images.length - 1} onClick={() => move(index, 1)} className="rounded-md p-2 text-slate-500 hover:bg-white disabled:opacity-30"><ArrowDown className="size-4" /></button><button type="button" aria-label={`Remove ${image.file.name}`} disabled={busy} onClick={() => remove(image)} className="rounded-md p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-30"><Trash2 className="size-4" /></button></div>
          </div>)}</div>
          {message && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-700">{message}</p>}
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4"><p className="text-xs text-slate-500">{images.length} {images.length === 1 ? "image" : "images"} selected</p><div className="flex gap-2"><button type="button" onClick={onClose} disabled={busy} className="h-9 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-700 disabled:opacity-40">Cancel</button><button type="button" disabled={busy || images.length === 0} onClick={uploadAndInsert} className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-700 px-4 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-40"><Upload className="size-4" />{busy ? "Uploading…" : images.some((image) => image.error) ? "Retry and insert" : "Upload and insert"}</button></div></div>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
