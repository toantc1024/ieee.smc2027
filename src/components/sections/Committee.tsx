"use client";

import React, { useState } from "react";
import { Globe } from "lucide-react";
import { COMMITTEE_GROUPS } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function Committee() {
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);

  const activeGroup = COMMITTEE_GROUPS[activeGroupIndex] || COMMITTEE_GROUPS[0];

  return (
    <SectionContainer id="committee" fullWidthBg="bg-white">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">Organizing Committee</span>
            <span className="block text-[#115eff]">& Leadership</span>
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
            International Steering & Local Organizing Committees
          </p>
        </div>
      </div>

      {/* Committee Category Tabs: Full Width Divider */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50/30 flex flex-wrap items-center gap-2">
        {COMMITTEE_GROUPS.map((group, idx) => (
          <button
            key={group.groupName}
            onClick={() => setActiveGroupIndex(idx)}
            className={`min-h-[40px] px-4 py-2 text-sm font-semibold rounded-[0.26rem] transition-colors ${
              activeGroupIndex === idx
                ? "bg-[#115eff] text-white shadow-xs"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {group.groupName}
          </button>
        ))}
      </div>

      {/* Members Grid */}
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {activeGroup.groupName}
          </h3>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {activeGroup.members.length} Members
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeGroup.members.map((member, index) => (
            <div
              key={index}
              className="p-5 bg-white border border-slate-200 rounded-md hover:border-[#115eff] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 border border-blue-200/80 text-[#115eff] rounded">
                    {member.role}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {member.country}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {member.name}
                </h4>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-medium text-slate-600">
                  <Globe className="w-3.5 h-3.5 text-[#115eff]" />
                  <span>{member.country}</span>
                </span>
                <span className="text-slate-400">IEEE SMC 2027</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SectionContainer>
  );
}
