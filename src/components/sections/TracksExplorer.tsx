"use client";

import React, { useState } from "react";
import { Search, Layers, Cpu, Users, ArrowDown, Play, LayoutGrid } from "lucide-react";
import { TECHNICAL_TRACKS } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function TracksExplorer() {
  const [activePillarId, setActivePillarId] = useState<string>("systems");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"marquee" | "grid">("marquee");

  const activePillar = TECHNICAL_TRACKS.find((p) => p.id === activePillarId) || TECHNICAL_TRACKS[0];

  const filteredTopics = activePillar.topics.filter((topic) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      topic.name.toLowerCase().includes(query) ||
      topic.code.toLowerCase().includes(query) ||
      topic.category.toLowerCase().includes(query)
    );
  });

  // Automatically switch to grid when user is actively searching
  const effectiveMode = searchQuery.trim() ? "grid" : viewMode;

  const getPillarIcon = (id: string) => {
    switch (id) {
      case "systems":
        return <Layers className="w-4 h-4 text-blue-200" />;
      case "cybernetics":
        return <Cpu className="w-4 h-4 text-blue-200" />;
      case "humans":
        return <Users className="w-4 h-4 text-blue-200" />;
      default:
        return null;
    }
  };

  // Split topics into 3 columns for Marquee view
  const col1 = filteredTopics.filter((_, i) => i % 3 === 0);
  const col2 = filteredTopics.filter((_, i) => i % 3 === 1);
  const col3 = filteredTopics.filter((_, i) => i % 3 === 2);

  const renderTopicCard = (topic: typeof filteredTopics[0], uniqueKey: string) => (
    <div
      key={uniqueKey}
      className="p-5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 backdrop-blur-xs rounded-md transition-all flex flex-col justify-between group shadow-xs hover:shadow-md cursor-pointer"
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black text-[#115eff] bg-white px-2.5 py-0.5 rounded-md">
            {topic.code}
          </span>
          <span className="text-xs px-2 py-0.5 bg-white/15 text-blue-100 rounded font-medium">
            {topic.category}
          </span>
        </div>

        <h4 className="text-base font-bold text-white tracking-tight group-hover:text-blue-200 transition-colors leading-snug">
          {topic.name}
        </h4>
      </div>

      <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-blue-200">
        <span>IEEE SMC 2027 Scope</span>
        <span className="font-semibold text-white/90">PaperCept</span>
      </div>
    </div>
  );

  return (
    <SectionContainer id="tracks" fullWidthBg="bg-[#115eff] text-white" borderColor="border-white/20">
      {/* Static Dot Pattern Background (No Running Wave) */}
      <div className="absolute inset-0 bg-dot-dark opacity-35 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/30 via-transparent to-blue-950/30 pointer-events-none" />

      {/* Section Header Strip */}
      <div className="relative overflow-hidden border-b border-white/20 px-4 sm:px-6 py-5 sm:py-6 bg-blue-700/40 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-grid-dark-tr opacity-40" />

        <div className="relative z-10">
          <span className="text-sm font-bold text-blue-200 block mb-1 uppercase tracking-wider">
            Technical Scope & Research Topics
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Technical Tracks & 3 Core Pillars
          </h2>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-88 z-10">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200" />
          <input
            type="text"
            placeholder="Search topics (e.g., Robotics, BCI, AI)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white/15 border border-white/30 rounded-md focus:outline-none focus:bg-white/25 focus:border-white focus:ring-2 focus:ring-white/20 transition-all text-white placeholder:text-blue-200"
          />
        </div>
      </div>

      {/* 3 Pillars Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/20 divide-y md:divide-y-0 md:divide-x divide-white/20 bg-blue-800/40 relative z-10">
        {TECHNICAL_TRACKS.map((pillar) => {
          const isActive = pillar.id === activePillarId;
          return (
            <button
              key={pillar.id}
              onClick={() => setActivePillarId(pillar.id)}
              className={`px-4 sm:px-6 py-6 sm:py-7 text-left transition-all relative cursor-pointer ${
                isActive
                  ? "bg-white/20 text-white shadow-inner"
                  : "hover:bg-white/10 text-blue-100"
              }`}
            >
              {/* Active Pure White Indicator */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-white" />
              )}

              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  {getPillarIcon(pillar.id)}
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-white text-[#115eff] font-extrabold"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    {pillar.code}
                  </span>
                </div>
                <span className="text-xs text-blue-200 font-medium">
                  {pillar.topics.length} Official Topics
                </span>
              </div>

              <h3 className="text-lg font-bold tracking-tight text-white">
                {pillar.title}
              </h3>

              <p className="mt-1.5 text-sm text-blue-100 line-clamp-2 leading-relaxed">
                {pillar.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Pillar Topic Directory */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-8 sm:py-10 z-10">
        <div className="corner-dot-dark-bl opacity-30" />

        <div className="relative z-10 mb-6 p-4 sm:p-5 bg-white/10 border border-white/20 rounded-md backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
              Official CFP Scope
            </div>
            <p className="text-sm sm:text-base text-blue-50 leading-relaxed">
              We particularly encourage submissions that focus on the following topics (but are not limited to):
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 bg-white/15 border border-white/25 rounded-md text-white">
              {filteredTopics.length} Topics in {activePillar.code}
            </span>

            {/* View Mode Toggle: Marquee vs Grid */}
            <div className="flex items-center bg-white/15 p-0.5 rounded-md border border-white/25">
              <button
                type="button"
                onClick={() => setViewMode("marquee")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  effectiveMode === "marquee"
                    ? "bg-white text-[#115eff] shadow-xs"
                    : "text-blue-100 hover:text-white"
                }`}
                title="Continuous auto-scrolling marquee with pause on hover"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Marquee</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded transition-all cursor-pointer ${
                  effectiveMode === "grid"
                    ? "bg-white text-[#115eff] shadow-xs"
                    : "text-blue-100 hover:text-white"
                }`}
                title="Interactive scrollable directory grid"
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Browse Grid</span>
              </button>
            </div>
          </div>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="relative z-10 py-12 text-center text-base text-blue-200">
            No topics matched &ldquo;{searchQuery}&rdquo; in this pillar. Try another keyword or switch pillars.
          </div>
        ) : (
          /* Marquee Overflow Container with Signature Top & Bottom Fade Blur */
          <div className="relative z-10 overflow-hidden rounded-md">
            
            {/* Top Marquee Fade Blur Overlay */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 sm:h-24 bg-gradient-to-b from-[#115eff] via-[#115eff]/85 to-transparent backdrop-blur-[2px] z-20" />

            {/* Bottom Marquee Fade Blur Overlay */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 sm:h-24 bg-gradient-to-t from-[#115eff] via-[#115eff]/85 to-transparent backdrop-blur-[2px] z-20" />

            {effectiveMode === "marquee" ? (
              /* Continuous Auto-Scrolling Vertical Marquee Columns (Pauses on Hover) */
              <div
                className="h-[520px] sm:h-[580px] overflow-hidden py-3"
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 h-full">
                  {/* Column 1 */}
                  <div
                    className="flex flex-col gap-4 animate-marquee-vertical hover:[animation-play-state:paused]"
                    style={{ animationDuration: "36s" }}
                  >
                    {col1.concat(col1).map((topic, i) => renderTopicCard(topic, `col1-${topic.code}-${i}`))}
                  </div>

                  {/* Column 2 */}
                  <div
                    className="flex flex-col gap-4 animate-marquee-vertical hover:[animation-play-state:paused]"
                    style={{ animationDuration: "42s" }}
                  >
                    {col2.concat(col2).map((topic, i) => renderTopicCard(topic, `col2-${topic.code}-${i}`))}
                  </div>

                  {/* Column 3 */}
                  <div
                    className="hidden lg:flex flex-col gap-4 animate-marquee-vertical hover:[animation-play-state:paused]"
                    style={{ animationDuration: "38s" }}
                  >
                    {col3.concat(col3).map((topic, i) => renderTopicCard(topic, `col3-${topic.code}-${i}`))}
                  </div>
                </div>
              </div>
            ) : (
              /* Interactive Vertically Scrollable Directory Container */
              <div
                className="max-h-[520px] sm:max-h-[580px] overflow-y-auto pr-2 sm:pr-3 tracks-scroll-container py-3"
                style={{
                  maskImage: "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
                  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 6%, black 94%, transparent 100%)",
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 pb-2">
                  {filteredTopics.map((topic) => renderTopicCard(topic, `grid-${topic.code}`))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </SectionContainer>
  );
}
