"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  FileCode,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export const PAPER_TEMPLATE_ITEMS = [
  {
    name: "IEEE LaTeX Template Package",
    format: "LaTeX ZIP",
    icon: FileCode,
    description:
      "Complete IEEEtran class package including sample .tex, IEEEtran.cls, bibliography style, and build script for conference proceedings.",
    fileSize: "1.2 MB",
    downloadUrl:
      "https://www.ieee.org/content/dam/ieee-org/ieee/web/org/conferences/conference-template-a4.zip",
    instructions:
      "Compile using pdflatex or xelatex. Ensure all fonts are embedded and margins match standard US Letter format.",
  },
  {
    name: "IEEE Microsoft Word Template",
    format: "MS Word DOCX",
    icon: FileText,
    description:
      "Pre-styled Microsoft Word template with built-in styles for title, author affiliations, abstract, headings, and equations.",
    fileSize: "480 KB",
    downloadUrl:
      "https://www.ieee.org/content/dam/ieee-org/ieee/web/org/conferences/conference-template-letter.docx",
    instructions:
      "Replace the sample text directly. Do not modify page margins, font sizes, or column widths.",
  },
];

export const PAPER_GUIDELINES = [
  {
    label: "Regular & Special Session Papers",
    limit: "Up to 6 pages",
    detail:
      "Up to 2 additional overlength pages allowed at $100 per page upon acceptance.",
  },
  {
    label: "Work-in-Progress & Industry Papers",
    limit: "Up to 4 pages",
    detail: "Total length including all figures, tables, and references.",
  },
  {
    label: "Workshop Technical Papers",
    limit: "Up to 6 pages",
    detail: "Undergoes same rigorous peer-review standard as regular papers.",
  },
  {
    label: "Call for Two-Page Abstracts",
    limit: "Strictly 2 pages",
    detail: "Poster and rapid presentation format for cutting-edge emerging ideas.",
  },
];

export const DEFAULT_PRE_SUBMISSION_CHECKLIST = [
  { text: 'Document is strictly formatted in US Letter size 8.5" x 11".' },
  { text: "All author affiliations, names, and emails are correctly positioned." },
  { text: "Abstract does not exceed 250 words and provides a self-contained summary." },
  { text: "All figures, graphs, and schematics have a minimum resolution of 300 DPI." },
  { text: "No page numbers, headers, or footers appear in the draft manuscript." },
];

export interface PaperTemplatesProps {
  templates?: Array<Omit<(typeof PAPER_TEMPLATE_ITEMS)[number], "icon">>;
  guidelines?: typeof PAPER_GUIDELINES;
  title?: string;
  subtitle?: string;
  templatesHeading?: string;
  officialBadgeLabel?: string;
  showComplianceNotice?: boolean;
  complianceTitle?: string;
  complianceMessage?: string;
  guidelinesHeading?: string;
  checklistHeading?: string;
  checklistItems?: Array<{ text: string }>;
  authorCenterLabel?: string;
  authorCenterUrl?: string;
}

export function PaperTemplates({
  templates = PAPER_TEMPLATE_ITEMS,
  guidelines = PAPER_GUIDELINES,
  title = "Author Submission Templates & Guidelines",
  subtitle = "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
  templatesHeading = "Download Official Conference Templates",
  officialBadgeLabel = "Official IEEE",
  showComplianceNotice = true,
  complianceTitle = "IEEE PDF eXpress Compliance",
  complianceMessage = "All final camera-ready papers must be validated through IEEE PDF eXpress before final submission to ensure compatibility with the IEEE Xplore Digital Library. Detailed PDF eXpress conference credentials will be provided upon paper acceptance.",
  guidelinesHeading = "Page Length & Type Limits",
  checklistHeading = "Pre-Submission Checklist",
  checklistItems = DEFAULT_PRE_SUBMISSION_CHECKLIST,
  authorCenterLabel = "Visit IEEE Official Author Center",
  authorCenterUrl = "https://www.ieee.org/conferences/publishing/templates.html",
}: PaperTemplatesProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const safeTemplates = Array.isArray(templates) ? templates : [];
  const safeGuidelines = Array.isArray(guidelines) ? guidelines : [];
  const safeChecklist = Array.isArray(checklistItems) ? checklistItems : [];

  const handleCopyLink = (name: string, url: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(name);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  return (
    <SectionContainer id="templates" fullWidthBg="bg-white">
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold tracking-tight leading-[1.2] w-full">
            {title.includes("&") ? (
              <>
                <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                <span className="block text-[#115eff]">&amp; {title.split("&").slice(1).join("&").trim()}</span>
              </>
            ) : (
              <span className="block text-[#004776]">{title}</span>
            )}
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {templatesHeading && (
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
                {templatesHeading}
              </h3>
            )}

            {safeTemplates.length === 0 ? (
              <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-6 text-center text-sm text-slate-500">
                No templates added yet.
              </div>
            ) : (
              <div className="space-y-4">
                {safeTemplates.map((tpl, idx) => {
                  const Icon = (tpl.format || "").toLowerCase().includes("latex")
                    ? FileCode
                    : FileText;
                  return (
                    <div
                      key={`${tpl.name}-${idx}`}
                      {...subItemAttr(["templates", idx])}
                      className="p-6 sm:p-7 bg-slate-50/70 border border-slate-200 hover:border-[#115eff] rounded-sm shadow-2xs hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 bg-white border border-slate-200 text-[#115eff] rounded-sm flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-[#115eff] transition-colors">
                              {tpl.name}
                            </h4>
                            <span className="text-sm font-semibold text-slate-500">
                              {tpl.format}
                              {tpl.fileSize ? ` • ${tpl.fileSize}` : ""}
                            </span>
                          </div>
                        </div>

                        {officialBadgeLabel && (
                          <span className="px-2.5 py-1 bg-white border border-slate-200/75 rounded-sm text-xs font-bold text-slate-700">
                            {officialBadgeLabel}
                          </span>
                        )}
                      </div>

                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-4">
                        {tpl.description}
                      </p>

                      {tpl.instructions && (
                        <div className="p-3.5 bg-white border border-slate-200/80 rounded-sm text-sm text-slate-600 mb-5 leading-relaxed">
                          <strong className="text-slate-800">Usage Note: </strong>
                          {tpl.instructions}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href={tpl.downloadUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-base rounded-sm transition-all shadow-xs"
                        >
                          <Download className="w-4.5 h-4.5" />
                          <span>Download Template</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => handleCopyLink(tpl.name, tpl.downloadUrl)}
                          className="inline-flex items-center gap-1.5 min-h-[46px] px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-sm rounded-sm transition-colors cursor-pointer"
                        >
                          {copiedLink === tpl.name ? (
                            <>
                              <Check className="w-4 h-4 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {showComplianceNotice && complianceMessage && (
              <div className="p-4.5 bg-amber-50/70 border border-amber-200 rounded-sm flex items-start gap-3.5 text-sm text-amber-900 leading-relaxed">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  {complianceTitle && (
                    <strong className="font-bold">{complianceTitle}: </strong>
                  )}
                  {complianceMessage}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 sm:p-7 bg-slate-50 border border-slate-200 rounded-sm shadow-2xs">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
                {guidelinesHeading}
              </h3>

              {safeGuidelines.length === 0 ? (
                <p className="text-sm text-slate-500">No page limits added yet.</p>
              ) : (
                <div className="space-y-3.5">
                  {safeGuidelines.map((g, idx) => (
                    <div
                      key={`${g.label}-${idx}`}
                      {...subItemAttr(["guidelines", idx])}
                      className="p-3.5 bg-white border border-slate-200 rounded-sm"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {g.label}
                        </span>
                        <span className="px-2.5 py-1 bg-blue-50 text-[#115eff] font-bold text-xs sm:text-sm rounded-sm border border-blue-100">
                          {g.limit}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {g.detail}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-sm shadow-2xs space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-200 pb-3">
                {checklistHeading}
              </h3>

              <ul className="space-y-3 text-sm sm:text-base text-slate-700">
                {safeChecklist.map((item, idx) => (
                  <li
                    key={idx}
                    {...subItemAttr(["checklistItems", idx])}
                    className="flex items-start gap-2.5"
                  >
                    <CheckCircle className="w-5 h-5 text-[#115eff] shrink-0 mt-0.5" />
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>

              {authorCenterLabel && (
                <div className="pt-3 border-t border-slate-100">
                  <a
                    href={authorCenterUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#115eff] hover:underline"
                  >
                    <span>{authorCenterLabel}</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
