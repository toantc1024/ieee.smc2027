"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Pipette, Plus, RotateCcw, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SOLID_SWATCHES = [
  "#FFFFFF",
  "#F8FAFC",
  "#F1F5F9",
  "#E2E8F0",
  "#004776",
  "#00558F",
  "#1154A0",
  "#2563EB",
  "#3B82F6",
  "#DBEAFE",
  "#05225C",
  "#082445",
  "#D97706",
  "#F59E0B",
  "#FEF3C7",
  "#059669",
  "#10B981",
  "#E11D48",
];

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #004776 0%, #1154A0 50%, #2563EB 100%)",
  "linear-gradient(135deg, #05225C 0%, #004776 100%)",
  "linear-gradient(180deg, #F8FAFC 0%, #EFF6FF 100%)",
  "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)",
  "linear-gradient(135deg, #004776 0%, #0F766E 100%)",
  "linear-gradient(135deg, #FEF3C7 0%, #FFFBEB 100%)",
];

interface GradientStop {
  id: string;
  color: string;
  position: number;
}

interface ParsedGradient {
  type: "linear" | "radial";
  angle: number;
  stops: GradientStop[];
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number; a: number } {
  const clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
      a: 1,
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
      a: 1,
    };
  }
  if (clean.length === 8) {
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
      a: Number((parseInt(clean.slice(6, 8), 16) / 255).toFixed(2)),
    };
  }
  return { r: 37, g: 99, b: 235, a: 1 };
}

function parseCssColor(value: string): { r: number; g: number; b: number; a: number } {
  if (!value) return { r: 255, g: 255, b: 255, a: 1 };
  const trimmed = value.trim();
  if (trimmed.startsWith("#")) return hexToRgb(trimmed);
  const rgbaMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbaMatch) {
    return {
      r: clamp(Number(rgbaMatch[1]), 0, 255),
      g: clamp(Number(rgbaMatch[2]), 0, 255),
      b: clamp(Number(rgbaMatch[3]), 0, 255),
      a: rgbaMatch[4] !== undefined ? clamp(Number(rgbaMatch[4]), 0, 1) : 1,
    };
  }
  return { r: 37, g: 99, b: 235, a: 1 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h: Math.round(h), s: Math.round(s), v: Math.round(v) };
}

function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const sn = clamp(s, 0, 100) / 100;
  const vn = clamp(v, 0, 100) / 100;
  const c = vn * sn;
  const hh = ((h % 360) + 360) % 360 / 60;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  let r1 = 0, g1 = 0, b1 = 0;
  if (hh >= 0 && hh < 1) [r1, g1, b1] = [c, x, 0];
  else if (hh >= 1 && hh < 2) [r1, g1, b1] = [x, c, 0];
  else if (hh >= 2 && hh < 3) [r1, g1, b1] = [0, c, x];
  else if (hh >= 3 && hh < 4) [r1, g1, b1] = [0, x, c];
  else if (hh >= 4 && hh < 5) [r1, g1, b1] = [x, 0, c];
  else [r1, g1, b1] = [c, 0, x];
  const m = vn - c;
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function formatCssColor(r: number, g: number, b: number, a: number): string {
  if (a >= 0.995) return rgbToHex(r, g, b);
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Number(a.toFixed(2))})`;
}

function parseGradientString(input: string): ParsedGradient {
  const isRadial = /^radial-gradient/i.test(input.trim());
  const angleMatch = input.match(/(\d+)deg/i);
  const angle = angleMatch ? clamp(Number(angleMatch[1]), 0, 360) : 135;
  const stopMatches = [...input.matchAll(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))\s+(\d+)%/g)];
  const stops: GradientStop[] =
    stopMatches.length >= 2
      ? stopMatches.map((m, idx) => ({
          id: `stop-${idx}`,
          color: m[1].toUpperCase(),
          position: clamp(Number(m[2]), 0, 100),
        }))
      : [
          { id: "stop-0", color: "#004776", position: 0 },
          { id: "stop-1", color: "#2563EB", position: 100 },
        ];
  return {
    type: isRadial ? "radial" : "linear",
    angle,
    stops,
  };
}

function buildGradientString(g: ParsedGradient): string {
  const ordered = [...g.stops].sort((a, b) => a.position - b.position);
  const stopsText = ordered.map((s) => `${s.color} ${Math.round(s.position)}%`).join(", ");
  if (g.type === "radial") {
    return `radial-gradient(circle, ${stopsText})`;
  }
  return `linear-gradient(${Math.round(g.angle)}deg, ${stopsText})`;
}

interface UnifiedColorPickerProps {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  allowGradient?: boolean;
  placeholder?: string;
}

export function UnifiedColorPicker({
  label,
  value = "",
  onChange,
  allowGradient = false,
  placeholder = "Default",
}: UnifiedColorPickerProps) {
  const isGradientValue = value.includes("gradient(");
  const [mode, setMode] = useState<"solid" | "gradient">(
    allowGradient && isGradientValue ? "gradient" : "solid"
  );

  const parsedSolid = parseCssColor(isGradientValue ? "#004776" : value || "#FFFFFF");
  const initialHsv = rgbToHsv(parsedSolid.r, parsedSolid.g, parsedSolid.b);
  const [hsv, setHsv] = useState(initialHsv);
  const [alpha, setAlpha] = useState(parsedSolid.a);
  const [hexDraft, setHexDraft] = useState(rgbToHex(parsedSolid.r, parsedSolid.g, parsedSolid.b));

  const [gradient, setGradient] = useState<ParsedGradient>(() =>
    parseGradientString(isGradientValue ? value : GRADIENT_PRESETS[0])
  );
  const [activeStopId, setActiveStopId] = useState<string>("stop-0");

  const svBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) return;
    if (value.includes("gradient(")) {
      if (allowGradient) {
        setMode("gradient");
        setGradient(parseGradientString(value));
      }
      return;
    }
    const rgb = parseCssColor(value);
    setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
    setAlpha(rgb.a);
    setHexDraft(rgbToHex(rgb.r, rgb.g, rgb.b));
  }, [value, allowGradient]);

  const applyHsvAndAlpha = useCallback(
    (nextHsv: { h: number; s: number; v: number }, nextAlpha: number) => {
      setHsv(nextHsv);
      setAlpha(nextAlpha);
      const rgb = hsvToRgb(nextHsv.h, nextHsv.s, nextHsv.v);
      const formatted = formatCssColor(rgb.r, rgb.g, rgb.b, nextAlpha);
      setHexDraft(rgbToHex(rgb.r, rgb.g, rgb.b));

      if (mode === "gradient" && allowGradient) {
        setGradient((prev) => {
          const updated: ParsedGradient = {
            ...prev,
            stops: prev.stops.map((s) =>
              s.id === activeStopId ? { ...s, color: formatted } : s
            ),
          };
          onChange(buildGradientString(updated));
          return updated;
        });
      } else {
        onChange(formatted);
      }
    },
    [mode, allowGradient, activeStopId, onChange]
  );

  const handleSvPointer = (clientX: number, clientY: number) => {
    const rect = svBoxRef.current?.getBoundingClientRect();
    if (!rect) return;
    const s = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
    const v = clamp(100 - ((clientY - rect.top) / rect.height) * 100, 0, 100);
    applyHsvAndAlpha({ h: hsv.h, s: Math.round(s), v: Math.round(v) }, alpha);
  };

  const updateGradient = (next: ParsedGradient) => {
    setGradient(next);
    onChange(buildGradientString(next));
  };

  const selectGradientStop = (stop: GradientStop) => {
    setActiveStopId(stop.id);
    const rgb = parseCssColor(stop.color);
    setHsv(rgbToHsv(rgb.r, rgb.g, rgb.b));
    setAlpha(rgb.a);
    setHexDraft(rgbToHex(rgb.r, rgb.g, rgb.b));
  };

  const currentRgb = hsvToRgb(hsv.h, hsv.s, hsv.v);
  const pureHueRgb = hsvToRgb(hsv.h, 100, 100);

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-slate-900">{label}</span>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs font-bold text-slate-500 hover:text-[#004776] flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset color"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Choose ${label || "color"}`}
              className="h-10 flex-1 flex items-center gap-2.5 px-3 rounded-lg border border-slate-300 bg-white hover:border-slate-400 transition-colors text-left cursor-pointer min-w-0"
            >
              <span
                className="w-6 h-6 rounded-md border border-slate-300 shrink-0 shadow-2xs"
                style={{
                  background:
                    value ||
                    "repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%) 50% / 8px 8px",
                }}
              />
              <span className="text-sm font-bold text-slate-900 truncate flex-1">
                {value ? (isGradientValue ? "Gradient" : value) : placeholder}
              </span>
              <Pipette className="w-4 h-4 text-slate-500 shrink-0" />
            </button>
          </PopoverTrigger>

          <PopoverContent align="end" className="w-80 p-3.5 space-y-3">
            {allowGradient && (
              <div className="grid grid-cols-2 p-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("solid");
                    const formatted = formatCssColor(currentRgb.r, currentRgb.g, currentRgb.b, alpha);
                    onChange(formatted);
                  }}
                  className={cn(
                    "py-1.5 rounded-md transition-colors cursor-pointer",
                    mode === "solid" ? "bg-[#004776] text-white shadow-xs font-bold" : "text-slate-700 hover:text-slate-900"
                  )}
                >
                  Solid
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("gradient");
                    onChange(buildGradientString(gradient));
                  }}
                  className={cn(
                    "py-1.5 rounded-md transition-colors cursor-pointer",
                    mode === "gradient" ? "bg-[#004776] text-white shadow-xs font-bold" : "text-slate-700 hover:text-slate-900"
                  )}
                >
                  Gradient
                </button>
              </div>
            )}

            {mode === "gradient" && allowGradient && (
              <div className="space-y-2.5 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 rounded-md bg-slate-100 p-0.5 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => updateGradient({ ...gradient, type: "linear" })}
                      className={cn(
                        "px-2 py-0.5 rounded cursor-pointer",
                        gradient.type === "linear" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500"
                      )}
                    >
                      Linear
                    </button>
                    <button
                      type="button"
                      onClick={() => updateGradient({ ...gradient, type: "radial" })}
                      className={cn(
                        "px-2 py-0.5 rounded cursor-pointer",
                        gradient.type === "radial" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500"
                      )}
                    >
                      Radial
                    </button>
                  </div>

                  {gradient.type === "linear" && (
                    <div className="flex items-center gap-1">
                      {[90, 135, 180].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() => updateGradient({ ...gradient, angle: deg })}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-semibold border cursor-pointer",
                            gradient.angle === deg
                              ? "bg-blue-50 border-blue-400 text-blue-700"
                              : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                          )}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Gradient Bar & Stops */}
                <div className="space-y-1.5">
                  <div
                    className="h-5 w-full rounded-md border border-slate-200 relative"
                    style={{ background: buildGradientString(gradient) }}
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {gradient.stops.map((stop) => {
                      const isStopActive = stop.id === activeStopId;
                      return (
                        <div
                          key={stop.id}
                          className={cn(
                            "flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold cursor-pointer",
                            isStopActive
                              ? "border-blue-600 bg-blue-50/70 text-blue-700"
                              : "border-slate-200 bg-white text-slate-600"
                          )}
                          onClick={() => selectGradientStop(stop)}
                        >
                          <span
                            className="w-3 h-3 rounded-xs border border-slate-300"
                            style={{ background: stop.color }}
                          />
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={stop.position}
                            onChange={(e) => {
                              const pos = clamp(Number(e.target.value) || 0, 0, 100);
                              updateGradient({
                                ...gradient,
                                stops: gradient.stops.map((s) =>
                                  s.id === stop.id ? { ...s, position: pos } : s
                                ),
                              });
                            }}
                            className="w-8 bg-transparent text-center focus:outline-none"
                          />
                          <span>%</span>
                          {gradient.stops.length > 2 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const remaining = gradient.stops.filter((s) => s.id !== stop.id);
                                setActiveStopId(remaining[0].id);
                                updateGradient({ ...gradient, stops: remaining });
                              }}
                              className="text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {gradient.stops.length < 5 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newStop: GradientStop = {
                            id: `stop-${Date.now()}`,
                            color: "#3B82F6",
                            position: 50,
                          };
                          setActiveStopId(newStop.id);
                          updateGradient({ ...gradient, stops: [...gradient.stops, newStop] });
                        }}
                        className="px-1.5 py-0.5 rounded-md border border-dashed border-slate-300 text-[10px] font-semibold text-blue-600 hover:border-blue-500 flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus className="w-2.5 h-2.5" />
                        <span>Stop</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Gradient Presets */}
                <div className="grid grid-cols-6 gap-1.5 pt-1">
                  {GRADIENT_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setGradient(parseGradientString(preset));
                        onChange(preset);
                      }}
                      className="h-6 rounded-md border border-slate-200 hover:scale-105 transition-transform cursor-pointer shadow-2xs"
                      style={{ background: preset }}
                      title="Apply gradient preset"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* 2D Saturation / Brightness Canvas */}
            <div
              ref={svBoxRef}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                handleSvPointer(e.clientX, e.clientY);
              }}
              onPointerMove={(e) => {
                if (e.buttons === 1) handleSvPointer(e.clientX, e.clientY);
              }}
              className="relative h-32 w-full rounded-lg overflow-hidden cursor-crosshair border border-slate-200 select-none touch-none"
              style={{
                backgroundColor: `rgb(${pureHueRgb.r}, ${pureHueRgb.g}, ${pureHueRgb.b})`,
                backgroundImage:
                  "linear-gradient(to top, #000000, transparent), linear-gradient(to right, #ffffff, transparent)",
              }}
            >
              <span
                className="absolute w-3.5 h-3.5 -ml-1.75 -mt-1.75 rounded-full border-2 border-white shadow-md ring-1 ring-slate-900/30 pointer-events-none"
                style={{
                  left: `${hsv.s}%`,
                  top: `${100 - hsv.v}%`,
                }}
              />
            </div>

            {/* Hue & Alpha Sliders */}
            <div className="space-y-2">
              <input
                type="range"
                aria-label="Hue"
                min={0}
                max={360}
                value={hsv.h}
                onChange={(e) =>
                  applyHsvAndAlpha({ ...hsv, h: Number(e.target.value) }, alpha)
                }
                className="w-full h-2.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background:
                    "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                }}
              />
              <input
                type="range"
                aria-label="Opacity"
                min={0}
                max={100}
                value={Math.round(alpha * 100)}
                onChange={(e) =>
                  applyHsvAndAlpha(hsv, Number(e.target.value) / 100)
                }
                className="w-full h-2 rounded-full appearance-none cursor-pointer bg-slate-200 accent-blue-600"
              />
            </div>

            {/* Hex + Alpha Input Row */}
            <div className="flex items-center gap-1.5">
              <Input
                value={hexDraft}
                aria-label="Hex color"
                onChange={(e) => {
                  const next = e.target.value;
                  setHexDraft(next);
                  if (/^#[0-9a-fA-F]{6}$/.test(next.trim())) {
                    const rgb = hexToRgb(next.trim());
                    applyHsvAndAlpha(rgbToHsv(rgb.r, rgb.g, rgb.b), alpha);
                  }
                }}
                className="h-8 text-xs font-semibold uppercase"
              />
              <div className="h-8 px-2 rounded-md border border-slate-200 bg-slate-50 flex items-center text-[11px] font-semibold text-slate-600 shrink-0">
                {Math.round(alpha * 100)}%
              </div>
            </div>

            {/* Swatches */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Theme Swatches
                </span>
                <button
                  type="button"
                  onClick={() => onChange("transparent")}
                  className="text-[10px] font-semibold text-slate-500 hover:text-blue-600 cursor-pointer"
                >
                  Transparent
                </button>
              </div>
              <div className="grid grid-cols-9 gap-1">
                {SOLID_SWATCHES.map((swatch) => (
                  <button
                    key={swatch}
                    type="button"
                    onClick={() => {
                      const rgb = hexToRgb(swatch);
                      setMode("solid");
                      applyHsvAndAlpha(rgbToHsv(rgb.r, rgb.g, rgb.b), 1);
                    }}
                    className={cn(
                      "w-6 h-6 rounded-md border transition-transform hover:scale-110 cursor-pointer",
                      value.toUpperCase() === swatch
                        ? "border-blue-600 ring-2 ring-blue-500/30"
                        : "border-slate-200"
                    )}
                    style={{ backgroundColor: swatch }}
                    title={swatch}
                  />
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

