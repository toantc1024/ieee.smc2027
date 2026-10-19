"use client";

import React, { useState } from "react";
import { ArrowRight, PlayCircle, Globe } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ConferenceVideoProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  viewDetailsUrl?: string;
  videoUrl?: string;
  qqVideoVid?: string;
  venueName?: string;
  location?: string;
}

function formatYouTubeEmbedUrl(url?: string): string {
  if (!url) return "https://www.youtube.com/embed/vTwRHpRNtls";
  if (url.includes("jkNA1OPUhQk") || url.includes("I1UGApHrQKo")) {
    return "https://www.youtube.com/embed/vTwRHpRNtls";
  }
  if (url.includes("youtube.com/embed/")) return url;

  const youtuBeMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (youtuBeMatch) return `https://www.youtube.com/embed/${youtuBeMatch[1]}`;

  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

  return url;
}

export function ConferenceVideo({
  subtitle = "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global collaboration.",
  viewDetailsUrl = "#venue",
  videoUrl = "https://www.youtube.com/embed/vTwRHpRNtls",
  qqVideoVid = "x3508h1k2m9",
}: ConferenceVideoProps) {
  const [playerSource, setPlayerSource] = useState<"YOUTUBE" | "QQ_VIDEO">("YOUTUBE");

  const safeSubtitle = subtitle?.includes("Pacific Northwest")
    ? "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global collaboration."
    : subtitle;
  const safeViewDetailsUrl =
    viewDetailsUrl?.includes("2026") || !viewDetailsUrl ? "#venue" : viewDetailsUrl;
  const safeYoutubeUrl = formatYouTubeEmbedUrl(videoUrl);
  const qqEmbedUrl = `https://v.qq.com/txp/iframe/player.html?vid=${encodeURIComponent(qqVideoVid)}`;

  return (
    <SectionContainer
      id="video"
      fullWidthBg="bg-slate-50/50"
      className="relative overflow-hidden"
    >
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 relative z-10 w-full">
          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
              <span className="block text-[#004776]">IEEE SMC 2027</span>
              <span className="block text-[#005496]">Comes to Ho Chi Minh City</span>
            </h2>
            <p className="text-base sm:text-lg text-[#004776]/80 font-medium max-w-3xl">
              {safeSubtitle}
            </p>
          </div>

          {/* China-Friendly QQ Video / International YouTube Switcher */}
          <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs shrink-0">
            <button
              type="button"
              onClick={() => setPlayerSource("YOUTUBE")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                playerSource === "YOUTUBE"
                  ? "bg-[#005496] text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <PlayCircle className="size-3.5" />
              International Stream
            </button>
            <button
              type="button"
              onClick={() => setPlayerSource("QQ_VIDEO")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                playerSource === "QQ_VIDEO"
                  ? "bg-[#005496] text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="size-3.5" />
              QQ Video · China Access
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch relative z-10">
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="relative w-full h-full min-h-[320px] aspect-video lg:aspect-auto rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
              <iframe
                key={playerSource}
                src={playerSource === "QQ_VIDEO" ? qqEmbedUrl : safeYoutubeUrl}
                title="IEEE SMC 2027 Video Presentation"
                className="w-full h-full object-cover absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col h-full min-h-[280px] lg:min-h-0">
            <div className="relative overflow-hidden p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col justify-between h-full">
              <div className="corner-dot-tr opacity-60 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <Badge variant="ute">
                  {playerSource === "QQ_VIDEO"
                    ? "Tencent QQ Video Stream Active"
                    : "Official Host City Preview"}
                </Badge>

                <h3 className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-[#004776] tracking-tight leading-snug">
                  Experience IEEE SMC in Ho Chi Minh City
                </h3>

                <p className="text-base sm:text-lg font-normal text-slate-700 leading-relaxed">
                  Hosted by Ho Chi Minh City University of Technology and Education in Vietnam&apos;s vibrant technological hub — where systems science, human-machine interaction, and cybernetics converge for global research collaboration.
                </p>
              </div>

              <div className="relative z-10 w-full pt-6 mt-6 border-t border-slate-100">
                <a href={safeViewDetailsUrl} className="block w-full">
                  <Button variant="ute" size="lg" className="w-full">
                    <span>Explore Venue &amp; City Details</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

export default ConferenceVideo;
