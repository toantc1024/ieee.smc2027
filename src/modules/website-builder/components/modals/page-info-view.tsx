"use client";

import React, { useMemo } from "react";
import {
  Globe,
  Share2,
  CheckCircle2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useBuilderStore } from "../../store/builder-store";
import { PageParentPicker } from "../studio/page-parent-picker";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function PageInfoView() {
  const {
    pageTitle,
    pageSlug,
    isPublished,
    data,
    updatePageMeta,
  } = useBuilderStore();

  const root = data.root;
  const currentTitle = root.title || pageTitle;
  const currentSlug = root.slug || pageSlug;
  const metaTitle = root.metaTitle || `${currentTitle} | IEEE SMC 2027`;
  const metaDescription =
    root.metaDescription ||
    "Official Conference Website for IEEE SMC 2027 in Ho Chi Minh City, Vietnam. Systems science, human-AI symbiosis, and cybernetics.";

  const seoAudit = useMemo(() => {
    let score = 0;
    const checks: Array<{ label: string; passed: boolean; tip: string }> = [];

    const titleLen = metaTitle.length;
    const titlePass = titleLen >= 20 && titleLen <= 70;
    if (titlePass) score += 30;
    checks.push({
      label: "SEO Title Length",
      passed: titlePass,
      tip: `${titleLen} characters`,
    });

    const descLen = metaDescription.length;
    const descPass = descLen >= 50 && descLen <= 170;
    if (descPass) score += 30;
    checks.push({
      label: "Meta Description Length",
      passed: descPass,
      tip: `${descLen} characters`,
    });

    const slugPass =
      currentSlug.length > 0 &&
      !currentSlug.includes(" ") &&
      currentSlug === currentSlug.toLowerCase();
    if (slugPass) score += 20;
    checks.push({
      label: "Clean URL Slug",
      passed: slugPass,
      tip: slugPass ? "Lowercase URL without spaces" : "Contains invalid characters",
    });

    const sectionsPass = data.content.length >= 2;
    if (sectionsPass) score += 20;
    checks.push({
      label: "Page Content Depth",
      passed: sectionsPass,
      tip: `${data.content.length} sections placed`,
    });

    return { score, checks };
  }, [metaTitle, metaDescription, currentSlug, data.content.length]);

  const liveUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${currentSlug === "home" ? "" : currentSlug}`
      : `https://ieee-smc2027.org/${currentSlug}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(liveUrl);
    toast.success("Page URL copied to clipboard");
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-6 max-w-5xl w-full mx-auto space-y-6 select-none">
      {/* Overview Top Card */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "text-xs font-bold px-2.5 py-0.5 rounded-full",
                isPublished
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 text-slate-600 border border-slate-200"
              )}
            >
              {isPublished ? "Published" : "Draft"}
            </span>
            <span className="text-xs text-slate-400 font-medium">/{currentSlug}</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{currentTitle}</h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <span>Public URL:</span>
            <span className="font-medium text-blue-600">{liveUrl}</span>
            <button
              type="button"
              onClick={copyUrl}
              className="text-slate-400 hover:text-blue-600 cursor-pointer"
              title="Copy URL"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </p>
        </div>

        {/* SEO Score Gauge */}
        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0">
          <div className="text-center">
            <span
              className={cn(
                "text-3xl font-black",
                seoAudit.score >= 80
                  ? "text-emerald-600"
                  : seoAudit.score >= 50
                    ? "text-amber-500"
                    : "text-rose-500"
              )}
            >
              {seoAudit.score}
            </span>
            <span className="text-xs block font-semibold text-slate-400">
              SEO Score
            </span>
          </div>
          <div className="h-10 w-px bg-slate-200" />
          <div className="space-y-1 text-xs">
            {seoAudit.checks.map((c, i) => (
              <div key={i} className="flex items-center gap-1.5">
                {c.passed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                )}
                <span className="text-slate-600 text-[11px]">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Two Column Layout: Editor Fields & Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-text">
        {/* Left Column: Page Structure & Metadata */}
        <div className="space-y-5 bg-white p-6 rounded-2xl border border-slate-200/75 shadow-2xs">
          <h3 className="text-xs font-bold text-slate-500">
            Page Settings & SEO Metadata
          </h3>

          <PageParentPicker />

          <div className="space-y-1.5">
            <Label htmlFor="seo-title" className="text-xs font-semibold text-slate-700">
              Page Title
            </Label>
            <Input
              id="seo-title"
              value={root.title || ""}
              onChange={(e) => updatePageMeta({ title: e.target.value })}
              className="text-xs"
            />
            <span className="text-[10px] text-slate-400">
              {root.title?.length || 0} characters
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seo-slug" className="text-xs font-semibold text-slate-700">
              URL Slug
            </Label>
            <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs">
              <span className="text-slate-400 mr-1 select-none">/</span>
              <input
                id="seo-slug"
                value={root.slug || ""}
                onChange={(e) => updatePageMeta({ slug: e.target.value })}
                className="w-full bg-transparent outline-none font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seo-meta-title" className="text-xs font-semibold text-slate-700">
              Search Engine Title
            </Label>
            <Input
              id="seo-meta-title"
              value={root.metaTitle || ""}
              onChange={(e) => updatePageMeta({ metaTitle: e.target.value })}
              placeholder="IEEE SMC 2027 | ..."
              className="text-xs"
            />
            <span className="text-[10px] text-slate-400">
              {metaTitle.length} characters · ideal 30–65
            </span>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="seo-meta-desc" className="text-xs font-semibold text-slate-700">
              Meta Description
            </Label>
            <Textarea
              id="seo-meta-desc"
              value={root.metaDescription || ""}
              onChange={(e) => updatePageMeta({ metaDescription: e.target.value })}
              placeholder="Summary of this page for search engines and social cards..."
              className="text-xs min-h-[100px] resize-none"
            />
            <span className="text-[10px] text-slate-400">
              {metaDescription.length} characters · ideal 70–160
            </span>
          </div>
        </div>

        {/* Right Column: Live Previews */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/75 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Google Search Preview</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="text-xs text-slate-500 truncate">
                https://ieee-smc2027.org/{currentSlug === "home" ? "" : currentSlug}
              </div>
              <h4 className="text-base font-semibold text-blue-700 truncate">
                {metaTitle}
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {metaDescription}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/75 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>Social Open Graph Card</span>
            </div>
            <div className="rounded-xl border border-slate-200/75 overflow-hidden bg-white shadow-2xs">
              <div className="h-32 bg-gradient-to-r from-[#004776] to-[#2563EB] flex items-center justify-center text-white font-bold text-sm tracking-tight px-4 text-center">
                IEEE SMC 2027 · Ho Chi Minh City, Vietnam
              </div>
              <div className="p-3.5 space-y-1 bg-slate-50">
                <span className="text-xs font-semibold text-slate-400">
                  ieee-smc2027.org
                </span>
                <h5 className="text-xs font-bold text-slate-900 truncate">
                  {metaTitle}
                </h5>
                <p className="text-[11px] text-slate-500 line-clamp-1">
                  {metaDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
