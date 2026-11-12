"use client";

import React, { useCallback, useEffect, useState } from "react";
import { BookmarkPlus, Layers, LayoutTemplate, Trash2 } from "lucide-react";
import type { PageBlock, PageBuilderData } from "../../types";
import { cloneReusableContent, isReusableContent, type ReusableContent } from "../../utils/reusable-templates";

interface SavedTemplate { id: string; name: string; description: string | null; content: ReusableContent; updatedAt: string }
interface Props {
  selectedBlock: PageBlock | null;
  data: PageBuilderData;
  onInsertBlock: (block: PageBlock) => void;
  onApplyPage: (content: PageBlock[], zones?: PageBuilderData["zones"]) => void;
}

export function ReusableTemplatesPanel({ selectedBlock, data, onInsertBlock, onApplyPage }: Props) {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"block" | "page">("block");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/reusable-templates", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || !Array.isArray(result.templates)) throw new Error(result.error || "Could not load templates");
      setTemplates(result.templates.filter((item: SavedTemplate) => isReusableContent(item.content)));
    } catch (err) { setError(err instanceof Error ? err.message : "Could not load templates"); }
    finally { setLoading(false); }
  }, []);

  // Synchronize the panel with the authenticated server-side template library.
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/reusable-templates", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !Array.isArray(result.templates)) throw new Error(result.error || "Could not load templates");
        if (!controller.signal.aborted) setTemplates(result.templates.filter((item: SavedTemplate) => isReusableContent(item.content)));
      })
      .catch((err) => { if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Could not load templates"); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  const save = async () => {
    if (!name.trim()) { setError("Enter a name for this template."); return; }
    if (kind === "block" && !selectedBlock) { setError("Select a block to save."); return; }
    const content: ReusableContent = kind === "block" && selectedBlock
      ? { version: 1, kind: "block", block: selectedBlock }
      : { version: 1, kind: "page", content: data.content, ...(data.zones ? { zones: data.zones } : {}) };
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/reusable-templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, content }) });
      const result = await response.json();
      if (!response.ok || !result.template || !isReusableContent(result.template.content)) throw new Error(result.error || "Could not save template");
      setTemplates((current) => [result.template, ...current]);
      setName("");
      setNotice(kind === "block" ? "Block saved to the library." : "Page layout saved to the library.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save template"); }
    finally { setBusy(false); }
  };

  const remove = async (item: SavedTemplate) => {
    if (!window.confirm(`Delete “${item.name}” from the reusable library?`)) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/admin/reusable-templates/${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || result.deleted !== true) throw new Error(result.error || "Could not delete template");
      setTemplates((current) => current.filter((template) => template.id !== item.id));
      setNotice("Template deleted.");
    } catch (err) { setError(err instanceof Error ? err.message : "Could not delete template"); }
    finally { setBusy(false); }
  };

  const apply = (item: SavedTemplate) => {
    if (item.content.kind === "page" && !window.confirm(`Replace the current page layout with “${item.name}”? You can undo this change.`)) return;
    const copy = cloneReusableContent(item.content);
    if (copy.kind === "block") onInsertBlock(copy.block);
    else onApplyPage(copy.content, copy.zones);
    setNotice(copy.kind === "block" ? "Block added. Save the page to publish this change." : "Page layout applied. Save the page to publish this change.");
  };

  return <div className="flex h-full flex-col overflow-hidden bg-white text-slate-800">
    <div className="space-y-3 border-b border-slate-200 p-3">
      <div><h3 className="text-xs font-bold">Reusable library</h3><p className="mt-1 text-[11px] text-slate-500">Save blocks and page layouts for use on other pages.</p></div>
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => setKind("block")} className={`flex-1 rounded px-2 py-1 text-xs ${kind === "block" ? "bg-white font-semibold text-blue-700 shadow-sm" : "text-slate-600"}`}>Block</button><button type="button" onClick={() => setKind("page")} className={`flex-1 rounded px-2 py-1 text-xs ${kind === "page" ? "bg-white font-semibold text-blue-700 shadow-sm" : "text-slate-600"}`}>Page layout</button></div>
      <p className="text-[11px] text-slate-500">{kind === "block" ? selectedBlock ? `Selected: ${selectedBlock.type}` : "Select a block first." : `${data.content.length} sections will be saved.`}</p>
      <label className="block text-xs font-medium">Name<input value={name} maxLength={100} onChange={(event) => setName(event.target.value)} placeholder={kind === "block" ? "e.g. Speaker card" : "e.g. Program page"} className="mt-1 h-8 w-full rounded border border-slate-200 px-2 text-xs" /></label>
      <button type="button" disabled={busy || (kind === "block" && !selectedBlock)} onClick={() => void save()} className="flex h-8 w-full items-center justify-center gap-1 rounded bg-blue-700 text-xs font-semibold text-white hover:bg-blue-800 disabled:opacity-40"><BookmarkPlus className="size-3.5" />{busy ? "Working…" : kind === "block" ? "Save selected block" : "Save page layout"}</button>
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}{notice && <p role="status" className="text-xs text-emerald-700">{notice}</p>}
    </div>
    <div className="flex-1 space-y-2 overflow-y-auto p-3">
      {loading ? <p className="text-xs text-slate-500">Loading library…</p> : templates.length === 0 && <p className="rounded border border-dashed border-slate-200 p-3 text-xs text-slate-500">No saved blocks or layouts yet.</p>}
      {templates.map((item) => <div key={item.id} className="rounded-lg border border-slate-200 p-3"><div className="flex items-start gap-2"><div className="rounded bg-blue-50 p-1.5 text-blue-700">{item.content.kind === "block" ? <Layers className="size-4" /> : <LayoutTemplate className="size-4" />}</div><div className="min-w-0 flex-1"><p className="break-words text-xs font-bold">{item.name}</p><p className="mt-1 text-[10px] text-slate-500">{item.content.kind === "block" ? `Block · ${item.content.block.type}` : `Page layout · ${item.content.content.length} sections`}</p></div><button type="button" disabled={busy} aria-label={`Delete ${item.name}`} onClick={() => void remove(item)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40"><Trash2 className="size-3.5" /></button></div><button type="button" disabled={busy} onClick={() => apply(item)} className="mt-3 w-full rounded border border-blue-200 bg-blue-50 px-2 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-40">{item.content.kind === "block" ? "Insert block" : "Apply layout"}</button></div>)}
      {error && <button type="button" onClick={() => { setLoading(true); setError(""); void load(); }} className="text-xs font-semibold text-blue-700 underline">Retry loading</button>}
    </div>
  </div>;
}
