"use client";

import React, { useState } from "react";
import { ExternalLink, Monitor, Smartphone, Tablet, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useBuilderStore } from "../../store/builder-store";
import { getBlockDefinition } from "../../registry";
import { getBlockPresentation, isBlockHidden } from "../../utils/block-presentation";
import { PublicNestedBlock } from "../canvas/columns-slot";
import { BlockErrorBoundary } from "../canvas/block-error-boundary";
import type { ViewportMode } from "../../types";
import { cn } from "@/lib/utils";

interface PagePreviewModalProps {
  open: boolean;
  onClose: () => void;
}

const PREVIEW_WIDTHS: Record<ViewportMode, string> = {
  desktop: "100%",
  tablet: "768px",
  mobile: "390px",
};

export function PagePreviewModal({ open, onClose }: PagePreviewModalProps) {
  const { data, pageTitle, pageSlug } = useBuilderStore();
  const [device, setDevice] = useState<ViewportMode>("desktop");

  if (!open) return null;

  const visibleBlocks = data.content.filter((b) => !isBlockHidden(b));
  const publicPath = `/${pageSlug === "home" ? "" : pageSlug}`;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="max-w-[96vw] sm:max-w-[96vw] w-[96vw] h-[92vh] p-0 gap-0 overflow-hidden flex flex-col bg-slate-100 border-slate-200 rounded-2xl shadow-2xl [&>button:last-child]:hidden"
      >
        {/* Top Preview Bar */}
        <div className="h-12 px-4 bg-white border-b border-slate-200 flex items-center justify-between gap-3 shrink-0 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
            <DialogTitle className="text-sm font-bold text-slate-900 truncate">
              {pageTitle}
            </DialogTitle>
            <span className="hidden sm:inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500 truncate">
              {publicPath}
            </span>
          </div>

          {/* Device Switcher */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold">
            {[
              { id: "desktop" as const, label: "Desktop", icon: Monitor },
              { id: "tablet" as const, label: "Tablet", icon: Tablet },
              { id: "mobile" as const, label: "Mobile", icon: Smartphone },
            ].map((item) => {
              const Icon = item.icon;
              const active = device === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setDevice(item.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors cursor-pointer",
                    active
                      ? "bg-white text-blue-600 shadow-2xs font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.open(`${publicPath}?preview=true`, "_blank")}
              className="h-8 px-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">Open Tab</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="h-8 w-8 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Rendered Preview Viewport */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 flex justify-center bg-[#edf2f7]">
          <div
            style={{ width: PREVIEW_WIDTHS[device] }}
            className={cn(
              "bg-white min-h-full overflow-x-hidden transition-all duration-150",
              device !== "desktop" && "rounded-2xl border border-slate-200/85 shadow-xl"
            )}
          >
            {visibleBlocks.length === 0 ? (
              <div className="py-24 text-center text-sm text-slate-400">
                No visible sections on this page yet.
              </div>
            ) : (
              visibleBlocks.map((block) => {
                const def = getBlockDefinition(block.type);
                const Renderer = def?.render;
                const presentation = getBlockPresentation(block);
                return (
                  <div
                    key={block.id}
                    className={cn("relative w-full", presentation.className)}
                    style={presentation.style}
                  >
                    <BlockErrorBoundary blockType={block.type} blockId={block.id}>
                      {Renderer ? (
                        <Renderer
                          {...block.props}
                          {...(block.type === "ColumnsSlot"
                            ? { builderBlockId: block.id, builderEditing: false }
                            : {})}
                        >
                          {block.children?.map((child) => (
                            <PublicNestedBlock key={child.id} block={child} />
                          ))}
                        </Renderer>
                      ) : (
                        <div className="p-8 text-center bg-slate-100 text-slate-500 text-xs">
                          Unknown section: {block.type}
                        </div>
                      )}
                    </BlockErrorBoundary>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
