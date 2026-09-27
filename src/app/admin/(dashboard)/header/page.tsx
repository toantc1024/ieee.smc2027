"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  PanelTop,
  Save,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Eye,
  Phone,
  Mail,
  ExternalLink,
  Settings2,
  ListTree,
  Columns3,
  X,
  ArrowLeft,
  Loader2,
  Sparkles,
  Link2,
  Layers,
  ArrowUpRight,
  HelpCircle,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import {
  DEFAULT_HEADER_DATA,
  type HeaderConfig,
  type NavLinkItem,
  type NavSubItem,
  type NavColumnItem,
  type NavPromoCard,
} from "@/lib/header-config";
import { NAV_ICON_OPTIONS, getNavIcon } from "@/lib/nav-icons";
import { cn } from "@/lib/utils";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function emptySubLink(): NavSubItem {
  return {
    id: uid(),
    title: "Liên kết mới",
    href: "/#",
    description: "",
    icon: "Layers",
    isExternal: false,
  };
}

function emptyColumn(): NavColumnItem {
  return {
    id: uid(),
    title: "Cột mới",
    links: [emptySubLink()],
  };
}

// ═══════════════════════════════════════════════════
// LINK EDITOR — Exact HCMUTE style for child links
// ═══════════════════════════════════════════════════

function LinkEditor({
  link,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  link: NavSubItem;
  onChange: (link: NavSubItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const update = (patch: Partial<NavSubItem>) => onChange({ ...link, ...patch });
  const IconComp = getNavIcon(link.icon);

  return (
    <div className="group rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition-colors">
      <div className="flex items-start gap-2 p-2.5">
        {/* Reorder Up/Down */}
        <div className="flex flex-col shrink-0 pt-0.5 gap-0">
          <button
            type="button"
            className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors disabled:opacity-20 cursor-pointer"
            onClick={onMoveUp}
            disabled={isFirst}
            title="Di chuyển lên"
          >
            <ChevronUp className="size-3" />
          </button>
          <button
            type="button"
            className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors disabled:opacity-20 cursor-pointer"
            onClick={onMoveDown}
            disabled={isLast}
            title="Di chuyển xuống"
          >
            <ChevronDown className="size-3" />
          </button>
        </div>

        {/* Icon Preview */}
        <div className="shrink-0 pt-0.5">
          <div className="size-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <IconComp className="size-3.5 text-[#115eff]" />
          </div>
        </div>

        {/* Form Fields */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {/* Title */}
          <div className="flex items-center gap-1.5">
            <input
              className="h-7 text-xs rounded-md border border-slate-200 bg-white px-2.5 flex-1 min-w-0 font-semibold text-slate-800 focus:outline-none focus:border-[#115eff] focus:ring-1 focus:ring-[#115eff]/20"
              value={link.title}
              placeholder="Tiêu đề liên kết"
              onChange={(e) => update({ title: e.target.value })}
            />
          </div>

          {/* URL & Icon Selector */}
          <div className="flex items-center gap-1.5">
            <input
              className="h-7 text-xs rounded-md border border-slate-200 bg-white px-2.5 font-mono flex-1 min-w-0 text-slate-700 focus:outline-none focus:border-[#115eff] focus:ring-1 focus:ring-[#115eff]/20"
              value={link.href}
              placeholder="/đường-dẫn hoặc https://..."
              onChange={(e) => update({ href: e.target.value })}
            />
            <select
              value={link.icon || "Layers"}
              onChange={(e) => update({ icon: e.target.value })}
              className="h-7 w-[120px] text-xs rounded-md border border-slate-200 bg-white px-2 text-slate-700 shrink-0 focus:outline-none focus:border-[#115eff]"
            >
              {NAV_ICON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <input
            className="h-7 text-[11px] rounded-md border border-slate-200 bg-white px-2.5 w-full text-slate-600 focus:outline-none focus:border-[#115eff] focus:ring-1 focus:ring-[#115eff]/20"
            value={link.description || ""}
            placeholder="Mô tả ngắn (tùy chọn)"
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>

        {/* Actions: External toggle & Delete */}
        <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
          <button
            type="button"
            className={cn(
              "size-6 rounded-md flex items-center justify-center transition-colors cursor-pointer",
              link.isExternal
                ? "bg-sky-500/15 text-[#115eff]"
                : "bg-slate-100 text-slate-400 hover:text-slate-600"
            )}
            onClick={() => update({ isExternal: !link.isExternal })}
            title={link.isExternal ? "Mở tab mới (External: Đang bật)" : "Cùng tab (Click để mở tab mới)"}
          >
            <ExternalLink className="size-3" />
          </button>
          <button
            type="button"
            className="size-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={onDelete}
            title="Xóa liên kết"
          >
            <Trash2 className="size-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// COLUMN EDITOR — For Multi-Column Mega Menus
// ═══════════════════════════════════════════════════

function ColumnEditor({
  column,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  column: NavColumnItem;
  onChange: (col: NavColumnItem) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const updateLinks = (links: NavSubItem[]) => onChange({ ...column, links });
  const addLink = () => updateLinks([...column.links, emptySubLink()]);

  const moveLink = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= column.links.length) return;
    const next = [...column.links];
    [next[index], next[target]] = [next[target], next[index]];
    updateLinks(next);
  };

  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
      {/* Column Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200">
        <div className="flex items-center gap-2.5 flex-1 min-w-0 mr-3">
          {/* Reorder */}
          <div className="flex flex-col shrink-0 gap-0">
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors disabled:opacity-20 cursor-pointer"
              onClick={onMoveUp}
              disabled={isFirst}
            >
              <ChevronUp className="size-3" />
            </button>
            <button
              type="button"
              className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors disabled:opacity-20 cursor-pointer"
              onClick={onMoveDown}
              disabled={isLast}
            >
              <ChevronDown className="size-3" />
            </button>
          </div>

          <Columns3 className="size-4 text-[#115eff] shrink-0" />
          <input
            className="h-7 text-xs font-bold rounded-lg border border-slate-200 bg-white px-2.5 flex-1 min-w-0 text-slate-900 focus:outline-none focus:border-[#115eff]"
            value={column.title}
            placeholder="Tên cột (Ví dụ: Overview & Vision)"
            onChange={(e) => onChange({ ...column, title: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            {column.links.length} liên kết
          </span>
          <button
            type="button"
            className="size-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            onClick={onDelete}
            title="Xóa cột này"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Column Links List */}
      <div className="p-3.5 space-y-2">
        {column.links.map((link, i) => (
          <LinkEditor
            key={link.id}
            link={link}
            isFirst={i === 0}
            isLast={i === column.links.length - 1}
            onChange={(updated) =>
              updateLinks(column.links.map((l) => (l.id === link.id ? updated : l)))
            }
            onDelete={() => updateLinks(column.links.filter((l) => l.id !== link.id))}
            onMoveUp={() => moveLink(i, -1)}
            onMoveDown={() => moveLink(i, 1)}
          />
        ))}

        <button
          type="button"
          className="flex items-center justify-center gap-1.5 w-full py-2 mt-1 rounded-xl border border-dashed border-slate-200 text-xs font-semibold text-slate-500 hover:text-[#115eff] hover:border-[#115eff]/40 hover:bg-blue-50/20 transition-all cursor-pointer"
          onClick={addLink}
        >
          <Plus className="size-3" />
          <span>Thêm liên kết vào cột này</span>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// PROMO CARD EDITOR — Right Featured Card in Mega Menu
// ═══════════════════════════════════════════════════

function PromoCardEditor({
  promoCard,
  onChange,
}: {
  promoCard?: NavPromoCard;
  onChange: (card?: NavPromoCard) => void;
}) {
  const enabled = Boolean(promoCard);

  const toggle = () => {
    if (enabled) {
      onChange(undefined);
    } else {
      onChange({
        title: "Tiêu điểm nổi bật",
        description: "Mô tả ngắn gọn về chương trình, địa điểm hoặc thông tin quan trọng.",
        image: "/assets/cta-background.webp",
        href: "/#venue",
        badge: "Tiêu điểm",
        ctaText: "Khám phá ngay",
      });
    }
  };

  const update = (patch: Partial<NavPromoCard>) => {
    if (!promoCard) return;
    onChange({ ...promoCard, ...patch });
  };

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-800">Thẻ Tiêu Điểm (Right Featured Promo Card)</span>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-xs text-slate-500">{enabled ? "Bật" : "Tắt"}</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={toggle}
            className="size-4 rounded text-[#115eff] focus:ring-[#115eff] cursor-pointer"
          />
        </label>
      </div>

      {enabled && promoCard && (
        <div className="p-4 space-y-3">
          {/* Card Preview */}
          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-3 space-y-1.5 shadow-xs">
            <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-100 text-[#115eff] uppercase">
              {promoCard.badge || "Tiêu điểm"}
            </span>
            <p className="text-xs font-bold text-slate-900 leading-snug">{promoCard.title || "Tiêu đề thẻ"}</p>
            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
              {promoCard.description || "Nội dung mô tả ngắn gọn..."}
            </p>
          </div>

          <div className="grid gap-2.5">
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Huy hiệu (Badge)</label>
              <input
                className="w-full h-7 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-800 focus:outline-none focus:border-[#115eff]"
                value={promoCard.badge || ""}
                onChange={(e) => update({ badge: e.target.value })}
                placeholder="Ví dụ: Host Venue, Submission Portal..."
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Tiêu đề (Title)</label>
              <input
                className="w-full h-7 text-xs rounded-lg border border-slate-200 bg-white px-2.5 text-slate-800 focus:outline-none focus:border-[#115eff]"
                value={promoCard.title}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Tiêu đề thẻ"
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Mô tả (Description)</label>
              <textarea
                className="w-full text-xs rounded-lg border border-slate-200 bg-white p-2 text-slate-800 min-h-[50px] resize-none focus:outline-none focus:border-[#115eff]"
                value={promoCard.description}
                onChange={(e) => update({ description: e.target.value })}
                placeholder="Nội dung mô tả ngắn gọn..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-500 mb-1 block">URL Hình ảnh</label>
                <input
                  className="w-full h-7 text-xs rounded-lg border border-slate-200 bg-white px-2.5 font-mono text-slate-700 focus:outline-none focus:border-[#115eff]"
                  value={promoCard.image}
                  onChange={(e) => update({ image: e.target.value })}
                  placeholder="/assets/cta-background.webp"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-slate-500 mb-1 block">Đường dẫn click</label>
                <input
                  className="w-full h-7 text-xs rounded-lg border border-slate-200 bg-white px-2.5 font-mono text-slate-700 focus:outline-none focus:border-[#115eff]"
                  value={promoCard.href}
                  onChange={(e) => update({ href: e.target.value })}
                  placeholder="/#venue hoặc https://..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MEGA MENU EDITOR — Multi-column + Promo card
// ═══════════════════════════════════════════════════

function MegaMenuEditor({
  item,
  onChange,
}: {
  item: NavLinkItem;
  onChange: (item: NavLinkItem) => void;
}) {
  const columns = item.columns || [];

  const updateColumns = (cols: NavColumnItem[]) => {
    onChange({ ...item, columns: cols });
  };

  const addColumn = () => {
    updateColumns([...columns, emptyColumn()]);
  };

  const moveColumn = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= columns.length) return;
    const next = [...columns];
    [next[index], next[target]] = [next[target], next[index]];
    updateColumns(next);
  };

  return (
    <div className="space-y-5">
      {/* Columns Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Columns3 className="size-4 text-[#115eff]" />
          <h3 className="text-sm font-semibold text-slate-900">Các cột nội dung (Full-Width Columns)</h3>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {columns.length} cột
        </span>
      </div>

      {/* Columns List */}
      <div className="space-y-3">
        {columns.map((col, idx) => (
          <ColumnEditor
            key={col.id}
            column={col}
            isFirst={idx === 0}
            isLast={idx === columns.length - 1}
            onChange={(updated) =>
              updateColumns(columns.map((c) => (c.id === col.id ? updated : c)))
            }
            onDelete={() => updateColumns(columns.filter((c) => c.id !== col.id))}
            onMoveUp={() => moveColumn(idx, -1)}
            onMoveDown={() => moveColumn(idx, 1)}
          />
        ))}
      </div>

      <button
        type="button"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 text-xs font-bold text-slate-600 hover:text-[#115eff] hover:border-[#115eff]/40 hover:bg-blue-50/20 transition-all cursor-pointer"
        onClick={addColumn}
      >
        <Plus className="size-3.5" />
        <span>Thêm cột nội dung mới</span>
      </button>

      <div className="border-t border-slate-200" />

      {/* Promo Card */}
      <PromoCardEditor
        promoCard={item.promoCard}
        onChange={(card) => onChange({ ...item, promoCard: card })}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════
// HEADER SIDE PANEL — Slide-over Item Editor
// ═══════════════════════════════════════════════════

interface HeaderSidePanelProps {
  item: NavLinkItem;
  open: boolean;
  onClose: () => void;
  onSave: (item: NavLinkItem) => void;
}

function HeaderSidePanel({ item: initialItem, open, onClose, onSave }: HeaderSidePanelProps) {
  const [item, setItem] = useState<NavLinkItem>(initialItem);

  useEffect(() => {
    setItem(initialItem);
  }, [initialItem]);

  if (!open) return null;

  const isMega = item.type === "mega" || Boolean(item.columns && item.columns.length > 0);
  const isDropdown = item.type === "dropdown" || Boolean(item.children && item.children.length > 0);

  const handleTypeChange = (newType: "link" | "dropdown" | "mega") => {
    if (newType === item.type) return;
    if (newType === "mega") {
      // Migrate existing children into column if present
      const initialCols: NavColumnItem[] =
        item.columns && item.columns.length > 0
          ? item.columns
          : item.children && item.children.length > 0
          ? [
              {
                id: uid(),
                title: item.name,
                links: item.children,
              },
            ]
          : [emptyColumn()];

      setItem({
        ...item,
        type: "mega",
        columns: initialCols,
        promoCard: item.promoCard || {
          title: "Tiêu điểm nổi bật",
          description: "Mô tả tiêu điểm cho mục " + item.name,
          image: "/assets/cta-background.webp",
          href: item.href || "/#",
          badge: "Tiêu điểm",
          ctaText: "Khám phá ngay",
        },
      });
    } else if (newType === "dropdown") {
      const initialChildren =
        item.children && item.children.length > 0
          ? item.children
          : item.columns && item.columns.length > 0
          ? item.columns.flatMap((c) => c.links)
          : [emptySubLink()];

      setItem({
        ...item,
        type: "dropdown",
        children: initialChildren,
      });
    } else {
      setItem({
        ...item,
        type: "link",
      });
    }
  };

  const handleSaveLocal = () => {
    onSave(item);
    onClose();
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-250">
      {/* Top Header */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-slate-200 bg-slate-50/70 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
            title="Đóng panel"
          >
            <ArrowLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 uppercase tracking-wider",
                isMega
                  ? "bg-purple-50 text-purple-600 border-purple-200"
                  : isDropdown
                  ? "bg-sky-50 text-[#115eff] border-sky-200"
                  : "bg-emerald-50 text-emerald-600 border-emerald-200"
              )}
            >
              {isMega ? "Mega Menu Full-Width" : isDropdown ? "Dropdown" : "Direct Link"}
            </span>
            <span className="text-sm font-bold text-slate-900 truncate">{item.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSaveLocal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Check className="size-3.5" />
            <span>Áp dụng</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
        {/* Basic Configuration */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
            <Settings2 className="size-4 text-[#115eff]" />
            <span>Thông tin cơ bản</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Tên hiển thị trên Navbar
              </label>
              <input
                className="w-full h-8 text-sm rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-800 focus:outline-none focus:border-[#115eff]"
                value={item.name}
                onChange={(e) => setItem({ ...item, name: e.target.value })}
                placeholder="Ví dụ: About, Committees..."
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Đường dẫn liên kết chính (Href)
              </label>
              <input
                className="w-full h-8 text-sm rounded-lg border border-slate-200 bg-white px-3 font-mono text-slate-700 focus:outline-none focus:border-[#115eff]"
                value={item.href}
                onChange={(e) => setItem({ ...item, href: e.target.value })}
                placeholder="/#about hoặc https://..."
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-500 mb-1 block">
                Loại Menu (Menu Type)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleTypeChange("mega")}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between gap-1",
                    isMega
                      ? "bg-purple-50/70 border-purple-500 text-purple-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Columns3 className="size-3.5" />
                    <span>Mega Menu</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-400">Full-width nhiều cột</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange("dropdown")}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between gap-1",
                    !isMega && isDropdown
                      ? "bg-blue-50/70 border-[#115eff] text-[#115eff]"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <ListTree className="size-3.5" />
                    <span>Dropdown</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-400">1 danh sách liên kết</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeChange("link")}
                  className={cn(
                    "p-2.5 rounded-xl border text-xs font-bold text-left transition-all cursor-pointer flex flex-col justify-between gap-1",
                    !isMega && !isDropdown
                      ? "bg-emerald-50/70 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <div className="flex items-center gap-1.5">
                    <Link2 className="size-3.5" />
                    <span>Link Thường</span>
                  </div>
                  <span className="text-[10px] font-normal text-slate-400">Chuyển trang trực tiếp</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200" />

        {/* Content Editor according to type */}
        {isMega ? (
          <MegaMenuEditor item={item} onChange={setItem} />
        ) : isDropdown ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListTree className="size-4 text-[#115eff]" />
                <h3 className="text-sm font-semibold text-slate-900">Danh sách liên kết con</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {(item.children || []).length} mục
              </span>
            </div>

            <div className="space-y-2">
              {(item.children || []).map((sub, i) => (
                <LinkEditor
                  key={sub.id}
                  link={sub}
                  isFirst={i === 0}
                  isLast={i === (item.children || []).length - 1}
                  onChange={(updated) => {
                    const next = (item.children || []).map((c) => (c.id === sub.id ? updated : c));
                    setItem({ ...item, children: next });
                  }}
                  onDelete={() => {
                    const next = (item.children || []).filter((c) => c.id !== sub.id);
                    setItem({ ...item, children: next });
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 text-xs font-semibold text-slate-500 hover:text-[#115eff] hover:border-[#115eff]/40 hover:bg-blue-50/20 transition-all cursor-pointer"
              onClick={() => {
                const next = [...(item.children || []), emptySubLink()];
                setItem({ ...item, children: next });
              }}
            >
              <Plus className="size-3.5" />
              <span>Thêm liên kết con</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1.5">
            <Link2 className="size-5 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700">Mục liên kết trực tiếp</p>
            <p className="text-[11px] text-slate-500">
              Mục này sẽ chuyển hướng trực tiếp đến đường dẫn {item.href || "/"} khi người dùng click vào trên Navbar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════

export default function HeaderEditorPage() {
  const [data, setData] = useState<HeaderConfig>(DEFAULT_HEADER_DATA);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<"nav" | "topbar" | "cta">("nav");
  const [editingItem, setEditingItem] = useState<NavLinkItem | null>(null);

  // Live preview interactive hover
  const [previewHoverId, setPreviewHoverId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/header")
      .then((res) => res.json())
      .then((res) => {
        if (res.header) {
          setData({
            ...DEFAULT_HEADER_DATA,
            ...res.header,
            topbar: { ...DEFAULT_HEADER_DATA.topbar, ...(res.header.topbar || {}) },
            brand: { ...DEFAULT_HEADER_DATA.brand, ...(res.header.brand || {}) },
            ctaButton: { ...DEFAULT_HEADER_DATA.ctaButton, ...(res.header.ctaButton || {}) },
            navLinks: res.header.navLinks || DEFAULT_HEADER_DATA.navLinks,
          });
        }
      })
      .catch((err) => console.error("Error loading header:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const res = await fetch("/api/admin/header", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert("Lỗi khi lưu Header. Vui lòng thử lại!");
      }
    } catch {
      alert("Lỗi kết nối khi lưu Header!");
    } finally {
      setSaving(false);
    }
  };

  const addNavItem = () => {
    const newItem: NavLinkItem = {
      id: uid(),
      name: "Mục Menu Mới",
      href: "/#",
      type: "mega",
      columns: [emptyColumn()],
    };
    setData({
      ...data,
      navLinks: [...data.navLinks, newItem],
    });
    setEditingItem(newItem);
  };

  const updateNavItem = (updated: NavLinkItem) => {
    const next = data.navLinks.map((item) => (item.id === updated.id ? updated : item));
    setData({ ...data, navLinks: next });
  };

  const deleteNavItem = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa mục menu này?")) {
      setData({
        ...data,
        navLinks: data.navLinks.filter((item) => item.id !== id),
      });
      if (editingItem?.id === id) {
        setEditingItem(null);
      }
    }
  };

  const moveNavItem = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= data.navLinks.length) return;
    const next = [...data.navLinks];
    [next[index], next[target]] = [next[target], next[index]];
    setData({ ...data, navLinks: next });
  };

  // Preview active item helper
  const previewItem = data.navLinks.find((l) => l.id === previewHoverId);
  const previewColumns: NavColumnItem[] = previewItem?.columns && previewItem.columns.length > 0
    ? previewItem.columns
    : previewItem?.children && previewItem.children.length > 0
    ? [
        {
          id: `${previewItem.id}-col`,
          title: previewItem.name,
          links: previewItem.children,
        },
      ]
    : [];

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-slate-500 gap-3">
        <RefreshCw className="size-6 animate-spin text-[#115eff]" />
        <span className="text-sm font-medium">Đang tải dữ liệu cấu hình Header...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 font-sans">
      {/* ── Page Header & Save Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-[#115eff] text-[11px] font-bold uppercase tracking-wider mb-1.5">
            <PanelTop className="size-3.5" />
            <span>HCMUTE Full-Width Mega Navigation Editor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Quản Lý Thanh Điều Hướng (Header)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Chỉnh sửa các mục menu, các cột full-width, thẻ tiêu điểm, topbar và nút CTA cùng phong cách chuẩn HCMUTE.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Eye className="size-3.5 text-slate-500" />
            <span>Xem trang chủ</span>
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="size-4 text-emerald-300" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Interactive Live Preview Box with Full-Width Mega Dropdown ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-visible shadow-xs relative">
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Eye className="size-3.5 text-[#115eff]" />
            <span>Xem trước trực tiếp — Full-Width Mega Dropdown</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Rê chuột vào các mục để kiểm tra mega menu full-width
          </span>
        </div>

        <div className="p-4 sm:p-6 bg-slate-100/60 overflow-visible">
          <div className="border border-slate-200 rounded-xl overflow-visible bg-white shadow-xs relative">
            {/* Live Topbar */}
            {data.topbar.enabled && (
              <div className="bg-[#115eff] text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4 text-blue-100">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Phone className="size-3 text-blue-200" />
                    <span>{data.topbar.hotline}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Mail className="size-3 text-blue-200" />
                    <span>{data.topbar.email}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-blue-100">
                  <span className="bg-white/15 px-2 py-0.5 rounded font-bold">
                    {data.topbar.hostBadgeText}
                  </span>
                  <span className="bg-white/15 px-2 py-0.5 rounded font-bold">
                    {data.topbar.societyBadgeText}
                  </span>
                </div>
              </div>
            )}

            {/* Live Sticky Navbar Row */}
            <div className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-100 relative">
              {/* Brand Logo */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#115eff] text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
                  SMC
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {data.brand.conferenceTitle}
                  </div>
                  <div className="text-[10px] text-slate-500 hidden sm:block">
                    {data.brand.conferenceSubtitle}
                  </div>
                </div>
              </div>

              {/* Navigation Items with Real-time Hover Mega Dropdown */}
              <div className="hidden lg:flex items-center gap-1">
                {data.navLinks.map((link) => {
                  const hasMenu =
                    (link.columns && link.columns.length > 0) ||
                    (link.children && link.children.length > 0);
                  const isHovered = previewHoverId === link.id;

                  return (
                    <div
                      key={link.id}
                      className="py-1.5"
                      onMouseEnter={() => hasMenu && setPreviewHoverId(link.id)}
                      onMouseLeave={() => setPreviewHoverId(null)}
                    >
                      <button
                        type="button"
                        onClick={() => setEditingItem(link)}
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer select-none",
                          isHovered
                            ? "bg-[#115eff] text-white shadow-xs font-bold"
                            : "text-slate-700 hover:bg-slate-100 hover:text-[#004776]"
                        )}
                      >
                        <span>{link.name}</span>
                        {hasMenu && (
                          <ChevronDown
                            className={cn(
                              "size-3 text-slate-400 transition-transform duration-200",
                              isHovered && "rotate-180 text-white"
                            )}
                          />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Live CTA Button */}
              {data.ctaButton.enabled && (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#115eff] text-white text-xs font-bold rounded-lg shadow-xs">
                  <span>{data.ctaButton.label}</span>
                  <ExternalLink className="size-3" />
                </div>
              )}
            </div>

            {/* ── Full-Width Mega Menu Dropdown inside Preview ── */}
            {previewItem && previewColumns.length > 0 && (
              <div
                className="w-full bg-white border-b border-slate-200 rounded-b-xl shadow-xl overflow-hidden animate-in fade-in duration-150 relative z-30"
                onMouseEnter={() => setPreviewHoverId(previewItem.id)}
                onMouseLeave={() => setPreviewHoverId(null)}
              >
                <div className="flex flex-col lg:flex-row items-stretch w-full divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                  {/* Columns */}
                  {previewColumns.map((col, idx) => (
                    <div key={col.id || idx} className="flex-1 p-5 min-w-0">
                      <div className="relative pb-2 mb-3">
                        <h4 className="text-xs font-extrabold text-slate-900 tracking-normal">
                          {col.title}
                        </h4>
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-200 rounded-full" />
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-blue-600 via-indigo-500 to-red-500 rounded-full" />
                      </div>

                      <div className="space-y-1.5">
                        {col.links.map((sub) => {
                          const SubIcon = getNavIcon(sub.icon);
                          return (
                            <div
                              key={sub.id}
                              className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <div className="size-6 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                                <SubIcon className="size-3 text-[#115eff]" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    {sub.title}
                                  </span>
                                  {sub.badge && (
                                    <span className="text-[9px] px-1 py-0.2 rounded bg-blue-100 text-[#115eff] font-bold">
                                      {sub.badge}
                                    </span>
                                  )}
                                  {sub.isExternal && (
                                    <ArrowUpRight className="size-2.5 text-slate-400" />
                                  )}
                                </div>
                                {sub.description && (
                                  <p className="text-[10px] text-slate-500 line-clamp-1">
                                    {sub.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Promo Card Preview */}
                  {previewItem.promoCard && (
                    <div className="w-64 shrink-0 p-5 bg-slate-50/50 flex flex-col justify-start">
                      <div className="relative pb-2 mb-3">
                        <h4 className="text-xs font-bold text-slate-700">
                          {previewItem.promoCard.badge || "Tiêu điểm"}
                        </h4>
                        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-slate-200 rounded-full" />
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                        <div className="relative aspect-[16/9] w-full bg-slate-100">
                          <img
                            src={previewItem.promoCard.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-3 space-y-1">
                          <p className="text-xs font-bold text-slate-900 leading-snug">
                            {previewItem.promoCard.title}
                          </p>
                          <p className="text-[10px] text-slate-500 line-clamp-2">
                            {previewItem.promoCard.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Main Tab Navigation Bar ── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("nav")}
          className={cn(
            "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2",
            activeTab === "nav"
              ? "bg-[#115eff] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <ListTree className="size-3.5" />
          <span>Menu Điều Hướng ({data.navLinks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("topbar")}
          className={cn(
            "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2",
            activeTab === "topbar"
              ? "bg-[#115eff] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Phone className="size-3.5" />
          <span>Thanh Tiện Ích (Topbar)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cta")}
          className={cn(
            "px-4 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2",
            activeTab === "cta"
              ? "bg-[#115eff] text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Sparkles className="size-3.5" />
          <span>Nút Kêu Gọi (CTA)</span>
        </button>
      </div>

      {/* ── Tab Content ── */}
      {activeTab === "nav" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Các mục trên thanh điều hướng chính
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nhấp &quot;Cấu hình Layout&quot; để thiết lập các cột full-width, thêm liên kết con và thẻ tiêu điểm.
              </p>
            </div>
            <button
              type="button"
              onClick={addNavItem}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#115eff] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="size-3.5" />
              <span>Thêm mục menu mới</span>
            </button>
          </div>

          {/* List of Main Nav Items */}
          <div className="space-y-2.5">
            {data.navLinks.map((item, index) => {
              const isMega = item.type === "mega" || Boolean(item.columns && item.columns.length > 0);
              const isDropdown = item.type === "dropdown" || Boolean(item.children && item.children.length > 0);
              const columnCount = item.columns?.length || 0;
              const linkCount =
                item.columns && item.columns.length > 0
                  ? item.columns.reduce((acc, c) => acc + c.links.length, 0)
                  : item.children?.length || 0;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  {/* Left: Reorder & Name */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Reorder Buttons */}
                    <div className="flex flex-col shrink-0 gap-0">
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors disabled:opacity-20 cursor-pointer"
                        onClick={() => moveNavItem(index, -1)}
                        disabled={index === 0}
                        title="Di chuyển lên"
                      >
                        <ChevronUp className="size-3" />
                      </button>
                      <button
                        type="button"
                        className="text-slate-400 hover:text-slate-700 p-0.5 transition-colors disabled:opacity-20 cursor-pointer"
                        onClick={() => moveNavItem(index, 1)}
                        disabled={index === data.navLinks.length - 1}
                        title="Di chuyển xuống"
                      >
                        <ChevronDown className="size-3" />
                      </button>
                    </div>

                    {/* Order badge */}
                    <span className="size-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    {/* Label & URL */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                            isMega
                              ? "bg-purple-50 text-purple-600 border-purple-200"
                              : isDropdown
                              ? "bg-sky-50 text-[#115eff] border-sky-200"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200"
                          )}
                        >
                          {isMega ? "Mega Menu Full-Width" : isDropdown ? "Dropdown" : "Link"}
                        </span>
                        {isMega && (
                          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                            • {columnCount} cột ({linkCount} liên kết)
                            {item.promoCard && " + Thẻ tiêu điểm"}
                          </span>
                        )}
                        {!isMega && isDropdown && (
                          <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                            • {linkCount} liên kết
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-slate-400 truncate mt-0.5">
                        {item.href}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setEditingItem(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:text-[#115eff] hover:border-[#115eff]/30 transition-colors cursor-pointer"
                    >
                      <Settings2 className="size-3.5" />
                      <span>Cấu hình Layout</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteNavItem(item.id)}
                      className="size-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Xóa mục"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addNavItem}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border-2 border-dashed border-slate-200 text-xs font-bold text-slate-500 hover:text-[#115eff] hover:border-[#115eff]/40 hover:bg-blue-50/20 transition-all cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Thêm mục menu mới</span>
          </button>
        </div>
      )}

      {/* ── Topbar Tab ── */}
      {activeTab === "topbar" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Thanh Tiện Ích Trên Cùng (Topbar)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Thông tin đường dây nóng, email liên hệ chính thức và các huy hiệu đơn vị chủ trì.
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-700">Hiển thị Topbar:</span>
              <input
                type="checkbox"
                checked={data.topbar.enabled}
                onChange={(e) =>
                  setData({
                    ...data,
                    topbar: { ...data.topbar, enabled: e.target.checked },
                  })
                }
                className="size-4 rounded text-[#115eff] focus:ring-[#115eff] cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Số điện thoại Hotline
              </label>
              <input
                className="w-full h-9 text-xs rounded-xl border border-slate-200 bg-white px-3 text-slate-800 focus:outline-none focus:border-[#115eff]"
                value={data.topbar.hotline}
                onChange={(e) =>
                  setData({
                    ...data,
                    topbar: { ...data.topbar, hotline: e.target.value },
                  })
                }
                placeholder="+84 981 479 507"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Email Thư ký hội nghị
              </label>
              <input
                className="w-full h-9 text-xs rounded-xl border border-slate-200 bg-white px-3 text-slate-800 focus:outline-none focus:border-[#115eff]"
                value={data.topbar.email}
                onChange={(e) =>
                  setData({
                    ...data,
                    topbar: { ...data.topbar, email: e.target.value },
                  })
                }
                placeholder="ieeesmc2027@hcmute.edu.vn"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Huy hiệu Trường Chủ Trì
              </label>
              <input
                className="w-full h-9 text-xs rounded-xl border border-slate-200 bg-white px-3 text-slate-800 focus:outline-none focus:border-[#115eff]"
                value={data.topbar.hostBadgeText}
                onChange={(e) =>
                  setData({
                    ...data,
                    topbar: { ...data.topbar, hostBadgeText: e.target.value },
                  })
                }
                placeholder="Host: HCM-UTE (Vietnam)"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Huy hiệu Hội IEEE SMC
              </label>
              <input
                className="w-full h-9 text-xs rounded-xl border border-slate-200 bg-white px-3 text-slate-800 focus:outline-none focus:border-[#115eff]"
                value={data.topbar.societyBadgeText}
                onChange={(e) =>
                  setData({
                    ...data,
                    topbar: { ...data.topbar, societyBadgeText: e.target.value },
                  })
                }
                placeholder="IEEE SMC Society (Global)"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── CTA Button Tab ── */}
      {activeTab === "cta" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Nút Kêu Gọi Hành Động (CTA Button)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Nút màu xanh nổi bật ở góc phải Navbar (Ví dụ: Nộp bài qua PaperCept).
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs font-bold text-slate-700">Bật nút CTA:</span>
              <input
                type="checkbox"
                checked={data.ctaButton.enabled}
                onChange={(e) =>
                  setData({
                    ...data,
                    ctaButton: { ...data.ctaButton, enabled: e.target.checked },
                  })
                }
                className="size-4 rounded text-[#115eff] focus:ring-[#115eff] cursor-pointer"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Nội dung nhãn nút (Label)
              </label>
              <input
                className="w-full h-9 text-xs rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-800 focus:outline-none focus:border-[#115eff]"
                value={data.ctaButton.label}
                onChange={(e) =>
                  setData({
                    ...data,
                    ctaButton: { ...data.ctaButton, label: e.target.value },
                  })
                }
                placeholder="Submit Paper (PaperCept)"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 mb-1 block">
                Đường dẫn liên kết (Href)
              </label>
              <input
                className="w-full h-9 text-xs rounded-xl border border-slate-200 bg-white px-3 font-mono text-slate-700 focus:outline-none focus:border-[#115eff]"
                value={data.ctaButton.href}
                onChange={(e) =>
                  setData({
                    ...data,
                    ctaButton: { ...data.ctaButton, href: e.target.value },
                  })
                }
                placeholder="/#cfp"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-over Side Panel Editor (HeaderSidePanel) ── */}
      {editingItem && (
        <HeaderSidePanel
          item={editingItem}
          open={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSave={updateNavItem}
        />
      )}
    </div>
  );
}
