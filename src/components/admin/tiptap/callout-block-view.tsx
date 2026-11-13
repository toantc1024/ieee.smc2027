"use client";

import React from "react";
import type { NodeViewProps } from "@tiptap/react";
import {
  Info,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BlockWrapper } from "./block-wrapper";
import type { CalloutBlockAttrs, CalloutVariant } from "./callout-block-extension";

const VARIANT_CONFIG: Record<
  CalloutVariant,
  {
    label: string;
    boxClass: string;
    iconClass: string;
    Icon: React.ComponentType<{ className?: string }>;
  }
> = {
  info: {
    label: "Info",
    boxClass: "bg-blue-50/80 border-blue-200 text-slate-800",
    iconClass: "bg-blue-600 text-white",
    Icon: Info,
  },
  warning: {
    label: "Warning",
    boxClass: "bg-amber-50/80 border-amber-200 text-slate-800",
    iconClass: "bg-amber-500 text-white",
    Icon: AlertTriangle,
  },
  success: {
    label: "Success",
    boxClass: "bg-emerald-50/80 border-emerald-200 text-slate-800",
    iconClass: "bg-emerald-600 text-white",
    Icon: CheckCircle2,
  },
  danger: {
    label: "Urgent",
    boxClass: "bg-rose-50/80 border-rose-200 text-slate-800",
    iconClass: "bg-rose-600 text-white",
    Icon: AlertCircle,
  },
};

export function CalloutBlockView({
  node,
  updateAttributes,
  deleteNode,
  selected,
}: NodeViewProps) {
  const attrs = node.attrs as CalloutBlockAttrs;
  const variant: CalloutVariant = attrs.variant || "info";
  const title = attrs.title ?? "Important Notice";
  const text = attrs.text ?? "";
  const width = Number(attrs.width) || 100;

  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.info;
  const IconComp = cfg.Icon;

  return (
    <BlockWrapper
      selected={selected}
      label="Callout Block"
      badge={cfg.label}
      icon={<IconComp className="size-3.5" />}
      width={width}
      onWidthChange={(w) => updateAttributes({ width: w })}
      onDelete={deleteNode}
      headerActions={
        <div className="flex items-center gap-0.5 mr-1">
          {(Object.keys(VARIANT_CONFIG) as CalloutVariant[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateAttributes({ variant: v });
              }}
              className={cn(
                "h-5 px-1.5 rounded text-[10px] font-semibold transition-colors cursor-pointer",
                variant === v
                  ? selected
                    ? "bg-white text-blue-600"
                    : "bg-blue-600 text-white"
                  : selected
                    ? "text-blue-100 hover:text-white"
                    : "text-slate-500 hover:bg-slate-200/70"
              )}
            >
              {VARIANT_CONFIG[v].label}
            </button>
          ))}
        </div>
      }
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn("p-4 sm:p-5 flex items-start gap-3.5", cfg.boxClass)}
      >
        <div
          className={cn(
            "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
            cfg.iconClass
          )}
        >
          <IconComp className="size-4" />
        </div>
        <div className="flex-1 space-y-1.5 min-w-0">
          <input
            type="text"
            value={title}
            onChange={(e) => updateAttributes({ title: e.target.value })}
            placeholder="Callout title..."
            className="w-full font-bold text-sm sm:text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-200/85 focus:border-blue-600 focus:outline-none pb-0.5"
          />
          <textarea
            value={text}
            onChange={(e) => updateAttributes({ text: e.target.value })}
            placeholder="Callout message..."
            rows={2}
            className="w-full text-xs sm:text-sm text-slate-700 bg-transparent border border-transparent hover:border-slate-200/85 focus:border-blue-600 rounded p-1 -ml-1 focus:outline-none resize-y"
          />
        </div>
      </div>
    </BlockWrapper>
  );
}
