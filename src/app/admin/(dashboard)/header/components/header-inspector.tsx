"use client";

import React, { useEffect, useRef, useState } from "react";
import type {
  HeaderConfig,
  HeaderVariant,
  NavColumnItem,
  NavLinkItem,
  NavPromoCard,
  NavSubItem,
  TopbarQuickLink,
} from "@/lib/header-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { IconPicker } from "./icon-picker";
import { PageLinkPicker } from "./page-link-picker";
import type { SelectedInspectorTarget } from "./visual-header-canvas";
import {
  X,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Upload,
  Loader2,
  Columns3,
  Image as ImageIcon,
  SlidersHorizontal,
  Link2,
  PanelTop,
  ArrowUpRight,
  GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface HeaderInspectorProps {
  config: HeaderConfig;
  target: SelectedInspectorTarget;
  onClose: () => void;
  onUpdateConfig: (updater: (prev: HeaderConfig) => HeaderConfig) => void;
  onDeleteColumn: (triggerId: string, columnId: string) => void;
  onDeleteTrigger: (triggerId: string) => void;
}

const DEFAULT_PROMO_CARD: NavPromoCard = {
  title: "IEEE SMC 2027 · Ho Chi Minh City",
  description: "Explore Call for Papers, Special Sessions, and submission guidelines.",
  image: "/assets/cta-background.webp",
  href: "/#cfp",
  badge: "Featured",
  ctaText: "Learn More",
};

const LOGO_PRESETS = [
  { label: "Horizontal Lockup", url: "/logo/rectangle-logo.png" },
  { label: "Conference Lockup", url: "/logo/ieee-smc-2027-conference-lockup.png" },
  { label: "Square Emblem", url: "/logo/square-logo.png" },
  { label: "White Emblem", url: "/logo/square-logo-white.png" },
];

async function uploadImageAsset(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "header-assets");

  const res = await fetch("/api/admin/upload", {
    method: "POST",
    body: formData,
  });
  const data = await res.json();
  if (!res.ok || (!data.proxyUrl && !data.url)) {
    throw new Error(data.error || "Upload failed");
  }
  return data.proxyUrl || data.url;
}

/* ── Promo Card Inspector ─────────────────────────────────────────────────── */
function PromoCardInspector({
  promoCard,
  onChange,
  onRemove,
  title = "Featured Promo Card",
}: {
  promoCard: NavPromoCard;
  onChange: (next: NavPromoCard) => void;
  onRemove?: () => void;
  title?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageAsset(file);
      onChange({ ...promoCard, image: url });
      toast.success("Promo image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/70 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-[#115eff]" />
          <span className="text-xs font-bold text-[#004776]">{title}</span>
        </div>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px] text-slate-600 mb-1 block">Title</Label>
              <Input
                value={promoCard.title}
                onChange={(e) => onChange({ ...promoCard, title: e.target.value })}
                placeholder="Call for Papers Open"
                className="h-8 text-xs bg-white"
              />
            </div>
            <div>
              <Label className="text-[11px] text-slate-600 mb-1 block">Badge Label</Label>
              <Input
                value={promoCard.badge || ""}
                onChange={(e) => onChange({ ...promoCard, badge: e.target.value })}
                placeholder="CFP 2027"
                className="h-8 text-xs bg-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-[11px] text-slate-600 mb-1 block">Description</Label>
            <Textarea
              value={promoCard.description}
              onChange={(e) => onChange({ ...promoCard, description: e.target.value })}
              rows={2}
              className="text-xs bg-white min-h-[56px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[11px] text-slate-600 mb-1 block">Button Text</Label>
              <Input
                value={promoCard.ctaText || ""}
                onChange={(e) => onChange({ ...promoCard, ctaText: e.target.value })}
                placeholder="Explore Track"
                className="h-8 text-xs bg-white"
              />
            </div>
            <div>
              <Label className="text-[11px] text-slate-600 mb-1 block">Target URL</Label>
              <div className="flex items-center gap-1.5">
                <Input
                  value={promoCard.href}
                  onChange={(e) => onChange({ ...promoCard, href: e.target.value })}
                  placeholder="/#cfp"
                  className="h-8 text-xs bg-white font-mono"
                />
                <PageLinkPicker
                  value={promoCard.href}
                  onSelect={(sel) =>
                    onChange({
                      ...promoCard,
                      href: sel.href,
                      title: promoCard.title || sel.label || "",
                    })
                  }
                  label="Pick"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Promo Image Uploader */}
        <div className="space-y-2">
          <Label className="text-[11px] text-slate-600 block">Cover Image</Label>
          <div className="relative aspect-[16/9] rounded-md border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
            {promoCard.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={promoCard.image}
                alt={promoCard.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon className="w-6 h-6 text-slate-300" />
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              value={promoCard.image}
              onChange={(e) => onChange({ ...promoCard, image: e.target.value })}
              placeholder="/assets/cta-background.webp"
              className="h-7 text-[11px] font-mono bg-white"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="h-7 px-2 text-xs bg-white shrink-0"
            >
              {uploading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Links List Editor ────────────────────────────────────────────────────── */
function LinksListEditor({
  links,
  activeLinkId,
  onChange,
}: {
  links: NavSubItem[];
  activeLinkId?: string;
  onChange: (next: NavSubItem[]) => void;
}) {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeLinkId && itemRefs.current[activeLinkId]) {
      itemRefs.current[activeLinkId]?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeLinkId]);

  const updateLink = (id: string, patch: Partial<NavSubItem>) => {
    onChange(links.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const moveLink = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= links.length) return;
    const copy = [...links];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    onChange(copy);
  };

  const addLink = () => {
    const newItem: NavSubItem = {
      id: `sub-${Date.now()}`,
      title: "New Navigation Link",
      href: "/#about",
      description: "Short conference link description",
      icon: "Globe",
    };
    onChange([...links, newItem]);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Column Links ({links.length})
        </span>
        <Button
          type="button"
          size="sm"
          onClick={addLink}
          className="h-7 px-2.5 text-xs bg-[#115eff] hover:bg-blue-700 text-white"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Link
        </Button>
      </div>

      <div className="space-y-2">
        {links.map((link, idx) => {
          const isHighlighted = activeLinkId === link.id;
          const titleLines = (link.title || "").split("\n");

          return (
            <div
              key={link.id}
              ref={(el) => {
                itemRefs.current[link.id] = el;
              }}
              className={cn(
                "p-3 rounded-lg border transition-all bg-white space-y-2.5",
                isHighlighted
                  ? "border-[#115eff] ring-2 ring-[#115eff]/20 bg-blue-50/20"
                  : "border-slate-200 hover:border-blue-200"
              )}
            >
              {/* Top Row: Icon + Multiline Title + Reorder + Delete */}
              <div className="flex items-start gap-2">
                <div className="pt-0.5">
                  <IconPicker
                    value={link.icon}
                    onChange={(icon) => updateLink(link.id, { icon })}
                  />
                </div>

                {/* Visual Line-Break Title Editor */}
                <div className="flex-1 space-y-1">
                  {titleLines.map((lineText, lineIdx) => (
                    <div key={lineIdx} className="flex items-center gap-1">
                      <Input
                        value={lineText}
                        onChange={(e) => {
                          const nextLines = [...titleLines];
                          nextLines[lineIdx] = e.target.value;
                          updateLink(link.id, { title: nextLines.join("\n") });
                        }}
                        placeholder={lineIdx === 0 ? "Link title" : "Line continuation"}
                        className="h-8 text-xs font-semibold bg-white"
                      />
                      {titleLines.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          title="Remove line"
                          onClick={() => {
                            const nextLines = titleLines.filter((_, i) => i !== lineIdx);
                            updateLink(link.id, { title: nextLines.join("\n") });
                          }}
                          className="h-8 w-7 p-0 text-slate-400 hover:text-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      updateLink(link.id, { title: `${link.title || ""}\n` })
                    }
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#115eff] hover:underline cursor-pointer"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    Line Break
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === 0}
                    onClick={() => moveLink(idx, -1)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={idx === links.length - 1}
                    onClick={() => moveLink(idx, 1)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-slate-700"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onChange(links.filter((item) => item.id !== link.id))
                    }
                    className="h-7 w-7 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* URL, Page Picker, Badge, New Tab */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <div className="md:col-span-5 flex items-center gap-1.5">
                  <Input
                    value={link.href}
                    onChange={(e) => updateLink(link.id, { href: e.target.value })}
                    placeholder="/#cfp"
                    className="h-8 text-xs font-mono bg-slate-50"
                  />
                  <PageLinkPicker
                    value={link.href}
                    isExternal={link.isExternal}
                    onSelect={(sel) =>
                      updateLink(link.id, {
                        href: sel.href,
                        title: sel.label || link.title,
                        isExternal: sel.isExternal,
                      })
                    }
                    label="Page"
                  />
                </div>

                <div className="md:col-span-3">
                  <Input
                    value={link.badge || ""}
                    onChange={(e) => updateLink(link.id, { badge: e.target.value })}
                    placeholder="Badge text"
                    className="h-8 text-xs bg-slate-50"
                  />
                </div>

                <div className="md:col-span-2 flex items-center gap-1.5">
                  <Switch
                    checked={Boolean(link.isExternal)}
                    onCheckedChange={(val) =>
                      updateLink(link.id, { isExternal: val })
                    }
                    className="scale-90"
                  />
                  <span className="text-[11px] text-slate-600">New Tab</span>
                </div>

                <div className="md:col-span-2 flex items-center gap-1.5">
                  <Switch
                    checked={Boolean(link.featured)}
                    onCheckedChange={(val) =>
                      updateLink(link.id, { featured: val })
                    }
                    className="scale-90"
                  />
                  <span className="text-[11px] text-slate-600">Featured</span>
                </div>
              </div>

              <Input
                value={link.description || ""}
                onChange={(e) =>
                  updateLink(link.id, { description: e.target.value })
                }
                placeholder="Subtitle or brief description shown under link title"
                className="h-8 text-xs bg-slate-50"
              />
            </div>
          );
        })}

        {links.length === 0 && (
          <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
            No links in this column yet. Click Add Link above.
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Column Inspector ─────────────────────────────────────────────────────── */
function ColumnInspector({
  trigger,
  column,
  activeLinkId,
  onUpdateColumn,
  onDeleteColumn,
}: {
  trigger: NavLinkItem;
  column: NavColumnItem;
  activeLinkId?: string;
  onUpdateColumn: (patch: Partial<NavColumnItem>) => void;
  onDeleteColumn: () => void;
}) {
  const hasPromo = Boolean(column.promoCard);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-5">
          <Label className="text-xs font-semibold text-slate-700 mb-1 block">
            Column Heading
          </Label>
          <Textarea
            value={column.title}
            onChange={(e) => onUpdateColumn({ title: e.target.value })}
            rows={1}
            placeholder="SECTION HEADING"
            className="min-h-[34px] h-9 text-xs font-bold uppercase tracking-wide"
          />
        </div>

        <div className="md:col-span-3">
          <Label className="text-xs font-semibold text-slate-700 mb-1 block">
            Column Type
          </Label>
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-md bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => onUpdateColumn({ type: "category-links" })}
              className={cn(
                "py-1.5 rounded text-xs font-semibold transition-all cursor-pointer",
                column.type !== "promo-card"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-600"
              )}
            >
              Links
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateColumn({
                  type: "promo-card",
                  promoCard: column.promoCard || { ...DEFAULT_PROMO_CARD },
                })
              }
              className={cn(
                "py-1.5 rounded text-xs font-semibold transition-all cursor-pointer",
                column.type === "promo-card"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-600"
              )}
            >
              Promo Only
            </button>
          </div>
        </div>

        <div className="md:col-span-4 flex items-center justify-end gap-2">
          {!hasPromo && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                onUpdateColumn({
                  promoCard: { ...DEFAULT_PROMO_CARD },
                  promoPosition: "bottom",
                })
              }
              className="h-8 text-xs border-blue-200 text-[#004776]"
            >
              <ImageIcon className="w-3.5 h-3.5 mr-1 text-[#115eff]" />
              Attach Promo Card
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDeleteColumn}
            className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Delete Column
          </Button>
        </div>
      </div>

      {hasPromo && column.promoCard && (
        <div className="space-y-2">
          {column.type !== "promo-card" && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-600">Promo Position:</span>
              <button
                type="button"
                onClick={() => onUpdateColumn({ promoPosition: "top" })}
                className={cn(
                  "px-2.5 py-1 rounded border text-xs font-semibold cursor-pointer",
                  column.promoPosition === "top"
                    ? "bg-[#004776] text-white border-[#004776]"
                    : "bg-white text-slate-600 border-slate-200"
                )}
              >
                Top of Column
              </button>
              <button
                type="button"
                onClick={() => onUpdateColumn({ promoPosition: "bottom" })}
                className={cn(
                  "px-2.5 py-1 rounded border text-xs font-semibold cursor-pointer",
                  column.promoPosition !== "top"
                    ? "bg-[#004776] text-white border-[#004776]"
                    : "bg-white text-slate-600 border-slate-200"
                )}
              >
                Bottom of Column
              </button>
            </div>
          )}
          <PromoCardInspector
            promoCard={column.promoCard}
            onChange={(nextPromo) => onUpdateColumn({ promoCard: nextPromo })}
            onRemove={
              column.type === "promo-card"
                ? undefined
                : () => onUpdateColumn({ promoCard: undefined })
            }
            title={`Column Promo Card · ${trigger.name}`}
          />
        </div>
      )}

      {column.type !== "promo-card" && (
        <LinksListEditor
          links={column.links || []}
          activeLinkId={activeLinkId}
          onChange={(nextLinks) => onUpdateColumn({ links: nextLinks })}
        />
      )}
    </div>
  );
}

/* ── Trigger Inspector ────────────────────────────────────────────────────── */
function TriggerInspector({
  trigger,
  canDelete,
  onUpdateTrigger,
  onDeleteTrigger,
}: {
  trigger: NavLinkItem;
  canDelete: boolean;
  onUpdateTrigger: (patch: Partial<NavLinkItem>) => void;
  onDeleteTrigger: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <div className="md:col-span-3">
          <Label className="text-xs font-semibold text-slate-700 mb-1 block">
            Trigger Label
          </Label>
          <Input
            value={trigger.name}
            onChange={(e) => onUpdateTrigger({ name: e.target.value })}
            placeholder="Conference"
            className="h-9 text-xs font-semibold"
          />
        </div>

        <div className="md:col-span-3">
          <Label className="text-xs font-semibold text-slate-700 mb-1 block">
            Trigger Mode
          </Label>
          <div className="grid grid-cols-2 gap-1 p-0.5 rounded-md bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => onUpdateTrigger({ type: "link" })}
              className={cn(
                "py-1.5 rounded text-xs font-semibold transition-all cursor-pointer",
                trigger.type !== "mega"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-600"
              )}
            >
              Direct Link
            </button>
            <button
              type="button"
              onClick={() =>
                onUpdateTrigger({
                  type: "mega",
                  columns:
                    trigger.columns && trigger.columns.length > 0
                      ? trigger.columns
                      : [
                          {
                            id: `col-${Date.now()}`,
                            title: "OVERVIEW",
                            type: "category-links",
                            links: [
                              {
                                id: `sub-${Date.now()}`,
                                title: trigger.name || "Explore Section",
                                href: trigger.href || "/#about",
                                description: "Conference section overview",
                                icon: "Globe",
                              },
                            ],
                          },
                        ],
                })
              }
              className={cn(
                "py-1.5 rounded text-xs font-semibold transition-all cursor-pointer",
                trigger.type === "mega"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-600"
              )}
            >
              Mega Menu
            </button>
          </div>
        </div>

        <div className="md:col-span-4">
          <Label className="text-xs font-semibold text-slate-700 mb-1 block">
            Fallback / Direct URL
          </Label>
          <div className="flex items-center gap-1.5">
            <Input
              value={trigger.href}
              onChange={(e) => onUpdateTrigger({ href: e.target.value })}
              placeholder="/#about"
              className="h-9 text-xs font-mono"
            />
            <PageLinkPicker
              value={trigger.href}
              isExternal={trigger.isExternal}
              onSelect={(sel) =>
                onUpdateTrigger({
                  href: sel.href,
                  name: trigger.name || sel.label || "Link",
                  isExternal: sel.isExternal,
                })
              }
              label="Page"
            />
          </div>
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-2 pb-1">
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
            <Switch
              checked={Boolean(trigger.isExternal)}
              onCheckedChange={(val) => onUpdateTrigger({ isExternal: val })}
              className="scale-90"
            />
            <span>New Tab</span>
          </label>

          {canDelete && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDeleteTrigger}
              className="h-8 px-2 text-red-600 hover:bg-red-50"
              title="Delete menu trigger"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Featured Right Sidebar Promo Card for Mega Menu */}
      {trigger.type === "mega" && (
        <div>
          {trigger.promoCard ? (
            <PromoCardInspector
              promoCard={trigger.promoCard}
              onChange={(nextPromo) => onUpdateTrigger({ promoCard: nextPromo })}
              onRemove={() => onUpdateTrigger({ promoCard: undefined })}
              title="Right Sidebar Featured Promo Card"
            />
          ) : (
            <div className="p-3.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-[#004776]">
                  Right Sidebar Featured Promo Card
                </div>
                <div className="text-[11px] text-slate-500">
                  Add a dark-navy featured spotlight banner on the right edge of this mega menu.
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  onUpdateTrigger({ promoCard: { ...DEFAULT_PROMO_CARD } })
                }
                className="h-8 text-xs border-blue-200 text-[#004776] bg-white"
              >
                <Plus className="w-3.5 h-3.5 mr-1 text-[#115eff]" />
                Add Featured Card
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── General & Top Bar Inspector ──────────────────────────────────────────── */
function GeneralInspector({
  config,
  onUpdateConfig,
}: {
  config: HeaderConfig;
  onUpdateConfig: (updater: (prev: HeaderConfig) => HeaderConfig) => void;
}) {
  const [uploadingField, setUploadingField] = useState<"desktop" | "mobile" | null>(
    null
  );
  const desktopFileRef = useRef<HTMLInputElement | null>(null);
  const mobileFileRef = useRef<HTMLInputElement | null>(null);

  const variant: HeaderVariant = config.variant || "left-aligned";
  const topbar = config.topbar || {
    enabled: true,
    hotline: "",
    email: "",
    showSearch: true,
    searchPlaceholder: "Search IEEE SMC 2027...",
    quickLinks: [],
  };
  const cta = config.ctaButton || {
    label: "Submit Paper",
    href: "/#cfp",
    enabled: true,
  };

  const quickLinks: TopbarQuickLink[] = topbar.quickLinks || [];

  const handleUploadLogo = async (
    e: React.ChangeEvent<HTMLInputElement>,
    kind: "desktop" | "mobile"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(kind);
    try {
      const url = await uploadImageAsset(file);
      onUpdateConfig((prev) =>
        kind === "desktop" ? { ...prev, logoUrl: url } : { ...prev, mobileLogoUrl: url }
      );
      toast.success("Logo updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Column 1: Layout Variant & Logos */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#004776]">Layout & Branding</span>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
            <Switch
              checked={config.sticky !== false}
              onCheckedChange={(val) =>
                onUpdateConfig((prev) => ({ ...prev, sticky: val }))
              }
              className="scale-90"
            />
            <span>Sticky Header</span>
          </label>
        </div>

        <div>
          <Label className="text-[11px] text-slate-600 mb-1.5 block">
            Desktop Layout Variant
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
            {(
              [
                { id: "left-aligned", label: "Left Aligned" },
                { id: "centered", label: "Centered Nav" },
                { id: "stacked", label: "Stacked" },
                { id: "minimal", label: "Minimal" },
              ] as { id: HeaderVariant; label: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onUpdateConfig((prev) => ({ ...prev, variant: opt.id }))
                }
                className={cn(
                  "px-2.5 py-1.5 rounded border text-xs font-semibold text-left transition-all cursor-pointer",
                  variant === opt.id
                    ? "bg-[#004776] text-white border-[#004776]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Logo */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-slate-600 block">Desktop Brand Logo</Label>
          <div className="flex items-center gap-1.5">
            <Input
              value={config.logoUrl || "/logo/rectangle-logo.png"}
              onChange={(e) =>
                onUpdateConfig((prev) => ({ ...prev, logoUrl: e.target.value }))
              }
              className="h-8 text-xs font-mono bg-white"
            />
            <input
              ref={desktopFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleUploadLogo(e, "desktop")}
              className="hidden"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={uploadingField === "desktop"}
              onClick={() => desktopFileRef.current?.click()}
              className="h-8 px-2.5 bg-white shrink-0"
            >
              {uploadingField === "desktop" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Upload className="w-3.5 h-3.5" />
              )}
            </Button>
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            {LOGO_PRESETS.map((preset) => (
              <button
                key={preset.url}
                type="button"
                onClick={() =>
                  onUpdateConfig((prev) => ({ ...prev, logoUrl: preset.url }))
                }
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-medium border cursor-pointer",
                  config.logoUrl === preset.url
                    ? "bg-blue-50 text-[#115eff] border-blue-300"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-200"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Logo & Header Title */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[11px] text-slate-600 mb-1 block">Mobile Logo</Label>
            <div className="flex items-center gap-1">
              <Input
                value={config.mobileLogoUrl || "/logo/square-logo.png"}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({ ...prev, mobileLogoUrl: e.target.value }))
                }
                className="h-8 text-[11px] font-mono bg-white"
              />
              <input
                ref={mobileFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleUploadLogo(e, "mobile")}
                className="hidden"
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploadingField === "mobile"}
                onClick={() => mobileFileRef.current?.click()}
                className="h-8 px-2 bg-white shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          <div>
            <Label className="text-[11px] text-slate-600 mb-1 block">
              Brand Subtitle
            </Label>
            <Input
              value={config.brand?.conferenceSubtitle || "Ho Chi Minh City"}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  brand: {
                    ...prev.brand,
                    conferenceSubtitle: e.target.value,
                  },
                }))
              }
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>
      </div>

      {/* Column 2: Top Utility Bar Settings */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#004776]">Top Utility Bar</span>
          <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
            <Switch
              checked={topbar.enabled !== false}
              onCheckedChange={(val) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  topbar: { ...prev.topbar, enabled: val },
                }))
              }
              className="scale-90"
            />
            <span>Visible</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[11px] text-slate-600 mb-1 block">Hotline</Label>
            <Input
              value={topbar.hotline || ""}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  topbar: { ...prev.topbar, hotline: e.target.value },
                }))
              }
              className="h-8 text-xs bg-white"
            />
          </div>
          <div>
            <Label className="text-[11px] text-slate-600 mb-1 block">
              Contact Email
            </Label>
            <Input
              value={topbar.email || ""}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  topbar: { ...prev.topbar, email: e.target.value },
                }))
              }
              className="h-8 text-xs bg-white"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-slate-600">Topbar Search Input</Label>
            <Switch
              checked={topbar.showSearch !== false}
              onCheckedChange={(val) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  topbar: { ...prev.topbar, showSearch: val },
                }))
              }
              className="scale-90"
            />
          </div>
          {topbar.showSearch !== false && (
            <Input
              value={topbar.searchPlaceholder || ""}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  topbar: { ...prev.topbar, searchPlaceholder: e.target.value },
                }))
              }
              placeholder="Search IEEE SMC 2027..."
              className="h-8 text-xs bg-white"
            />
          )}
        </div>

        {/* Topbar Quick Links */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[11px] text-slate-600">
              Utility Quick Links ({quickLinks.length})
            </Label>
            <button
              type="button"
              onClick={() =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  topbar: {
                    ...prev.topbar,
                    quickLinks: [
                      ...(prev.topbar?.quickLinks || []),
                      {
                        id: `ql-${Date.now()}`,
                        label: "New Link",
                        href: "/#news",
                      },
                    ],
                  },
                }))
              }
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#115eff] hover:underline cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Add Link
            </button>
          </div>

          <div className="space-y-1.5 max-h-28 overflow-y-auto pr-0.5">
            {quickLinks.map((ql) => (
              <div key={ql.id} className="flex items-center gap-1">
                <GripVertical className="w-3 h-3 text-slate-300 shrink-0" />
                <Input
                  value={ql.label}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      topbar: {
                        ...prev.topbar,
                        quickLinks: (prev.topbar?.quickLinks || []).map((item) =>
                          item.id === ql.id ? { ...item, label: e.target.value } : item
                        ),
                      },
                    }))
                  }
                  placeholder="Label"
                  className="h-7 text-[11px] bg-white w-28"
                />
                <Input
                  value={ql.href}
                  onChange={(e) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      topbar: {
                        ...prev.topbar,
                        quickLinks: (prev.topbar?.quickLinks || []).map((item) =>
                          item.id === ql.id ? { ...item, href: e.target.value } : item
                        ),
                      },
                    }))
                  }
                  placeholder="/#news"
                  className="h-7 text-[11px] font-mono bg-white flex-1"
                />
                <PageLinkPicker
                  value={ql.href}
                  isExternal={ql.isExternal}
                  onSelect={(sel) =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      topbar: {
                        ...prev.topbar,
                        quickLinks: (prev.topbar?.quickLinks || []).map((item) =>
                          item.id === ql.id
                            ? {
                                ...item,
                                href: sel.href,
                                label: sel.label || item.label,
                                isExternal: sel.isExternal,
                              }
                            : item
                        ),
                      },
                    }))
                  }
                  label=""
                  buttonClassName="h-7 w-7 p-0 justify-center"
                />
                <button
                  type="button"
                  onClick={() =>
                    onUpdateConfig((prev) => ({
                      ...prev,
                      topbar: {
                        ...prev.topbar,
                        quickLinks: (prev.topbar?.quickLinks || []).filter(
                          (item) => item.id !== ql.id
                        ),
                      },
                    }))
                  }
                  className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Column 3: Primary CTA Button */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#004776]">Primary CTA Button</span>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <Switch
                checked={cta.enabled !== false}
                onCheckedChange={(val) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    ctaButton: { ...prev.ctaButton, enabled: val },
                  }))
                }
                className="scale-90"
              />
              <span>Enabled</span>
            </label>
          </div>

          <div>
            <Label className="text-[11px] text-slate-600 mb-1 block">Button Label</Label>
            <Input
              value={cta.label || ""}
              onChange={(e) =>
                onUpdateConfig((prev) => ({
                  ...prev,
                  ctaButton: { ...prev.ctaButton, label: e.target.value },
                }))
              }
              placeholder="Submit Paper"
              className="h-8 text-xs bg-white font-semibold"
            />
          </div>

          <div>
            <Label className="text-[11px] text-slate-600 mb-1 block">
              Destination URL
            </Label>
            <div className="flex items-center gap-1.5">
              <Input
                value={cta.href || ""}
                onChange={(e) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    ctaButton: { ...prev.ctaButton, href: e.target.value },
                  }))
                }
                placeholder="/#cfp"
                className="h-8 text-xs font-mono bg-white"
              />
              <PageLinkPicker
                value={cta.href || ""}
                onSelect={(sel) =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    ctaButton: {
                      ...prev.ctaButton,
                      href: sel.href,
                      label: prev.ctaButton?.label || sel.label || "Submit Paper",
                    },
                  }))
                }
                label="Pick"
              />
            </div>
          </div>
        </div>

        {/* Live Button Preview */}
        <div className="p-3 rounded-md bg-white border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">Live Preview</span>
          {cta.enabled !== false ? (
            <div className="px-3.5 py-1.5 rounded-md bg-[#004776] text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs">
              <span>{cta.label || "Submit Paper"}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          ) : (
            <Badge variant="secondary" size="sm">
              Hidden
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Docked Bottom Inspector Drawer ──────────────────────────────────── */
export function HeaderInspector({
  config,
  target,
  onClose,
  onUpdateConfig,
  onDeleteColumn,
  onDeleteTrigger,
}: HeaderInspectorProps) {
  if (!target) return null;

  let headerTitle = "Inspector";
  let HeaderIcon = SlidersHorizontal;
  let body: React.ReactNode = null;

  if (target.type === "general") {
    headerTitle = "General Settings & Top Utility Bar";
    HeaderIcon = PanelTop;
    body = <GeneralInspector config={config} onUpdateConfig={onUpdateConfig} />;
  } else if (target.type === "trigger") {
    const trigger = config.navLinks.find((n) => n.id === target.triggerId);
    if (!trigger) return null;
    headerTitle = `Menu Trigger · ${trigger.name}`;
    HeaderIcon = Link2;
    body = (
      <TriggerInspector
        trigger={trigger}
        canDelete={config.navLinks.length > 1}
        onUpdateTrigger={(patch) =>
          onUpdateConfig((prev) => ({
            ...prev,
            navLinks: prev.navLinks.map((n) =>
              n.id === trigger.id ? { ...n, ...patch } : n
            ),
          }))
        }
        onDeleteTrigger={() => onDeleteTrigger(trigger.id)}
      />
    );
  } else if (target.type === "column") {
    const trigger = config.navLinks.find((n) => n.id === target.triggerId);
    const column = trigger?.columns?.find((c) => c.id === target.columnId);
    if (!trigger || !column) return null;
    headerTitle = `Column · ${column.title || "Untitled Column"}`;
    HeaderIcon = Columns3;
    body = (
      <ColumnInspector
        trigger={trigger}
        column={column}
        activeLinkId={target.linkId}
        onUpdateColumn={(patch) =>
          onUpdateConfig((prev) => ({
            ...prev,
            navLinks: prev.navLinks.map((n) =>
              n.id !== trigger.id
                ? n
                : {
                    ...n,
                    columns: (n.columns || []).map((c) =>
                      c.id === column.id ? { ...c, ...patch } : c
                    ),
                  }
            ),
          }))
        }
        onDeleteColumn={() => onDeleteColumn(trigger.id, column.id)}
      />
    );
  }

  return (
    <section className="h-[360px] shrink-0 bg-white border-t border-slate-200 shadow-[0_-8px_24px_rgba(15,23,42,0.06)] flex flex-col z-20">
      <div className="h-10 px-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <HeaderIcon className="w-4 h-4 text-[#115eff] shrink-0" />
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#004776] truncate">
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
      <div className="flex-1 overflow-y-auto p-4">{body}</div>
    </section>
  );
}
