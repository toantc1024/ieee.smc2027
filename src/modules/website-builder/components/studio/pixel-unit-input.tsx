"use client";

import React, { useState } from "react";
import { ChevronDown, Minus, Plus, RotateCcw } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const LEGACY_SPACING_MAP: Record<string, string> = {
  "pt-0": "0px",
  "pt-4": "16px",
  "pt-8": "32px",
  "pt-12": "48px",
  "pt-16": "64px",
  "pb-0": "0px",
  "pb-4": "16px",
  "pb-8": "32px",
  "pb-12": "48px",
  "pb-16": "64px",
};

const POSITIVE_PRESETS = [0, 8, 16, 24, 32, 48, 64, 80, 96, 120];
const NEGATIVE_PRESETS = [-64, -32, -16, -8];

interface PixelUnitInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  allowNegative?: boolean;
  step?: number;
  min?: number;
  max?: number;
}

function normalizeSpacingValue(raw?: string): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (LEGACY_SPACING_MAP[trimmed]) return LEGACY_SPACING_MAP[trimmed];
  return trimmed;
}

function parseNumericPixels(raw: string): number | null {
  if (!raw) return null;
  const match = raw.match(/^(-?\d+(?:\.\d+)?)(px)?$/i);
  if (!match) return null;
  return Number(match[1]);
}

export function PixelUnitInput({
  label,
  value,
  onChange,
  allowNegative = false,
  step = 4,
  min = allowNegative ? -240 : 0,
  max = 320,
}: PixelUnitInputProps) {
  const [open, setOpen] = useState(false);
  const normalized = normalizeSpacingValue(value);
  const numeric = parseNumericPixels(normalized);
  const displayNumber = numeric !== null ? String(numeric) : normalized.replace(/px$/i, "");

  const commitNumeric = (next: number) => {
    const clamped = Math.max(min, Math.min(max, Math.round(next)));
    onChange(`${clamped}px`);
  };

  const handleStep = (delta: number) => {
    const base = numeric ?? 0;
    commitNumeric(base + delta);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (!raw) {
      onChange("");
      return;
    }
    if (/^-?\d+$/.test(raw)) {
      const n = Number(raw);
      const clamped = Math.max(min, Math.min(max, n));
      onChange(`${clamped}px`);
      return;
    }
    if (raw === "-" && allowNegative) {
      onChange("-0px");
      return;
    }
    onChange(raw);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] font-semibold text-slate-700 truncate">{label}</span>
        {normalized && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[10px] font-medium text-slate-400 hover:text-blue-600 flex items-center gap-0.5 transition-colors cursor-pointer"
            title="Reset to default"
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>Auto</span>
          </button>
        )}
      </div>

      <div className="flex items-center h-8 rounded-lg border border-slate-200 bg-white focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-500/15 overflow-hidden">
        <button
          type="button"
          onClick={() => handleStep(-step)}
          className="h-full px-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 border-r border-slate-100"
          aria-label={`Decrease ${label}`}
        >
          <Minus className="w-3 h-3" />
        </button>

        <input
          type="text"
          inputMode="numeric"
          value={displayNumber}
          onChange={handleInputChange}
          placeholder="Auto"
          aria-label={label}
          className="w-full min-w-0 h-full px-2 text-center text-xs font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-normal bg-transparent focus:outline-none"
        />

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="h-full px-1.5 text-[10px] font-bold text-slate-500 hover:text-blue-600 hover:bg-slate-50 flex items-center gap-0.5 border-l border-slate-100 transition-colors cursor-pointer shrink-0"
              aria-label={`${label} presets`}
            >
              <span>px</span>
              <ChevronDown className="w-2.5 h-2.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-52 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700">{label}</span>
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-[10px] font-semibold text-blue-600 hover:underline cursor-pointer"
              >
                Default
              </button>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {POSITIVE_PRESETS.map((preset) => {
                const active = numeric === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      commitNumeric(preset);
                      setOpen(false);
                    }}
                    className={cn(
                      "h-7 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer",
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                    )}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
            {allowNegative && (
              <div className="pt-1.5 border-t border-slate-100 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 block">Negative Offset</span>
                <div className="grid grid-cols-4 gap-1">
                  {NEGATIVE_PRESETS.map((preset) => {
                    const active = numeric === preset;
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          commitNumeric(preset);
                          setOpen(false);
                        }}
                        className={cn(
                          "h-7 rounded-md text-[11px] font-semibold border transition-colors cursor-pointer",
                          active
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-slate-50 text-slate-700 border-slate-200 hover:border-blue-400 hover:text-blue-600"
                        )}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <button
          type="button"
          onClick={() => handleStep(step)}
          className="h-full px-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer shrink-0 border-l border-slate-100"
          aria-label={`Increase ${label}`}
        >
          <Plus className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

