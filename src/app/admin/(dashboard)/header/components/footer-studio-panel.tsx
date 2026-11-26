"use client";

import React, { useEffect, useRef, useState } from "react";
import type {
  FooterConfigData,
  FooterLinkGroup,
  FooterLinkItem,
  FooterSocialLink,
} from "@/lib/footer-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageLinkPicker } from "./page-link-picker";
import { MediaLibraryModal } from "@/components/media/MediaLibraryModal";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Globe,
  FileDown,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  FolderOpen,
  X,
  Columns3,
  PanelBottom,
  Building2,
  Megaphone,
  Copyright,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const DOC_ACCEPT = ".pdf,.zip,.doc,.docx,.xls,.xlsx,.ppt,.pptx,application/pdf,application/zip";

export type FooterInspectorTarget =
  | { type: "banner" }
  | { type: "brand" }
  | { type: "group"; groupIndex: number }
  | { type: "bottom" }
  | null;

/* ── Left Palette for Footer Mode (Layers & Draggable Link Columns) ───────── */
export function FooterPalette({
  config,
  selectedTarget,
  onSelectTarget,
  onAddLinkGroup,
  onSetColumnCount,
  onMoveLinkGroup,
  onDeleteLinkGroup,
}: {
  config: FooterConfigData;
  selectedTarget: FooterInspectorTarget;
  onSelectTarget: (target: FooterInspectorTarget) => void;
  onAddLinkGroup: () => void;
  onSetColumnCount: (count: number) => void;
  onMoveLinkGroup: (fromIndex: number, toIndex: number) => void;
  onDeleteLinkGroup: (groupIndex: number) => void;
}) {
  const [dragColIdx, setDragColIdx] = useState<number | null>(null);
  const [dragOverColIdx, setDragOverColIdx] = useState<number | null>(null);

  const sections: {
    id: "banner" | "brand" | "bottom";
    title: string;
    description: string;
  }[] = [
    {
      id: "banner",
      title: "Top CFP Banner",
      description: "Badge, dates, heading, CFP file & portal CTA.",
    },
    {
      id: "brand",
      title: "Brand, Contact & Social",
      description: "Host university, venue, hotline, email & social.",
    },
    {
      id: "bottom",
      title: "Bottom Copyright Bar",
      description: "Copyright notice and right-side venue credit.",
    },
  ];

  return (
    <aside className="w-[272px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      <div className="px-3.5 py-2.5 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-extrabold text-[#004776]">
          Footer Layers
        </span>
        <span className="text-[10px] font-semibold text-slate-400">
          Drag to reorder
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Core Regions */}
        <div className="space-y-1.5">
          <div className="px-0.5 text-[11px] font-bold capitalize text-slate-400">
            Layout Regions
          </div>
          {sections.map((sec) => {
            const isSelected = selectedTarget?.type === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => onSelectTarget({ type: sec.id })}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg border transition-all cursor-pointer",
                  isSelected
                    ? "bg-blue-50/70 border-[#115eff] shadow-2xs"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                )}
              >
                <div className="text-xs font-bold text-[#004776] truncate">
                  {sec.title}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                  {sec.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Draggable Link Columns */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-bold capitalize text-slate-400">
              Link Columns ({config.linkGroups.length})
            </span>
            <div className="inline-flex items-center gap-0.5 rounded bg-slate-100 p-0.5 border border-slate-200">
              {[2, 3, 4, 5].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => onSetColumnCount(count)}
                  className={cn(
                    "h-5 w-5 rounded text-[11px] font-bold transition-colors cursor-pointer",
                    config.linkGroups.length === count
                      ? "bg-[#115eff] text-white"
                      : "text-slate-600 hover:bg-white hover:text-[#115eff]"
                  )}
                  title={`Set ${count} columns`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            {config.linkGroups.map((group, idx) => {
              const isSelected =
                selectedTarget?.type === "group" &&
                selectedTarget.groupIndex === idx;
              return (
                <div
                  key={`${group.heading}-${idx}`}
                  draggable
                  onDragStart={(e) => {
                    setDragColIdx(idx);
                    e.dataTransfer.setData("application/x-footer-col", String(idx));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    if (dragColIdx !== null && dragColIdx !== idx) {
                      e.preventDefault();
                      setDragOverColIdx(idx);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverColIdx === idx) setDragOverColIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragColIdx !== null && dragColIdx !== idx) {
                      onMoveLinkGroup(dragColIdx, idx);
                    }
                    setDragColIdx(null);
                    setDragOverColIdx(null);
                  }}
                  onDragEnd={() => {
                    setDragColIdx(null);
                    setDragOverColIdx(null);
                  }}
                  onClick={() => onSelectTarget({ type: "group", groupIndex: idx })}
                  className={cn(
                    "group flex items-center gap-2 px-2.5 py-2 rounded-md border transition-all cursor-grab active:cursor-grabbing",
                    isSelected
                      ? "bg-blue-50/80 border-[#115eff] shadow-2xs"
                      : "bg-white border-slate-200 hover:border-blue-200 hover:bg-slate-50",
                    dragOverColIdx === idx && "border-t-2 border-t-[#115eff]"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#004776] truncate">
                      {group.heading || `Column ${idx + 1}`}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {group.links.length}{" "}
                      {group.links.length === 1 ? "link" : "links"}
                    </div>
                  </div>
                  {config.linkGroups.length > 1 && (
                    <button
                      type="button"
                      title="Delete column"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLinkGroup(idx);
                      }}
                      className="p-1 rounded text-slate-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-2.5 border-t border-slate-100 bg-slate-50/50">
        <Button
          type="button"
          size="sm"
          onClick={onAddLinkGroup}
          className="w-full h-8 text-xs bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add Link Column
        </Button>
      </div>
    </aside>
  );
}

/* ── Crisp Square Hover / Selection Frame for Admin Footer Canvas ─────────── */
function FooterSquareFrame({
  selected,
  groupHoverClass = "group-hover/slot:border-white group-hover/slot:opacity-100",
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
          ? "border-amber-300 opacity-100"
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

/* ── Visual Footer Canvas (Matches live HCM-UTE Footer.tsx 1:1 + Square Hover Frames) ── */
export function VisualFooterCanvas({
  config,
  viewport,
  selectedTarget,
  onSelectTarget,
  onMoveLinkGroup,
  onReorderGroupLinks,
  onReorderSocialLinks,
  onDeleteLinkGroup,
}: {
  config: FooterConfigData;
  viewport: "desktop" | "tablet" | "mobile";
  selectedTarget: FooterInspectorTarget;
  onSelectTarget: (target: FooterInspectorTarget) => void;
  onMoveLinkGroup: (fromIndex: number, toIndex: number) => void;
  onReorderGroupLinks: (groupIndex: number, fromIndex: number, toIndex: number) => void;
  onReorderSocialLinks: (fromIndex: number, toIndex: number) => void;
  onDeleteLinkGroup: (groupIndex: number) => void;
}) {
  const [dragColIdx, setDragColIdx] = useState<number | null>(null);
  const [dragOverColIdx, setDragOverColIdx] = useState<number | null>(null);
  const [dragLink, setDragLink] = useState<{ groupIndex: number; linkIndex: number } | null>(null);
  const [dragOverLink, setDragOverLink] = useState<{ groupIndex: number; linkIndex: number } | null>(null);
  const [dragSocialIdx, setDragSocialIdx] = useState<number | null>(null);
  const [dragOverSocialIdx, setDragOverSocialIdx] = useState<number | null>(null);

  const frameClass =
    viewport === "mobile"
      ? "w-[390px]"
      : viewport === "tablet"
        ? "w-[768px]"
        : "w-[1280px]";

  const isBannerSelected = selectedTarget?.type === "banner";
  const isBrandSelected = selectedTarget?.type === "brand";
  const isBottomSelected = selectedTarget?.type === "bottom";

  return (
    <div className={cn(frameClass, "mx-auto py-6 px-4 select-none")}>
      <div className="rounded-xl border border-blue-200/80 shadow-2xl overflow-hidden bg-blue-600 text-white relative">
        {/* Giant HCM-UTE white flower watermark matching hcmute-website-frontend */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/flower-ute-white.png"
          alt=""
          className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-[45rem] h-[45rem] opacity-[0.075] rotate-[30deg] pointer-events-none select-none object-contain"
        />

        {/* Top Banner: Host University & CFP Action Bar */}
        <div
          onClick={() => onSelectTarget({ type: "banner" })}
          title="Click to edit Top CFP Banner"
          className={cn(
            "relative z-10 px-6 py-7 border-b border-white/20 cursor-pointer transition-all group/banner",
            viewport === "desktop"
              ? "grid grid-cols-12 gap-6 items-center"
              : "flex flex-col gap-5",
            isBannerSelected ? "bg-white/10" : "hover:bg-white/5"
          )}
        >
          <FooterSquareFrame
            selected={isBannerSelected}
            groupHoverClass="group-hover/banner:border-white group-hover/banner:opacity-100"
            cornerHoverClass="group-hover/banner:opacity-100"
          />
          <span className="absolute top-2.5 right-3 z-30 inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-black/35 text-[10px] font-bold text-white opacity-0 group-hover/banner:opacity-100 transition-opacity">
            <SlidersHorizontal className="w-3 h-3" />
            Edit Banner
          </span>

          <div className={viewport === "desktop" ? "col-span-8" : ""}>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/15 border border-white/25 text-xs font-semibold text-white mb-2.5">
              <span>{config.badgeText}</span>
              <span className="text-white/50">•</span>
              <span>{config.datesText}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {config.heading}
            </h3>
            <p className="mt-1.5 text-sm text-white/90 max-w-2xl leading-relaxed">
              {config.description}
            </p>
          </div>

          <div
            className={cn(
              "flex flex-col gap-2.5",
              viewport === "desktop" ? "col-span-4" : ""
            )}
          >
            {config.cfpButtonLabel && (
              <div className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-white text-blue-700 font-bold text-sm rounded-lg shadow-sm">
                <FileDown className="w-4 h-4 text-blue-700" />
                <span>{config.cfpButtonLabel}</span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            )}
            {config.portalButtonLabel && (
              <div className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-white/10 border border-white/25 text-white font-semibold text-sm rounded-lg">
                <Globe className="w-4 h-4" />
                <span>{config.portalButtonLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Footer Content Grid (Matches 4+8 col HCM-UTE layout) */}
        <div
          className={cn(
            "relative z-10 px-6 py-10",
            viewport === "desktop"
              ? "grid grid-cols-12 gap-10"
              : "flex flex-col gap-8"
          )}
        >
          {/* Left Column: Brand & Contact (col-span-4) */}
          <div
            onClick={() => onSelectTarget({ type: "brand" })}
            title="Click to edit Brand, Contact & Social Links"
            className={cn(
              "space-y-4 p-3 -m-3 cursor-pointer transition-all relative group/brand",
              viewport === "desktop" ? "col-span-4" : "",
              isBrandSelected ? "bg-white/10" : "hover:bg-white/5"
            )}
          >
            <FooterSquareFrame
              selected={isBrandSelected}
              groupHoverClass="group-hover/brand:border-white group-hover/brand:opacity-100"
              cornerHoverClass="group-hover/brand:opacity-100"
            />
            <span className="absolute top-2 right-2 z-30 inline-flex items-center gap-1 px-2 py-0.5 rounded-none bg-black/35 text-[10px] font-bold text-white opacity-0 group-hover/brand:opacity-100 transition-opacity">
              Edit Brand
            </span>

            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo/rectangle-logo.png"
                alt="HCM-UTE"
                className="h-14 w-auto object-contain"
              />
            </div>

            <p className="text-white/95 text-sm leading-relaxed">
              {config.secondaryDescription || config.universityNote}
            </p>

            <div className="space-y-2.5 text-sm text-white/95 pt-1">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-white mt-0.5 shrink-0" />
                <span>
                  {config.venueName}, {config.address}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-white shrink-0" />
                <span>{config.hotline}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-white shrink-0" />
                <span>{config.contactEmail}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              {config.socialLinks.map((social, idx) => (
                <span
                  key={`${social.name}-${idx}`}
                  draggable
                  onDragStart={(e) => {
                    e.stopPropagation();
                    setDragSocialIdx(idx);
                    e.dataTransfer.setData("application/x-footer-social", String(idx));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    if (dragSocialIdx !== null && dragSocialIdx !== idx) {
                      e.preventDefault();
                      e.stopPropagation();
                      setDragOverSocialIdx(idx);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverSocialIdx === idx) setDragOverSocialIdx(null);
                  }}
                  onDrop={(e) => {
                    if (dragSocialIdx !== null && dragSocialIdx !== idx) {
                      e.preventDefault();
                      e.stopPropagation();
                      onReorderSocialLinks(dragSocialIdx, idx);
                    }
                    setDragSocialIdx(null);
                    setDragOverSocialIdx(null);
                  }}
                  onDragEnd={() => {
                    setDragSocialIdx(null);
                    setDragOverSocialIdx(null);
                  }}
                  className={cn(
                    "px-2.5 py-1 rounded-[var(--radius)] bg-white/10 border border-white/20 text-xs font-medium text-white cursor-grab active:cursor-grabbing transition-all",
                    dragOverSocialIdx === idx && "ring-2 ring-white"
                  )}
                >
                  {social.name}
                </span>
              ))}
            </div>
          </div>

          {/* Right Columns: Draggable Categorized Navigation Links (col-span-8) */}
          <div className={viewport === "desktop" ? "col-span-8" : ""}>
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns:
                  viewport === "mobile"
                    ? "repeat(1, minmax(0, 1fr))"
                    : viewport === "tablet"
                      ? "repeat(2, minmax(0, 1fr))"
                      : `repeat(${Math.max(1, config.linkGroups.length)}, minmax(0, 1fr))`,
              }}
            >
              {config.linkGroups.map((group, gIdx) => {
                const isGroupSelected =
                  selectedTarget?.type === "group" &&
                  selectedTarget.groupIndex === gIdx;

                return (
                  <div
                    key={`${group.heading}-${gIdx}`}
                    draggable
                    onDragStart={(e) => {
                      e.stopPropagation();
                      setDragColIdx(gIdx);
                      e.dataTransfer.setData("application/x-footer-canvas-col", String(gIdx));
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      if (dragColIdx !== null && dragColIdx !== gIdx) {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverColIdx(gIdx);
                      }
                    }}
                    onDragLeave={() => {
                      if (dragOverColIdx === gIdx) setDragOverColIdx(null);
                    }}
                    onDrop={(e) => {
                      if (dragColIdx !== null && dragColIdx !== gIdx) {
                        e.preventDefault();
                        e.stopPropagation();
                        onMoveLinkGroup(dragColIdx, gIdx);
                      }
                      setDragColIdx(null);
                      setDragOverColIdx(null);
                    }}
                    onDragEnd={() => {
                      setDragColIdx(null);
                      setDragOverColIdx(null);
                    }}
                    onClick={() =>
                      onSelectTarget({ type: "group", groupIndex: gIdx })
                    }
                    className={cn(
                      "group/col relative p-2.5 -m-2.5 cursor-grab active:cursor-grabbing transition-all",
                      isGroupSelected ? "bg-white/10" : "hover:bg-white/5",
                      dragOverColIdx === gIdx && "border-l-2 border-l-white"
                    )}
                  >
                    <FooterSquareFrame
                      selected={isGroupSelected}
                      groupHoverClass="group-hover/col:border-white group-hover/col:opacity-100"
                      cornerHoverClass="group-hover/col:opacity-100"
                    />

                    {/* Floating Column Reorder/Delete Bar */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "absolute top-1 right-1 z-30 flex items-center gap-0.5 px-1 py-0.5 rounded-none bg-white text-slate-700 shadow-sm transition-opacity",
                        isGroupSelected
                          ? "opacity-100"
                          : "opacity-0 group-hover/col:opacity-100"
                      )}
                    >
                      <button
                        type="button"
                        disabled={gIdx === 0}
                        onClick={() => onMoveLinkGroup(gIdx, gIdx - 1)}
                        className="p-0.5 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Move left"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        disabled={gIdx === config.linkGroups.length - 1}
                        onClick={() => onMoveLinkGroup(gIdx, gIdx + 1)}
                        className="p-0.5 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                        title="Move right"
                      >
                      <ArrowRight className="w-3 h-3" />
                      </button>
                      {config.linkGroups.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteLinkGroup(gIdx)}
                          className="p-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    <h4 className="text-white font-semibold text-sm uppercase mb-4 tracking-wide pr-10">
                      {group.heading || `Column ${gIdx + 1}`}
                    </h4>
                    <ul className="space-y-2">
                      {group.links.map((link, lIdx) => {
                        const isLinkOver =
                          dragOverLink?.groupIndex === gIdx &&
                          dragOverLink.linkIndex === lIdx;
                        return (
                          <li
                            key={`${link.label}-${lIdx}`}
                            draggable
                            onDragStart={(e) => {
                              e.stopPropagation();
                              setDragLink({ groupIndex: gIdx, linkIndex: lIdx });
                              e.dataTransfer.setData("application/x-footer-link", String(lIdx));
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            onDragOver={(e) => {
                              if (
                                dragLink &&
                                dragLink.groupIndex === gIdx &&
                                dragLink.linkIndex !== lIdx
                              ) {
                                e.preventDefault();
                                e.stopPropagation();
                                setDragOverLink({ groupIndex: gIdx, linkIndex: lIdx });
                              }
                            }}
                            onDragLeave={() => {
                              if (isLinkOver) setDragOverLink(null);
                            }}
                            onDrop={(e) => {
                              if (
                                dragLink &&
                                dragLink.groupIndex === gIdx &&
                                dragLink.linkIndex !== lIdx
                              ) {
                                e.preventDefault();
                                e.stopPropagation();
                                onReorderGroupLinks(gIdx, dragLink.linkIndex, lIdx);
                              }
                              setDragLink(null);
                              setDragOverLink(null);
                            }}
                            onDragEnd={() => {
                              setDragLink(null);
                              setDragOverLink(null);
                            }}
                            className={cn(
                              "text-white/90 text-sm truncate px-1 py-0.5 -mx-1 hover:bg-white/10 hover:text-white cursor-grab active:cursor-grabbing",
                              isLinkOver && "border-t-2 border-t-white"
                            )}
                          >
                            {link.label || "Untitled Link"}
                          </li>
                        );
                      })}
                      {group.links.length === 0 && (
                        <li className="text-white/60 text-xs italic">
                          No links yet
                        </li>
                      )}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Sub-bar */}
        <div
          onClick={() => onSelectTarget({ type: "bottom" })}
          title="Click to edit Bottom Copyright Bar"
          className={cn(
            "group/bottom relative border-t border-white/20 px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-2 text-sm cursor-pointer transition-all",
            isBottomSelected ? "bg-white/10" : "hover:bg-white/5"
          )}
        >
          <FooterSquareFrame
            selected={isBottomSelected}
            groupHoverClass="group-hover/bottom:border-white group-hover/bottom:opacity-100"
            cornerHoverClass="group-hover/bottom:opacity-100"
          />
          <p className="text-white/90">{config.copyrightText}</p>
          <span className="text-white/80">{config.footerRightText}</span>
        </div>
      </div>
    </div>
  );
}

/* ── Bottom Docked Footer Inspector Drawer ────────────────────────────────── */
export function FooterInspector({
  config,
  target,
  onClose,
  onUpdateConfig,
  onDeleteLinkGroup,
}: {
  config: FooterConfigData;
  target: FooterInspectorTarget;
  onClose: () => void;
  onUpdateConfig: (updater: (prev: FooterConfigData) => FooterConfigData) => void;
  onDeleteLinkGroup: (groupIndex: number) => void;
}) {
  const [filePickerTarget, setFilePickerTarget] = useState<
    | { kind: "cfp" }
    | { kind: "group-link"; groupIndex: number; linkIndex: number }
    | null
  >(null);
  const [panelHeight, setPanelHeight] = useState<number | null>(null);
  const draggingRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const delta = draggingRef.current.startY - e.clientY;
      const maxH = Math.max(260, Math.round(window.innerHeight * 0.72));
      const next = Math.min(maxH, Math.max(180, draggingRef.current.startHeight + delta));
      setPanelHeight(next);
    };
    const onUp = () => {
      if (!draggingRef.current) return;
      draggingRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  if (!target) return null;

  let headerTitle = "Footer Inspector";
  let HeaderIcon = PanelBottom;
  let body: React.ReactNode = null;

  if (target.type === "banner") {
    headerTitle = "Footer Top CFP Banner";
    HeaderIcon = Megaphone;
    body = (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1 block">
                Badge Text
              </Label>
              <Input
                value={config.badgeText}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({ ...prev, badgeText: e.target.value }))
                }
                className="h-8 text-xs bg-white"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1 block">
                Conference Dates
              </Label>
              <Input
                value={config.datesText}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({ ...prev, datesText: e.target.value }))
                }
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              Banner Heading
            </Label>
            <Input
              value={config.heading}
              onChange={(e) =>
                onUpdateConfig((prev) => ({ ...prev, heading: e.target.value }))
              }
              className="h-8 text-xs bg-white font-semibold"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              Description
            </Label>
            <Textarea
              value={config.description}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={2}
              className="text-xs bg-white min-h-[60px]"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              Primary Button Label
            </Label>
            <Input
              value={config.cfpButtonLabel}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  cfpButtonLabel: e.target.value,
                }))
              }
              className="h-8 text-xs bg-white"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              CFP File / Target URL
            </Label>
            <div className="flex items-center gap-1.5">
              <Input
                value={config.cfpPdfUrl}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({ ...prev, cfpPdfUrl: e.target.value }))
                }
                className="h-8 text-xs font-mono bg-white"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setFilePickerTarget({ kind: "cfp" })}
                title="Select from File Manager"
                className="h-8 w-8 p-0 bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-600 hover:text-[#115eff] shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1 block">
                Secondary Button
              </Label>
              <Input
                value={config.portalButtonLabel}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    portalButtonLabel: e.target.value,
                  }))
                }
                className="h-8 text-xs bg-white"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1 block">
                Portal URL
              </Label>
              <Input
                value={config.websiteUrl}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({ ...prev, websiteUrl: e.target.value }))
                }
                className="h-8 text-xs font-mono bg-white"
              />
            </div>
          </div>
        </div>
      </div>
    );
  } else if (target.type === "brand") {
    headerTitle = "Brand, Venue, Contact & Social Links";
    HeaderIcon = Building2;

    const updateSocial = (idx: number, patch: Partial<FooterSocialLink>) => {
      onUpdateConfig((prev) => ({
        ...prev,
        socialLinks: prev.socialLinks.map((s, i) =>
          i === idx ? { ...s, ...patch } : s
        ),
      }));
    };

    body = (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              University Note
            </Label>
            <Textarea
              value={config.universityNote}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  universityNote: e.target.value,
                }))
              }
              rows={2}
              className="text-xs bg-white"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              Conference Summary
            </Label>
            <Textarea
              value={config.secondaryDescription}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  secondaryDescription: e.target.value,
                }))
              }
              rows={3}
              className="text-xs bg-white"
            />
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              Venue Name
            </Label>
            <Input
              value={config.venueName}
              onChange={(e) =>
                onUpdateConfig((prev) => ({ ...prev, venueName: e.target.value }))
              }
              className="h-8 text-xs bg-white"
            />
          </div>
          <div>
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              Address
            </Label>
            <Input
              value={config.address}
              onChange={(e) =>
                onUpdateConfig((prev) => ({ ...prev, address: e.target.value }))
              }
              className="h-8 text-xs bg-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1 block">
                Hotline
              </Label>
              <Input
                value={config.hotline}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    hotline: e.target.value,
                    hotlineRaw: e.target.value.replace(/[^+\d]/g, ""),
                  }))
                }
                className="h-8 text-xs bg-white"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold text-slate-700 mb-1 block">
                Contact Email
              </Label>
              <Input
                value={config.contactEmail}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-[#004776]">
              Social Links ({config.socialLinks.length})
            </Label>
            <button
              type="button"
              onClick={() =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  socialLinks: [
                    ...prev.socialLinks,
                    { name: "Website", href: "https://hcmute.edu.vn", platform: "globe" },
                  ],
                }))
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#115eff] hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Social
            </button>
          </div>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-0.5">
            {config.socialLinks.map((social, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Input
                  value={social.name}
                  onChange={(e) => updateSocial(idx, { name: e.target.value })}
                  placeholder="Name"
                  className="h-7 text-xs bg-white w-28"
                />
                <Input
                  value={social.href}
                  onChange={(e) => updateSocial(idx, { href: e.target.value })}
                  placeholder="https://..."
                  className="h-7 text-xs font-mono bg-white flex-1"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      socialLinks: prev.socialLinks.filter((_, i) => i !== idx),
                    }))
                  }
                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } else if (target.type === "group") {
    const group: FooterLinkGroup | undefined = config.linkGroups[target.groupIndex];
    if (!group) return null;

    headerTitle = `Footer Column · ${group.heading || `Column ${target.groupIndex + 1}`}`;
    HeaderIcon = Columns3;

    const updateGroup = (patch: Partial<FooterLinkGroup>) => {
      onUpdateConfig((prev) => ({
        ...prev,
        linkGroups: prev.linkGroups.map((g, idx) =>
          idx === target.groupIndex ? { ...g, ...patch } : g
        ),
      }));
    };

    const updateLink = (linkIdx: number, patch: Partial<FooterLinkItem>) => {
      updateGroup({
        links: group.links.map((l, i) =>
          i === linkIdx ? { ...l, ...patch } : l
        ),
      });
    };

    const moveLink = (linkIdx: number, dir: -1 | 1) => {
      const nextIdx = linkIdx + dir;
      if (nextIdx < 0 || nextIdx >= group.links.length) return;
      const copy = [...group.links];
      const [moved] = copy.splice(linkIdx, 1);
      copy.splice(nextIdx, 0, moved);
      updateGroup({ links: copy });
    };

    body = (
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-3">
          <div className="w-72">
            <Label className="text-xs font-semibold text-slate-700 mb-1 block">
              Column Heading
            </Label>
            <Input
              value={group.heading}
              onChange={(e) => updateGroup({ heading: e.target.value })}
              className="h-8 text-xs font-bold bg-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() =>
                updateGroup({
                  links: [...group.links, { label: "New Link", href: "/" }],
                })
              }
              className="h-8 px-3 text-xs bg-[#115eff] hover:bg-[#0a4de6] text-white"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Link
            </Button>
            {config.linkGroups.length > 1 && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => onDeleteLinkGroup(target.groupIndex)}
                className="h-8 px-2.5 text-xs border-red-200 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Delete Column
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {group.links.map((link, lIdx) => (
            <div
              key={lIdx}
              className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50/50"
            >
              <Input
                value={link.label}
                onChange={(e) => updateLink(lIdx, { label: e.target.value })}
                placeholder="Link label"
                className="h-8 text-xs bg-white w-56 font-medium"
              />
              <Input
                value={link.href}
                onChange={(e) => updateLink(lIdx, { href: e.target.value })}
                placeholder="/submissions"
                className="h-8 text-xs font-mono bg-white flex-1"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setFilePickerTarget({
                    kind: "group-link",
                    groupIndex: target.groupIndex,
                    linkIndex: lIdx,
                  })
                }
                title="Select from File Manager"
                className="h-8 w-8 p-0 bg-white border-slate-200 hover:bg-blue-50 hover:border-blue-300 text-slate-600 hover:text-[#115eff] shrink-0"
              >
                <FolderOpen className="w-3.5 h-3.5" />
              </Button>
              <PageLinkPicker
                value={link.href}
                onSelect={(sel) =>
                  updateLink(lIdx, {
                    href: sel.href,
                    label: link.label || sel.label || "Link",
                  })
                }
                label="Page"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={lIdx === 0}
                onClick={() => moveLink(lIdx, -1)}
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={lIdx === group.links.length - 1}
                onClick={() => moveLink(lIdx, 1)}
                className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() =>
                  updateGroup({
                    links: group.links.filter((_, i) => i !== lIdx),
                  })
                }
                className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (target.type === "bottom") {
    headerTitle = "Bottom Copyright Bar";
    HeaderIcon = Copyright;
    body = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-xs font-semibold text-slate-700 mb-1 block">
            Left Copyright Text
          </Label>
          <Input
            value={config.copyrightText}
            onChange={(e) =>
              onUpdateConfig((prev) => ({
                ...prev,
                copyrightText: e.target.value,
              }))
            }
            className="h-9 text-xs bg-white"
          />
        </div>
        <div>
          <Label className="text-xs font-semibold text-slate-700 mb-1 block">
            Right Venue / Credit Text
          </Label>
          <Input
            value={config.footerRightText}
            onChange={(e) =>
              onUpdateConfig((prev) => ({
                ...prev,
                footerRightText: e.target.value,
              }))
            }
            className="h-9 text-xs bg-white"
          />
        </div>
      </div>
    );
  }

  return (
    <section
      ref={sectionRef}
      style={panelHeight ? { height: `${panelHeight}px` } : undefined}
      className={cn(
        "w-full shrink-0 bg-white border-t border-slate-200 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] flex flex-col z-20 min-h-0",
        !panelHeight && "max-h-[48%]"
      )}
    >
      {/* Fluid Resize Handle (VS Code style) */}
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          const rect = sectionRef.current?.getBoundingClientRect();
          draggingRef.current = {
            startY: e.clientY,
            startHeight: rect?.height || 300,
          };
          document.body.style.cursor = "row-resize";
          document.body.style.userSelect = "none";
        }}
        title="Drag to resize panel"
        className="h-1.5 w-full cursor-row-resize bg-transparent hover:bg-[#115eff]/25 active:bg-[#115eff]/40 transition-colors shrink-0 flex items-center justify-center group"
      >
        <span className="w-10 h-0.5 rounded-full bg-slate-300 group-hover:bg-[#115eff] transition-colors" />
      </div>
      <div className="h-9 px-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <HeaderIcon className="w-4 h-4 text-[#115eff] shrink-0" />
          <h3 className="text-xs font-extrabold capitalize text-[#004776] truncate">
            {headerTitle}
          </h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">{body}</div>

      <MediaLibraryModal
        open={filePickerTarget !== null}
        onClose={() => setFilePickerTarget(null)}
        onSelect={(url, file) => {
          if (!filePickerTarget) return;
          if (filePickerTarget.kind === "cfp") {
            onUpdateConfig((prev) => ({ ...prev, cfpPdfUrl: url }));
            toast.success(`Selected ${file?.filename || "file"}`);
          } else if (filePickerTarget.kind === "group-link") {
            onUpdateConfig((prev) => ({
              ...prev,
              linkGroups: prev.linkGroups.map((g, gIdx) =>
                gIdx !== filePickerTarget.groupIndex
                  ? g
                  : {
                      ...g,
                      links: g.links.map((l, lIdx) =>
                        lIdx === filePickerTarget.linkIndex
                          ? { ...l, href: url }
                          : l
                      ),
                    }
              ),
            }));
            toast.success(`Selected ${file?.filename || "file"}`);
          }
        }}
        accept={DOC_ACCEPT}
        title={filePickerTarget?.kind === "cfp" ? "Select CFP File" : "Select File"}
        allowDelete
      />
    </section>
  );
}
