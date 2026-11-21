"use client";

import React from "react";
import Image from "next/image";
import { Clock, Database, ExternalLink, FileDown, ShieldCheck } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface CfpPolicyCardItem {
  iconImage?: string;
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerIcon?: "clock" | "database" | "shield";
}

export const DEFAULT_CFP_POLICIES: CfpPolicyCardItem[] = [
  {
    iconImage: "/assets/3d/announcement-3d.png",
    eyebrow: "Official Paper Submission Policy",
    title: "Submission Format & Language",
    description: CONFERENCE_INFO.submissionNotice,
    footerText: "Submission Deadline: April 08, 2027",
    footerIcon: "clock",
  },
  {
    iconImage: "/assets/3d/verified-badge-3d.png",
    eyebrow: "Proceedings & Copyright",
    title: "IEEE Xplore® Digital Library Publication",
    description: CONFERENCE_INFO.ieeeXploreNotice,
    footerText: "Indexed in Scopus, EI Compendex, and Web of Science",
    footerIcon: "database",
  },
];

export interface CfpPoliciesBlockProps {
  title?: string;
  subtitle?: string;
  introText?: string;
  cfpPdfUrl?: string;
  downloadButtonLabel?: string;
  policies?: CfpPolicyCardItem[];
}

export function CfpPoliciesBlock({
  title = "Call For Papers & Submission Policies",
  subtitle = "Author Guidelines & IEEE Xplore Publication Standards • IEEE SMC 2027",
  introText = "The 2027 IEEE International Conference on Systems, Man, and Cybernetics invites original research papers, special session papers, workshop proposals, and tutorial presentations across systems science, human-machine systems, and cybernetics.",
  cfpPdfUrl = CONFERENCE_INFO.cfpPdfUrl,
  downloadButtonLabel = "Download CFP PDF",
  policies = DEFAULT_CFP_POLICIES,
}: CfpPoliciesBlockProps) {
  const list = Array.isArray(policies) ? policies : [];

  return (
    <SectionContainer id="cfp-policies" fullWidthBg="bg-white">
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 w-full">
          <div className="space-y-3 flex-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] w-full">
              {title.includes("&") ? (
                <>
                  <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                  <span className="block text-[#115eff]">&amp; {title.split("&").slice(1).join("&").trim()}</span>
                </>
              ) : (
                <span className="block text-[#004776]">{title}</span>
              )}
            </h2>
            {subtitle && (
              <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {downloadButtonLabel && cfpPdfUrl && (
            <div className="relative z-10 flex items-center gap-3">
              <a
                href={cfpPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 bg-white hover:bg-[#115eff] text-[#115eff] hover:text-white border border-[#115eff] font-bold text-sm sm:text-[15px] rounded-[0.26rem] shadow-2xs transition-all"
              >
                <FileDown className="w-4.5 h-4.5" />
                <span>{downloadButtonLabel}</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-10 sm:pb-12 pt-4">
        {introText && (
          <div className="max-w-4xl mb-8">
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {introText}
            </p>
          </div>
        )}

        {list.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center text-sm text-slate-500">
            No submission policies added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {list.map((policy, idx) => {
              const legacy = policy as CfpPolicyCardItem & {
                badge?: string;
                linkLabel?: string;
              };
              const eyebrow = policy.eyebrow || legacy.badge || "";
              const footerText = policy.footerText || legacy.linkLabel || "";
              const FooterIcon =
                policy.footerIcon === "database"
                  ? Database
                  : policy.footerIcon === "shield"
                    ? ShieldCheck
                    : Clock;
              return (
                <div
                  key={idx}
                  {...subItemAttr(["policies", idx])}
                  className="p-6 sm:p-7 border border-blue-100/90 bg-white rounded-md shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    {(policy.iconImage || eyebrow) && (
                      <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-[#115eff] mb-2.5">
                        {policy.iconImage && (
                          <Image
                            src={policy.iconImage}
                            alt={eyebrow || policy.title}
                            width={40}
                            height={40}
                            unoptimized
                            className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0 drop-shadow-xs"
                          />
                        )}
                        {eyebrow && <span>{eyebrow}</span>}
                      </div>
                    )}
                    <h3 className="text-lg sm:text-xl font-bold text-[#004776] tracking-tight mb-3">
                      {policy.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {policy.description}
                    </p>
                  </div>

                  {footerText && (
                    <div className="mt-6 pt-4 border-t border-blue-50 flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#115eff]">
                      <FooterIcon className="w-4.5 h-4.5 shrink-0" />
                      <span>{footerText}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

