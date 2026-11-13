"use client";

import React from "react";
import {
  Calendar,
  Send,
  Download,
  Award,
  CheckCircle2,
  ExternalLink,
  Layers,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface DeadlineItem {
  id?: string;
  title: string;
  date: string;
  isPassed?: boolean;
  highlight?: boolean;
}

export interface TopicItem {
  id?: string;
  trackName: string;
  subTopics: string;
}

export interface CallForPapersBlockProps {
  sectionTitle?: string;
  conferenceName?: string;
  scopeDescription?: string;
  submissionUrl?: string;
  templateWordUrl?: string;
  templateLatexUrl?: string;
  indexingBadges?: string;
  deadlines?: DeadlineItem[];
  topics?: TopicItem[];
}

export function CallForPapersBlock({
  sectionTitle = "",
  conferenceName = "",
  scopeDescription = "",
  submissionUrl = "",
  templateWordUrl = "",
  templateLatexUrl = "",
  indexingBadges = "",
  deadlines,
  topics,
}: CallForPapersBlockProps) {
  const defaultDeadlines: DeadlineItem[] = [];

  const defaultTopics: TopicItem[] = [];

  const deadlineList = Array.isArray(deadlines) ? deadlines : defaultDeadlines;
  const topicList = Array.isArray(topics) ? topics : defaultTopics;
  const badgeList = typeof indexingBadges === "string" ? indexingBadges.split(",").map((b) => b.trim()).filter(Boolean) : [];

  return (
    <section className="w-full py-12 lg:py-16 bg-slate-50 dark:bg-zinc-950 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Header & Badges */}
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <FileText className="size-3.5" />
            <span>Call for papers</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground dark:text-white tracking-tight">
            {sectionTitle}
          </h2>

          <p className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
            {conferenceName}
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {scopeDescription}
          </p>

          {/* Indexing Badges */}
          {badgeList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-bold text-slate-500">Indexing:</span>
              {badgeList.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-extrabold bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs"
                >
                  <Award className="size-3.5 text-blue-600" />
                  <span>{badge}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 2 Columns: Deadlines & Submissions Links (Left) vs Tracks & Topics (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Deadlines & Actions */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-sm space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                <Calendar className="size-5 text-blue-600" />
                <h3 className="text-base font-bold text-foreground dark:text-white tracking-tight">
                  Important dates
                </h3>
              </div>

              <div className="space-y-3">
                {deadlineList.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border transition-all",
                      item.highlight
                        ? "bg-rose-50/70 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900"
                        : "bg-slate-50/70 border-slate-200/70 dark:bg-zinc-800/60 dark:border-zinc-700/60"
                    )}
                  >
                    <div className="space-y-0.5">
                      <p className={cn("text-xs font-bold", item.highlight ? "text-rose-900 dark:text-rose-200" : "text-slate-800 dark:text-slate-200")}>
                        {item.title}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-black shrink-0",
                        item.highlight
                          ? "bg-rose-600 text-white shadow-xs"
                          : "bg-slate-200 text-slate-800 dark:bg-zinc-700 dark:text-zinc-200"
                      )}
                    >
                      {item.date}
                    </span>
                  </div>
                ))}
              </div>

              {/* Submission CTAs */}
              <div className="pt-2 space-y-2.5">
                {submissionUrl && (
                  <a
                    href={submissionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/30 transition-all hover:scale-[1.01]"
                  >
                    <Send className="size-4" />
                    <span>Submit a paper</span>
                    <ExternalLink className="size-3.5 opacity-80" />
                  </a>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {templateWordUrl && (
                    <a
                      href={templateWordUrl}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-zinc-700 transition-colors"
                    >
                      <Download className="size-3.5 text-blue-600" />
                      <span>Template Word</span>
                    </a>
                  )}

                  {templateLatexUrl && (
                    <a
                      href={templateLatexUrl}
                      className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-zinc-700 transition-colors"
                    >
                      <Download className="size-3.5 text-blue-600" />
                      <span>Template LaTeX</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Tracks & Scope topics */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800 pb-3">
              <Layers className="size-5 text-blue-600" />
              <h3 className="text-base font-bold text-foreground dark:text-white tracking-tight">
                Tracks & topics
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {topicList.map((track, idx) => (
                <div
                  key={track.id || idx}
                  className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-600 transition-all space-y-2"
                >
                  <h4 className="text-sm sm:text-base font-bold text-foreground dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>{track.trackName}</span>
                  </h4>
                  <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">
                    {track.subTopics}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
