"use client";

import React from "react";
import { ArrowUpRight, Award, Building2 } from "lucide-react";
import { IeeeIcon } from "@/components/common/ProviderIcons";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

interface SponsorItem {
  name: string;
  shortName: string;
  type: string;
  logoType: "hcmute" | "ieee" | "ieee-smc" | "ieee-cis" | "ieee-ras" | "most";
}

const SPONSORS: SponsorItem[] = [
  {
    name: "IEEE Systems, Man, and Cybernetics Society",
    shortName: "IEEE SMC Society",
    type: "Financial Sponsor & Lead Organizer",
    logoType: "ieee-smc",
  },
  {
    name: "Ho Chi Minh City University of Technology and Engineering-Vietnam",
    shortName: "HCM-UTE",
    type: "Host Institution & Co-Organizer",
    logoType: "hcmute",
  },
  {
    name: "IEEE Vietnam Section",
    shortName: "IEEE Vietnam",
    type: "Technical Co-Sponsor",
    logoType: "ieee",
  },
  {
    name: "IEEE Computational Intelligence Society",
    shortName: "IEEE CIS",
    type: "Technical Partner",
    logoType: "ieee-cis",
  },
  {
    name: "IEEE Robotics & Automation Society",
    shortName: "IEEE RAS",
    type: "Technical Partner",
    logoType: "ieee-ras",
  },
  {
    name: "Ministry of Science and Technology, Vietnam",
    shortName: "MOST Vietnam",
    type: "Institutional Patron",
    logoType: "most",
  },
];

function SponsorLogoBadge({ type }: { type: SponsorItem["logoType"] }) {
  if (type === "hcmute") {
    return (
      <div className="w-12 h-12 relative flex items-center justify-center mb-3">
        <img
          src="/logo/square-logo.png"
          alt="HCM-UTE Emblem"
          className="w-full h-full object-contain"
        />
      </div>
    );
  }

  if (type === "ieee" || type === "ieee-smc") {
    return (
      <div className="w-12 h-12 rounded-[0.26rem] bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#115eff] mb-3 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
        <IeeeIcon className="w-7 h-7" />
      </div>
    );
  }

  if (type === "ieee-cis" || type === "ieee-ras") {
    return (
      <div className="w-12 h-12 rounded-[0.26rem] bg-blue-50 border border-blue-200/80 flex items-center justify-center text-[#115eff] mb-3 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
        <Award className="w-6 h-6" />
      </div>
    );
  }

  return (
    <div className="w-12 h-12 rounded-[0.26rem] bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mb-3 group-hover:border-[#115eff] group-hover:text-[#115eff] transition-colors">
      <Building2 className="w-6 h-6" />
    </div>
  );
}

export function Sponsors() {
  return (
    <SectionContainer id="sponsors" fullWidthBg="bg-white" borderBottom={true}>
      
      {/* Header Strip with Top-Right Corner Grid Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-grid-tr opacity-50" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] uppercase tracking-wider block mb-1">
            Partners & Organizing Institutions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Sponsors & Supporting Societies
          </h2>
        </div>
        
        {/* Customized Taller Button with 25% Larger Text */}
        <a
          href={`mailto:${CONFERENCE_INFO.contactEmail}`}
          className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 py-3.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-base rounded-[0.26rem] transition-all shadow-sm hover:shadow-md"
        >
          <span>Download Sponsorship Prospectus</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* Sponsors Grid: Content aligned with header */}
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {SPONSORS.map((s, index) => (
            <div
              key={index}
              className="p-5 bg-slate-50/70 border border-[#ccd7e2] rounded-[0.35rem] text-center flex flex-col items-center justify-between min-h-[168px] hover:border-[#115eff] hover:bg-white hover:shadow-md transition-all group"
            >
              <SponsorLogoBadge type={s.logoType} />
              
              <div className="w-full">
                <div className="text-sm font-bold text-slate-900 group-hover:text-[#115eff] transition-colors leading-snug">
                  {s.shortName}
                </div>
                <div className="mt-1 text-xs text-slate-500 font-medium line-clamp-2">
                  {s.type}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </SectionContainer>
  );
}

