"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_HEADER_DATA,
  normalizeHeaderConfig,
  type HeaderConfig,
  type NavColumnItem,
  type NavLinkItem,
} from "@/lib/header-config";
import {
  DEFAULT_FOOTER_CONFIG,
  type FooterConfigData,
} from "@/lib/footer-config";
import { useAutoMinimizeSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BuilderPalette,
  type PaletteDragBlockType,
} from "./components/builder-palette";
import {
  VisualHeaderCanvas,
  type SelectedInspectorTarget,
} from "./components/visual-header-canvas";
import { HeaderInspector } from "./components/header-inspector";
import {
  FooterPalette,
  VisualFooterCanvas,
  FooterInspector,
  type FooterInspectorTarget,
} from "./components/footer-studio-panel";
import { useDragAutoScroll } from "./components/use-drag-auto-scroll";
import {
  ArrowLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelTop,
  PanelBottom,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Upload,
  RotateCcw,
  Save,
  ExternalLink,
  Loader2,
  LayoutTemplate,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ZoomMode = "auto" | "75" | "85" | "100";
type StudioMode = "header" | "footer";

export default function HeaderStudioPage() {
  useAutoMinimizeSidebar();

  const [studioMode, setStudioMode] = useState<StudioMode>("header");

  const [config, setConfig] = useState<HeaderConfig>(() =>
    normalizeHeaderConfig(DEFAULT_HEADER_DATA)
  );
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() =>
    JSON.stringify(normalizeHeaderConfig(DEFAULT_HEADER_DATA))
  );

  const [footerConfig, setFooterConfig] = useState<FooterConfigData>(() => ({
    ...DEFAULT_FOOTER_CONFIG,
  }));
  const [savedFooterSnapshot, setSavedFooterSnapshot] = useState<string>(() =>
    JSON.stringify(DEFAULT_FOOTER_CONFIG)
  );
  const [footerTarget, setFooterTarget] = useState<FooterInspectorTarget>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [paletteOpen, setPaletteOpen] = useState(true);
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [zoomMode, setZoomMode] = useState<ZoomMode>("auto");
  const [autoScale, setAutoScale] = useState(1);

  const [activeTriggerId, setActiveTriggerId] = useState<string>(
    DEFAULT_HEADER_DATA.navLinks[1]?.id || DEFAULT_HEADER_DATA.navLinks[0]?.id || "nav-about"
  );
  const [selectedTarget, setSelectedTarget] = useState<SelectedInspectorTarget>(null);

  const canvasScrollRef = useRef<HTMLDivElement | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  useDragAutoScroll(canvasScrollRef, { active: true });

  // Load persisted header & footer configs on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      fetch("/api/admin/header")
        .then((res) => (res.ok ? res.json() : ({} as { header?: Partial<HeaderConfig> })))
        .catch(() => ({} as { header?: Partial<HeaderConfig> })),
      fetch("/api/footer")
        .then((res) => (res.ok ? res.json() : ({} as { footer?: Partial<FooterConfigData> })))
        .catch(() => ({} as { footer?: Partial<FooterConfigData> })),
    ])
      .then(([headerRes, footerRes]) => {
        if (!mounted) return;
        const normalized = normalizeHeaderConfig(headerRes.header || DEFAULT_HEADER_DATA);
        setConfig(normalized);
        setSavedSnapshot(JSON.stringify(normalized));
        const firstMega =
          normalized.navLinks.find((l) => l.type === "mega") || normalized.navLinks[0];
        if (firstMega) {
          setActiveTriggerId(firstMega.id);
        }

        const mergedFooter: FooterConfigData = {
          ...DEFAULT_FOOTER_CONFIG,
          ...(footerRes.footer || {}),
          linkGroups: Array.isArray(footerRes.footer?.linkGroups)
            ? footerRes.footer.linkGroups
            : DEFAULT_FOOTER_CONFIG.linkGroups,
          socialLinks: Array.isArray(footerRes.footer?.socialLinks)
            ? footerRes.footer.socialLinks
            : DEFAULT_FOOTER_CONFIG.socialLinks,
        };
        setFooterConfig(mergedFooter);
        setSavedFooterSnapshot(JSON.stringify(mergedFooter));
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Auto-scale desktop 1260px artboard to fit center workspace cleanly
  useEffect(() => {
    const el = canvasScrollRef.current;
    if (!el) return;

    const computeScale = () => {
      const availableWidth = el.clientWidth - 48;
      if (availableWidth <= 0) return;
      const ratio = Math.min(1, Math.max(0.55, availableWidth / 1260));
      setAutoScale(Number(ratio.toFixed(3)));
    };

    computeScale();
    const observer = new ResizeObserver(computeScale);
    observer.observe(el);
    return () => observer.disconnect();
  }, [paletteOpen, viewport]);

  const effectiveScale = useMemo(() => {
    if (viewport !== "desktop") return 1;
    if (zoomMode === "auto") return autoScale;
    return Number(zoomMode) / 100;
  }, [viewport, zoomMode, autoScale]);

  const isHeaderDirty = useMemo(() => {
    return JSON.stringify(config) !== savedSnapshot;
  }, [config, savedSnapshot]);

  const isFooterDirty = useMemo(() => {
    return JSON.stringify(footerConfig) !== savedFooterSnapshot;
  }, [footerConfig, savedFooterSnapshot]);

  const isDirty = isHeaderDirty || isFooterDirty;

  const updateConfig = useCallback(
    (updater: (prev: HeaderConfig) => HeaderConfig) => {
      setConfig((prev) => updater(prev));
    },
    []
  );

  const updateFooterConfig = useCallback(
    (updater: (prev: FooterConfigData) => FooterConfigData) => {
      setFooterConfig((prev) => updater(prev));
    },
    []
  );

  // Footer Column Actions
  const handleAddFooterGroup = () => {
    const nextIndex = footerConfig.linkGroups.length;
    updateFooterConfig((prev) => ({
      ...prev,
      linkGroups: [
        ...prev.linkGroups,
        {
          heading: "New Column",
          links: [{ label: "New Link", href: "/" }],
        },
      ],
    }));
    setFooterTarget({ type: "group", groupIndex: nextIndex });
  };

  const handleDeleteFooterGroup = (groupIndex: number) => {
    if (footerConfig.linkGroups.length <= 1) {
      toast.error("At least one footer link column is required.");
      return;
    }
    updateFooterConfig((prev) => ({
      ...prev,
      linkGroups: prev.linkGroups.filter((_, i) => i !== groupIndex),
    }));
    if (footerTarget?.type === "group") {
      setFooterTarget(null);
    }
  };

  const handleMoveFooterGroup = (fromIndex: number, toIndex: number) => {
    updateFooterConfig((prev) => {
      const next = [...prev.linkGroups];
      if (
        fromIndex < 0 ||
        fromIndex >= next.length ||
        toIndex < 0 ||
        toIndex >= next.length
      ) {
        return prev;
      }
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, linkGroups: next };
    });
    if (footerTarget?.type === "group" && footerTarget.groupIndex === fromIndex) {
      setFooterTarget({ type: "group", groupIndex: toIndex });
    }
  };

  const handleReorderFooterGroupLinks = (
    groupIndex: number,
    fromIndex: number,
    toIndex: number
  ) => {
    updateFooterConfig((prev) => ({
      ...prev,
      linkGroups: prev.linkGroups.map((group, gIdx) => {
        if (gIdx !== groupIndex) return group;
        const nextLinks = [...group.links];
        if (
          fromIndex < 0 ||
          fromIndex >= nextLinks.length ||
          toIndex < 0 ||
          toIndex >= nextLinks.length
        ) {
          return group;
        }
        const [moved] = nextLinks.splice(fromIndex, 1);
        nextLinks.splice(toIndex, 0, moved);
        return { ...group, links: nextLinks };
      }),
    }));
  };

  const handleReorderFooterSocialLinks = (fromIndex: number, toIndex: number) => {
    updateFooterConfig((prev) => {
      const next = [...prev.socialLinks];
      if (
        fromIndex < 0 ||
        fromIndex >= next.length ||
        toIndex < 0 ||
        toIndex >= next.length
      ) {
        return prev;
      }
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return { ...prev, socialLinks: next };
    });
  };

  // Trigger Actions
  const handleSelectTrigger = (triggerId: string) => {
    setActiveTriggerId(triggerId);
    setSelectedTarget({ type: "trigger", triggerId });
  };

  const handleAddTrigger = () => {
    const id = `nav-${Date.now()}`;
    const newTrigger: NavLinkItem = {
      id,
      name: "New Section",
      href: "/",
      type: "mega",
      position: "left",
      columns: [
        {
          id: `col-${Date.now()}`,
          title: "Quick Links",
          type: "category-links",
          links: [
            {
              id: `sub-${Date.now()}`,
              title: "Section Overview",
              href: "/",
              description: "Introduction and key details",
              icon: "Globe",
            },
          ],
        },
      ],
    };

    updateConfig((prev) => ({
      ...prev,
      navLinks: [...prev.navLinks, newTrigger],
    }));
    setActiveTriggerId(id);
    setSelectedTarget({ type: "trigger", triggerId: id });
    toast.success("Added new menu trigger.");
  };

  const handleRenameTrigger = (triggerId: string, name: string) => {
    updateConfig((prev) => ({
      ...prev,
      navLinks: prev.navLinks.map((n) =>
        n.id === triggerId ? { ...n, name } : n
      ),
    }));
  };

  const handleDeleteTrigger = (triggerId: string) => {
    if (config.navLinks.length <= 1) {
      toast.error("At least one menu trigger is required.");
      return;
    }

    const remaining = config.navLinks.filter((n) => n.id !== triggerId);
    updateConfig((prev) => ({
      ...prev,
      navLinks: remaining,
    }));

    if (activeTriggerId === triggerId && remaining[0]) {
      setActiveTriggerId(remaining[0].id);
    }
    if (
      selectedTarget &&
      "triggerId" in selectedTarget &&
      selectedTarget.triggerId === triggerId
    ) {
      setSelectedTarget(null);
    }
    toast.success("Menu trigger removed.");
  };

  const handleReorderTriggers = (fromIndex: number, toIndex: number) => {
    updateConfig((prev) => {
      const next = [...prev.navLinks];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) return prev;
      next.splice(toIndex, 0, moved);
      return { ...prev, navLinks: next };
    });
  };

  // Column Actions
  const handleAddColumn = (
    triggerId: string,
    columnType: "category-links" | "promo-card",
    insertIndex?: number
  ) => {
    const colId = `col-${Date.now()}`;
    const newCol: NavColumnItem =
      columnType === "promo-card"
        ? {
            id: colId,
            title: "HIGHLIGHT",
            type: "promo-card",
            links: [],
            promoPosition: "top",
            promoCard: {
              title: "IEEE SMC 2027 · Ho Chi Minh City",
              description: "Explore tracks, deadlines, and author submission details.",
              image: "/assets/cta-background.webp",
              href: "/submissions",
              badge: "Featured",
              ctaText: "Explore",
            },
          }
        : {
            id: colId,
            title: "NEW CATEGORY",
            type: "category-links",
            links: [
              {
                id: `sub-${Date.now()}`,
                title: "Conference Page",
                href: "/",
                description: "Brief description for this destination",
                icon: "Globe",
              },
            ],
          };

    updateConfig((prev) => ({
      ...prev,
      navLinks: prev.navLinks.map((nav) => {
        if (nav.id !== triggerId) return nav;
        const currentCols = [...(nav.columns || [])];
        if (typeof insertIndex === "number" && insertIndex >= 0) {
          currentCols.splice(insertIndex, 0, newCol);
        } else {
          currentCols.push(newCol);
        }
        return {
          ...nav,
          type: "mega",
          columns: currentCols,
        };
      }),
    }));

    setActiveTriggerId(triggerId);
    setSelectedTarget({ type: "column", triggerId, columnId: colId });
  };

  const handleDeleteColumn = (triggerId: string, columnId: string) => {
    updateConfig((prev) => ({
      ...prev,
      navLinks: prev.navLinks.map((nav) => {
        if (nav.id !== triggerId) return nav;
        return {
          ...nav,
          columns: (nav.columns || []).filter((c) => c.id !== columnId),
        };
      }),
    }));
    if (
      selectedTarget?.type === "column" &&
      selectedTarget.columnId === columnId
    ) {
      setSelectedTarget({ type: "trigger", triggerId });
    }
  };

  const handleMoveColumn = (
    triggerId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    updateConfig((prev) => ({
      ...prev,
      navLinks: prev.navLinks.map((nav) => {
        if (nav.id !== triggerId || !nav.columns) return nav;
        const nextCols = [...nav.columns];
        if (
          fromIndex < 0 ||
          fromIndex >= nextCols.length ||
          toIndex < 0 ||
          toIndex >= nextCols.length
        ) {
          return nav;
        }
        const [moved] = nextCols.splice(fromIndex, 1);
        nextCols.splice(toIndex, 0, moved);
        return { ...nav, columns: nextCols };
      }),
    }));
  };

  const handleReorderColumnLinks = (
    triggerId: string,
    columnId: string,
    fromIndex: number,
    toIndex: number
  ) => {
    updateConfig((prev) => ({
      ...prev,
      navLinks: prev.navLinks.map((nav) => {
        if (nav.id !== triggerId) return nav;
        return {
          ...nav,
          columns: (nav.columns || []).map((col) => {
            if (col.id !== columnId) return col;
            const nextLinks = [...col.links];
            if (
              fromIndex < 0 ||
              fromIndex >= nextLinks.length ||
              toIndex < 0 ||
              toIndex >= nextLinks.length
            ) {
              return col;
            }
            const [moved] = nextLinks.splice(fromIndex, 1);
            nextLinks.splice(toIndex, 0, moved);
            return { ...col, links: nextLinks };
          }),
        };
      }),
    }));
  };

  const handleSetPromoPosition = (triggerId: string, position: "left" | "right") => {
    updateConfig((prev) => ({
      ...prev,
      navLinks: prev.navLinks.map((nav) =>
        nav.id === triggerId ? { ...nav, promoCardPosition: position } : nav
      ),
    }));
  };

  const handleConvertTriggerToMega = (triggerId: string) => {
    handleAddColumn(triggerId, "category-links");
  };

  const handleDropPaletteBlock = (
    blockType: PaletteDragBlockType,
    insertIndex?: number
  ) => {
    if (blockType === "category-links" || blockType === "promo-card") {
      const targetId =
        activeTriggerId || config.navLinks[0]?.id || "nav-about";
      handleAddColumn(targetId, blockType, insertIndex);
    } else if (blockType === "trigger") {
      handleAddTrigger();
    } else if (blockType === "general") {
      setSelectedTarget({ type: "general" });
    }
  };

  // Save, Export, Import, Reset
  const handleSave = async () => {
    setSaving(true);
    try {
      const saveHeader = isHeaderDirty || (!isFooterDirty && studioMode === "header");
      const saveFooter = isFooterDirty || (!isHeaderDirty && studioMode === "footer");

      if (saveHeader) {
        const payload = normalizeHeaderConfig(config);
        const res = await fetch("/api/admin/header", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to save header settings.");
          return;
        }
        setConfig(payload);
        setSavedSnapshot(JSON.stringify(payload));
        window.dispatchEvent(
          new CustomEvent("smc:header-updated", { detail: payload })
        );
        if (typeof BroadcastChannel !== "undefined") {
          const channel = new BroadcastChannel("smc_header_sync");
          channel.postMessage(payload);
          channel.close();
        }
      }

      if (saveFooter) {
        const res = await fetch("/api/footer", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(footerConfig),
        });
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.error || "Failed to save footer settings.");
          return;
        }
        const savedFooter: FooterConfigData = data.data?.footer || data.footer || footerConfig;
        setFooterConfig(savedFooter);
        setSavedFooterSnapshot(JSON.stringify(savedFooter));
        window.dispatchEvent(
          new CustomEvent("smc:footer-updated", { detail: savedFooter })
        );
        if (typeof BroadcastChannel !== "undefined") {
          const channel = new BroadcastChannel("smc_footer_sync");
          channel.postMessage(savedFooter);
          channel.close();
        }
      }

      toast.success(
        saveHeader && saveFooter
          ? "Header & Footer published."
          : saveFooter
            ? "Footer configuration published."
            : "Header configuration published."
      );
    } catch {
      toast.error("Network error while saving configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    const data = studioMode === "footer" ? footerConfig : config;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download =
      studioMode === "footer"
        ? "ieee-smc-2027-footer-config.json"
        : "ieee-smc-2027-header-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(
      studioMode === "footer" ? "Exported footer JSON." : "Exported header JSON."
    );
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (studioMode === "footer") {
        const merged: FooterConfigData = {
          ...DEFAULT_FOOTER_CONFIG,
          ...parsed,
          linkGroups: Array.isArray(parsed.linkGroups)
            ? parsed.linkGroups
            : DEFAULT_FOOTER_CONFIG.linkGroups,
          socialLinks: Array.isArray(parsed.socialLinks)
            ? parsed.socialLinks
            : DEFAULT_FOOTER_CONFIG.socialLinks,
        };
        setFooterConfig(merged);
        setFooterTarget(null);
        toast.success("Imported footer JSON. Click Save Changes to publish.");
      } else {
        const normalized = normalizeHeaderConfig(parsed);
        setConfig(normalized);
        if (normalized.navLinks[0]) {
          setActiveTriggerId(normalized.navLinks[0].id);
        }
        setSelectedTarget(null);
        toast.success("Imported header JSON. Click Save Changes to publish.");
      }
    } catch {
      toast.error("Invalid JSON configuration file.");
    } finally {
      e.target.value = "";
    }
  };

  const handleResetDefaults = () => {
    if (studioMode === "footer") {
      setFooterConfig({ ...DEFAULT_FOOTER_CONFIG });
      setFooterTarget(null);
      toast.info("Restored default IEEE SMC 2027 footer template.");
      return;
    }
    const fresh = normalizeHeaderConfig(DEFAULT_HEADER_DATA);
    setConfig(fresh);
    const firstMega =
      fresh.navLinks.find((l) => l.type === "mega") || fresh.navLinks[0];
    if (firstMega) setActiveTriggerId(firstMega.id);
    setSelectedTarget(null);
    toast.info("Restored default IEEE SMC 2027 header template.");
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-100 overflow-hidden">
      {/* Studio Top Toolbar */}
      <header className="h-13 shrink-0 bg-white border-b border-slate-200 px-3 sm:px-4 flex items-center justify-between gap-3 z-30">
        {/* Left Controls */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href="/admin/pages"
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-[#115eff] transition-colors shrink-0"
            title="Back to Pages"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setPaletteOpen((prev) => !prev)}
            className="h-8 w-8 p-0 text-slate-600 hover:text-[#004776]"
            title={paletteOpen ? "Collapse Left Palette" : "Expand Left Palette"}
          >
            {paletteOpen ? (
              <PanelLeftClose className="w-4 h-4" />
            ) : (
              <PanelLeftOpen className="w-4 h-4" />
            )}
          </Button>

          <div className="hidden md:flex items-center pr-2.5 border-r border-slate-200">
            <span className="text-sm font-extrabold text-[#004776] tracking-tight">
              Layout Studio
            </span>
          </div>

          {/* Header vs Footer Mode Switcher */}
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setStudioMode("header")}
              className={cn(
                "px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                studioMode === "header"
                  ? "bg-white text-[#115eff] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Header
            </button>
            <button
              type="button"
              onClick={() => setStudioMode("footer")}
              className={cn(
                "px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                studioMode === "footer"
                  ? "bg-white text-[#115eff] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Footer
            </button>
          </div>
        </div>

        {/* Center Viewport & Zoom Controls */}
        <div className="hidden xl:flex items-center gap-2">
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              title="Desktop Viewport"
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer",
                viewport === "desktop"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("tablet")}
              title="Tablet Viewport"
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer",
                viewport === "tablet"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              title="Mobile Viewport"
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer",
                viewport === "mobile"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-500 hover:text-slate-800"
              )}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {viewport === "desktop" && (
            <Select
              value={zoomMode}
              onValueChange={(v) => setZoomMode(v as ZoomMode)}
            >
              <SelectTrigger className="h-7 w-24 text-xs bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="auto" className="text-xs">
                  Fit {Math.round(autoScale * 100)}%
                </SelectItem>
                <SelectItem value="75" className="text-xs">
                  75%
                </SelectItem>
                <SelectItem value="85" className="text-xs">
                  85%
                </SelectItem>
                <SelectItem value="100" className="text-xs">
                  100%
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isDirty ? (
            <Badge
              variant="outline"
              size="sm"
              className="bg-rose-50 text-rose-700 border-rose-200"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
              Unsaved Changes
            </Badge>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 px-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Synced
            </span>
          )}

          <input
            ref={importInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportJson}
            className="hidden"
          />

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExportJson}
            title="Export JSON"
            className="h-8 px-2 text-xs text-slate-600 hover:text-[#004776]"
          >
            <Download className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden lg:inline">Export</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => importInputRef.current?.click()}
            title="Import JSON"
            className="h-8 px-2 text-xs text-slate-600 hover:text-[#004776]"
          >
            <Upload className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden lg:inline">Import</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            title="Reset to Defaults"
            className="h-8 px-2 text-xs text-slate-600 hover:text-red-600"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden lg:inline">Reset</span>
          </Button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-md border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:border-blue-300 hover:text-[#115eff] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Live Site</span>
          </a>

          <Button
            type="button"
            size="sm"
            disabled={saving}
            onClick={handleSave}
            className="h-8 px-3.5 text-xs font-bold bg-[#115eff] hover:bg-[#0a4de6] text-white shadow-xs"
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            Save Changes
          </Button>
        </div>
      </header>

      {/* Main Studio Body: Full-height Left Palette + Right Column (Canvas + Fluid Bottom Inspector like VS Code) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {paletteOpen &&
          (studioMode === "header" ? (
            <BuilderPalette
              navLinks={config.navLinks}
              activeTriggerId={activeTriggerId}
              onSelectTrigger={handleSelectTrigger}
              onAddTrigger={handleAddTrigger}
              onRenameTrigger={handleRenameTrigger}
              onDeleteTrigger={handleDeleteTrigger}
              onReorderTriggers={handleReorderTriggers}
              onAddColumnBlock={(blockType) =>
                handleAddColumn(activeTriggerId, blockType)
              }
              onSelectGeneral={() => setSelectedTarget({ type: "general" })}
            />
          ) : (
            <FooterPalette
              config={footerConfig}
              selectedTarget={footerTarget}
              onSelectTarget={setFooterTarget}
              onAddLinkGroup={handleAddFooterGroup}
              onMoveLinkGroup={handleMoveFooterGroup}
              onDeleteLinkGroup={handleDeleteFooterGroup}
            />
          ))}

        {/* Right Workspace Column: Canvas + Docked Fluid Bottom Inspector */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          {/* Center Dot-Grid Workspace */}
          <div
            ref={canvasScrollRef}
            className="flex-1 min-h-0 overflow-auto relative"
            style={{
              backgroundColor: "#f8fafc",
              backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          >
            {loading ? (
              <div className="h-full flex items-center justify-center gap-2.5 text-sm font-medium text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin text-[#115eff]" />
                Loading Layout Studio...
              </div>
            ) : (
              <div
                className="origin-top mx-auto transition-transform duration-150"
                style={
                  viewport === "desktop" && effectiveScale !== 1
                    ? {
                        transform: `scale(${effectiveScale})`,
                        transformOrigin: "top center",
                        width: "1260px",
                      }
                    : undefined
                }
              >
                {studioMode === "header" ? (
                  <VisualHeaderCanvas
                    config={config}
                    viewport={viewport}
                    activeTriggerId={activeTriggerId}
                    selectedTarget={selectedTarget}
                    onSelectTrigger={setActiveTriggerId}
                    onSelectTarget={setSelectedTarget}
                    onAddColumn={handleAddColumn}
                    onDeleteColumn={handleDeleteColumn}
                    onMoveColumn={handleMoveColumn}
                    onReorderTriggers={handleReorderTriggers}
                    onReorderColumnLinks={handleReorderColumnLinks}
                    onSetPromoPosition={handleSetPromoPosition}
                    onConvertTriggerToMega={handleConvertTriggerToMega}
                    onDropPaletteBlock={handleDropPaletteBlock}
                  />
                ) : (
                  <VisualFooterCanvas
                    config={footerConfig}
                    viewport={viewport}
                    selectedTarget={footerTarget}
                    onSelectTarget={setFooterTarget}
                    onMoveLinkGroup={handleMoveFooterGroup}
                    onReorderGroupLinks={handleReorderFooterGroupLinks}
                    onReorderSocialLinks={handleReorderFooterSocialLinks}
                    onDeleteLinkGroup={handleDeleteFooterGroup}
                  />
                )}
              </div>
            )}
          </div>

          {/* Fluid Bottom Inspector Drawer (aligned to canvas column, VS Code style) */}
          {studioMode === "header" ? (
            <HeaderInspector
              config={config}
              target={selectedTarget}
              onClose={() => setSelectedTarget(null)}
              onUpdateConfig={updateConfig}
              onDeleteColumn={handleDeleteColumn}
              onDeleteTrigger={handleDeleteTrigger}
            />
          ) : (
            <FooterInspector
              config={footerConfig}
              target={footerTarget}
              onClose={() => setFooterTarget(null)}
              onUpdateConfig={updateFooterConfig}
              onDeleteLinkGroup={handleDeleteFooterGroup}
            />
          )}
        </div>
      </div>
    </div>
  );
}
