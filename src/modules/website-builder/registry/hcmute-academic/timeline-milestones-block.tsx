"use client";
/* eslint-disable @next/next/no-img-element -- Milestone media can use arbitrary user-provided URLs. */

import React from "react";
import {
  CheckCircle2,
  Clock,
  Award,
  Flag,
  Rocket,
  Star,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineMilestoneItem {
  id?: string;
  year: string;
  title: string;
  description: string;
  badge?: string;
  status?: "completed" | "current" | "upcoming";
  icon?: "award" | "flag" | "rocket" | "star" | "book" | "check";
  image?: string;
  linkText?: string;
  linkUrl?: string;
}

export interface TimelineMilestonesBlockProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  layout?: "vertical" | "horizontal";
  items?: TimelineMilestoneItem[];
}

export function TimelineMilestonesBlock({
  sectionTitle = "",
  sectionSubtitle = "",
  layout = "vertical",
  items,
}: TimelineMilestonesBlockProps) {
  const defaultItems: TimelineMilestoneItem[] = [];

  const milestoneList = Array.isArray(items) ? items.filter(Boolean) : defaultItems;

  const renderIcon = (iconName?: string) => {
    switch (iconName) {
      case "award":
        return <Award className="size-4" />;
      case "rocket":
        return <Rocket className="size-4" />;
      case "star":
        return <Star className="size-4" />;
      case "book":
        return <BookOpen className="size-4" />;
      case "check":
        return <CheckCircle2 className="size-4" />;
      default:
        return <Flag className="size-4" />;
    }
  };

  return (
    <section className="w-full py-12 lg:py-16 bg-slate-50/70 dark:bg-zinc-950 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="size-3.5" />
            <span>Milestones</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground dark:text-white tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Timeline Layout */}
        {layout === "horizontal" ? <div className="flex gap-4 overflow-x-auto pb-4">{milestoneList.map((item, idx) => <article key={item.id || idx} className="w-72 shrink-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className="mb-3 flex items-center gap-2 text-blue-700">{renderIcon(item.icon)}<span className="font-bold">{item.year}</span>{item.badge && <span className="text-xs text-slate-500">{item.badge}</span>}</div><h3 className="font-bold">{item.title}</h3><p className="mt-2 text-sm text-slate-600">{item.description}</p>{item.image && <img src={item.image} alt={item.title} className="mt-3 h-36 w-full rounded-lg object-cover" />}{item.linkUrl && <a href={item.linkUrl} className="mt-3 inline-block text-sm font-semibold text-blue-700">{item.linkText || "Learn more"}</a>}</article>)}</div> : <div className="relative">
          {/* Vertical central gradient line */}
          <div
            className="absolute left-4 sm:left-1/2 top-4 bottom-4 -translate-x-1/2 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-500 to-slate-300 dark:to-zinc-800 hidden sm:block"
            aria-hidden="true"
          />
          {/* Mobile left line */}
          <div
            className="absolute left-6 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-600 via-indigo-500 to-slate-300 dark:to-zinc-800 sm:hidden"
            aria-hidden="true"
          />

          <div className="space-y-8 sm:space-y-12">
            {milestoneList.map((item, idx) => {
              const isEven = idx % 2 === 0;
              const isCurrent = item.status === "current";

              return (
                <div
                  key={item.id || idx}
                  className={cn(
                    "relative flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-0",
                    isEven ? "sm:flex-row-reverse" : ""
                  )}
                >
                  {/* Content Box */}
                  <div
                    className={cn(
                      "w-full sm:w-[calc(50%-2.5rem)] pl-14 sm:pl-0",
                      isEven ? "sm:text-left" : "sm:text-right"
                    )}
                  >
                    <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:shadow-lg transition-all duration-300 space-y-3">
                      {/* Year badge & Tag */}
                      <div
                        className={cn(
                          "flex items-center gap-2",
                          isEven ? "justify-start" : "sm:justify-end"
                        )}
                      >
                        <span
                          className={cn(
                            "px-3 py-1 rounded-xl text-xs font-black tracking-wide",
                            isCurrent
                              ? "bg-blue-600 text-white shadow-xs animate-pulse"
                              : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                          )}
                        >
                          {item.year}
                        </span>
                        {item.badge && (
                          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                            • {item.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-foreground dark:text-white leading-snug">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>

                      {item.image && (
                        <div className="pt-2 rounded-xl overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-36 object-cover rounded-xl"
                          />
                        </div>
                      )}

                      {item.linkUrl && (
                        <div className={cn("pt-1", isEven ? "text-left" : "sm:text-right")}>
                          <a
                            href={item.linkUrl}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            <span>{item.linkText || "Learn more"}</span>
                            <ArrowRight className="size-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Node Icon on Center Line */}
                  <div
                    className={cn(
                      "absolute left-6 sm:left-1/2 -translate-x-1/2 flex items-center justify-center size-9 sm:size-11 rounded-full border-4 border-slate-50 dark:border-zinc-950 transition-transform duration-300 hover:scale-110",
                      isCurrent
                        ? "bg-blue-600 text-white ring-4 ring-blue-600/30 shadow-md"
                        : "bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm"
                    )}
                  >
                    {renderIcon(item.icon)}
                  </div>

                  {/* Empty spacer on opposite side for desktop centering */}
                  <div className="hidden sm:block sm:w-[calc(50%-2.5rem)]" />
                </div>
              );
            })}
          </div>
        </div>}
      </div>
    </section>
  );
}
