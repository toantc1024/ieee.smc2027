"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Check,
  Eye,
  EyeOff,
  PanelsTopLeft,
  Info,
  History,
  Send,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBuilderStore } from "../../store/builder-store";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BuilderHeaderProps {
  onSave?: () => Promise<void>;
  saving?: boolean;
}

export function BuilderHeader({ onSave, saving = false }: BuilderHeaderProps) {
  const router = useRouter();
  const {
    pageId,
    pageTitle,
    pageSlug,
    pageVersion,
    isPublished,
    isDirty,
    viewMode,
    studioTab,
    setViewMode,
    setStudioTab,
    updatePageMeta,
  } = useBuilderStore();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(pageTitle);

  useEffect(() => {
    setTitleInput(pageTitle);
  }, [pageTitle]);

  const handleTitleSubmit = () => {
    setEditingTitle(false);
    if (titleInput.trim() && titleInput.trim() !== pageTitle) {
      updatePageMeta({ title: titleInput.trim() });
    }
  };

  // Keyboard shortcut: Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        if (onSave) onSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave]);

  return (
    <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between select-none shrink-0 z-30">
      {/* Left: Back Link & Title */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/pages"
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Back to Page Management"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        <div className="h-5 w-px bg-slate-200" />

        {/* Title & Slug */}
        <div className="flex items-center gap-2">
          {editingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSubmit();
                if (e.key === "Escape") setEditingTitle(false);
              }}
              className="text-sm font-bold text-slate-900 px-1 py-0.5 rounded border border-blue-500 outline-none"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingTitle(true)}
              className="text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-1.5"
              title="Click to rename"
            >
              <span>{pageTitle}</span>
            </button>
          )}

          <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
            /{pageSlug}
          </span>

          <span className="text-[11px] font-mono text-slate-400">
            v{pageVersion}
          </span>
        </div>

        {/* Dirty State Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 pl-2">
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isDirty ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
            )}
          />
          <span className="text-[11px] font-medium text-slate-400">
            {isDirty ? "Unsaved Changes" : "Saved"}
          </span>
        </div>
      </div>

      {/* Center: Main View Segmented Switcher */}
      <div className="flex items-center p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setStudioTab("content")}
          className={cn(
            "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
            studioTab === "content" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
          )}
        >
          <PanelsTopLeft className="w-3.5 h-3.5" />
          <span>Visual Canvas</span>
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("info")}
          className={cn(
            "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
            studioTab === "info" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
          )}
        >
          <Info className="w-3.5 h-3.5" />
          <span>SEO & Metadata</span>
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("history")}
          className={cn(
            "px-3 py-1 rounded-md transition-all flex items-center gap-1.5",
            studioTab === "history" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
          )}
        >
          <History className="w-3.5 h-3.5" />
          <span>Version History</span>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Preview Toggle */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setViewMode(viewMode === "preview" ? "edit" : "preview")}
          className={cn(
            "h-8 text-xs gap-1.5",
            viewMode === "preview" && "bg-blue-50 text-blue-600 border-blue-200"
          )}
        >
          {viewMode === "preview" ? (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>Exit Preview</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Live Preview</span>
            </>
          )}
        </Button>

        {/* View Live URL */}
        <Button
          size="sm"
          variant="ghost"
          onClick={() =>
            window.open(`/${pageSlug === "home" ? "" : pageSlug}?preview=true`, "_blank")
          }
          className="h-8 text-xs text-slate-500 hover:text-slate-900 p-2"
          title="Open Public Preview in New Tab"
        >
          <ExternalLink className="w-4 h-4" />
        </Button>

        {/* Save Button */}
        <Button
          size="sm"
          disabled={saving || !isDirty}
          onClick={onSave}
          className={cn(
            "h-8 text-xs text-white min-w-[90px] gap-1.5 shadow-sm transition-all",
            isDirty
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-slate-300 text-slate-500 cursor-not-allowed hover:bg-slate-300"
          )}
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
