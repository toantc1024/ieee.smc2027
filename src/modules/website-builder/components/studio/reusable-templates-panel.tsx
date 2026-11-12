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
    <div className="space-y-3 border-b border-slate-200 p-4">
      <h3 className="text-sm font-bold text-slate-900">Reusable library</h3>
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200">
        <button type="button" onClick={() => setKind("block")} className={`flex-1 rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer ${kind === "block" ? "bg-[#004776] font-bold text-white shadow-xs" : "text-slate-700 hover:text-slate-900"}`}>Block</button>
        <button type="button" onClick={() => setKind("page")} className={`flex-1 rounded-md px-2 py-1.5 text-xs transition-colors cursor-pointer ${kind === "page" ? "bg-[#004776] font-bold text-white shadow-xs" : "text-slate-700 hover:text-slate-900"}`}>Page layout</button>
      </div>
      <p className="text-xs text-slate-500">{kind === "block" ? selectedBlock ? `Selected: ${selectedBlock.type}` : "Select a block first" : `${data.content.length} sections will be saved`}</p>
      <label className="block text-sm font-bold text-slate-900">Name<input value={name} maxLength={100} onChange={(event) => setName(event.target.value)} placeholder={kind === "block" ? "e.g. Speaker card" : "e.g. Program page"} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-[#004776]" /></label>
      <button type="button" disabled={busy || (kind === "block" && !selectedBlock)} onClick={() => void save()} className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-[#004776] hover:bg-[#115eff] text-xs font-bold text-white shadow-xs disabled:opacity-40 cursor-pointer"><BookmarkPlus className="size-4" />{busy ? "Working…" : kind === "block" ? "Save selected block" : "Save page layout"}</button>
      {error && <p role="alert" className="text-xs font-bold text-rose-600">{error}</p>}{notice && <p role="status" className="text-xs font-bold text-emerald-700">{notice}</p>}
    </div>
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      {loading ? <p className="text-xs text-slate-500">Loading library…</p> : templates.length === 0 && <p className="rounded-xl border border-dashed border-slate-300 p-4 text-center text-xs text-slate-500">No saved blocks or layouts yet.</p>}
      {templates.map((item) => <div key={item.id} className="rounded-xl border border-slate-300 bg-white p-3.5 space-y-2"><div className="flex items-start gap-2.5"><div className="rounded-lg bg-slate-900 p-2 text-white shrink-0">{item.content.kind === "block" ? <Layers className="size-4" /> : <LayoutTemplate className="size-4" />}</div><div className="min-w-0 flex-1"><p className="break-words text-sm font-bold text-slate-900">{item.name}</p><p className="mt-0.5 text-xs text-slate-500">{item.content.kind === "block" ? `Block · ${item.content.block.type}` : `Layout · ${item.content.content.length} sections`}</p></div><button type="button" disabled={busy} aria-label={`Delete ${item.name}`} onClick={() => void remove(item)} className="rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40 cursor-pointer"><Trash2 className="size-4" /></button></div><button type="button" disabled={busy} onClick={() => apply(item)} className="w-full rounded-lg border border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 disabled:opacity-40 cursor-pointer">{item.content.kind === "block" ? "Insert block" : "Apply layout"}</button></div>)}
      {error && <button type="button" onClick={() => { setLoading(true); setError(""); void load(); }} className="text-xs font-bold text-[#004776] underline cursor-pointer">Retry loading</button>}
    </div>
  </div>;
}
