"use client";

import React from "react";
import { Radio, Zap, Globe, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { WebsiteRealtimeDto } from "../../types";

interface WebsiteRealtimeStreamProps {
  realtimeData: WebsiteRealtimeDto | null;
  isLoading: boolean;
}

export function WebsiteRealtimeStream({
  realtimeData,
  isLoading,
}: WebsiteRealtimeStreamProps) {
  if (isLoading) {
    return <Skeleton className="h-[360px] rounded-2xl" />;
  }

  const urls = Object.entries(realtimeData?.urls || {});
  const countries = Object.entries(realtimeData?.countries || {});
  const events = realtimeData?.events || [];

  return (
    <Card className="rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
      <CardHeader className="pb-3 pt-4 sm:pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
              <Radio className="size-4 animate-pulse" />
            </div>
            <span>Real-time Activity Stream</span>
          </CardTitle>
          <Badge variant="outline" className="text-[11px] font-semibold bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Live</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 flex-1">
        {/* Active URLs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <FileText className="size-3.5 text-blue-500" />
              <span>Active Pages</span>
            </span>
            <span className="text-[11px]">{urls.length} paths</span>
          </div>

          {urls.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-1">No active pageviews right now</p>
          ) : (
            <div className="space-y-1.5">
              {urls.slice(0, 4).map(([url, count], idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-muted/40 border border-border/60 text-xs">
                  <span className="font-medium text-foreground truncate max-w-[200px]" title={url}>
                    {url}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    {count} views
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real-time Countries */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Globe className="size-3.5 text-emerald-500" />
              <span>Visitor Locations</span>
            </span>
            <span className="text-[11px]">{countries.length} countries</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {countries.length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">No geo telemetry</p>
            ) : (
              countries.slice(0, 5).map(([country, count], idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-muted/50 border-border/70 py-1 px-2.5">
                  <span>{country}</span>
                  <span className="ml-1.5 text-[10px] font-semibold text-muted-foreground tabular-nums">
                    {count}
                  </span>
                </Badge>
              ))
            )}
          </div>
        </div>

        {/* Recent Ingested Events */}
        <div className="space-y-2 pt-2 border-t border-border/60">
          <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
            <span className="flex items-center gap-1.5">
              <Zap className="size-3.5 text-amber-500" />
              <span>Recent Ingested Events</span>
            </span>
            <span className="text-[11px]">{events.length}</span>
          </div>

          {events.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-1">No custom events yet</p>
          ) : (
            <div className="space-y-1">
              {events.slice(0, 3).map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1">
                  <span className="font-medium text-foreground truncate max-w-[180px]">
                    {ev.event || "view"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(ev.createdAt || ev.timestamp || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
