"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { isValidPageParent } from "../../utils/page-tree";
import { useBuilderStore } from "../../store/builder-store";

interface ParentOption { id: string; parentId: string | null; title: string; slug: string }

/** Changes are saved together with the page, just like the other page settings. */
export function PageParentPicker() {
  const pageId = useBuilderStore((state) => state.pageId);
  const parentId = useBuilderStore((state) => state.data.root.parentId);
  const updatePageMeta = useBuilderStore((state) => state.updatePageMeta);
  const [pages, setPages] = useState<ParentOption[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/pages?view=flat", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load pages");
        return response.json();
      })
      .then((data) => setPages(Array.isArray(data.pages) ? data.pages : []))
      .catch(() => { if (!controller.signal.aborted) setError(true); });
    return () => controller.abort();
  }, []);

  const options = pages.filter((page) => pageId && isValidPageParent(pages, pageId, page.id));
  return <div className="space-y-1.5">
    <Label htmlFor="page-parent-setting" className="text-xs font-semibold text-slate-700">Parent page</Label>
    <select id="page-parent-setting" value={parentId || ""} disabled={error} onChange={(event) => updatePageMeta({ parentId: event.target.value || null })} className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs text-slate-800 focus:outline-2 focus:outline-blue-500">
      <option value="">Top-level page</option>
      {parentId && !options.some((page) => page.id === parentId) && <option value={parentId}>Current parent</option>}
      {options.map((page) => <option key={page.id} value={page.id}>{page.title} · /{page.slug}</option>)}
    </select>
    <p className="text-[11px] text-slate-500">{error ? "Could not load parent pages. Reload to try again." : "Choose where this page appears in the page tree. Save the page to apply."}</p>
  </div>;
}
