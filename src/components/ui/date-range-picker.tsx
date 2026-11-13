"use client";

import * as React from "react";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  Clock3,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  format,
  subDays,
  startOfYear,
  startOfMonth,
  startOfDay,
  endOfDay,
  isValid,
} from "date-fns";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface DateRangePickerProps {
  value?: { from?: Date; to?: Date };
  onChange?: (range: { from?: Date; to?: Date } | undefined) => void;
  className?: string;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  placeholder?: string;
  presetKey?: string;
  onPresetChange?: (presetKey: string) => void;
  showPresets?: boolean;
  variant?: "glass" | "outline" | "default";
}

export interface DateRangePreset {
  id: string;
  label: string;
  getRange: () => { from: Date; to: Date };
}

export function getDateRangeFromPreset(presetId: string): { from: Date; to: Date } {
  const now = new Date();
  switch (presetId) {
    case "today":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "7d":
    case "last_7_days":
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case "30d":
    case "last_30_days":
      return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
    case "this_month":
      return { from: startOfDay(startOfMonth(now)), to: endOfDay(now) };
    case "90d":
    case "this_quarter":
      return { from: startOfDay(subDays(now, 89)), to: endOfDay(now) };
    case "12m":
    case "this_year":
      return { from: startOfDay(startOfYear(now)), to: endOfDay(now) };
    case "all":
    case "all_time":
    default:
      return { from: startOfDay(new Date(2024, 0, 1)), to: endOfDay(now) };
  }
}

export const DEFAULT_DATE_PRESETS: DateRangePreset[] = [
  {
    id: "today",
    label: "Today",
    getRange: () => getDateRangeFromPreset("today"),
  },
  {
    id: "7d",
    label: "Last 7 days",
    getRange: () => getDateRangeFromPreset("7d"),
  },
  {
    id: "30d",
    label: "Last 30 days",
    getRange: () => getDateRangeFromPreset("30d"),
  },
  {
    id: "this_month",
    label: "This month",
    getRange: () => getDateRangeFromPreset("this_month"),
  },
  {
    id: "90d",
    label: "Last 90 days",
    getRange: () => getDateRangeFromPreset("90d"),
  },
  {
    id: "this_year",
    label: "This year",
    getRange: () => getDateRangeFromPreset("this_year"),
  },
  {
    id: "all",
    label: "All time",
    getRange: () => getDateRangeFromPreset("all"),
  },
];

export function DateRangePicker({
  value,
  onChange,
  className,
  triggerClassName,
  align = "end",
  placeholder = "Select date range",
  presetKey,
  onPresetChange,
  showPresets = true,
  variant = "outline",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const sanitizeRange = React.useCallback(
    (range?: { from?: Date; to?: Date }): DateRange | undefined => {
      if (!range?.from || !isValid(range.from)) return undefined;
      const safeTo = range.to && isValid(range.to) ? range.to : undefined;
      return { from: range.from, to: safeTo };
    },
    [],
  );

  const [draftRange, setDraftRange] = React.useState<DateRange | undefined>(() =>
    sanitizeRange(value),
  );

  React.useEffect(() => {
    setDraftRange(sanitizeRange(value));
  }, [value, open, sanitizeRange]);

  const handleApply = () => {
    if (draftRange?.from && isValid(draftRange.from)) {
      const from = startOfDay(draftRange.from);
      const safeTo = draftRange.to && isValid(draftRange.to) ? draftRange.to : draftRange.from;
      const to = endOfDay(safeTo);
      onChange?.({ from, to });
      if (onPresetChange) {
        onPresetChange("custom");
      }
    } else {
      onChange?.(undefined);
    }
    setOpen(false);
  };

  const handleReset = () => {
    const allRange = getDateRangeFromPreset("all");
    setDraftRange(allRange);
    onChange?.(allRange);
    if (onPresetChange) {
      onPresetChange("all");
    }
    setOpen(false);
  };

  const handleSelectPreset = (preset: DateRangePreset) => {
    const range = preset.getRange();
    setDraftRange(range);
    onChange?.(range);
    if (onPresetChange) {
      onPresetChange(preset.id);
    }
    setOpen(false);
  };

  const displayLabel = React.useMemo(() => {
    if (!value?.from || !isValid(value.from)) {
      return placeholder;
    }
    const fromStr = format(value.from, "dd/MM/yyyy");
    const toDate = value.to && isValid(value.to) ? value.to : undefined;
    if (!toDate || value.from.getTime() === toDate.getTime()) {
      return fromStr;
    }
    const toStr = format(toDate, "dd/MM/yyyy");

    if (presetKey === "all" || presetKey === "all_time") {
      return "All time";
    }
    if (presetKey === "today") {
      return `Today: ${fromStr}`;
    }
    if (presetKey === "7d" || presetKey === "last_7_days") {
      return `Last 7 days: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }
    if (presetKey === "30d" || presetKey === "last_30_days") {
      return `Last 30 days: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }
    if (presetKey === "this_month") {
      return `This month: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }
    if (presetKey === "90d" || presetKey === "this_quarter") {
      return `Last 90 days: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }
    if (presetKey === "12m" || presetKey === "this_year") {
      return `This year: ${format(value.from, "dd/MM")} - ${format(toDate, "dd/MM")}`;
    }

    return `${fromStr} - ${toStr}`;
  }, [value, placeholder, presetKey]);

  const fullRangeTitle = React.useMemo(() => {
    if (!value?.from || !isValid(value.from)) return undefined;
    const fromStr = format(value.from, "dd/MM/yyyy");
    const toStr = value.to && isValid(value.to) ? format(value.to, "dd/MM/yyyy") : fromStr;
    return `${fromStr} - ${toStr}`;
  }, [value]);

  const defaultMonth = React.useMemo(() => {
    if (draftRange?.from && isValid(draftRange.from)) return draftRange.from;
    if (value?.from && isValid(value.from)) return value.from;
    return new Date();
  }, [draftRange?.from, value?.from]);

  const isGlass = variant === "glass";
  const hasValidValue = Boolean(value?.from && isValid(value.from));

  return (
    <div className={cn("inline-flex items-center min-w-0 max-w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range-picker-trigger"
            variant={isGlass ? "outline" : "outline"}
            size="sm"
            title={fullRangeTitle}
            className={cn(
              isGlass
                ? "h-8 px-2.5 text-xs font-medium rounded-lg border border-white/20 bg-black/30 hover:bg-black/40 text-white backdrop-blur-md transition-all gap-1.5 max-w-full shadow-xs shrink-0 cursor-pointer"
                : "h-9 px-3 text-xs font-medium rounded-xl border border-border/80 bg-background hover:bg-muted/70 text-foreground transition-all gap-2 max-w-full shadow-2xs shrink-0 cursor-pointer",
              !hasValidValue && (isGlass ? "text-white/80" : "text-muted-foreground"),
              triggerClassName,
            )}
          >
            <CalendarIcon
              className={cn(
                "size-3.5 shrink-0",
                isGlass ? "text-sky-400" : "text-blue-500 dark:text-blue-400",
              )}
            />
            <span className="truncate max-w-[140px] sm:max-w-[200px] md:max-w-[260px]">
              {displayLabel}
            </span>
            <ChevronDown
              className={cn(
                "size-3 ml-0.5 shrink-0",
                isGlass ? "opacity-60 text-white" : "text-muted-foreground",
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto max-w-[min(calc(100vw-1.5rem),540px)] max-h-[min(calc(100vh-2rem),620px)] overflow-y-auto p-0 rounded-2xl shadow-2xl border border-border bg-popover text-popover-foreground z-50"
          align={align}
          collisionPadding={12}
          sideOffset={6}
        >
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-border/60">
            {/* Presets Sidebar */}
            {showPresets && (
              <div className="p-2 sm:p-2.5 bg-muted/20 sm:w-44 flex flex-col shrink-0">
                <span className="text-[11px] font-semibold text-muted-foreground px-1.5 sm:px-2 py-0.5 sm:py-1">
                  Presets
                </span>
                <div className="grid grid-cols-2 sm:flex sm:flex-col gap-1 mt-1">
                  {DEFAULT_DATE_PRESETS.map((preset) => {
                    const isActive =
                      presetKey === preset.id ||
                      (preset.id === "this_year" && presetKey === "12m") ||
                      (preset.id === "7d" && presetKey === "last_7_days") ||
                      (preset.id === "30d" && presetKey === "last_30_days") ||
                      (preset.id === "90d" && presetKey === "this_quarter") ||
                      (preset.id === "all" && presetKey === "all_time");
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={cn(
                          "flex items-center justify-between w-full px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-lg font-medium transition-all text-left cursor-pointer",
                          isActive
                            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                            : "text-foreground hover:bg-muted/70",
                        )}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <Clock3 className="size-3 opacity-70 shrink-0" />
                          <span className="truncate">{preset.label}</span>
                        </span>
                        {isActive && <Check className="size-3 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 sm:mt-auto pt-1.5 sm:pt-2 border-t border-border/40">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex items-center justify-center sm:justify-start gap-1.5 w-full px-2 py-1.5 sm:px-2.5 sm:py-1.5 text-xs rounded-lg font-medium text-muted-foreground hover:text-primary hover:bg-muted/70 transition-colors text-left cursor-pointer"
                  >
                    <RotateCcw className="size-3.5 shrink-0" />
                    <span className="truncate">Reset to all time</span>
                  </button>
                </div>
              </div>
            )}

            {/* Calendar & Range Selector */}
            <div className="p-2 sm:p-3 flex flex-col min-w-0">
              <div className="overflow-x-auto flex justify-center">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={defaultMonth}
                  selected={draftRange}
                  onSelect={setDraftRange}
                  numberOfMonths={1}
                  className="rounded-xl border-0 p-0 sm:p-1"
                />
              </div>

              {/* Range footer summary & Action buttons */}
              <div className="mt-2 pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[180px] sm:max-w-[240px]">
                  {draftRange?.from && isValid(draftRange.from) ? (
                    draftRange.to && isValid(draftRange.to) ? (
                      <span>
                        {format(draftRange.from, "dd/MM/yyyy")} –{" "}
                        {format(draftRange.to, "dd/MM/yyyy")}
                      </span>
                    ) : (
                      <span>
                        From {format(draftRange.from, "dd/MM/yyyy")}
                      </span>
                    )
                  ) : (
                    <span>No range selected</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 ml-auto shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="h-7 px-2 text-xs cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    disabled={!draftRange?.from || !isValid(draftRange.from)}
                    onClick={handleApply}
                    className="h-7 px-2.5 text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
