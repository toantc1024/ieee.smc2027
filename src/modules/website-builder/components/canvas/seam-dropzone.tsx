"use client";

import React from "react";
import { Plus } from "lucide-react";

interface SeamDropzoneIndicatorProps {
  label: string;
  position: "before" | "after";
  counterScale?: number;
}

export function SeamDropzoneIndicator({
  label,
  position,
  counterScale = 1,
}: SeamDropzoneIndicatorProps) {
  return (
    <div className="absolute inset-x-0 z-[9999] pointer-events-none flex items-center justify-center -translate-y-1/2">
      {/* Full width indicator line */}
      <div className="absolute inset-x-0 h-1 bg-blue-600 rounded-full shadow-md" />

      {/* Terminal beads */}
      <div className="absolute left-0 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm -translate-x-1/2" />
      <div className="absolute right-0 w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm translate-x-1/2" />

      {/* Centered counter-scaled badge */}
      <div
        className="relative z-10 px-3 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold shadow-lg flex items-center gap-1.5 whitespace-nowrap"
        style={{
          transform: counterScale !== 1 ? `scale(${counterScale})` : undefined,
          transformOrigin: "center center",
        }}
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Insert {position === "before" ? "before" : "after"}: {label}</span>
      </div>
    </div>
  );
}
