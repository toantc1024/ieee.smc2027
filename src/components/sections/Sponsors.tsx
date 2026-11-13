"use client";

import React from "react";
import { ArrowUpRight, Award, Building2 } from "lucide-react";
import { IeeeIcon } from "@/components/common/ProviderIcons";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";
import { IeeeSmc2027LogoGroup } from "@/components/common/IeeeSmc2027LogoGroup";

export interface SponsorItem {
  logo?: string;
  name: string;
  shortName: string;
  type: string;
  logoType: "hcmute" | "ieee" | "ieee-smc" | "ieee-cis" | "ieee-ras" | "most";
}

export const SPONSORS: SponsorItem[] = [
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
    <div className="w-12 h-12 rounded-[0.26rem] bg-blue-50/70 border border-blue-100/90 flex items-center justify-center text-[#004776] mb-3 group-hover:border-[#115eff] group-hover:text-[#115eff] transition-colors">
      <Building2 className="w-6 h-6" />
    </div>
  );
}

export interface SponsorsProps {
  sponsors?: SponsorItem[];
  title?: string;
  subtitle?: string;
}

export function Sponsors({
  sponsors = SPONSORS,
  title = "Sponsors & Partners & Supporting Societies",
  subtitle = "Partners & Organizing Institutions Supporting IEEE SMC 2027",
}: SponsorsProps) {
  return (
    <SectionContainer id="sponsors" fullWidthBg="bg-white">
      
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 w-full">
          <div className="space-y-3 flex-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] w-full">
              {title === "Sponsors & Partners & Supporting Societies" ? (
                <>
                  <span className="block text-[#004776]">Sponsors & Partners</span>
                  <span className="block text-[#115eff]">& Supporting Societies</span>
                </>
              ) : title.includes("&") ? (
                <>
                  <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                  <span className="block text-[#115eff]">& {title.split("&").slice(1).join("&").trim()}</span>
                </>
              ) : (
                <span className="block text-[#004776]">{title}</span>
              )}
            </h2>
            <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
              {subtitle}
            </p>
          </div>
        
        <a
          href={`mailto:${CONFERENCE_INFO.contactEmail}`}
          className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 sm:px-6 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-[15px] rounded-sm transition-all shadow-sm hover:shadow-md self-start md:self-auto"
        >
          <span>Download Sponsorship Prospectus</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>
    </div>

      {/* Sponsors Grid: Content aligned with header */}
      <div className="px-4 sm:px-6 py-8 sm:py-10 space-y-8">
        {/* Official Society Co-Sponsorship Banner Lockup */}
        <div className="w-full p-5 sm:p-8 bg-blue-50/40 border border-blue-100/90 rounded-sm flex flex-col items-center justify-center text-center">
          <span className="text-xs sm:text-sm font-bold text-[#004776]/75 mb-4">
            Official Technical Co-Sponsorship & Society Affiliation
          </span>
          <IeeeSmc2027LogoGroup variant="transparent" height={72} priority />
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {sponsors.map((s, index) => (
            <div
              key={index}
              className="p-5 bg-blue-50/35 border border-blue-100/90 rounded-sm text-center flex flex-col items-center justify-between min-h-[190px] sm:min-h-[215px] hover:border-[#115eff] hover:bg-white hover:shadow-md transition-all group"
            >
              {s.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={s.logo} alt={s.name} className="mb-3 h-12 w-full object-contain" />
              ) : <SponsorLogoBadge type={s.logoType} />}
              
              <div className="w-full pt-2 border-t border-blue-50">
                <div className="text-sm sm:text-base font-bold text-[#004776] group-hover:text-[#115eff] transition-colors leading-snug">
                  {s.shortName}
                </div>
                <div className="mt-1 text-xs text-slate-600 font-medium line-clamp-2">
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

