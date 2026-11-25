"use client";

import React from "react";
import Image from "next/image";
import {
  FileDown,
  CheckCircle,
  ExternalLink,
  Clock,
  Database,
  ShieldCheck,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";
import {
  DEFAULT_CFP_POLICIES,
  type CfpPolicyCardItem,
} from "@/components/sections/CfpPoliciesBlock";
import {
  DEFAULT_SUBMISSION_CATEGORIES,
  type SubmissionCategoryItem,
} from "@/components/sections/SubmissionCategoriesBlock";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface CallForPapersProps {
  title?: string;
  subtitle?: string;
  introText?: string;
  downloadButtonLabel?: string;
  cfpPdfUrl?: string;
  submissionUrl?: string;
  submissionDeadline?: string;
  showPolicyCards?: boolean;
  policyCards?: CfpPolicyCardItem[];
  showTrackCards?: boolean;
  trackCards?: SubmissionCategoryItem[];
  showBrochureBanner?: boolean;
  brochureBanner?: {
    title?: string;
    description?: string;
    previewButtonLabel?: string;
    hidePreviewButtonLabel?: string;
    openButtonLabel?: string;
  };
}

export function CallForPapers({
  title = "Call For Papers & Submission Guidelines",
  subtitle = "Submission Categories & Technical Topics • IEEE SMC 2027",
  introText = "The 2027 IEEE International Conference on Systems, Man, and Cybernetics invites original research papers, special session papers, workshop proposals, and tutorial presentations in systems science and engineering, human-machine systems, and cybernetics.",
  downloadButtonLabel = "Download CFP PDF",
  cfpPdfUrl = CONFERENCE_INFO.cfpPdfUrl,
  submissionDeadline = "April 08, 2027",
  submissionUrl = CONFERENCE_INFO.submissionPortal,
  showPolicyCards = true,
  policyCards,
  showTrackCards = true,
  trackCards,
  showBrochureBanner = true,
  brochureBanner,
}: CallForPapersProps) {
  const [showPdfViewer, setShowPdfViewer] = React.useState(false);
  const resolvedPdfUrl = (cfpPdfUrl ?? "").trim();

  const resolvedPolicies: CfpPolicyCardItem[] = Array.isArray(policyCards)
    ? policyCards
    : DEFAULT_CFP_POLICIES.map((p, idx) =>
        idx === 0
          ? { ...p, footerText: `Submission Deadline: ${submissionDeadline}` }
          : p
      );

  const resolvedTracks: SubmissionCategoryItem[] = Array.isArray(trackCards)
    ? trackCards
    : DEFAULT_SUBMISSION_CATEGORIES.map((cat, idx) =>
        idx < 2
          ? {
              ...cat,
              deadline: submissionDeadline,
              checklist:
                idx === 0
                  ? cat.checklist.map((item, cIdx) =>
                      cIdx === 1 ? { ...item, url: submissionUrl } : item
                    )
                  : cat.checklist,
            }
          : cat
      );

  const bannerTitle =
    brochureBanner?.title || "Official Call for Papers PDF Document";
  const bannerDesc =
    brochureBanner?.description ||
    "Official 2-page CFP brochure with complete track topics, submission dates, and committee directory.";
  const previewLabel = brochureBanner?.previewButtonLabel || "Preview PDF";
  const hidePreviewLabel =
    brochureBanner?.hidePreviewButtonLabel || "Hide PDF Preview";
  const openPdfLabel = brochureBanner?.openButtonLabel || "Open CFP PDF";

  return (
    <SectionContainer id="cfp" fullWidthBg="bg-white">
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
            <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
              {subtitle}
            </p>
          </div>

          {downloadButtonLabel && resolvedPdfUrl && (
            <div className="relative z-10 flex items-center gap-3">
              <a
                href={resolvedPdfUrl}
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

      <div className="px-4 sm:px-6 py-8 sm:py-10">
        {introText && (
          <div className="max-w-4xl">
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
              {introText}
            </p>
          </div>
        )}

        {showPolicyCards && resolvedPolicies.length > 0 && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {resolvedPolicies.map((policy, idx) => {
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
                  {...subItemAttr(["policyCards", idx])}
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

        {showTrackCards && resolvedTracks.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {resolvedTracks.map((cat, idx) => (
              <div
                key={idx}
                {...subItemAttr(["trackCards", idx])}
                className="p-6 sm:p-7 border border-blue-100/90 bg-white rounded-md relative hover:border-[#115eff] hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
                      {cat.image && (
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          width={96}
                          height={96}
                          unoptimized
                          className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {cat.badge && (
                        <span className="text-xs sm:text-sm font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-md">
                          {cat.badge}
                        </span>
                      )}
                      {cat.deadline && (
                        <span className="text-xs sm:text-sm font-semibold px-3 py-0.5 bg-blue-50/70 text-[#004776] rounded-md">
                          {cat.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#004776] tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {cat.description}
                  </p>
                </div>

                {Array.isArray(cat.checklist) && cat.checklist.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-blue-50 text-sm text-slate-700 space-y-2.5">
                    {cat.checklist.map((item, cIdx) => (
                      <div
                        key={cIdx}
                        {...subItemAttr(["trackCards", idx, "checklist", cIdx])}
                        className="flex items-center gap-2.5"
                      >
                        <CheckCircle className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                        {item.url ? (
                          <a href={item.url} className="hover:underline">
                            {item.text}
                          </a>
                        ) : (
                          <span>{item.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {showBrochureBanner && resolvedPdfUrl && (
          <>
            <div className="mt-8 p-6 sm:p-7 bg-blue-50/35 border border-blue-100/90 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <FileDown className="w-9 h-9 text-[#115eff] shrink-0" />
                <div>
                  <h4 className="text-base sm:text-lg font-bold text-[#004776]">
                    {bannerTitle}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">
                    {bannerDesc}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPdfViewer(!showPdfViewer)}
                  className={`inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 font-bold text-sm sm:text-[15px] rounded-[0.26rem] transition-all shadow-2xs cursor-pointer ${
                    showPdfViewer
                      ? "bg-[#115eff] hover:bg-[#0a4de6] text-white border border-[#115eff]"
                      : "bg-white hover:bg-[#115eff] text-[#115eff] hover:text-white border border-[#115eff]"
                  }`}
                >
                  <span>{showPdfViewer ? hidePreviewLabel : previewLabel}</span>
                </button>

                <a
                  href={resolvedPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 sm:px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-[15px] rounded-[0.26rem] transition-all shadow-sm hover:shadow-md"
                >
                  <span>{openPdfLabel}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {showPdfViewer && (
              <div className="mt-4 border border-blue-100/90 rounded-md overflow-hidden bg-blue-50/40 shadow-sm">
                <div className="px-4 py-2.5 bg-blue-50/80 border-b border-blue-100/90 flex items-center justify-between text-xs font-semibold text-[#004776]">
                  <span>{bannerTitle}</span>
                  <a
                    href={resolvedPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#115eff] font-bold hover:underline flex items-center gap-1"
                  >
                    <span>Open in full tab</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <iframe
                  src={resolvedPdfUrl}
                  title={bannerTitle}
                  className="w-full h-[640px] border-0"
                />
              </div>
            )}
          </>
        )}
      </div>
    </SectionContainer>
  );
}
