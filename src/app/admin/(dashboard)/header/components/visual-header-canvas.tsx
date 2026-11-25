"use client";

import React, { useState } from "react";
import type {
  HeaderConfig,
  NavColumnItem,
  NavLinkItem,
} from "@/lib/header-config";
import { getNavIcon } from "@/lib/nav-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Phone,
  Mail,
  Search,
  ChevronDown,
  ArrowUpRight,
  Plus,
  Columns3,
  Image as ImageIcon,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Trash2,
  Menu,
  X,
  ExternalLink,
  PanelTop,
  Link2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaletteDragBlockType } from "./builder-palette";

export type SelectedInspectorTarget =
  | { type: "general" }
  | { type: "trigger"; triggerId: string }
  | { type: "column"; triggerId: string; columnId: string; linkId?: string }
  | null;

interface VisualHeaderCanvasProps {
  config: HeaderConfig;
  viewport: "desktop" | "tablet" | "mobile";
  activeTriggerId: string;
  selectedTarget: SelectedInspectorTarget;
  onSelectTrigger: (triggerId: string) => void;
  onSelectTarget: (target: SelectedInspectorTarget) => void;
  onAddColumn: (
    triggerId: string,
    columnType: "category-links" | "promo-card",
    insertIndex?: number
  ) => void;
  onDeleteColumn: (triggerId: string, columnId: string) => void;
  onMoveColumn: (triggerId: string, fromIndex: number, toIndex: number) => void;
  onReorderTriggers: (fromIndex: number, toIndex: number) => void;
  onReorderColumnLinks: (
    triggerId: string,
    columnId: string,
    fromIndex: number,
    toIndex: number
  ) => void;
  onSetPromoPosition: (triggerId: string, position: "left" | "right") => void;
  onConvertTriggerToMega: (triggerId: string) => void;
  onDropPaletteBlock: (
    blockType: PaletteDragBlockType,
    insertIndex?: number
  ) => void;
}

export function VisualHeaderCanvas({
  config,
  viewport,
  activeTriggerId,
  selectedTarget,
  onSelectTrigger,
  onSelectTarget,
  onAddColumn,
  onDeleteColumn,
  onMoveColumn,
  onReorderTriggers,
  onReorderColumnLinks,
  onSetPromoPosition,
  onConvertTriggerToMega,
  onDropPaletteBlock,
}: VisualHeaderCanvasProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(true);
  const [dragTriggerIdx, setDragTriggerIdx] = useState<number | null>(null);
  const [dragOverTriggerIdx, setDragOverTriggerIdx] = useState<number | null>(null);
  const [dragColIdx, setDragColIdx] = useState<number | null>(null);
  const [dragOverColIdx, setDragOverColIdx] = useState<number | null>(null);
  const [dragLinkState, setDragLinkState] = useState<{
    colId: string;
    index: number;
  } | null>(null);
  const [dragOverLink, setDragOverLink] = useState<{
    colId: string;
    index: number;
  } | null>(null);
  const [draggingPromo, setDraggingPromo] = useState(false);
  const [promoDropSide, setPromoDropSide] = useState<"left" | "right" | null>(null);
  const [canvasDropActive, setCanvasDropActive] = useState(false);

  const activeTrigger: NavLinkItem | undefined =
    config.navLinks.find((n) => n.id === activeTriggerId) || config.navLinks[0];

  const isGeneralSelected = selectedTarget?.type === "general";
  const isTriggerSelected =
    selectedTarget?.type === "trigger" &&
    selectedTarget.triggerId === activeTrigger?.id;
  const selectedColumnId =
    selectedTarget?.type === "column" ? selectedTarget.columnId : null;
  const selectedLinkId =
    selectedTarget?.type === "column" ? selectedTarget.linkId : null;

  const variant = config.variant || "left-aligned";
  const showTopbar = config.topbar?.enabled !== false;
  const quickLinks = config.topbar?.quickLinks || [];
  const showSearch = config.topbar?.showSearch !== false;
  const ctaEnabled = config.ctaButton?.enabled !== false;
  const showLogo = config.showLogo !== false;
  const desktopLogo = config.logoUrl || "/logo/tagline.png";
  const mobileLogo = config.mobileLogoUrl || "/logo/square-logo.png";

  const handleCanvasDragOver = (e: React.DragEvent) => {
    const hasBlock =
      e.dataTransfer.types.includes("application/x-builder-block") ||
      e.dataTransfer.types.includes("application/x-col-index");
    if (hasBlock) {
      e.preventDefault();
      setCanvasDropActive(true);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    setCanvasDropActive(false);
    const blockType = e.dataTransfer.getData("application/x-builder-block") as
      | PaletteDragBlockType
      | "";
    if (blockType) {
      onDropPaletteBlock(blockType, insertIndex);
      return;
    }
    const colIdxStr = e.dataTransfer.getData("application/x-col-index");
    if (colIdxStr && activeTrigger && typeof insertIndex === "number") {
      const fromIndex = Number(colIdxStr);
      if (!Number.isNaN(fromIndex) && fromIndex !== insertIndex) {
        onMoveColumn(activeTrigger.id, fromIndex, insertIndex);
      }
    }
    setDragColIdx(null);
    setDragOverColIdx(null);
  };

  // Mobile / Tablet Frame Mockup
  if (viewport === "mobile" || viewport === "tablet") {
    const frameWidth = viewport === "mobile" ? "w-[390px]" : "w-[768px]";

    return (
      <div className="flex flex-col items-center py-6 px-4">
        <div
          className={cn(
            frameWidth,
            "bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300"
          )}
        >
          {/* Clickable Mobile Header Bar */}
          <div
            onClick={() => onSelectTarget({ type: "general" })}
            className={cn(
              "px-4 py-3 bg-white border-b border-blue-100 flex items-center justify-between cursor-pointer transition-all",
              isGeneralSelected && "ring-2 ring-inset ring-[#115eff] bg-blue-50/20"
            )}
          >
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mobileLogo}
                alt="IEEE SMC 2027"
                className="h-9 w-auto object-contain"
              />
              <div className="leading-tight">
                <div className="text-xs font-extrabold text-[#004776]">
                  {config.brand?.conferenceTitle || "IEEE SMC 2027"}
                </div>
                <div className="text-[10px] font-medium text-slate-500">
                  {config.brand?.conferenceSubtitle || "Ho Chi Minh City"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {config.mobileHeader?.showSearch !== false && (
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-500">
                  <Search className="w-3.5 h-3.5" />
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen((prev) => !prev);
                }}
                className="w-9 h-9 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004776] cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Content */}
          {mobileMenuOpen && (
            <div className="bg-slate-50/70 p-4 space-y-2.5 max-h-[680px] overflow-y-auto">
              {config.navLinks.map((item) => {
                const isActive = activeTrigger?.id === item.id;
                const isMega = item.type === "mega" && (item.columns?.length || 0) > 0;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-lg border bg-white overflow-hidden transition-all",
                      isActive ? "border-[#115eff] shadow-xs" : "border-slate-200"
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTrigger(item.id);
                        onSelectTarget({ type: "trigger", triggerId: item.id });
                      }}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left cursor-pointer"
                    >
                      <span
                        className={cn(
                          "text-sm font-bold",
                          isActive ? "text-[#115eff]" : "text-slate-800"
                        )}
                      >
                        {item.name}
                      </span>
                      {isMega ? (
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-slate-400 transition-transform",
                            isActive && "rotate-180 text-[#115eff]"
                          )}
                        />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {isActive && isMega && (
                      <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 space-y-3 bg-slate-50/40">
                        {item.columns?.map((col) => (
                          <div
                            key={col.id}
                            onClick={() =>
                              onSelectTarget({
                                type: "column",
                                triggerId: item.id,
                                columnId: col.id,
                              })
                            }
                            className={cn(
                              "p-2 rounded border border-dashed cursor-pointer",
                              selectedColumnId === col.id
                                ? "border-[#115eff] bg-blue-50/40"
                                : "border-transparent hover:border-blue-200"
                            )}
                          >
                            <div className="text-[11px] font-bold capitalize text-[#004776] mb-1.5">
                              {col.title}
                            </div>
                            <div className="space-y-1">
                              {col.links.map((link) => {
                                const IconComp = getNavIcon(link.icon);
                                return (
                                  <div
                                    key={link.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectTarget({
                                        type: "column",
                                        triggerId: item.id,
                                        columnId: col.id,
                                        linkId: link.id,
                                      });
                                    }}
                                    className={cn(
                                      "flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer",
                                      selectedLinkId === link.id
                                        ? "bg-blue-100/70 text-[#004776] font-semibold"
                                        : "hover:bg-white text-slate-700"
                                    )}
                                  >
                                    <IconComp className="w-3.5 h-3.5 text-[#115eff] shrink-0" />
                                    <span className="truncate flex-1">{link.title}</span>
                                    {link.badge && (
                                      <Badge variant="ute" size="sm">
                                        {link.badge}
                                      </Badge>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {ctaEnabled && (
                <div className="pt-2">
                  <div className="w-full py-2.5 px-4 rounded-md bg-[#115eff] text-white text-center text-sm font-bold shadow-xs">
                    {config.ctaButton?.label || "Submit Paper"}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Canvas Mockup
  const columns: NavColumnItem[] = activeTrigger?.columns || [];
  const hasMegaCanvas = activeTrigger?.type === "mega";

  return (
    <div className="w-[1260px] mx-auto py-6 px-4 select-none">
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xl overflow-hidden">
        {/* 1. Clickable Top Utility Bar Mockup */}
        {showTopbar ? (
          <div
            onClick={() => onSelectTarget({ type: "general" })}
            title="Click to edit Top Utility Bar & General Settings"
            className={cn(
              "bg-[#115eff] text-white px-6 py-2 flex items-center justify-between gap-4 cursor-pointer transition-all relative group/topbar",
              isGeneralSelected && "ring-2 ring-inset ring-amber-300"
            )}
          >
            <div className="flex items-center gap-4 text-xs text-blue-100 min-w-0">
              {config.topbar?.hotline && (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Phone className="w-3 h-3 text-blue-300 shrink-0" />
                  <span className="font-medium text-white">{config.topbar.hotline}</span>
                </span>
              )}
              {config.topbar?.email && (
                <span className="inline-flex items-center gap-1.5 truncate">
                  <Mail className="w-3 h-3 text-blue-300 shrink-0" />
                  <span className="truncate">{config.topbar.email}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 text-xs shrink-0">
              {quickLinks.map((ql, idx) => (
                <React.Fragment key={ql.id}>
                  {idx > 0 && <span className="text-white/30">•</span>}
                  <span className="px-1.5 py-0.5 rounded text-blue-100 hover:text-white font-medium">
                    {ql.label}
                  </span>
                </React.Fragment>
              ))}

              {showSearch && (
                <>
                  {quickLinks.length > 0 && <span className="text-white/30">•</span>}
                  <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1 text-[11px] text-blue-100 w-44">
                    <Search className="w-3 h-3 opacity-80 shrink-0" />
                    <span className="truncate">
                      {config.topbar?.searchPlaceholder || "Search IEEE SMC 2027..."}
                    </span>
                  </div>
                </>
              )}

              <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/15 text-[10px] font-bold text-white opacity-0 group-hover/topbar:opacity-100 transition-opacity">
                <PanelTop className="w-3 h-3" />
                Edit Top Bar
              </span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => onSelectTarget({ type: "general" })}
            className="bg-slate-100 border-b border-slate-200 px-6 py-1.5 text-[11px] text-slate-500 flex items-center justify-between cursor-pointer hover:bg-blue-50"
          >
            <span>Top Utility Bar is currently hidden</span>
            <span className="font-semibold text-[#115eff]">Enable in General Settings</span>
          </div>
        )}

        {/* 2. Desktop Main Header Bar Mockup (4 variants supported) */}
        <div
          className={cn(
            "bg-white border-b border-blue-100 px-6 transition-all",
            variant === "stacked" ? "py-3 space-y-2.5" : "h-[74px] flex items-center justify-between gap-4"
          )}
        >
          {/* Logo Slot */}
          {showLogo ? (
            <div
              onClick={() => onSelectTarget({ type: "general" })}
              title="Click to edit Brand Logo & Variant"
              className={cn(
                "flex items-center shrink-0 cursor-pointer rounded p-1 transition-all",
                variant === "stacked" && "justify-center w-full border-b border-slate-100 pb-2",
                isGeneralSelected && "ring-2 ring-[#115eff] bg-blue-50/40"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={desktopLogo}
                alt="IEEE SMC 2027"
                className={cn(
                  "w-auto object-contain",
                  variant === "minimal" ? "h-9" : "h-11"
                )}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onSelectTarget({ type: "general" })}
              className="px-2 py-1 rounded border border-dashed border-slate-300 text-[10px] font-semibold text-slate-400 hover:border-[#115eff] hover:text-[#115eff] shrink-0 cursor-pointer"
            >
              Logo Hidden
            </button>
          )}

          {/* Nav Triggers Row (Draggable to reorder, crisp square style) */}
          <nav
            className={cn(
              "flex items-stretch gap-0.5 flex-wrap",
              variant !== "stacked" && "h-full",
              variant === "centered" && "flex-1 justify-center",
              variant === "left-aligned" && "flex-1 justify-start ml-2",
              variant === "stacked" && "w-full justify-center",
              variant === "minimal" && "flex-1 justify-end mr-2"
            )}
          >
            {config.navLinks.map((item, navIdx) => {
              const isActive = activeTrigger?.id === item.id;
              const isMega = item.type === "mega";
              return (
                <button
                  key={item.id}
                  type="button"
                  draggable
                  onDragStart={(e) => {
                    setDragTriggerIdx(navIdx);
                    e.dataTransfer.setData("application/x-nav-trigger", String(navIdx));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    if (dragTriggerIdx !== null && dragTriggerIdx !== navIdx) {
                      e.preventDefault();
                      setDragOverTriggerIdx(navIdx);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverTriggerIdx === navIdx) setDragOverTriggerIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragTriggerIdx !== null && dragTriggerIdx !== navIdx) {
                      onReorderTriggers(dragTriggerIdx, navIdx);
                    }
                    setDragTriggerIdx(null);
                    setDragOverTriggerIdx(null);
                  }}
                  onDragEnd={() => {
                    setDragTriggerIdx(null);
                    setDragOverTriggerIdx(null);
                  }}
                  onClick={() => {
                    onSelectTrigger(item.id);
                    onSelectTarget({ type: "trigger", triggerId: item.id });
                  }}
                  className={cn(
                    "group relative px-3.5 rounded-none border-b-2 text-[14px] font-semibold flex items-center gap-1.5 transition-colors cursor-grab active:cursor-grabbing",
                    variant === "stacked" ? "py-2" : "h-full",
                    isActive
                      ? "border-[#115eff] text-[#115eff] bg-blue-50/40"
                      : "border-transparent text-[#004776] hover:text-[#115eff] hover:bg-blue-50/40",
                    dragOverTriggerIdx === navIdx && "border-l-2 border-l-[#115eff]"
                  )}
                >
                  <span>{item.name || "Untitled"}</span>
                  {isMega && (
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 transition-transform",
                        isActive ? "rotate-180 text-[#115eff]" : "text-slate-400"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right CTA Button */}
          {ctaEnabled && variant !== "stacked" && (
            <div
              onClick={() => onSelectTarget({ type: "general" })}
              className="shrink-0 cursor-pointer"
              title="Click to edit Primary CTA Button"
            >
              <div className="px-4 py-2 rounded-lg bg-[#115eff] text-white text-[13px] font-bold flex items-center gap-1.5 shadow-xs hover:bg-[#0a4de6] transition-colors">
                <span>{config.ctaButton?.label || "Submit Paper"}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </div>
          )}
        </div>

        {/* 3. Interactive Mega Menu / Trigger Artboard */}
        {activeTrigger && (
          <div
            onDragOver={handleCanvasDragOver}
            onDragLeave={() => setCanvasDropActive(false)}
            onDrop={(e) => handleCanvasDrop(e)}
            className={cn(
              "bg-slate-50/60 border-t border-slate-100 transition-colors",
              canvasDropActive && "bg-blue-50/60 ring-2 ring-inset ring-[#115eff]/40"
            )}
          >
            {/* Artboard Control Sub-header */}
            <div className="px-6 py-2.5 bg-white border-b border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-bold capitalize text-slate-400">
                  Editing Trigger
                </span>
                <span className="text-sm font-extrabold text-[#004776] truncate">
                  {activeTrigger.name}
                </span>
                <Badge variant={hasMegaCanvas ? "ute" : "secondary"} size="sm">
                  {hasMegaCanvas
                    ? `Mega Menu · ${columns.length} ${columns.length === 1 ? "Column" : "Columns"}`
                    : "Direct Link"}
                </Badge>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {hasMegaCanvas && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs font-semibold border-blue-200 text-[#004776] hover:bg-blue-50"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1 text-[#115eff]" />
                        Add Block
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-white">
                      <DropdownMenuItem
                        onClick={() => onAddColumn(activeTrigger.id, "category-links")}
                        className="text-xs cursor-pointer gap-2"
                      >
                        <Columns3 className="w-3.5 h-3.5 text-[#115eff]" />
                        Category Links Column
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onAddColumn(activeTrigger.id, "promo-card")}
                        className="text-xs cursor-pointer gap-2"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#115eff]" />
                        Promo Card Column
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                <Button
                  type="button"
                  size="sm"
                  variant={isTriggerSelected ? "default" : "outline"}
                  onClick={() =>
                    onSelectTarget({ type: "trigger", triggerId: activeTrigger.id })
                  }
                  className={cn(
                    "h-7 text-xs font-semibold",
                    isTriggerSelected
                      ? "bg-[#115eff] hover:bg-blue-700 text-white"
                      : "border-slate-200 text-slate-700"
                  )}
                >
                  <SlidersHorizontal className="w-3 h-3 mr-1" />
                  Trigger Settings
                </Button>
              </div>
            </div>

            {!hasMegaCanvas ? (
              /* Full-width Direct Link Artboard */
              <div className="p-5 bg-white">
                <div className="w-full rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/3d/empty-state__hcmute-3d-icon.png"
                      alt="Direct Navigation Link"
                      className="w-16 h-16 object-contain shrink-0 select-none"
                    />
                    <div className="min-w-0 text-left">
                      <h4 className="text-sm font-bold text-[#004776]">
                        Direct Navigation Link
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Clicking <span className="font-semibold text-slate-700">{activeTrigger.name}</span> navigates straight to{" "}
                        <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-mono text-[11px] text-[#004776]">
                          {activeTrigger.href || "/"}
                        </code>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        onSelectTarget({ type: "trigger", triggerId: activeTrigger.id })
                      }
                      className="h-8 text-xs bg-white"
                    >
                      Edit Destination URL
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onConvertTriggerToMega(activeTrigger.id)}
                      className="h-8 text-xs bg-[#115eff] hover:bg-[#0a4de6] text-white"
                    >
                      <Columns3 className="w-3.5 h-3.5 mr-1.5" />
                      Convert to Mega Menu
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              /* Interactive Mega Menu Columns Artboard */
              <div className="p-5 bg-white">
                {columns.length === 0 && !activeTrigger.promoCard ? (
                  <div className="w-full rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/3d/empty-state__hcmute-3d-icon.png"
                        alt="Empty Mega Menu"
                        className="w-16 h-16 object-contain shrink-0 select-none"
                      />
                      <div className="text-left">
                        <div className="text-sm font-bold text-[#004776]">
                          This mega menu has no columns yet
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Add a links column or drag a block from the left palette.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onAddColumn(activeTrigger.id, "category-links")}
                      className="h-8 text-xs bg-[#115eff] hover:bg-[#0a4de6] text-white shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add First Column
                    </Button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      if (!draggingPromo) return;
                      e.preventDefault();
                      const rect = e.currentTarget.getBoundingClientRect();
                      const side = e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                      setPromoDropSide(side);
                    }}
                    onDragLeave={(e) => {
                      if (draggingPromo && !e.currentTarget.contains(e.relatedTarget as Node)) {
                        setPromoDropSide(null);
                      }
                    }}
                    onDrop={(e) => {
                      if (e.dataTransfer.getData("application/x-promo-card") === "1") {
                        e.preventDefault();
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const side = e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                        onSetPromoPosition(activeTrigger.id, side);
                        setDraggingPromo(false);
                        setPromoDropSide(null);
                      }
                    }}
                    className={cn(
                      "flex items-stretch w-full divide-x divide-blue-100/80 border border-slate-100 rounded-lg overflow-hidden relative",
                      promoDropSide === "left" && "border-l-4 border-l-[#115eff]",
                      promoDropSide === "right" && "border-r-4 border-r-[#115eff]"
                    )}
                  >
                    {/* Left Featured Promo Card (when dragged to left) */}
                    {activeTrigger.promoCard && activeTrigger.promoCardPosition === "left" && (
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggingPromo(true);
                          e.dataTransfer.setData("application/x-promo-card", "1");
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDraggingPromo(false);
                          setPromoDropSide(null);
                        }}
                        onClick={() =>
                          onSelectTarget({ type: "trigger", triggerId: activeTrigger.id })
                        }
                        title="Drag right to move Featured Card, or click to edit"
                        className={cn(
                          "group/promo w-[280px] shrink-0 p-4 bg-white border-r border-blue-100/80 flex flex-col justify-between relative overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:bg-blue-50/40",
                          isTriggerSelected && "ring-2 ring-inset ring-[#115eff]",
                          draggingPromo && "opacity-60"
                        )}
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 z-20 opacity-0 group-hover/promo:opacity-100 transition-opacity flex items-center gap-0.5 bg-white border border-slate-200 rounded px-1 py-0.5 shadow-2xs"
                        >
                          <button
                            type="button"
                            onClick={() => onSetPromoPosition(activeTrigger.id, "right")}
                            title="Move to right"
                            className="p-1 rounded text-slate-500 hover:text-[#115eff] hover:bg-blue-50 cursor-pointer"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="relative z-10 space-y-2.5">
                          {activeTrigger.promoCard.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activeTrigger.promoCard.image}
                              alt={activeTrigger.promoCard.title}
                              className="w-full h-28 object-cover rounded-sm border border-blue-100 shadow-2xs"
                            />
                          )}
                          {activeTrigger.promoCard.badge && (
                            <span className="inline-block text-[10px] font-bold capitalize px-2 py-0.5 rounded bg-blue-50 text-[#115eff] border border-blue-100">
                              {activeTrigger.promoCard.badge}
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-[#004776] leading-snug">
                            {activeTrigger.promoCard.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {activeTrigger.promoCard.description}
                          </p>
                        </div>
                        <div className="relative z-10 pt-3 mt-3 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-[#115eff]">
                          <span>{activeTrigger.promoCard.ctaText || "Learn More"}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                    {columns.map((col, colIdx) => {
                      const isColSelected = selectedColumnId === col.id;
                      const showPromo =
                        Boolean(col.promoCard) &&
                        (col.type === "promo-card" || Boolean(col.promoCard?.title || col.promoCard?.image));
                      const promoTop = col.promoPosition === "top";

                      const promoEl = showPromo && col.promoCard ? (
                        <div className="rounded-lg border border-blue-200 bg-[#115eff] text-white p-3.5 space-y-2 relative overflow-hidden">
                          {col.promoCard.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={col.promoCard.image}
                              alt={col.promoCard.title}
                              className="w-full h-24 object-cover rounded border border-white/15"
                            />
                          )}
                          {col.promoCard.badge && (
                            <span className="inline-block text-[10px] font-bold capitalize px-2 py-0.5 rounded bg-white/15 text-blue-100">
                              {col.promoCard.badge}
                            </span>
                          )}
                          <div className="text-xs font-bold leading-snug">
                            {col.promoCard.title || "Featured Highlight"}
                          </div>
                          {col.promoCard.description && (
                            <p className="text-[11px] text-blue-100/85 line-clamp-2">
                              {col.promoCard.description}
                            </p>
                          )}
                          {col.promoCard.ctaText && (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300">
                              <span>{col.promoCard.ctaText}</span>
                              <ArrowUpRight className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      ) : null;

                      return (
                        <div
                          key={col.id}
                          draggable
                          onDragStart={(e) => {
                            setDragColIdx(colIdx);
                            e.dataTransfer.setData("application/x-col-index", String(colIdx));
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragColIdx !== null && dragColIdx !== colIdx) {
                              setDragOverColIdx(colIdx);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverColIdx === colIdx) setDragOverColIdx(null);
                          }}
                          onDrop={(e) => handleCanvasDrop(e, colIdx)}
                          onDragEnd={() => {
                            setDragColIdx(null);
                            setDragOverColIdx(null);
                          }}
                          onClick={() =>
                            onSelectTarget({
                              type: "column",
                              triggerId: activeTrigger.id,
                              columnId: col.id,
                            })
                          }
                          className={cn(
                            "group/col relative flex-1 min-w-0 p-4 flex flex-col cursor-pointer transition-all",
                            isColSelected
                              ? "bg-blue-50/35 shadow-[inset_0_0_0_2px_#115eff]"
                              : "hover:bg-slate-50/70 hover:shadow-[inset_0_0_0_1px_rgba(17,94,255,0.35)]",
                            dragOverColIdx === colIdx && "border-l-4 border-l-[#115eff]"
                          )}
                        >
                          {/* Floating Column Action Bar */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "absolute top-2 right-2 z-20 flex items-center gap-0.5 px-1 py-0.5 rounded bg-white border border-slate-200 shadow-sm transition-opacity",
                              isColSelected
                                ? "opacity-100"
                                : "opacity-0 group-hover/col:opacity-100"
                            )}
                          >
                            <button
                              type="button"
                              disabled={colIdx === 0}
                              onClick={() => onMoveColumn(activeTrigger.id, colIdx, colIdx - 1)}
                              title="Move left"
                              className="p-1 rounded text-slate-500 hover:text-[#004776] hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={colIdx === columns.length - 1}
                              onClick={() => onMoveColumn(activeTrigger.id, colIdx, colIdx + 1)}
                              title="Move right"
                              className="p-1 rounded text-slate-500 hover:text-[#004776] hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onSelectTarget({
                                  type: "column",
                                  triggerId: activeTrigger.id,
                                  columnId: col.id,
                                })
                              }
                              title="Inspect column"
                              className="p-1 rounded text-[#115eff] hover:bg-blue-50 cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteColumn(activeTrigger.id, col.id)}
                              title="Delete column"
                              className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Column Heading + Animated Gradient Underline */}
                          <div className="relative pb-2.5 mb-3 shrink-0 pr-16">
                            <h3 className="text-xs font-bold capitalize text-[#004776] whitespace-pre-line">
                              {col.title || "UNTITLED COLUMN"}
                            </h3>
                            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-blue-100 rounded-full" />
                            <div
                              className={cn(
                                "absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500 rounded-full origin-left transition-transform duration-300",
                                isColSelected
                                  ? "scale-x-100"
                                  : "scale-x-0 group-hover/col:scale-x-100"
                              )}
                            />
                          </div>

                          {promoTop && promoEl && <div className="mb-3">{promoEl}</div>}

                          {/* Column Links */}
                          {col.type !== "promo-card" && (
                            <div className="flex flex-col gap-1 flex-1">
                              {col.links.map((link, linkIdx) => {
                                const IconComp = getNavIcon(link.icon);
                                const isLinkSelected =
                                  isColSelected && selectedLinkId === link.id;
                                const isLinkDragOver =
                                  dragOverLink?.colId === col.id &&
                                  dragOverLink.index === linkIdx;
                                return (
                                  <div
                                    key={link.id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.stopPropagation();
                                      setDragLinkState({ colId: col.id, index: linkIdx });
                                      e.dataTransfer.setData("application/x-col-link", String(linkIdx));
                                      e.dataTransfer.effectAllowed = "move";
                                    }}
                                    onDragOver={(e) => {
                                      if (
                                        dragLinkState &&
                                        dragLinkState.colId === col.id &&
                                        dragLinkState.index !== linkIdx
                                      ) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDragOverLink({ colId: col.id, index: linkIdx });
                                      }
                                    }}
                                    onDragLeave={() => {
                                      if (isLinkDragOver) setDragOverLink(null);
                                    }}
                                    onDrop={(e) => {
                                      if (
                                        dragLinkState &&
                                        dragLinkState.colId === col.id &&
                                        dragLinkState.index !== linkIdx
                                      ) {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onReorderColumnLinks(
                                          activeTrigger.id,
                                          col.id,
                                          dragLinkState.index,
                                          linkIdx
                                        );
                                      }
                                      setDragLinkState(null);
                                      setDragOverLink(null);
                                    }}
                                    onDragEnd={() => {
                                      setDragLinkState(null);
                                      setDragOverLink(null);
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectTarget({
                                        type: "column",
                                        triggerId: activeTrigger.id,
                                        columnId: col.id,
                                        linkId: link.id,
                                      });
                                    }}
                                    className={cn(
                                      "group/item flex flex-col gap-0.5 py-2 px-2 rounded-sm transition-all cursor-grab active:cursor-grabbing",
                                      isLinkSelected
                                        ? "bg-blue-100/70 ring-1 ring-[#115eff]"
                                        : "hover:bg-blue-50/60",
                                      isLinkDragOver && "border-t-2 border-t-[#115eff]"
                                    )}
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div
                                        className={cn(
                                          "w-7 h-7 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                                          isLinkSelected
                                            ? "bg-[#115eff] border-[#115eff] text-white"
                                            : "bg-blue-50 border-blue-100 text-[#115eff] group-hover/item:bg-[#115eff] group-hover/item:text-white"
                                        )}
                                      >
                                        <IconComp className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="text-[13px] font-semibold text-slate-900 whitespace-pre-line leading-tight flex-1 min-w-0">
                                        {link.title || "Untitled Link"}
                                      </span>
                                      {link.badge && (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-[#115eff] font-bold shrink-0">
                                          {link.badge}
                                        </span>
                                      )}
                                      {link.isExternal && (
                                        <ArrowUpRight className="w-3 h-3 text-slate-400 shrink-0" />
                                      )}
                                    </div>
                                    {link.description && (
                                      <p className="text-[11px] text-slate-500 pl-9 line-clamp-1">
                                        {link.description}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}

                              {col.links.length === 0 && (
                                <div className="py-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-200 rounded">
                                  No links in this column
                                </div>
                              )}
                            </div>
                          )}

                          {!promoTop && promoEl && <div className="mt-3">{promoEl}</div>}
                        </div>
                      );
                    })}

                    {/* Draggable Featured Promo Card Sidebar (Right side default) */}
                    {activeTrigger.promoCard && activeTrigger.promoCardPosition !== "left" && (
                      <div
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggingPromo(true);
                          e.dataTransfer.setData("application/x-promo-card", "1");
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragEnd={() => {
                          setDraggingPromo(false);
                          setPromoDropSide(null);
                        }}
                        onClick={() =>
                          onSelectTarget({ type: "trigger", triggerId: activeTrigger.id })
                        }
                        title="Drag left to move Featured Card, or click to edit"
                        className={cn(
                          "group/promo w-[280px] shrink-0 p-4 bg-white border-l border-blue-100/80 flex flex-col justify-between relative overflow-hidden cursor-grab active:cursor-grabbing transition-all hover:bg-blue-50/40",
                          isTriggerSelected && "ring-2 ring-inset ring-[#115eff]",
                          draggingPromo && "opacity-60"
                        )}
                      >
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute top-2 right-2 z-20 opacity-0 group-hover/promo:opacity-100 transition-opacity flex items-center gap-0.5 bg-white border border-slate-200 rounded px-1 py-0.5 shadow-2xs"
                        >
                          <button
                            type="button"
                            onClick={() => onSetPromoPosition(activeTrigger.id, "left")}
                            title="Move to left"
                            className="p-1 rounded text-slate-500 hover:text-[#115eff] hover:bg-blue-50 cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="relative z-10 space-y-2.5">
                          {activeTrigger.promoCard.image && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={activeTrigger.promoCard.image}
                              alt={activeTrigger.promoCard.title}
                              className="w-full h-28 object-cover rounded-sm border border-blue-100 shadow-2xs"
                            />
                          )}
                          {activeTrigger.promoCard.badge && (
                            <span className="inline-block text-[10px] font-bold capitalize px-2 py-0.5 rounded bg-blue-50 text-[#115eff] border border-blue-100">
                              {activeTrigger.promoCard.badge}
                            </span>
                          )}
                          <h4 className="text-sm font-bold text-[#004776] leading-snug">
                            {activeTrigger.promoCard.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                            {activeTrigger.promoCard.description}
                          </p>
                        </div>

                        <div className="relative z-10 pt-3 mt-3 border-t border-blue-100 flex items-center justify-between text-xs font-bold text-[#115eff]">
                          <span>{activeTrigger.promoCard.ctaText || "Learn More"}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
