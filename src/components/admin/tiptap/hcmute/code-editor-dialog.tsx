"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Tab = "html" | "css" | "js";
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialHtml?: string;
  initialCss?: string;
  initialJs?: string;
  initialTab?: Tab;
  title?: string;
  onSave: (value: { html: string; css: string; js: string }) => void;
}

export function CodeEditorDialog(props: Props) {
  if (!props.open) return null;
  return <CodeEditorDialogContent {...props} />;
}

function CodeEditorDialogContent({ open, onOpenChange, initialHtml = "", initialCss = "", initialJs = "", initialTab = "html", title = "Edit embed code", onSave }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [code, setCode] = useState({ html: initialHtml, css: initialCss, js: initialJs });
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="max-w-4xl"><DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
    <div className="flex gap-2">{(["html", "css", "js"] as const).map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`rounded px-3 py-1 text-sm ${tab === item ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"}`}>{item.toUpperCase()}</button>)}</div>
    <textarea aria-label={`${tab.toUpperCase()} code`} value={code[tab]} onChange={(event) => setCode({ ...code, [tab]: event.target.value })} spellCheck={false} className="min-h-80 w-full rounded border border-slate-300 bg-slate-950 p-3 font-mono text-sm text-white" />
    <div className="flex justify-end gap-2"><button type="button" className="rounded border px-4 py-2 text-sm" onClick={() => onOpenChange(false)}>Cancel</button><button type="button" className="rounded bg-blue-700 px-4 py-2 text-sm text-white" onClick={() => { onSave(code); onOpenChange(false); }}>Apply</button></div>
  </DialogContent></Dialog>;
}
