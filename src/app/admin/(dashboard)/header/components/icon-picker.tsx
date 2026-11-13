"use client";

import React, { useMemo, useState } from "react";
import { NAV_ICON_MAP, getNavIcon } from "@/lib/nav-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconPickerProps {
  value?: string;
  onChange: (iconName: string) => void;
  className?: string;
}

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const CurrentIcon = getNavIcon(value);

  const entries = useMemo(() => {
    const all = Object.entries(NAV_ICON_MAP);
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(([name]) => name.toLowerCase().includes(q));
  }, [search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={cn(
            "h-8 px-2.5 gap-1.5 justify-between text-xs font-medium bg-white border-slate-200 hover:border-blue-300",
            className
          )}
        >
          <span className="flex items-center gap-1.5 truncate">
            <CurrentIcon className="w-3.5 h-3.5 text-[#115eff] shrink-0" />
            <span className="truncate text-slate-700 font-mono text-[11px]">
              {value || "Globe"}
            </span>
          </span>
          <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-2.5 bg-white shadow-xl border-slate-200" align="start">
        <div className="relative mb-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search icon..."
            className="h-7 pl-8 text-xs bg-slate-50 border-slate-200"
          />
        </div>
        <div className="grid grid-cols-6 gap-1 max-h-52 overflow-y-auto pr-0.5">
          {entries.map(([name, IconComp]) => {
            const isSelected = (value || "Globe") === name;
            return (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => {
                  onChange(name);
                  setOpen(false);
                }}
                className={cn(
                  "h-9 rounded flex items-center justify-center border transition-all cursor-pointer",
                  isSelected
                    ? "bg-[#115eff] text-white border-[#115eff] shadow-xs"
                    : "bg-white text-slate-600 border-slate-100 hover:border-blue-300 hover:bg-blue-50 hover:text-[#115eff]"
                )}
              >
                <IconComp className="w-4 h-4" />
              </button>
            );
          })}
          {entries.length === 0 && (
            <div className="col-span-6 py-4 text-center text-xs text-slate-400">
              No icons found
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
