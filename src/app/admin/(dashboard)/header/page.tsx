"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_HEADER_DATA,
  normalizeHeaderConfig,
  type HeaderConfig,
  type NavColumnItem,
  type NavLinkItem,
} from "@/lib/header-config";
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
import { useDragAutoScroll } from "./components/use-drag-auto-scroll";
import {
  PanelLeftClose,
  PanelLeftOpen,
  Monitor,
  Tablet,
  Smartphone,
  Download,
  Upload,
  RotateCcw,
  Save,
  ExternalLink,
  SlidersHorizontal,
  Loader2,
  LayoutTemplate,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ZoomMode = "auto" | "75" | "85" | "100";

export default function HeaderStudioPage() {
  useAutoMinimizeSidebar();

  const [config, setConfig] = useState<HeaderConfig>(() =>
    normalizeHeaderConfig(DEFAULT_HEADER_DATA)
  );
  const [savedSnapshot, setSavedSnapshot] = useState<string>(() =>
    JSON.stringify(normalizeHeaderConfig(DEFAULT_HEADER_DATA))
  );
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

  // Load persisted header config on mount
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/api/admin/header")
      .then((res) => (res.ok ? res.json() : ({} as { header?: Partial<HeaderConfig> })))
      .then((res: { header?: Partial<HeaderConfig> }) => {
        if (!mounted) return;
        const normalized = normalizeHeaderConfig(res.header || DEFAULT_HEADER_DATA);
        setConfig(normalized);
        setSavedSnapshot(JSON.stringify(normalized));
        const firstMega =
          normalized.navLinks.find((l) => l.type === "mega") || normalized.navLinks[0];
        if (firstMega) {
          setActiveTriggerId(firstMega.id);
        }
      })
      .catch(() => {
        if (!mounted) return;
        toast.error("Failed to load header configuration. Using defaults.");
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

  const isDirty = useMemo(() => {
    return JSON.stringify(config) !== savedSnapshot;
  }, [config, savedSnapshot]);

  const updateConfig = useCallback(
    (updater: (prev: HeaderConfig) => HeaderConfig) => {
      setConfig((prev) => updater(prev));
    },
    []
  );

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
      href: "/#about",
      type: "mega",
      position: "left",
      columns: [
        {
          id: `col-${Date.now()}`,
          title: "QUICK LINKS",
          type: "category-links",
          links: [
            {
              id: `sub-${Date.now()}`,
              title: "Section Overview",
              href: "/#about",
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
              href: "/#cfp",
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
                href: "/#about",
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
      toast.success("Header configuration published.");

      // Instant live broadcast for Header.tsx
      window.dispatchEvent(
        new CustomEvent("smc:header-updated", { detail: payload })
      );
      if (typeof BroadcastChannel !== "undefined") {
        const channel = new BroadcastChannel("smc_header_sync");
        channel.postMessage(payload);
        channel.close();
      }
    } catch {
      toast.error("Network error while saving header configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ieee-smc-2027-header-config.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported header JSON.");
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const normalized = normalizeHeaderConfig(parsed);
      setConfig(normalized);
      if (normalized.navLinks[0]) {
        setActiveTriggerId(normalized.navLinks[0].id);
      }
      setSelectedTarget(null);
      toast.success("Imported header JSON. Click Save Changes to publish.");
    } catch {
      toast.error("Invalid JSON configuration file.");
    } finally {
      e.target.value = "";
    }
  };

  const handleResetDefaults = () => {
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

          <div className="hidden md:flex items-center gap-2 pr-2 border-r border-slate-200">
            <LayoutTemplate className="w-4 h-4 text-[#115eff]" />
            <span className="text-sm font-extrabold text-[#004776] tracking-tight">
              Header Studio
            </span>
          </div>

          {/* Canvas vs General Mode Switcher */}
          <div className="inline-flex rounded-md bg-slate-100 p-0.5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                if (selectedTarget?.type === "general") {
                  setSelectedTarget(null);
                }
              }}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold transition-all cursor-pointer",
                selectedTarget?.type !== "general"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              Canvas
            </button>
            <button
              type="button"
              onClick={() => setSelectedTarget({ type: "general" })}
              className={cn(
                "px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer",
                selectedTarget?.type === "general"
                  ? "bg-white text-[#004776] shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>General & Top Bar</span>
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
            <Badge variant="warning" size="sm">
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
            className="h-8 px-3.5 text-xs font-bold bg-[#004776] hover:bg-[#00365a] text-white shadow-xs"
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

      {/* Main Studio Body: Left Palette + Center Dot-Grid Artboard */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {paletteOpen && (
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
        )}

        {/* Center Dot-Grid Workspace */}
        <div
          ref={canvasScrollRef}
          className="flex-1 overflow-auto relative"
          style={{
            backgroundColor: "#f8fafc",
            backgroundImage: "radial-gradient(#cbd5e1 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center gap-2.5 text-sm font-medium text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-[#115eff]" />
              Loading Header Studio...
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
                onConvertTriggerToMega={handleConvertTriggerToMega}
                onDropPaletteBlock={handleDropPaletteBlock}
              />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Docked Inspector Drawer */}
      <HeaderInspector
        config={config}
        target={selectedTarget}
        onClose={() => setSelectedTarget(null)}
        onUpdateConfig={updateConfig}
        onDeleteColumn={handleDeleteColumn}
        onDeleteTrigger={handleDeleteTrigger}
      />
    </div>
  );
}
