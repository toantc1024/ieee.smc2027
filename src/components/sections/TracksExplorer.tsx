"use client";

import React, { useState } from "react";
import { Search, Layers, Cpu, Users } from "lucide-react";
import { TECHNICAL_TRACKS } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function TracksExplorer() {
  const [activePillarId, setActivePillarId] = useState<string>("systems");
  const [searchQuery, setSearchQuery] = useState<string>("");

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

  return (
    <SectionContainer id="tracks" fullWidthBg="bg-[#115eff] text-white" borderColor="border-white/20">
      
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
      <div className="grid grid-cols-1 md:grid-cols-3 border-b border-white/20 divide-y md:divide-y-0 md:divide-x divide-white/20 bg-blue-800/40">
        {TECHNICAL_TRACKS.map((pillar) => {
          const isActive = pillar.id === activePillarId;
          return (
            <button
              key={pillar.id}
              onClick={() => setActivePillarId(pillar.id)}
              className={`px-4 sm:px-6 py-6 sm:py-7 text-left transition-all relative ${
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

      {/* Active Pillar Topic Grid */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-8 sm:py-10">
        <div className="corner-dot-dark-bl opacity-30" />

        <div className="relative z-10 mb-8 p-5 bg-white/10 border border-white/20 rounded-md backdrop-blur-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200 mb-1">
              Official CFP Scope
            </div>
            <p className="text-sm sm:text-base text-blue-50 leading-relaxed">
              We particularly encourage submissions that focus on the following topics (but are not limited to):
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 bg-white/15 border border-white/25 rounded-md text-white shrink-0">
            {activePillar.topics.length} Topics in {activePillar.code}
          </span>
        </div>

        {filteredTopics.length === 0 ? (
          <div className="relative z-10 py-12 text-center text-base text-blue-200">
            No topics matched &ldquo;{searchQuery}&rdquo; in this pillar. Try another keyword or switch pillars.
          </div>
        ) : (
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {filteredTopics.map((topic) => (
              <div
                key={topic.code}
                className="p-5 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/40 backdrop-blur-xs rounded-md transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
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
                  <span>IEEE SMC 2027 Topic</span>
                  <span className="font-semibold text-white/90">PaperCept</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </SectionContainer>
  );
}
