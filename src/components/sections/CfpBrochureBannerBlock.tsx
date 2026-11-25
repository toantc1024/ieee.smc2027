"use client";

import React, { useState } from "react";
import { ExternalLink, FileDown } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export interface CfpBrochureBannerBlockProps {
  title?: string;
  description?: string;
  cfpPdfUrl?: string;
  previewButtonLabel?: string;
  hidePreviewButtonLabel?: string;
  openButtonLabel?: string;
  viewerHeading?: string;
  defaultExpanded?: boolean;
}

export function CfpBrochureBannerBlock({
  title = "Official Call for Papers PDF Brochure",
  description = "Official 2-page CFP brochure with complete track topics, submission dates, and committee directory.",
  cfpPdfUrl = CONFERENCE_INFO.cfpPdfUrl,
  previewButtonLabel = "Preview PDF",
  hidePreviewButtonLabel = "Hide PDF Preview",
  openButtonLabel = "Open CFP PDF",
  viewerHeading = "Official 2-Page Brochure",
  defaultExpanded = false,
}: CfpBrochureBannerBlockProps) {
  const [showPdfViewer, setShowPdfViewer] = useState(defaultExpanded);
  const resolvedPdfUrl = (cfpPdfUrl ?? "").trim();

  return (
    <SectionContainer id="cfp-brochure" fullWidthBg="bg-white">
      <div className="px-4 sm:px-6 py-8">
        <div className="p-6 sm:p-7 bg-blue-50/35 border border-blue-100/90 rounded-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <FileDown className="w-9 h-9 text-[#115eff] shrink-0" />
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#004776]">
                {title}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {description}
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
              <span>{showPdfViewer ? hidePreviewButtonLabel : previewButtonLabel}</span>
            </button>

            {resolvedPdfUrl && (
              <a
                href={resolvedPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 sm:px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-[15px] rounded-[0.26rem] transition-all shadow-sm hover:shadow-md"
              >
                <span>{openButtonLabel}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {showPdfViewer && resolvedPdfUrl && (
          <div className="mt-4 border border-blue-100/90 rounded-md overflow-hidden bg-blue-50/40 shadow-sm">
            <div className="px-4 py-2.5 bg-blue-50/80 border-b border-blue-100/90 flex items-center justify-between text-xs font-semibold text-[#004776]">
              <span>{viewerHeading}</span>
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
              title={title}
              className="w-full h-[640px] border-0"
            />
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

