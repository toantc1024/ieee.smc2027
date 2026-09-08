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
      {/* Section Header Strip with Top-Right Corner Grid Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-grid-tr opacity-50" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1 uppercase tracking-wider">
            Leadership & Governance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Organizing Committee
          </h2>
        </div>
        <span className="relative z-10 text-sm font-semibold text-[#115eff] bg-white border border-[#ccd7e2] px-4 py-2 rounded-full shadow-2xs">
          International Steering & Local Organizing Committees
        </span>
      </div>

      {/* Committee Category Tabs: Full Width Divider */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-[#ccd7e2] bg-slate-50/30 flex flex-wrap items-center gap-2">
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
