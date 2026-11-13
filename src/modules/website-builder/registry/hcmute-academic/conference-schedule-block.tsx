"use client";
/* eslint-disable @next/next/no-img-element -- Speaker media can use arbitrary user-provided URLs. */

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Coffee,
  Mic,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScheduleSessionItem {
  id?: string;
  dayIndex: number;
  time: string;
  type?: "keynote" | "session" | "break" | "panel" | "ceremony";
  title: string;
  speaker?: string;
  speakerAffiliation?: string;
  speakerAvatar?: string;
  chair?: string;
  room?: string;
  track?: string;
  description?: string;
}

export interface ConferenceScheduleBlockProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  days?: string;
  sessions?: ScheduleSessionItem[];
}

export function ConferenceScheduleBlock({
  sectionTitle = "",
  sectionSubtitle = "",
  days = "",
  sessions,
}: ConferenceScheduleBlockProps) {
  const [activeDay, setActiveDay] = useState(0);
  const [activeTrack, setActiveTrack] = useState<string>("All");

  const daysList = (typeof days === "string" ? days : "").split(",").map((d) => d.trim()).filter(Boolean);

  const defaultSessions: ScheduleSessionItem[] = [];

  const listToRender = Array.isArray(sessions) ? sessions : defaultSessions;
  const daySessions = listToRender.filter((s) => s.dayIndex === activeDay);
  const availableTracks = Array.from(
    new Set(daySessions.map((s) => s.track).filter(Boolean) as string[])
  );

  const filteredSessions = daySessions.filter((s) => {
    if (activeTrack === "All") return true;
    return s.track === activeTrack;
  });

  return (
    <section className="w-full py-12 lg:py-16 bg-white dark:bg-zinc-900 font-sans border-y border-slate-200/80 dark:border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
            <Calendar className="size-3.5" />
            <span>Event schedule</span>
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

        {/* Day Switcher Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {daysList.map((dayLabel, idx) => (
              <button
                key={dayLabel}
                type="button"
                onClick={() => {
                  setActiveDay(idx);
                  setActiveTrack("All");
                }}
                className={cn(
                  "px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2",
                  activeDay === idx
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 scale-102"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                )}
              >
                <Calendar className="size-4" />
                <span>{dayLabel}</span>
              </button>
            ))}
          </div>

          {/* Track filter if multiple tracks exist */}
          {availableTracks.length > 1 && (
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTrack("All")}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                  activeTrack === "All"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                )}
              >
                All tracks
              </button>
              {availableTracks.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTrack(t)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer",
                    activeTrack === t
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Timeline Schedule Cards */}
        <div className="space-y-4">
          {filteredSessions.map((session, idx) => {
            const isBreak = session.type === "break";
            const isKeynote = session.type === "keynote";
            const isPanel = session.type === "panel";

            if (isBreak) {
              return (
                <div
                  key={session.id || idx}
                  className="flex items-center gap-4 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50 text-amber-900 dark:text-amber-200"
                >
                  <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-900/80 flex items-center justify-center shrink-0 text-amber-700 dark:text-amber-300">
                    <Coffee className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {session.time}
                      </span>
                      {session.room && (
                        <span className="flex items-center gap-1 text-amber-700/80 dark:text-amber-400">
                          <MapPin className="size-3.5" />
                          {session.room}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold mt-0.5">{session.title}</p>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={session.id || idx}
                className={cn(
                  "relative p-5 sm:p-6 rounded-2xl border transition-all duration-200",
                  isKeynote
                    ? "bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-950/40 dark:to-indigo-950/40 border-blue-200 dark:border-blue-800 shadow-sm ring-1 ring-blue-500/20"
                    : "bg-white dark:bg-zinc-900 border-slate-200/80 dark:border-zinc-800 hover:shadow-md"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left: Time & Room */}
                  <div className="md:w-48 shrink-0 space-y-1.5 border-b md:border-b-0 md:border-r border-slate-100 dark:border-zinc-800 pb-3 md:pb-0 md:pr-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-extrabold bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-white">
                      <Clock className="size-3.5 text-blue-600" />
                      <span>{session.time}</span>
                    </div>

                    {session.room && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        <MapPin className="size-3.5 text-rose-500" />
                        <span>{session.room}</span>
                      </div>
                    )}

                    {session.track && (
                      <span className="inline-block text-[11px] font-bold text-blue-600 dark:text-blue-400">
                        {session.track}
                      </span>
                    )}
                  </div>

                  {/* Right: Content Details */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2">
                      {isKeynote && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-600 text-white shadow-xs">
                          <Mic className="size-3" />
                          <span>Keynote Speech</span>
                        </span>
                      )}
                      {isPanel && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-600 text-white shadow-xs">
                          <Users className="size-3" />
                          <span>Panel Discussion</span>
                        </span>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-foreground dark:text-white leading-snug">
                      {session.title}
                    </h3>

                    {session.description && (
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {session.description}
                      </p>
                    )}

                    {/* Speaker / Chair info */}
                    <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                      {session.speaker && (
                        <div className="flex items-center gap-2">
                          {session.speakerAvatar ? (
                            <img
                              src={session.speakerAvatar}
                              alt={session.speaker}
                              className="size-6 rounded-full object-cover ring-1 ring-slate-300"
                            />
                          ) : (
                            <div className="size-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                              <User className="size-3" />
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-foreground dark:text-white">Speaker: </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{session.speaker}</span>
                            {session.speakerAffiliation && (
                              <span className="text-slate-500 dark:text-slate-400"> ({session.speakerAffiliation})</span>
                            )}
                          </div>
                        </div>
                      )}

                      {session.chair && (
                        <div className="text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-300">Chair: </span>
                          <span>{session.chair}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
