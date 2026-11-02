"use client";

import React from "react";
import {
  Sliders,
  Paintbrush,
  Code2,
  Trash2,
  Plus,
  X,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useBuilderStore } from "../../store/builder-store";
import { getBlockDefinition } from "../../registry";
import type { FieldDefinition, InspectorTab } from "../../types";
import { cn } from "@/lib/utils";

export function PropertyInspector() {
  const {
    selectedBlockId,
    data,
    updateBlockProps,
    updateBlockStyles,
    removeBlock,
    inspectorTab,
    setInspectorTab,
  } = useBuilderStore();

  const selectedBlock = data.content.find((b) => b.id === selectedBlockId);

  if (!selectedBlock) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400 select-none">
        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
          <Layers className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-600">No Section Selected</p>
        <p className="text-[11px] text-slate-400 mt-1 max-w-[200px]">
          Click any section on the canvas to configure its content, typography, and styling.
        </p>
      </div>
    );
  }

  const def = getBlockDefinition(selectedBlock.type);
  const Icon = def?.icon || Layers;
  const props = selectedBlock.props || {};

  const handleFieldChange = (fieldName: string, value: any) => {
    updateBlockProps(selectedBlock.id, { [fieldName]: value });
  };

  const renderField = (fieldName: string, fieldDef: FieldDefinition) => {
    const value = props[fieldName] !== undefined ? props[fieldName] : fieldDef.defaultValue ?? "";

    switch (fieldDef.type) {
      case "text":
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              {fieldDef.label}
            </Label>
            <Input
              value={value || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="text-xs h-8"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              {fieldDef.label}
            </Label>
            <Textarea
              value={value || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="text-xs min-h-[70px] resize-none"
            />
          </div>
        );

      case "number":
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              {fieldDef.label}
            </Label>
            <Input
              type="number"
              min={fieldDef.min}
              max={fieldDef.max}
              step={fieldDef.step || 1}
              value={value ?? 0}
              onChange={(e) => handleFieldChange(fieldName, Number(e.target.value))}
              className="text-xs h-8"
            />
          </div>
        );

      case "switch":
        return (
          <div key={fieldName} className="flex items-center justify-between py-1">
            <Label className="text-xs font-medium text-slate-700 cursor-pointer">
              {fieldDef.label}
            </Label>
            <Switch
              checked={Boolean(value)}
              onCheckedChange={(checked) => handleFieldChange(fieldName, checked)}
            />
          </div>
        );

      case "select":
        return (
          <div key={fieldName} className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-700">
              {fieldDef.label}
            </Label>
            <select
              value={value || ""}
              onChange={(e) => handleFieldChange(fieldName, e.target.value)}
              className="w-full text-xs rounded-md border border-slate-200 bg-white py-1.5 px-2 text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {fieldDef.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case "array":
        const items = Array.isArray(value) ? value : [];
        return (
          <div key={fieldName} className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-800">
                {fieldDef.label} ({items.length})
              </Label>
              <button
                type="button"
                onClick={() => {
                  const defaultItem: Record<string, any> = {};
                  if (fieldDef.arrayFields) {
                    Object.entries(fieldDef.arrayFields).forEach(([k, v]) => {
                      defaultItem[k] = v.defaultValue ?? "";
                    });
                  }
                  handleFieldChange(fieldName, [...items, defaultItem]);
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Item
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs relative space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 text-[10px]">
                      Item #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = [...items];
                        next.splice(idx, 1);
                        handleFieldChange(fieldName, next);
                      }}
                      className="text-slate-400 hover:text-rose-600"
                      title="Remove Item"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {fieldDef.arrayFields &&
                    Object.entries(fieldDef.arrayFields).map(([subKey, subDef]) => (
                      <div key={subKey} className="space-y-1">
                        <Label className="text-[11px] text-slate-600">
                          {subDef.label}
                        </Label>
                        <Input
                          value={item[subKey] || ""}
                          onChange={(e) => {
                            const next = [...items];
                            next[idx] = { ...next[idx], [subKey]: e.target.value };
                            handleFieldChange(fieldName, next);
                          }}
                          className="h-7 text-xs bg-white"
                        />
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white select-none">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {def?.label || selectedBlock.type}
            </h4>
            <p className="text-[10px] text-slate-400 font-mono truncate">
              {selectedBlock.id}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => removeBlock(selectedBlock.id)}
          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
          title="Delete Section"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Segmented Tabs: Content, Styles, JSON */}
      <div className="grid grid-cols-3 p-1.5 border-b border-slate-200 bg-slate-50 gap-1 text-xs font-semibold text-slate-600">
        <button
          type="button"
          onClick={() => setInspectorTab("content")}
          className={cn(
            "py-1 rounded-md transition-all flex items-center justify-center gap-1.5",
            inspectorTab === "content" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
          )}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Content</span>
        </button>
        <button
          type="button"
          onClick={() => setInspectorTab("styles")}
          className={cn(
            "py-1 rounded-md transition-all flex items-center justify-center gap-1.5",
            inspectorTab === "styles" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
          )}
        >
          <Paintbrush className="w-3.5 h-3.5" />
          <span>Styles</span>
        </button>
        <button
          type="button"
          onClick={() => setInspectorTab("json")}
          className={cn(
            "py-1 rounded-md transition-all flex items-center justify-center gap-1.5",
            inspectorTab === "json" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
          )}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>JSON</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {inspectorTab === "content" && (
          <div className="space-y-4">
            {def?.fields && Object.keys(def.fields).length > 0 ? (
              Object.entries(def.fields).map(([fieldName, fieldDef]) =>
                renderField(fieldName, fieldDef)
              )
            ) : (
              <p className="text-xs text-slate-400 italic">
                This section uses default conference settings and requires no additional properties.
              </p>
            )}
          </div>
        )}

        {inspectorTab === "styles" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Custom CSS Classes
              </Label>
              <Input
                value={props._styles?.className || ""}
                onChange={(e) =>
                  updateBlockStyles(selectedBlock.id, { className: e.target.value })
                }
                placeholder="e.g. py-16 bg-slate-50"
                className="text-xs h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-700">
                Background Color Override
              </Label>
              <Input
                value={props._styles?.backgroundColor || ""}
                onChange={(e) =>
                  updateBlockStyles(selectedBlock.id, {
                    backgroundColor: e.target.value,
                  })
                }
                placeholder="#ffffff or transparent"
                className="text-xs h-8"
              />
            </div>
          </div>
        )}

        {inspectorTab === "json" && (
          <div className="space-y-2">
            <Label className="text-xs font-medium text-slate-700">
              Raw Section AST
            </Label>
            <pre className="p-3 rounded-lg bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto max-h-[400px]">
              {JSON.stringify(selectedBlock, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
