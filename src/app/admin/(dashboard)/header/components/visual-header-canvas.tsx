"use client";

import React, { useState } from "react";
import type {
  HeaderConfig,
  NavColumnItem,
  NavLinkItem,
  NavPromoCard,
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
  PanelTop,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaletteDragBlockType } from "./builder-palette";

export type SelectedInspectorTarget =
  | { type: "general" }
  | { type: "trigger"; triggerId: string }
  | { type: "column"; triggerId: string; columnId: string; linkId?: string }
  | null;

/* ─── Crisp Square Hover / Selection Bounding Box for Admin Canvas ─── */
function AdminSquareFrame({
  selected,
  groupHoverClass = "group-hover/slot:border-[#115eff]/85 group-hover/slot:opacity-100",
  cornerHoverClass = "group-hover/slot:opacity-100",
}: {
  selected?: boolean;
  groupHoverClass?: string;
  cornerHoverClass?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 z-20 rounded-none border-2 transition-all duration-150",
        selected
          ? "border-[#115eff] opacity-100"
          : cn("border-dashed border-transparent opacity-0", groupHoverClass)
      )}
    >
      {["-top-1 -left-1", "-top-1 -right-1", "-bottom-1 -left-1", "-bottom-1 -right-1"].map(
        (pos) => (
          <span
            key={pos}
            className={cn(
              "absolute size-2 rounded-none bg-white border-2 border-[#115eff] transition-opacity duration-150",
              pos,
              selected ? "opacity-100" : cn("opacity-0", cornerHoverClass)
            )}
          />
        )
      )}
    </div>
  );
}

/* ─── Canvas Promo Card Preview (Matches Live HCM-UTE PromoCardBlock 1:1) ─── */
function CanvasPromoCardPreview({ promoCard }: { promoCard: NavPromoCard }) {
  return (
    <div className="group/promocard relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white hover:bg-primary hover:border-primary shadow-sm hover:shadow-xl hover:shadow-primary/25 transition-all duration-300">
      <div
        className="absolute inset-0 bg-[radial-gradient(#94a3b8_1.3px,transparent_1.3px)] [background-size:12px_12px] opacity-60 group-hover/promocard:opacity-0 transition-opacity duration-300 pointer-events-none z-[1] [mask-image:radial-gradient(ellipse_55%_48%_at_bottom_right,white_10%,transparent_58%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:16px_16px] opacity-0 group-hover/promocard:opacity-100 transition-opacity duration-300 pointer-events-none z-[1] [mask-image:radial-gradient(ellipse_55%_48%_at_bottom_right,white_15%,transparent_65%)]"
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/flower-ute.png"
        alt=""
        className="pointer-events-none absolute -bottom-10 -right-10 w-44 h-44 object-contain select-none opacity-[0.06] group-hover/promocard:opacity-0 transition-opacity duration-300 z-[1]"
        aria-hidden="true"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/flower-ute-white.png"
        alt=""
        className="pointer-events-none absolute -bottom-10 -right-10 w-44 h-44 object-contain select-none opacity-0 group-hover/promocard:opacity-35 transition-opacity duration-300 z-[1]"
        aria-hidden="true"
      />

      {promoCard.image && (
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100 z-[2]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={promoCard.image}
            alt={promoCard.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover/promocard:scale-105"
          />
          {promoCard.badge && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 text-primary backdrop-blur-sm shadow-sm group-hover/promocard:bg-white group-hover/promocard:text-primary transition-colors">
              {promoCard.badge}
            </div>
          )}
        </div>
      )}

      <div className="relative z-[2] p-3.5 flex flex-col gap-1">
        <h4 className="text-[13.5px] font-bold text-foreground group-hover/promocard:text-white transition-colors duration-200 leading-snug">
          {promoCard.title || "Featured Spotlight"}
        </h4>
        {promoCard.description && (
          <p className="text-[11.5px] text-muted-foreground group-hover/promocard:text-white/90 transition-colors duration-200 font-normal leading-relaxed line-clamp-3">
            {promoCard.description}
          </p>
        )}
        <span className="text-[12px] font-semibold text-primary group-hover/promocard:text-white transition-colors duration-200 inline-flex items-center gap-1 mt-1">
          {promoCard.ctaText || "Explore now"}
          <span aria-hidden="true">›</span>
        </span>
      </div>
    </div>
  );
}

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
  onSetColumnCount: (triggerId: string, count: number) => void;
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
  onSetColumnCount,
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
      e.stopPropagation();
      setCanvasDropActive(true);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
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

  const renderTriggerButton = (item: NavLinkItem, navIdx: number) => {
    const isViewing = activeTrigger?.id === item.id;
    const isEditingThis =
      selectedTarget?.type === "trigger" && selectedTarget.triggerId === item.id;
    const isMega = item.type === "mega";

    return (
      <div
        key={item.id}
        draggable
        onDragStart={(e) => {
          e.stopPropagation();
          setDragTriggerIdx(navIdx);
          e.dataTransfer.setData("application/x-nav-trigger", String(navIdx));
          e.dataTransfer.effectAllowed = "move";
        }}
        onDragOver={(e) => {
          if (dragTriggerIdx !== null && dragTriggerIdx !== navIdx) {
            e.preventDefault();
            e.stopPropagation();
            setDragOverTriggerIdx(navIdx);
          }
        }}
        onDragLeave={() => {
          if (dragOverTriggerIdx === navIdx) setDragOverTriggerIdx(null);
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
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
        className={cn(
          "group/trig relative p-1 cursor-grab active:cursor-grabbing shrink-0",
          dragOverTriggerIdx === navIdx && "border-l-2 border-l-[#115eff]"
        )}
      >
        {/* Admin Square Hover/Selected Frame */}
        <AdminSquareFrame
          selected={isEditingThis}
          groupHoverClass="group-hover/trig:border-[#115eff]/85 group-hover/trig:opacity-100"
          cornerHoverClass="group-hover/trig:opacity-100"
        />

        {/* Exact Live HCM-UTE Nav Button Inside */}
        <button
          type="button"
          onClick={() => {
            onSelectTrigger(item.id);
            onSelectTarget({ type: "trigger", triggerId: item.id });
          }}
          className={cn(
            "group/btn inline-flex items-center gap-1 font-bold uppercase text-xs xl:text-[13px] px-2.5 xl:px-3 h-8 xl:h-9 rounded-lg transition-all duration-150 cursor-pointer whitespace-nowrap",
            isViewing
              ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
              : "text-foreground hover:bg-primary hover:text-primary-foreground hover:shadow-sm"
          )}
        >
          <span>{item.name || "Untitled"}</span>
          {isMega && (
            <ChevronDown
              className={cn(
                "w-3.5 h-3.5 transition-transform duration-200",
                isViewing
                  ? "rotate-180 text-primary-foreground"
                  : "text-foreground/80 group-hover/btn:text-primary-foreground"
              )}
            />
          )}
        </button>
      </div>
    );
  };

  // Mobile / Tablet Frame Mockup
  if (viewport === "mobile" || viewport === "tablet") {
    const frameWidth = viewport === "mobile" ? "w-[390px]" : "w-[768px]";

    return (
      <div className="flex flex-col items-center py-6 px-4 select-none">
        <div
          className={cn(
            frameWidth,
            "bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-300"
          )}
        >
          {/* Clickable Mobile Header Bar (Matches live mobile header) */}
          <div
            onClick={() => onSelectTarget({ type: "general" })}
            className="group/mbar relative px-4 h-[62px] bg-white border-b border-border/60 flex items-center justify-between cursor-pointer"
          >
            <AdminSquareFrame
              selected={isGeneralSelected}
              groupHoverClass="group-hover/mbar:border-[#115eff]/85 group-hover/mbar:opacity-100"
              cornerHoverClass="group-hover/mbar:opacity-100"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mobileLogo}
              alt="IEEE SMC 2027"
              className="h-10 w-auto object-contain"
            />

            <div className="flex items-center gap-1.5">
              {config.mobileHeader?.showSearch !== false && (
                <div className="h-9 px-3 rounded-full bg-slate-100/90 border border-slate-200/90 flex items-center gap-2 text-xs text-muted-foreground w-36">
                  <Search className="w-3.5 h-3.5 text-foreground/60 shrink-0" />
                  <span className="truncate">
                    {config.mobileHeader?.searchPlaceholder || "Search..."}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen((prev) => !prev);
                }}
                className="w-11 h-9.5 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary cursor-pointer"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Drawer Content */}
          {mobileMenuOpen && (
            <div className="bg-white p-3.5 space-y-2 max-h-[680px] overflow-y-auto">
              {config.navLinks.map((item) => {
                const isActive = activeTrigger?.id === item.id;
                const isEditingTrig =
                  selectedTarget?.type === "trigger" &&
                  selectedTarget.triggerId === item.id;
                const isMega = item.type === "mega" && (item.columns?.length || 0) > 0;
                return (
                  <div
                    key={item.id}
                    className="group/mtrig relative border-b border-slate-100 pb-1.5"
                  >
                    <AdminSquareFrame
                      selected={isEditingTrig}
                      groupHoverClass="group-hover/mtrig:border-[#115eff]/85 group-hover/mtrig:opacity-100"
                      cornerHoverClass="group-hover/mtrig:opacity-100"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onSelectTrigger(item.id);
                        onSelectTarget({ type: "trigger", triggerId: item.id });
                      }}
                      className={cn(
                        "w-full px-3.5 py-3 rounded-2xl flex items-center justify-between text-left cursor-pointer uppercase font-bold text-sm transition-colors",
                        isActive
                          ? "text-primary bg-primary/[0.05]"
                          : "text-foreground hover:bg-slate-50"
                      )}
                    >
                      <span>{item.name}</span>
                      {isMega ? (
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-slate-400 transition-transform",
                            isActive && "rotate-180 text-primary"
                          )}
                        />
                      ) : (
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>

                    {isActive && isMega && (
                      <div className="mt-1.5 p-2 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2.5">
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
                            className="group/mcol relative p-2 rounded-2xl bg-white border border-slate-200/70 cursor-pointer"
                          >
                            <AdminSquareFrame
                              selected={selectedColumnId === col.id && !selectedLinkId}
                              groupHoverClass="group-hover/mcol:border-[#115eff]/85 group-hover/mcol:opacity-100"
                              cornerHoverClass="group-hover/mcol:opacity-100"
                            />
                            <div className="flex items-center gap-1.5 px-2 pt-1 pb-1.5">
                              <div className="w-1.5 h-3.5 rounded-full bg-primary shrink-0" />
                              <span className="text-xs font-extrabold uppercase tracking-wide text-foreground truncate">
                                {col.title}
                              </span>
                            </div>
                            <div className="space-y-0.5 pl-1.5 border-l-2 border-primary/20 ml-2">
                              {col.links.map((link) => {
                                const IconComp = getNavIcon(link.icon);
                                const isThisLink = selectedLinkId === link.id;
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
                                    className="group/mlink relative"
                                  >
                                    <AdminSquareFrame
                                      selected={isThisLink}
                                      groupHoverClass="group-hover/mlink:border-[#115eff] group-hover/mlink:opacity-100"
                                      cornerHoverClass="group-hover/mlink:opacity-100"
                                    />
                                    <div className="group/item flex items-center gap-2 p-2 rounded-xl text-xs font-bold text-foreground hover:bg-primary hover:text-white transition-colors cursor-pointer">
                                      <div className="size-6 rounded-lg bg-primary/10 text-primary group-hover/item:bg-white/20 group-hover/item:text-white flex items-center justify-center shrink-0">
                                        <IconComp className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="truncate flex-1">{link.title}</span>
                                      {link.badge && (
                                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-700 group-hover/item:bg-white/20 group-hover/item:text-white">
                                          {link.badge}
                                        </span>
                                      )}
                                    </div>
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
                <div className="pt-2 space-y-2 border-t border-slate-200/80">
                  <div className="w-full h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold uppercase shadow-xs">
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

  // Desktop Canvas Mockup (Matches live Header.tsx + HCM-UTE 1280px standard)
  const columns: NavColumnItem[] = activeTrigger?.columns || [];
  const hasMegaCanvas = activeTrigger?.type === "mega";
  const halfIndex = Math.ceil(config.navLinks.length / 2);

  return (
    <div className="w-[1280px] mx-auto py-6 px-4 select-none">
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xl overflow-hidden">
        {/* 1. Clickable TopBar Mockup (Matches live TopBar 1:1 with Admin Square Hover Frame) */}
        {showTopbar ? (
          <div
            onClick={() => onSelectTarget({ type: "general" })}
            title="Click to edit Top Bar & General Settings"
            className="group/topbar relative bg-primary text-primary-foreground px-6 py-1.5 flex items-center justify-between gap-4 cursor-pointer transition-all"
          >
            <AdminSquareFrame
              selected={isGeneralSelected}
              groupHoverClass="group-hover/topbar:border-white group-hover/topbar:opacity-100"
              cornerHoverClass="group-hover/topbar:opacity-100"
            />
            {/* Left: Hotline + Email + Quick Links */}
            <div className="flex items-center gap-4 text-xs min-w-0 flex-1 overflow-hidden h-8">
              {config.topbar?.hotline && (
                <span className="inline-flex items-center gap-1.5 font-semibold text-primary-foreground/95 shrink-0">
                  <Phone className="w-3 h-3 text-primary-foreground/80 shrink-0" />
                  <span>{config.topbar.hotline}</span>
                </span>
              )}
              {config.topbar?.email && (
                <span className="inline-flex items-center gap-1.5 font-medium text-primary-foreground/90 shrink-0">
                  <Mail className="w-3 h-3 text-primary-foreground/70 shrink-0" />
                  <span>{config.topbar.email}</span>
                </span>
              )}
              {quickLinks.length > 0 && (
                <div className="flex items-center shrink-0">
                  {quickLinks.map((ql, idx) => (
                    <React.Fragment key={ql.id}>
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold hover:bg-primary-foreground/10 whitespace-nowrap">
                        {ql.label}
                      </span>
                      {idx < quickLinks.length - 1 && (
                        <span className="h-3 w-px bg-primary-foreground/20 mx-0.5 shrink-0" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Search Pill + Login + CTA */}
            <div className="flex items-center gap-2 shrink-0">
              {showSearch && (
                <div className="flex items-center justify-between gap-2 bg-white/10 border border-white/20 rounded-full px-3.5 h-8 min-w-[200px] text-xs font-medium text-white/95">
                  <span className="flex items-center gap-2 truncate">
                    <Search className="w-3.5 h-3.5 text-white/90 shrink-0" />
                    <span className="truncate">
                      {config.topbar?.searchPlaceholder || "Search conference, tracks..."}
                    </span>
                  </span>
                  <kbd className="text-[10px] font-semibold text-white/90 bg-black/25 border border-white/15 rounded px-1.5 py-0.5">
                    ⌘K
                  </kbd>
                </div>
              )}

              <span className="inline-flex items-center gap-1.5 h-8 px-2.5 text-xs font-bold uppercase text-white rounded-lg">
                <User className="size-3.5" />
                <span>Login</span>
              </span>

              {ctaEnabled && (
                <span className="inline-flex items-center gap-1 h-8 px-3 text-xs font-bold uppercase bg-white text-primary rounded-lg shadow-2xs">
                  <span>{config.ctaButton?.label || "Submit Paper"}</span>
                  <ArrowUpRight className="size-3.5" />
                </span>
              )}

              <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-black/35 text-[10px] font-bold text-white opacity-0 group-hover/topbar:opacity-100 transition-opacity">
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
            <span>Top Bar is currently hidden</span>
            <span className="font-semibold text-[#115eff]">Enable in General Settings</span>
          </div>
        )}

        {/* 2. Desktop Main White Header Bar Mockup (Matches hcmute-website-frontend 1:1) */}
        <div
          className={cn(
            "bg-white border-b border-border/60 px-6 transition-all",
            variant === "stacked"
              ? "py-3 space-y-2.5"
              : variant === "centered"
                ? "h-[72px] grid grid-cols-[1fr_auto_1fr] items-center gap-4"
                : "h-[72px] flex items-center justify-start gap-6"
          )}
        >
          {variant === "centered" ? (
            <>
              <nav className="flex items-center justify-start h-full gap-1 min-w-0">
                {config.navLinks
                  .slice(0, halfIndex)
                  .map((item, navIdx) => renderTriggerButton(item, navIdx))}
              </nav>

              {showLogo ? (
                <div
                  onClick={() => onSelectTarget({ type: "general" })}
                  title="Click to edit Brand Logo & Variant"
                  className="group/logo relative flex items-center justify-center shrink-0 cursor-pointer px-3 py-1.5"
                >
                  <AdminSquareFrame
                    selected={isGeneralSelected}
                    groupHoverClass="group-hover/logo:border-[#115eff]/85 group-hover/logo:opacity-100"
                    cornerHoverClass="group-hover/logo:opacity-100"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={desktopLogo}
                    alt="IEEE SMC 2027"
                    className="h-12 w-auto max-w-[160px] object-contain"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectTarget({ type: "general" })}
                  className="px-2 py-1 border border-dashed border-slate-300 text-[10px] font-semibold text-slate-400 hover:border-[#115eff] hover:text-[#115eff] shrink-0 cursor-pointer"
                >
                  Logo Hidden
                </button>
              )}

              <nav className="flex items-center justify-end h-full gap-1 min-w-0">
                {config.navLinks
                  .slice(halfIndex)
                  .map((item, offset) =>
                    renderTriggerButton(item, halfIndex + offset)
                  )}
              </nav>
            </>
          ) : (
            <>
              {/* Left Logo Slot */}
              {showLogo ? (
                <div
                  onClick={() => onSelectTarget({ type: "general" })}
                  title="Click to edit Brand Logo & Variant"
                  className={cn(
                    "group/logo relative flex items-center shrink-0 cursor-pointer p-1.5",
                    variant === "stacked" &&
                      "justify-center w-full border-b border-slate-100 pb-2.5"
                  )}
                >
                  <AdminSquareFrame
                    selected={isGeneralSelected}
                    groupHoverClass="group-hover/logo:border-[#115eff]/85 group-hover/logo:opacity-100"
                    cornerHoverClass="group-hover/logo:opacity-100"
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={desktopLogo}
                    alt="IEEE SMC 2027"
                    className={cn(
                      "w-auto object-contain",
                      variant === "minimal" ? "h-10" : "h-12 xl:h-13"
                    )}
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onSelectTarget({ type: "general" })}
                  className="px-2 py-1 border border-dashed border-slate-300 text-[10px] font-semibold text-slate-400 hover:border-[#115eff] hover:text-[#115eff] shrink-0 cursor-pointer"
                >
                  Logo Hidden
                </button>
              )}

              {/* Nav Triggers Row (HCM-UTE Solid Blue Hover + Admin Square Hover Frame) */}
              <nav
                className={cn(
                  "flex items-center gap-1 flex-wrap",
                  variant !== "stacked" && "h-full",
                  variant === "left-aligned" && "flex-1 justify-start",
                  variant === "stacked" && "w-full justify-center",
                  variant === "minimal" && "flex-1 justify-end"
                )}
              >
                {config.navLinks.map((item, navIdx) =>
                  renderTriggerButton(item, navIdx)
                )}
              </nav>
            </>
          )}
        </div>

        {/* 3. Interactive Mega Menu / Trigger Artboard */}
        {activeTrigger && (
          <div
            onDragOver={handleCanvasDragOver}
            onDragLeave={() => setCanvasDropActive(false)}
            onDrop={(e) => handleCanvasDrop(e)}
            className={cn(
              "bg-slate-50/60 transition-colors",
              canvasDropActive && "bg-blue-50/60 ring-2 ring-inset ring-[#115eff]/40"
            )}
          >
            {/* Artboard Control Sub-header */}
            <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Editing Trigger
                </span>
                <span className="text-sm font-extrabold text-foreground uppercase truncate">
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
                  <>
                    <div className="inline-flex items-center gap-1 rounded-md bg-white p-0.5 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 px-1.5">
                        Columns
                      </span>
                      {[1, 2, 3, 4].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => onSetColumnCount(activeTrigger.id, count)}
                          className={cn(
                            "h-6 w-6 rounded text-xs font-bold transition-colors cursor-pointer",
                            columns.length === count
                              ? "bg-[#115eff] text-white shadow-2xs"
                              : "text-slate-600 hover:bg-slate-100 hover:text-[#115eff]"
                          )}
                        >
                          {count}
                        </button>
                      ))}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs font-semibold border-blue-200 text-foreground bg-white hover:bg-blue-50"
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
                  </>
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
                      : "bg-white border-slate-200 text-slate-700"
                  )}
                >
                  <SlidersHorizontal className="w-3 h-3 mr-1" />
                  Trigger Settings
                </Button>
              </div>
            </div>

            {!hasMegaCanvas ? (
              <div className="p-6 bg-white">
                <div className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex items-center gap-4 min-w-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/3d/empty-state__hcmute-3d-icon.png"
                      alt="Direct Navigation Link"
                      className="w-16 h-16 object-contain shrink-0 select-none"
                    />
                    <div className="min-w-0 text-left">
                      <h4 className="text-sm font-bold text-foreground">
                        Direct Navigation Link
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Clicking{" "}
                        <span className="font-semibold text-slate-700">
                          {activeTrigger.name}
                        </span>{" "}
                        navigates straight to{" "}
                        <code className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-foreground">
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
              /* Interactive Mega Menu Columns Artboard (Matches Live HCM-UTE Mega Menu 1:1) */
              <div className="px-6 py-5 bg-white">
                {columns.length === 0 && !activeTrigger.promoCard ? (
                  <div className="w-full rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-5">
                    <div className="flex items-center gap-4 min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/assets/3d/empty-state__hcmute-3d-icon.png"
                        alt="Empty Mega Menu"
                        className="w-16 h-16 object-contain shrink-0 select-none"
                      />
                      <div className="text-left">
                        <div className="text-sm font-bold text-foreground">
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
                      const side =
                        e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                      setPromoDropSide(side);
                    }}
                    onDragLeave={(e) => {
                      if (
                        draggingPromo &&
                        !e.currentTarget.contains(e.relatedTarget as Node)
                      ) {
                        setPromoDropSide(null);
                      }
                    }}
                    onDrop={(e) => {
                      if (e.dataTransfer.getData("application/x-promo-card") === "1") {
                        e.preventDefault();
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const side =
                          e.clientX < rect.left + rect.width / 2 ? "left" : "right";
                        onSetPromoPosition(activeTrigger.id, side);
                        setDraggingPromo(false);
                        setPromoDropSide(null);
                      }
                    }}
                    className={cn(
                      "flex items-stretch w-full divide-x divide-slate-200/80 border border-border rounded-b-2xl overflow-hidden relative bg-white shadow-sm",
                      promoDropSide === "left" && "border-l-4 border-l-[#115eff]",
                      promoDropSide === "right" && "border-r-4 border-r-[#115eff]"
                    )}
                  >
                    {/* Left Featured Promo Card */}
                    {activeTrigger.promoCard &&
                      activeTrigger.promoCardPosition === "left" && (
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
                            onSelectTarget({
                              type: "trigger",
                              triggerId: activeTrigger.id,
                            })
                          }
                          title="Drag right to move Featured Card, or click to edit"
                          className={cn(
                            "group/promo w-[264px] shrink-0 py-6 px-5 bg-white flex flex-col justify-start relative cursor-grab active:cursor-grabbing",
                            draggingPromo && "opacity-60"
                          )}
                        >
                          <AdminSquareFrame
                            selected={isTriggerSelected}
                            groupHoverClass="group-hover/promo:border-[#115eff]/85 group-hover/promo:opacity-100"
                            cornerHoverClass="group-hover/promo:opacity-100"
                          />
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2 right-2 z-30 opacity-0 group-hover/promo:opacity-100 transition-opacity flex items-center gap-0.5 bg-white border border-slate-200 rounded-none px-1 py-0.5 shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={() => onSetPromoPosition(activeTrigger.id, "right")}
                              title="Move to right"
                              className="p-1 text-slate-500 hover:text-[#115eff] hover:bg-blue-50 cursor-pointer"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="relative pb-2 mb-3">
                            <h3 className="text-[13px] font-bold text-foreground whitespace-nowrap">
                              {activeTrigger.promoCard.badge || "Spotlight"}
                            </h3>
                            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-200/80 rounded-full" />
                          </div>
                          <CanvasPromoCardPreview promoCard={activeTrigger.promoCard} />
                        </div>
                      )}

                    {/* Mega Menu Columns */}
                    {columns.map((col, colIdx) => {
                      const isColSelected =
                        selectedColumnId === col.id && !selectedLinkId;
                      const showPromo =
                        Boolean(col.promoCard) &&
                        (col.type === "promo-card" ||
                          Boolean(col.promoCard?.title || col.promoCard?.image));
                      const promoTop = col.promoPosition === "top";
                      const hasAnyIconInCol = col.links.some((l) => Boolean(l.icon));

                      return (
                        <div
                          key={col.id}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDragColIdx(colIdx);
                            e.dataTransfer.setData(
                              "application/x-col-index",
                              String(colIdx)
                            );
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragOver={(e) => {
                            if (draggingPromo) return;
                            e.preventDefault();
                            e.stopPropagation();
                            if (dragColIdx !== null && dragColIdx !== colIdx) {
                              setDragOverColIdx(colIdx);
                            }
                          }}
                          onDragLeave={() => {
                            if (dragOverColIdx === colIdx) setDragOverColIdx(null);
                          }}
                          onDrop={(e) => {
                            if (
                              e.dataTransfer.getData("application/x-promo-card") ===
                              "1"
                            )
                              return;
                            handleCanvasDrop(e, colIdx);
                          }}
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
                            "group/col relative flex-1 min-w-0 py-6 px-0 flex flex-col cursor-pointer transition-all",
                            dragOverColIdx === colIdx && "border-l-4 border-l-[#115eff]"
                          )}
                        >
                          {/* Admin Square Hover/Selected Frame on Column */}
                          <AdminSquareFrame
                            selected={isColSelected}
                            groupHoverClass="group-hover/col:border-[#115eff]/75 group-hover/col:opacity-100"
                            cornerHoverClass="group-hover/col:opacity-100"
                          />

                          {/* Floating Column Action Bar */}
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className={cn(
                              "absolute top-2 right-2 z-30 flex items-center gap-0.5 px-1 py-0.5 rounded-none bg-white border border-slate-200 shadow-sm transition-opacity",
                              selectedColumnId === col.id
                                ? "opacity-100"
                                : "opacity-0 group-hover/col:opacity-100"
                            )}
                          >
                            <button
                              type="button"
                              disabled={colIdx === 0}
                              onClick={() =>
                                onMoveColumn(activeTrigger.id, colIdx, colIdx - 1)
                              }
                              title="Move left"
                              className="p-1 text-slate-500 hover:text-foreground hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              disabled={colIdx === columns.length - 1}
                              onClick={() =>
                                onMoveColumn(activeTrigger.id, colIdx, colIdx + 1)
                              }
                              title="Move right"
                              className="p-1 text-slate-500 hover:text-foreground hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
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
                              className="p-1 text-[#115eff] hover:bg-blue-50 cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onDeleteColumn(activeTrigger.id, col.id)}
                              title="Delete column"
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>

                          {/* Column Heading + Animated Gradient Underline */}
                          <div className="relative pb-2 mb-2 shrink-0 px-5 pr-20">
                            <h3 className="text-[13.5px] font-extrabold text-foreground whitespace-pre-line">
                              {col.title || "Untitled Column"}
                            </h3>
                            <div className="absolute bottom-0 left-5 right-5 h-[1.5px] bg-slate-200/80 rounded-full" />
                            <div
                              className={cn(
                                "absolute bottom-0 left-5 right-5 h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500 rounded-full origin-left transition-transform duration-300",
                                selectedColumnId === col.id
                                  ? "scale-x-100"
                                  : "scale-x-0 group-hover/col:scale-x-100"
                              )}
                            />
                          </div>

                          {promoTop && showPromo && col.promoCard && (
                            <div className="px-5 mb-2">
                              <CanvasPromoCardPreview promoCard={col.promoCard} />
                            </div>
                          )}

                          {/* Column Links (Full-bleed Solid Blue Hover + Admin Square Selection Frame) */}
                          {col.type !== "promo-card" && (
                            <div className="flex flex-col flex-1 w-full">
                              {col.links.map((link, linkIdx) => {
                                const IconComp = link.icon
                                  ? getNavIcon(link.icon)
                                  : null;
                                const isLinkSelected =
                                  selectedColumnId === col.id &&
                                  selectedLinkId === link.id;
                                const isLinkDragOver =
                                  dragOverLink?.colId === col.id &&
                                  dragOverLink.index === linkIdx;

                                return (
                                  <div
                                    key={link.id}
                                    draggable
                                    onDragStart={(e) => {
                                      e.stopPropagation();
                                      setDragLinkState({
                                        colId: col.id,
                                        index: linkIdx,
                                      });
                                      e.dataTransfer.setData(
                                        "application/x-col-link",
                                        String(linkIdx)
                                      );
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
                                        setDragOverLink({
                                          colId: col.id,
                                          index: linkIdx,
                                        });
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
                                      "group/linkslot relative w-full cursor-grab active:cursor-grabbing",
                                      isLinkDragOver && "border-t-2 border-t-[#115eff]"
                                    )}
                                  >
                                    <AdminSquareFrame
                                      selected={isLinkSelected}
                                      groupHoverClass="group-hover/linkslot:border-white/90 group-hover/linkslot:opacity-100"
                                      cornerHoverClass="group-hover/linkslot:opacity-100"
                                    />
                                    <div
                                      className={cn(
                                        "group/item w-full flex items-start gap-2.5 py-3 px-5 rounded-none transition-colors duration-150",
                                        isLinkSelected
                                          ? "bg-primary text-white"
                                          : "hover:bg-primary hover:text-white"
                                      )}
                                    >
                                      {IconComp ? (
                                        <div
                                          className={cn(
                                            "size-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors shadow-2xs",
                                            isLinkSelected
                                              ? "bg-white/20 text-white"
                                              : "bg-primary/10 text-primary group-hover/item:bg-white/20 group-hover/item:text-white"
                                          )}
                                        >
                                          <IconComp className="w-3.5 h-3.5" />
                                        </div>
                                      ) : hasAnyIconInCol ? (
                                        <div className="size-6 shrink-0" />
                                      ) : null}

                                      <span
                                        className={cn(
                                          "text-[14.5px] font-bold leading-snug flex-1 min-w-0 whitespace-pre-line",
                                          isLinkSelected
                                            ? "text-white"
                                            : "text-foreground group-hover/item:text-white"
                                        )}
                                      >
                                        {link.title || "Untitled Link"}
                                      </span>

                                      {link.badge && (
                                        <span
                                          className={cn(
                                            "shrink-0 text-[9.5px] font-extrabold uppercase px-1.5 py-0.5 rounded-md mt-0.5",
                                            isLinkSelected
                                              ? "bg-white/20 text-white"
                                              : "bg-amber-500/15 text-amber-700 group-hover/item:bg-white/20 group-hover/item:text-white"
                                          )}
                                        >
                                          {link.badge}
                                        </span>
                                      )}

                                      {link.isExternal && (
                                        <ArrowUpRight
                                          className={cn(
                                            "w-3.5 h-3.5 shrink-0 mt-0.5",
                                            isLinkSelected
                                              ? "text-white"
                                              : "text-muted-foreground/60 group-hover/item:text-white"
                                          )}
                                        />
                                      )}
                                    </div>
                                  </div>
                                );
                              })}

                              {col.links.length === 0 && (
                                <div className="mx-5 py-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-200">
                                  No links in this column
                                </div>
                              )}
                            </div>
                          )}

                          {!promoTop && showPromo && col.promoCard && (
                            <div className="px-5 mt-2">
                              <CanvasPromoCardPreview promoCard={col.promoCard} />
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Right Featured Promo Card Sidebar (Default right side) */}
                    {activeTrigger.promoCard &&
                      activeTrigger.promoCardPosition !== "left" && (
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
                            onSelectTarget({
                              type: "trigger",
                              triggerId: activeTrigger.id,
                            })
                          }
                          title="Drag left to move Featured Card, or click to edit"
                          className={cn(
                            "group/promo w-[264px] shrink-0 py-6 px-5 bg-white flex flex-col justify-start relative cursor-grab active:cursor-grabbing",
                            draggingPromo && "opacity-60"
                          )}
                        >
                          <AdminSquareFrame
                            selected={isTriggerSelected}
                            groupHoverClass="group-hover/promo:border-[#115eff]/85 group-hover/promo:opacity-100"
                            cornerHoverClass="group-hover/promo:opacity-100"
                          />
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2 right-2 z-30 opacity-0 group-hover/promo:opacity-100 transition-opacity flex items-center gap-0.5 bg-white border border-slate-200 rounded-none px-1 py-0.5 shadow-2xs"
                          >
                            <button
                              type="button"
                              onClick={() => onSetPromoPosition(activeTrigger.id, "left")}
                              title="Move to left"
                              className="p-1 text-slate-500 hover:text-[#115eff] hover:bg-blue-50 cursor-pointer"
                            >
                              <ArrowLeft className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="relative pb-2 mb-3">
                            <h3 className="text-[13px] font-bold text-foreground whitespace-nowrap">
                              {activeTrigger.promoCard.badge || "Spotlight"}
                            </h3>
                            <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-200/80 rounded-full" />
                          </div>
                          <CanvasPromoCardPreview promoCard={activeTrigger.promoCard} />
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
