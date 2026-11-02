"use client";

import React from "react";
import {
  FileText,
  Activity,
  ExternalLink,
  Compass,
  Layers,
  Laptop,
  Globe,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { WebsiteMetricDto, WebsiteDimensionType } from "../../types";

interface WebsiteDimensionsBreakdownProps {
  metrics: WebsiteMetricDto[];
  activeDimension: WebsiteDimensionType;
  onDimensionChange: (dim: WebsiteDimensionType) => void;
  isLoading: boolean;
}

const dimensions: { label: string; value: WebsiteDimensionType; icon: React.ElementType }[] = [
  { label: "Paths", value: "path", icon: FileText },
  { label: "Events", value: "event", icon: Activity },
  { label: "Referrers", value: "referrer", icon: ExternalLink },
  { label: "Browsers", value: "browser", icon: Compass },
  { label: "Operating Systems", value: "os", icon: Layers },
  { label: "Devices", value: "device", icon: Laptop },
  { label: "Countries", value: "country", icon: Globe },
];

export function WebsiteDimensionsBreakdown({
  metrics,
  activeDimension,
  onDimensionChange,
  isLoading,
}: WebsiteDimensionsBreakdownProps) {
  const totalCount = metrics.reduce((acc, m) => acc + m.y, 0) || 1;

  return (
    <Card className="rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
      <CardHeader className="pb-3 pt-4 sm:pt-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <Globe className="size-4" />
            </div>
            <span>Audience & Technology Breakdown</span>
          </CardTitle>
        </div>

        {/* Dimension Switcher Pills */}
        <div className="flex flex-wrap gap-1 pt-2">
          {dimensions.map((d) => {
            const Icon = d.icon;
            const isActive = activeDimension === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => onDimensionChange(d.value)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer font-medium",
                  isActive
                    ? "bg-blue-600 text-white font-semibold shadow-2xs"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-3" />
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="pt-2 flex-1">
        {isLoading ? (
          <div className="space-y-3 py-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-8 rounded-lg" />
            ))}
          </div>
        ) : metrics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-center text-muted-foreground">
            <FileText className="size-8 stroke-1 mb-2 text-muted-foreground/50" />
            <p className="text-xs">No records for this dimension</p>
          </div>
        ) : (
          <div className="space-y-2.5 py-1">
            {metrics.slice(0, 10).map((row, idx) => {
              const percent = Math.min(100, Math.round((row.y / totalCount) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground truncate max-w-[260px] sm:max-w-[340px]">
                      <span className="text-muted-foreground mr-1.5 font-semibold">#{idx + 1}</span>
                      {row.x || "(empty)"}
                    </span>
                    <span className="font-semibold text-foreground tabular-nums shrink-0 ml-2">
                      {row.y.toLocaleString()} <span className="text-muted-foreground font-normal">({percent}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
