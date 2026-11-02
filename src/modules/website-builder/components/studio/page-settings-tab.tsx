"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBuilderStore } from "../../store/builder-store";

export function PageSettingsTab() {
  const { data, updatePageMeta } = useBuilderStore();
  const root = data.root;

  return (
    <div className="p-4 space-y-5 overflow-y-auto">
      <div className="space-y-1.5">
        <Label htmlFor="page-title-setting" className="text-xs font-semibold text-slate-700">
          Page Title
        </Label>
        <Input
          id="page-title-setting"
          value={root.title || ""}
          onChange={(e) => updatePageMeta({ title: e.target.value })}
          placeholder="e.g. Call for Papers"
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="page-slug-setting" className="text-xs font-semibold text-slate-700">
          URL Slug
        </Label>
        <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
          <span className="text-slate-400 select-none mr-1">/</span>
          <input
            id="page-slug-setting"
            value={root.slug || ""}
            onChange={(e) => updatePageMeta({ slug: e.target.value })}
            placeholder="call-for-papers"
            className="w-full bg-transparent outline-none text-slate-900 font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="page-meta-title" className="text-xs font-semibold text-slate-700">
          SEO Meta Title
        </Label>
        <Input
          id="page-meta-title"
          value={root.metaTitle || ""}
          onChange={(e) => updatePageMeta({ metaTitle: e.target.value })}
          placeholder="IEEE SMC 2027 | ..."
          className="text-xs h-8"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="page-meta-desc" className="text-xs font-semibold text-slate-700">
          SEO Meta Description
        </Label>
        <Textarea
          id="page-meta-desc"
          value={root.metaDescription || ""}
          onChange={(e) => updatePageMeta({ metaDescription: e.target.value })}
          placeholder="Meta description for social search engines..."
          className="text-xs min-h-[90px] resize-none"
        />
      </div>
    </div>
  );
}
