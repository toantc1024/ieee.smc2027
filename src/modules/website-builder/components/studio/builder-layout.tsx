"use client";

import React, { useState } from "react";
import {
  LayoutGrid,
  Layers,
  Settings,
} from "lucide-react";
import { useBuilderStore } from "../../store/builder-store";
import { BuilderHeader } from "../toolbar/builder-header";
import { SubToolbar } from "../toolbar/sub-toolbar";
import { BuilderCanvas } from "../canvas/builder-canvas";
import { BlockLibraryDrawer } from "./block-library-drawer";
import { LayersTree } from "./layers-tree";
import { PageSettingsTab } from "./page-settings-tab";
import { PropertyInspector } from "./property-inspector";
import { PageInfoView } from "../modals/page-info-view";
import { PageHistoryView } from "../modals/page-history-view";
import { SyncTranslateModal } from "../modals/sync-translate-modal";
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
  } = useBuilderStore();

  const [saving, setSaving] = useState(false);
  const [translateModalOpen, setTranslateModalOpen] = useState(false);

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

      toast.success("Page saved successfully");
      markClean(json.page?.version);
    } catch (err: any) {
      toast.error(err.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const isPreview = viewMode === "preview";

  return (
    <div className="flex flex-col h-screen w-full bg-slate-100 overflow-hidden select-none">
      {/* Top Main Navigation Header */}
      <BuilderHeader onSave={handleSave} saving={saving} />

      {/* Auxiliary View: Page Info & SEO */}
      {studioTab === "info" && (
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
          <PageInfoView />
        </div>
      )}

      {/* Auxiliary View: Page History */}
      {studioTab === "history" && (
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
          <PageHistoryView />
        </div>
      )}

      {/* Main Visual Studio Canvas View */}
      {studioTab === "content" && (
        <>
          {/* Sub-toolbar */}
          {!isPreview && (
            <SubToolbar
              onOpenTranslateModal={() => setTranslateModalOpen(true)}
            />
          )}

          {/* Tri-Panel Grid Geometry */}
          <div
            className={cn(
              "flex-1 min-h-0 relative overflow-hidden bg-slate-50 grid transition-all",
              isPreview
                ? "grid-cols-1"
                : selectedBlockId
                ? "grid-cols-[308px_1fr_295px]"
                : "grid-cols-[308px_1fr]"
            )}
          >
            {/* Left Drawer (308px) */}
            {!isPreview && (
              <aside className="w-[308px] shrink-0 border-r border-slate-200 bg-white flex flex-col h-full overflow-hidden z-20">
                {/* Segmented Tab Header */}
                <div className="grid grid-cols-3 p-1.5 border-b border-slate-200 bg-slate-50 gap-1 text-xs font-semibold text-slate-600">
                  <button
                    type="button"
                    onClick={() => setSidebarTab("library")}
                    className={cn(
                      "py-1 rounded-md transition-all flex items-center justify-center gap-1.5",
                      sidebarTab === "library"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "hover:text-slate-900"
                    )}
                    title="Block Library"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Blocks</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSidebarTab("layers")}
                    className={cn(
                      "py-1 rounded-md transition-all flex items-center justify-center gap-1.5",
                      sidebarTab === "layers"
                        ? "bg-white text-blue-600 shadow-sm"
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
                      "py-1 rounded-md transition-all flex items-center justify-center gap-1.5",
                      sidebarTab === "settings"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "hover:text-slate-900"
                    )}
                    title="Page Settings"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Page</span>
                  </button>
                </div>

                {/* Left Panel Body */}
                <div className="flex-1 overflow-hidden">
                  {sidebarTab === "library" && <BlockLibraryDrawer />}
                  {sidebarTab === "layers" && <LayersTree />}
                  {sidebarTab === "settings" && <PageSettingsTab />}
                </div>
              </aside>
            )}

            {/* Center Fluid Canvas */}
            <main className="flex-1 h-full min-w-0 overflow-hidden relative">
              <BuilderCanvas />
            </main>

            {/* Right Property Inspector (295px) */}
            {!isPreview && selectedBlockId && (
              <aside className="w-[295px] shrink-0 border-l border-slate-200 bg-white flex flex-col h-full overflow-hidden z-20">
                <PropertyInspector />
              </aside>
            )}
          </div>
        </>
      )}

      {/* Multilingual Translate Modal */}
      <SyncTranslateModal
        open={translateModalOpen}
        onOpenChange={setTranslateModalOpen}
      />
    </div>
  );
}
