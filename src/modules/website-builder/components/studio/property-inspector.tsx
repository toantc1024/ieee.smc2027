"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ChevronRight,
  Code2,
  Eye,
  EyeOff,
  FileEdit,
  Layers,
  Paintbrush,
  Sliders,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useBuilderStore } from "../../store/builder-store";
import { getBlockDefinition } from "../../registry";
import type { FieldDefinition, PageBlock } from "../../types";
import { InspectorField, type FieldPath } from "./inspector-fields";
import { PixelUnitInput } from "./pixel-unit-input";
import { UnifiedColorPicker } from "./unified-color-picker";
import { setFieldValue } from "../../utils/field-values";
import { findBlock } from "../../utils/block-tree";
import { isBlockHidden } from "../../utils/block-presentation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function PropertyInspector() {
  const {
    selectedBlockId,
    data,
    updateBlockStyles,
    toggleBlockHidden,
    removeBlock,
    inspectorTab,
    setInspectorTab,
  } = useBuilderStore();

  const selectedBlock = findBlock(data.content, selectedBlockId);

  if (!selectedBlock) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center select-none bg-white">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3 text-blue-600 shadow-2xs">
          <Sliders className="w-5 h-5" />
        </div>
        <p className="text-sm font-bold text-slate-800">No Block Selected</p>
        <p className="text-xs text-slate-500 mt-1 max-w-[220px] leading-relaxed">
          Click any section on the canvas or in the Layers tree to edit its content, media, and styles.
        </p>
      </div>
    );
  }

  const def = getBlockDefinition(selectedBlock.type);
  const Icon = def?.icon || Layers;
  const props = selectedBlock.props || {};
  const mergedStyles = {
    ...(selectedBlock.styles || {}),
    ...(props._styles || {}),
  } as Record<string, any>;
  const isHidden = isBlockHidden(selectedBlock);
  const isJsonOpen = inspectorTab === "json";
  const shortId = selectedBlock.id.slice(-6);

  return (
    <div className="h-full flex flex-col bg-white select-none">
      {/* HCM-UTE Inspector Top Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate leading-tight">
              {def?.label || selectedBlock.type}
            </h4>
            <p className="text-xs font-medium text-slate-400 truncate mt-0.5">
              #{shortId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => toggleBlockHidden(selectedBlock.id)}
            className={cn(
              "h-7 px-2.5 rounded-md border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer",
              isHidden
                ? "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
            )}
            title={isHidden ? "Show section on page" : "Hide section on page"}
          >
            {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{isHidden ? "Hidden" : "Hide"}</span>
          </button>

          <button
            type="button"
            onClick={() => setInspectorTab(isJsonOpen ? "content" : "json")}
            className={cn(
              "h-7 px-2.5 rounded-md border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer",
              isJsonOpen
                ? "border-blue-600 bg-blue-600 text-white shadow-2xs"
                : "border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600"
            )}
            title="Toggle JSON Data Editor"
          >
            <Code2 className="w-3 h-3" />
            <span>JSON</span>
          </button>

          <button
            type="button"
            onClick={() => {
              removeBlock(selectedBlock.id);
              toast.success(`Removed "${def?.label || selectedBlock.type}"`);
            }}
            className="h-7 w-7 rounded-md border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Delete Block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Pill Tabs: Content | Styles */}
      {!isJsonOpen && (
        <div className="grid grid-cols-2 p-2 border-b border-slate-200 bg-slate-50/80 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setInspectorTab("content")}
            className={cn(
              "h-9 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
              inspectorTab === "content"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-white border border-slate-200/80 text-slate-600 font-semibold hover:text-slate-900"
            )}
          >
            <FileEdit className="w-4 h-4" />
            <span>Content</span>
          </button>
          <button
            type="button"
            onClick={() => setInspectorTab("styles")}
            className={cn(
              "h-9 rounded-lg text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer",
              inspectorTab === "styles"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "bg-white border border-slate-200/80 text-slate-600 font-semibold hover:text-slate-900"
            )}
          >
            <Paintbrush className="w-4 h-4" />
            <span>Styles</span>
          </button>
        </div>
      )}

      {/* Hidden Block Banner */}
      {isHidden && !isJsonOpen && (
        <div className="mx-3.5 mt-3 rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <EyeOff className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="text-xs font-semibold text-amber-800 truncate">
              Hidden from public website
            </span>
          </div>
          <button
            type="button"
            onClick={() => toggleBlockHidden(selectedBlock.id)}
            className="px-2 py-0.5 rounded-md bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            Show
          </button>
        </div>
      )}

      {/* Scrollable Inspector Body */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {inspectorTab === "content" && (
          <ContentFields
            key={selectedBlock.id}
            block={selectedBlock}
            onOpenStyles={() => setInspectorTab("styles")}
          />
        )}

        {inspectorTab === "styles" && (
          <StylesInspectorPanel
            block={selectedBlock}
            mergedStyles={mergedStyles}
            isHidden={isHidden}
            onToggleHidden={() => toggleBlockHidden(selectedBlock.id)}
            onUpdateStyles={(next) => updateBlockStyles(selectedBlock.id, next)}
          />
        )}

        {inspectorTab === "json" && (
          <BlockJsonEditor key={selectedBlock.id} block={selectedBlock} />
        )}
      </div>
    </div>
  );
}

function StylesInspectorPanel({
  block,
  mergedStyles,
  isHidden,
  onToggleHidden,
  onUpdateStyles,
}: {
  block: PageBlock;
  mergedStyles: Record<string, any>;
  isHidden: boolean;
  onToggleHidden: () => void;
  onUpdateStyles: (styles: Record<string, any>) => void;
}) {
  const hideSideBorders =
    (mergedStyles.hideTwoSideBorders ?? block.props?.hideTwoSideBorders ?? true) !== false;
  const textAlign = mergedStyles.textAlign || "";
  const backgroundValue =
    mergedStyles.backgroundGradient || mergedStyles.backgroundColor || "";

  return (
    <div className="space-y-4 p-4 select-text">
      {/* Visibility & Side Borders */}
      <div className="space-y-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="inspector-visible-switch" className="text-sm font-semibold text-slate-800 cursor-pointer">
              Visible on Website
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              Display this section to visitors on the live page.
            </p>
          </div>
          <Switch
            id="inspector-visible-switch"
            checked={!isHidden}
            onCheckedChange={() => onToggleHidden()}
          />
        </div>

        <div className="border-t border-slate-200/80 pt-2.5 flex items-center justify-between gap-3">
          <div>
            <Label htmlFor="section-side-borders" className="text-sm font-semibold text-slate-800 cursor-pointer">
              Hide Side Borders
            </Label>
            <p className="text-xs text-slate-500 mt-0.5">
              Remove vertical frame lines on the left and right edges.
            </p>
          </div>
          <Switch
            id="section-side-borders"
            checked={hideSideBorders}
            onCheckedChange={(checked) =>
              onUpdateStyles({ hideTwoSideBorders: checked })
            }
          />
        </div>
      </div>

      {/* Colors & Gradients */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5">
        <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Colors & Background
        </h5>

        <UnifiedColorPicker
          label="Section Background"
          value={backgroundValue}
          allowGradient
          placeholder="Default Background"
          onChange={(val) => {
            if (val.includes("gradient(")) {
              onUpdateStyles({ backgroundGradient: val, backgroundColor: val });
            } else {
              onUpdateStyles({ backgroundGradient: "", backgroundColor: val });
            }
          }}
        />

        <UnifiedColorPicker
          label="Text Color"
          value={mergedStyles.textColor || ""}
          placeholder="Inherit Default"
          onChange={(val) => onUpdateStyles({ textColor: val })}
        />
      </div>

      {/* Text Alignment */}
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3.5">
        <div className="flex items-center justify-between">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Text Alignment
          </h5>
          {textAlign && (
            <button
              type="button"
              onClick={() => onUpdateStyles({ textAlign: "" })}
              className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              Auto
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 border border-slate-200/80">
          {[
            { value: "left", label: "Left", icon: AlignLeft },
            { value: "center", label: "Center", icon: AlignCenter },
            { value: "right", label: "Right", icon: AlignRight },
          ].map((item) => {
            const AlignIcon = item.icon;
            const active = textAlign === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() =>
                  onUpdateStyles({ textAlign: active ? "" : item.value })
                }
                className={cn(
                  "h-7 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer",
                  active
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                <AlignIcon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spacing Controls */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-3.5">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Section Spacing
        </h5>
        <div className="grid grid-cols-2 gap-3">
          <PixelUnitInput
            label="Top Padding"
            value={mergedStyles.paddingTop || ""}
            onChange={(val) => onUpdateStyles({ paddingTop: val })}
          />
          <PixelUnitInput
            label="Bottom Padding"
            value={mergedStyles.paddingBottom || ""}
            onChange={(val) => onUpdateStyles({ paddingBottom: val })}
          />
          <PixelUnitInput
            label="Top Margin"
            value={mergedStyles.marginTop || ""}
            allowNegative
            onChange={(val) => onUpdateStyles({ marginTop: val })}
          />
          <PixelUnitInput
            label="Bottom Margin"
            value={mergedStyles.marginBottom || ""}
            allowNegative
            onChange={(val) => onUpdateStyles({ marginBottom: val })}
          />
        </div>
      </div>

      {/* Custom CSS */}
      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3.5">
        <Label htmlFor="custom-css-classes" className="text-sm font-semibold text-slate-700">
          Custom CSS Classes
        </Label>
        <Input
          id="custom-css-classes"
          value={mergedStyles.className || mergedStyles.customClass || ""}
          onChange={(e) =>
            onUpdateStyles({ className: e.target.value, customClass: e.target.value })
          }
          placeholder="py-12 bg-slate-50"
          className="text-sm h-9 bg-white"
        />
      </div>
    </div>
  );
}

function BlockJsonEditor({ block }: { block: PageBlock }) {
  const [text, setText] = useState(() => JSON.stringify(block, null, 2));
  const [error, setError] = useState("");
  const replaceBlock = useBuilderStore((state) => state.replaceBlock);
  const setInspectorTab = useBuilderStore((state) => state.setInspectorTab);

  function apply() {
    try {
      const parsed = JSON.parse(text);
      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed) ||
        parsed.id !== block.id ||
        typeof parsed.type !== "string" ||
        !getBlockDefinition(parsed.type) ||
        !parsed.props ||
        typeof parsed.props !== "object" ||
        Array.isArray(parsed.props) ||
        (parsed.hidden !== undefined && typeof parsed.hidden !== "boolean")
      ) {
        throw new Error(
          "Keep the section ID and provide a supported type, an object of properties, and a boolean visibility value."
        );
      }
      replaceBlock(block.id, parsed);
      setError("");
      toast.success("Updated section JSON");
    } catch (err) {
      setError(
        err instanceof SyntaxError
          ? "Invalid JSON. Check commas, brackets, and quotation marks."
          : err instanceof Error
            ? err.message
            : "Could not apply section data."
      );
    }
  }

  return (
    <div className="space-y-3 p-4 select-text">
      <div className="flex items-center justify-between">
        <Label htmlFor="block-json" className="text-xs font-bold text-slate-800">
          Raw Block JSON
        </Label>
        <button
          type="button"
          onClick={() => setInspectorTab("content")}
          className="text-[11px] font-semibold text-blue-600 hover:underline cursor-pointer"
        >
          Back to Inspector
        </button>
      </div>
      <Textarea
        id="block-json"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setError("");
        }}
        spellCheck={false}
        className="min-h-[360px] resize-y bg-slate-950 font-mono text-[11px] leading-relaxed text-slate-100"
      />
      {error && (
        <p role="alert" className="text-xs font-medium text-rose-600">
          {error}
        </p>
      )}
      <Button
        type="button"
        onClick={apply}
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
      >
        Apply JSON
      </Button>
    </div>
  );
}

function ContentFields({
  block,
  onOpenStyles,
}: {
  block: PageBlock;
  onOpenStyles: () => void;
}) {
  const definition = getBlockDefinition(block.type);
  const fields = definition?.fields || {};
  const entries = Object.entries(fields) as [string, FieldDefinition][];

  function onChange(path: FieldPath, value: unknown) {
    const current = findBlock(useBuilderStore.getState().data.content, block.id);
    if (!current) return;
    const rootKey = String(path[0]);
    const rawRoot =
      current.props[rootKey] ??
      definition?.defaultProps[rootKey] ??
      fields[rootKey]?.defaultValue;
    const rootValue = rawRoot !== undefined ? structuredClone(rawRoot) : undefined;
    const updated =
      path.length === 1 ? value : setFieldValue(rootValue, path.slice(1), value);
    useBuilderStore.getState().updateBlockProps(block.id, { [rootKey]: updated });
  }

  return (
    <div className="select-text">
      {/* Quick Styles Shortcut Banner */}
      <div className="px-4 pt-3.5">
        <button
          type="button"
          onClick={onOpenStyles}
          className="w-full flex items-center justify-between gap-2 rounded-xl border border-blue-100 bg-blue-50/60 hover:bg-blue-50 px-3.5 py-2.5 text-left transition-colors cursor-pointer group"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Paintbrush className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-sm font-semibold text-blue-800 truncate">
              Customize colors, spacing & borders
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="p-4 text-xs leading-relaxed text-slate-500 space-y-2">
          {block.type === "HeaderSection" ? (
            <Link
              href="/admin/header"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
            >
              <span>Edit navigation in Header settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : block.type === "FooterSection" ? (
            <Link
              href="/admin/footer"
              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:underline"
            >
              <span>Edit links in Footer settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <p>
              This section uses shared global data. Switch to the Styles tab to customize spacing, colors, and visibility.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-5 p-4">
          {entries.map(([key, field]) => (
            <InspectorField
              key={key}
              field={field}
              value={
                block.props[key] ??
                definition?.defaultProps[key] ??
                field.defaultValue ??
                ""
              }
              path={[key]}
              onChange={onChange}
              onBusyChange={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
