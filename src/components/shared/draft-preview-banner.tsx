import React from "react";
import { EyeOff } from "lucide-react";

interface DraftPreviewBannerProps {
  version?: number | string;
}

export function DraftPreviewBanner({ version }: DraftPreviewBannerProps) {
  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <EyeOff className="w-4 h-4" />
        <span>Draft Preview Mode — This page is currently unpublished and visible only to authorized users.</span>
      </div>
      {version !== undefined && (
        <span className="font-mono text-[11px] bg-amber-600 px-2 py-0.5 rounded">
          v{version}
        </span>
      )}
    </div>
  );
}
