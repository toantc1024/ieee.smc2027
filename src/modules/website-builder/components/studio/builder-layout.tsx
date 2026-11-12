"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutGrid,
  Layers,
  Settings,
  Bookmark,
} from "lucide-react";
import { useBuilderStore } from "../../store/builder-store";
import { BuilderHeader } from "../toolbar/builder-header";
import { SubToolbar } from "../toolbar/sub-toolbar";
import { BuilderCanvas } from "../canvas/builder-canvas";
import { BlockLibraryDrawer } from "./block-library-drawer";
import { LayersTree } from "./layers-tree";
import { PageSettingsTab } from "./page-settings-tab";
import { ReusableTemplatesPanel } from "./reusable-templates-panel";
import { findBlock } from "../../utils/block-tree";
import { handleBuilderShortcut } from "../../utils/keyboard-shortcuts";
import { PropertyInspector } from "./property-inspector";
import { BuilderDndContext } from "./builder-dnd-context";
import { PageInfoView } from "../modals/page-info-view";
import { PageHistoryView } from "../modals/page-history-view";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function BuilderLayout() {
  const {
    pageId,
    pageVersion,
    data,
    selectedBlockId,
    viewMode,
    sidebarTab,
    studioTab,
    setSidebarTab,
    markClean,
    insertSavedBlock,
    applySavedLayout,
  } = useBuilderStore();

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.addEventListener("keydown", handleBuilderShortcut);
    return () => window.removeEventListener("keydown", handleBuilderShortcut);
  }, []);

  const handleSave = async () => {
    if (!pageId) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/pages/${pageId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: data.root.title,
          slug: data.root.slug,
          parentId: data.root.parentId ?? null,
          version: pageVersion,
          blocks: data.content,
          content: data,
          metaTitle: data.root.metaTitle,
          metaDescription: data.root.metaDescription,
          changeSummary: `Saved ${data.content.length} sections in Visual Studio`,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save page");
      }

      if (useBuilderStore.getState().pageId === pageId) {
        const hasNewerEdits = useBuilderStore.getState().data !== data;
        markClean(json.page?.version, data);
        toast.success(hasNewerEdits ? "Page saved. Newer edits are still unsaved." : "Page saved successfully");
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const isPreview = viewMode === "preview";

  return (
    <div className="flex flex-col h-full w-full bg-slate-100 overflow-hidden select-none">
      {/* Top Main Navigation Header */}
      <BuilderHeader onSave={handleSave} saving={saving} />

      {/* Auxiliary View: Page Info & SEO */}
      {studioTab === "info" && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-slate-50">
          <PageInfoView />
        </div>
      )}

      {/* Auxiliary View: Page History */}
      {studioTab === "history" && (
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-slate-50">
          <PageHistoryView />
        </div>
      )}

      {/* Main Visual Studio Canvas View */}
      {studioTab === "content" && (
        <>
          {/* Sub-toolbar */}
          <SubToolbar />

          {/* Tri-Panel Studio Grid — fixed columns in edit mode so selecting blocks never jumps the canvas */}
          <BuilderDndContext>
          <div
            className={cn(
              "flex-1 min-h-0 relative overflow-hidden bg-slate-50 grid",
              isPreview
                ? "grid-cols-1"
                : "grid-cols-[280px_minmax(0,1fr)_380px] xl:grid-cols-[300px_minmax(0,1fr)_420px]"
            )}
          >
            {/* Left Drawer */}
            {!isPreview && (
              <aside className="min-w-0 shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden z-20">
                {/* Segmented Tab Header */}
                <div className="grid grid-cols-4 p-1.5 border-b border-slate-200 bg-slate-50 gap-1 text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setSidebarTab("library")}
                    className={cn(
                      "py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                      sidebarTab === "library"
                        ? "bg-white text-blue-600 shadow-xs font-bold"
                        : "hover:text-slate-900"
                    )}
                    title="Block Library"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Blocks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarTab("templates")}
                    className={cn(
                      "py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                      sidebarTab === "templates"
                        ? "bg-white text-blue-600 shadow-xs font-bold"
                        : "hover:text-slate-900"
                    )}
                    title="Saved Blocks and Layouts"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarTab("layers")}
                    className={cn(
                      "py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                      sidebarTab === "layers"
                        ? "bg-white text-blue-600 shadow-xs font-bold"
                        : "hover:text-slate-900"
                    )}
                    title="Layers Tree"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Layers</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarTab("settings")}
                    className={cn(
                      "py-1.5 rounded-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
                      sidebarTab === "settings"
                        ? "bg-white text-blue-600 shadow-xs font-bold"
                        : "hover:text-slate-900"
                    )}
                    title="Page Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Page</span>
                  </button>
                </div>

                {/* Left Panel Body */}
                <div className="flex-1 min-h-0 overflow-hidden">
                  {sidebarTab === "library" && <BlockLibraryDrawer />}
                  {sidebarTab === "layers" && <LayersTree />}
                  {sidebarTab === "templates" && <ReusableTemplatesPanel selectedBlock={findBlock(data.content, selectedBlockId) || null} data={data} onInsertBlock={insertSavedBlock} onApplyPage={applySavedLayout} />}
                  {sidebarTab === "settings" && <PageSettingsTab />}
                </div>
              </aside>
            )}

            {/* Center Fluid Canvas */}
            <main className="flex-1 h-full min-w-0 overflow-hidden relative">
              <BuilderCanvas />
            </main>

            {/* Right Property Inspector — always mounted in edit mode like HCM-UTE */}
            {!isPreview && (
              <aside className="min-w-0 shrink-0 border-l border-slate-200 bg-white flex flex-col h-full overflow-hidden z-20">
                <PropertyInspector />
              </aside>
            )}
          </div>
          </BuilderDndContext>
        </>
      )}

    </div>
  );
}
