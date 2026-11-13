"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useBuilderStore } from "../../store/builder-store";
import { PageParentPicker } from "./page-parent-picker";

export function PageSettingsTab() {
  const { data, updatePageMeta } = useBuilderStore();
  const root = data.root;

  return (
    <div className="p-4 space-y-5 overflow-y-auto">
      <PageParentPicker />
      <div className="space-y-1.5">
        <Label htmlFor="page-title-setting" className="text-sm font-bold text-slate-900">
          Page Title
        </Label>
        <Input
          id="page-title-setting"
          value={root.title || ""}
          onChange={(e) => updatePageMeta({ title: e.target.value })}
          placeholder="e.g. Call for Papers"
          className="text-sm font-medium h-10 border-slate-200/85 rounded-lg px-3 bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="page-slug-setting" className="text-sm font-bold text-slate-900">
          URL Slug
        </Label>
        <div className="flex items-center h-10 rounded-lg border border-slate-200/85 bg-white px-3 text-sm">
          <span className="text-slate-400 select-none mr-1">/</span>
          <input
            id="page-slug-setting"
            value={root.slug || ""}
            onChange={(e) => updatePageMeta({ slug: e.target.value })}
            placeholder="call-for-papers"
            className="w-full bg-transparent outline-none text-slate-900 font-medium text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="page-meta-title" className="text-sm font-bold text-slate-900">
          SEO Meta Title
        </Label>
        <Input
          id="page-meta-title"
          value={root.metaTitle || ""}
          onChange={(e) => updatePageMeta({ metaTitle: e.target.value })}
          placeholder="IEEE SMC 2027"
          className="text-sm font-medium h-10 border-slate-200/85 rounded-lg px-3 bg-white"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="page-meta-desc" className="text-sm font-bold text-slate-900">
          SEO Meta Description
        </Label>
        <Textarea
          id="page-meta-desc"
          value={root.metaDescription || ""}
          onChange={(e) => updatePageMeta({ metaDescription: e.target.value })}
          placeholder="Meta description for search engines and social previews"
          className="text-sm font-medium min-h-[90px] border-slate-200/85 rounded-lg p-3 bg-white resize-y"
        />
      </div>
    </div>
  );
}
