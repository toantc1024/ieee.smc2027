"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  EyeOff,
  Loader2,
  Pencil,
  Globe,
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
  const {
    pageId,
    pageTitle,
    pageSlug,
    pageVersion,
    isPublished,
    isDirty,
    studioTab,
    setStudioTab,
    updatePageMeta,
    setPublished,
  } = useBuilderStore();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(pageTitle);
  const [publishing, setPublishing] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitleInput(pageTitle);
  }, [pageTitle]);

  useEffect(() => {
    if (editingTitle) {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }
  }, [editingTitle]);

  const handleTitleSubmit = () => {
    setEditingTitle(false);
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== pageTitle) {
      updatePageMeta({ title: trimmed });
    } else {
      setTitleInput(pageTitle);
    }
  };

  const handleTogglePublish = async () => {
    if (!pageId || publishing) return;
    setPublishing(true);
    const nextPublished = !isPublished;
    try {
      const res = await fetch(`/api/admin/pages/${pageId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: nextPublished }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update publish status");
      }
      setPublished(nextPublished, json.page?.version);
      toast.success(
        nextPublished ? "Page published to live website" : "Page switched to draft"
      );
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update publish status"
      );
    } finally {
      setPublishing(false);
    }
  };

  // Keyboard shortcut: Cmd+S / Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (onSave) void onSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSave]);

  return (
    <header className="h-13 min-h-[52px] border-b border-slate-200 bg-white px-3 sm:px-4 flex items-center justify-between gap-3 select-none shrink-0 z-30">
      {/* Left: Back Button + HCM-UTE Full-Flex Clickable Title Bar */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0 max-w-xl">
        <Link
          href="/admin/pages"
          className="h-8 w-8 rounded-lg border border-slate-200/80 bg-white text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-center transition-colors shrink-0"
          title="Back to Pages"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>

        {/* Full-Flex Clickable Title Input Bar */}
        <div
          onClick={() => {
            if (!editingTitle) setEditingTitle(true);
          }}
          className={cn(
            "flex-1 min-w-0 h-8 rounded-lg border px-2.5 flex items-center justify-between gap-2 transition-colors cursor-text",
            editingTitle
              ? "border-blue-600 bg-white ring-2 ring-blue-500/15"
              : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 hover:border-slate-300"
          )}
        >
          {editingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleTitleSubmit();
                if (e.key === "Escape") {
                  setTitleInput(pageTitle);
                  setEditingTitle(false);
                }
              }}
              className="w-full min-w-0 bg-transparent text-xs sm:text-sm font-bold text-slate-900 outline-none"
            />
          ) : (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                {pageTitle}
              </span>
              <span className="hidden md:inline-block rounded bg-white border border-slate-200/80 px-1.5 py-0.2 text-[11px] font-medium text-slate-500 truncate">
                /{pageSlug}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <span className="hidden lg:inline text-[10px] font-semibold text-slate-400">
              v{pageVersion}
            </span>
            <Pencil className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </div>
        </div>
      </div>

      {/* Center: Segmented Studio View Switcher */}
      <div className="flex items-center h-9 p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 shrink-0">
        <button
          type="button"
          onClick={() => setStudioTab("content")}
          className={cn(
            "h-8 px-3.5 rounded-md transition-colors flex items-center justify-center cursor-pointer",
            studioTab === "content"
              ? "bg-[#004776] text-white shadow-xs font-bold"
              : "text-slate-700 hover:text-slate-900"
          )}
        >
          <span>Page Content</span>
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("info")}
          className={cn(
            "h-8 px-3.5 rounded-md transition-colors flex items-center justify-center cursor-pointer",
            studioTab === "info"
              ? "bg-[#004776] text-white shadow-xs font-bold"
              : "text-slate-700 hover:text-slate-900"
          )}
        >
          <span>Page Info</span>
        </button>
        <button
          type="button"
          onClick={() => setStudioTab("history")}
          className={cn(
            "h-8 px-3.5 rounded-md transition-colors flex items-center justify-center cursor-pointer",
            studioTab === "history"
              ? "bg-[#004776] text-white shadow-xs font-bold"
              : "text-slate-700 hover:text-slate-900"
          )}
        >
          <span>History</span>
        </button>
      </div>

      {/* Right: Status Pill + Publish/Unpublish + Save */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Published / Draft Status Dot Pill */}
        <div
          className="hidden xl:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-800"
        >
          <span
            className={cn(
              "w-2 h-2 rounded-full",
              isPublished ? "bg-emerald-600" : "bg-slate-400"
            )}
          />
          <span>{isPublished ? "Published" : "Draft"}</span>
        </div>

        {/* Publish / Unpublish Action */}
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!pageId || publishing}
          onClick={handleTogglePublish}
          className={cn(
            "h-8 px-3 text-xs font-bold gap-1.5 cursor-pointer shadow-none border-slate-300 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-400",
            isPublished && "hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50"
          )}
        >
          {publishing ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : isPublished ? (
            <EyeOff className="w-3.5 h-3.5" />
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
          <span>{isPublished ? "Unpublish" : "Publish"}</span>
        </Button>

        {/* Save Button */}
        <Button
          type="button"
          size="sm"
          disabled={saving || !isDirty}
          onClick={onSave}
          className={cn(
            "h-8 px-3.5 text-xs font-bold min-w-[88px] gap-1.5 shadow-xs transition-colors cursor-pointer",
            isDirty
              ? "bg-[#004776] hover:bg-[#115eff] text-white"
              : "border border-slate-300 bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100"
          )}
        >
          {saving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving…</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>{isDirty ? "Save" : "Saved"}</span>
            </>
          )}
        </Button>
      </div>
    </header>
  );
}
