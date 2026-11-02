"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  GraduationCap,
  Building2,
  Briefcase,
  CircleEllipsis,
  Activity,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface WebsiteAudienceSurveyCardProps {
  from?: string;
  to?: string;
  className?: string;
}

export interface CategorySurveyMeta {
  key: string;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

export const CATEGORY_DEFINITIONS: CategorySurveyMeta[] = [
  {
    key: "author",
    label: "Authors & Researchers",
    sublabel: "Paper submissions, review notifications & camera-ready guidelines",
    icon: Users,
  },
  {
    key: "attendee",
    label: "Conference Attendees",
    sublabel: "Registration passes, keynote schedules & venue information",
    icon: GraduationCap,
  },
  {
    key: "industry",
    label: "Industry Partners & Sponsors",
    sublabel: "Exhibition booths, sponsorship tiers & recruitment sessions",
    icon: Building2,
  },
  {
    key: "committee",
    label: "Committee & Reviewers",
    sublabel: "Track chair moderation, paper scoring & editorial sessions",
    icon: Briefcase,
  },
  {
    key: "general",
    label: "General Visitors & Students",
    sublabel: "Student travel grants, workshop tracks & proceedings",
    icon: CircleEllipsis,
  },
];

const SEGMENT_PALETTE = ["#2563eb", "#3b82f6", "#60a5fa", "#94a3b8", "#cbd5e1"];

export function WebsiteAudienceSurveyCard({
  className,
}: WebsiteAudienceSurveyCardProps) {
  const [surveyCounts] = useState<Record<string, number>>({
    author: 142,
    attendee: 98,
    industry: 45,
    committee: 36,
    general: 24,
  });

  const totalResponses = useMemo(() => {
    return Object.values(surveyCounts).reduce((acc, v) => acc + v, 0);
  }, [surveyCounts]);

  const rankedCategories = useMemo(() => {
    return CATEGORY_DEFINITIONS.map((cat, idx) => {
      const count = surveyCounts[cat.key] || 0;
      const percent = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
      return {
        ...cat,
        count,
        percent,
        color: SEGMENT_PALETTE[idx % SEGMENT_PALETTE.length],
      };
    }).sort((a, b) => b.count - a.count);
  }, [surveyCounts, totalResponses]);

  const dominant = rankedCategories[0];

  return (
    <Card className={`rounded-2xl border border-border/70 bg-card shadow-2xs ${className || ""}`}>
      <CardHeader className="pb-3 pt-4 sm:pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <Activity className="size-4" />
            </div>
            <span>Audience Profile & Participation Survey</span>
          </CardTitle>
          <Badge variant="outline" className="text-[11px] font-semibold bg-blue-500/10 border-blue-500/25 text-blue-700 dark:text-blue-300">
            {totalResponses.toLocaleString()} responses
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        {/* 4 Mini KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block mb-0.5">Total Responses</span>
            <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
              {totalResponses.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 block mb-0.5">Dominant Segment</span>
            <span className="text-sm font-bold tracking-tight text-blue-900 dark:text-blue-100 truncate block">
              {dominant?.label || "Authors"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block mb-0.5">Author Share</span>
            <span className="text-xl font-bold tracking-tight text-foreground tabular-nums">
              {dominant?.percent || 0}%
            </span>
          </div>
          <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
            <span className="text-[11px] font-medium text-muted-foreground block mb-0.5">Engagement Rate</span>
            <span className="text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
              94.2%
            </span>
          </div>
        </div>

        {/* Stacked Segment Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Distribution by Audience Profile</span>
            <span>100% Total</span>
          </div>
          <div className="h-3 w-full bg-muted/60 rounded-full overflow-hidden flex p-0.5 border border-border/60">
            {rankedCategories.map((cat, idx) => (
              <div
                key={idx}
                style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
                title={`${cat.label}: ${cat.count} (${cat.percent}%)`}
              />
            ))}
          </div>
        </div>

        {/* Ranked Breakdown List */}
        <div className="divide-y divide-border/40">
          {rankedCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="p-1.5 rounded-lg shrink-0 text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-semibold text-foreground truncate block">
                      {cat.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate block">
                      {cat.sublabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="font-bold text-foreground tabular-nums block">
                      {cat.count}
                    </span>
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {cat.percent}%
                    </span>
                  </div>
                  {idx === 0 && (
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
