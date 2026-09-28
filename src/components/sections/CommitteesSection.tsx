"use client";

import React from "react";
import Image from "next/image";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { COMMITTEE_GROUPS, type CommitteeMember } from "@/data/conference";

// High-resolution chair portraits mapping (all normalized to 900x1200 3:4 transparent canvas)
const CHAIR_PHOTO_MAP: Record<string, string> = {
  // Honorary Chairs
  "Hieu-Giang Le": "/chairs/prof-hieu-giang-le.webp",
  "Saeid Nahavandi": "/chairs/prof-saeid-nahavandi.webp",
  // General Chairs & Co-Chairs
  "Dinh-Thanh Chau": "/chairs/prof-dinh-thanh-chau.webp",
  "Yo-Ping Huang": "/chairs/prof-yo-ping-huang.webp",
  // Steering Committee
  "Sam Kwong": "/chairs/steering/sam-kwong.webp",
  "Imre Rudas": "/chairs/steering/imre-rudas.webp",
  "Adrian Stoica": "/chairs/steering/adrian-stoica.webp",
  "Ljiljana Trajkovic": "/chairs/steering/ljiljana-trajkovic.webp",
  "Eddie Tunstel": "/chairs/steering/eddie-tunstel.webp",
  // Other Committee Leaders
  "Ha-Hai Phan": "/chairs/prof-ha-hai-phan.png",
  "Rodney Roberts": "/chairs/prof-rodney-roberts.png",
  "Vladik Kreinovich": "/chairs/prof-vladik-kreinovich.png",
};

interface CommitteesSectionProps {
  title?: string;
  subtitle?: string;
  autoplayDuration?: number;
  initialGroupIndex?: number;
  showAllGroups?: boolean;
}

export function CommitteesSection({
  title = "Organizing Committee",
  subtitle = "International Steering & Organizing Committees for IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
}: CommitteesSectionProps) {
  return (
    <SectionContainer id="committees" fullWidthBg="bg-white">
      {/* 1. Page / Section Header - Clean, No Badges */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full border-b border-slate-200">
        <div className="corner-dot-tr opacity-70 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight leading-[1.15]">
            <span className="block text-[#004776]">{title}</span>
            <span className="block text-[#115eff]">& Leadership</span>
          </h1>

          <p className="text-base sm:text-lg text-[#004776]/80 font-medium max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {/* 2. All Groups Displayed in a Single Page Group by Group */}
      <div className="px-4 sm:px-6 py-10 sm:py-14 space-y-12 sm:space-y-16">
        {COMMITTEE_GROUPS.map((group) => (
          <div key={group.groupName} className="space-y-6">
            {/* Group Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#115eff]/20 gap-2">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#115eff] rounded-full shrink-0" />
                <h2 className="text-xl sm:text-2xl font-bold text-[#004776] tracking-tight">
                  {group.groupName}
                </h2>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-slate-500 pl-4 sm:pl-0">
                {group.members.length} {group.members.length === 1 ? "Member" : "Members"}
              </span>
            </div>

            {/* Members Cards Grid - Strict 3:4 Photo Proportions Matching Card Width */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 sm:gap-6">
              {group.members.map((member, idx) => {
                const photo = CHAIR_PHOTO_MAP[member.name];
                return (
                  <div
                    key={`${member.name}-${idx}`}
                    className="group relative flex flex-col"
                  >
                    {/* The Card Box */}
                    <div className="relative rounded-2xl bg-white border border-slate-200 group-hover:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-hidden shadow-2xs hover:shadow-md">
                      {/* Top: Image Canvas with Slate/White Background (Hover: Solid Primary Blue #115eff) */}
                      <div className="relative w-full aspect-[3/4] bg-slate-50/70 group-hover:bg-[#115eff] transition-colors duration-300 overflow-hidden flex items-end justify-center">
                        {/* Clipped background elements (dots only) behind the cutout */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {/* Blue Dot Pattern */}
                          <div
                            className="absolute inset-0 bg-dot-pattern opacity-50 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                            style={{
                              maskImage:
                                "linear-gradient(to bottom right, transparent 25%, black 75%)",
                              WebkitMaskImage:
                                "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            }}
                          />

                          {/* Crisp White Dot Pattern in hover (blue) state */}
                          <div
                            className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                            style={{
                              maskImage:
                                "linear-gradient(to bottom right, transparent 25%, black 75%)",
                              WebkitMaskImage:
                                "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            }}
                          />
                        </div>

                        {/* Image strictly scaled and fitted inside the container */}
                        <div className="relative w-full h-full flex items-end justify-center z-10">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={member.name}
                              fill
                              className="object-contain object-bottom transition-transform duration-300 ease-out group-hover:scale-105"
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-6">
                              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white/90 border border-blue-200/80 group-hover:border-white/40 flex items-center justify-center text-[#115eff] group-hover:text-white group-hover:bg-white/20 font-bold text-xl sm:text-2xl shadow-xs transition-all duration-300">
                                {member.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .filter(Boolean)
                                  .slice(-2)
                                  .join("")}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Bottom Details Section */}
                      <div className="relative z-20 w-full p-4 sm:p-5 bg-white group-hover:bg-[#115eff] border-t border-slate-200 group-hover:border-white/20 transition-colors duration-300 flex flex-col justify-between flex-1 min-h-[110px]">
                        <div className="relative z-10">
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-[#115eff] group-hover:!text-white transition-colors duration-300 mb-1">
                            {member.role}
                          </span>
                          <h4 className="text-base font-bold text-[#004776] group-hover:!text-white tracking-tight leading-snug transition-colors duration-300 line-clamp-2">
                            {member.name}
                          </h4>
                          {member.affiliation && (
                            <p className="text-xs text-slate-500 group-hover:!text-white/80 mt-1 font-normal leading-relaxed transition-colors duration-300 line-clamp-2">
                              {member.affiliation}
                            </p>
                          )}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 group-hover:border-white/20 flex items-center justify-between text-xs text-slate-500 group-hover:text-white/80 transition-colors duration-300">
                          <span className="font-semibold text-slate-600 group-hover:text-white">
                            {member.country}
                          </span>
                          <span className="text-[#004776] group-hover:text-white/80 text-[11px] font-medium">
                            IEEE SMC 2027
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}

export default CommitteesSection;
