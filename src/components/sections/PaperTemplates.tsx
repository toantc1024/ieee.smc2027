"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  CheckCircle,
  FileCode,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Copy,
  Check,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export interface PaperTemplatesProps {
  title?: string;
  subtitle?: string;
}

export function PaperTemplates({
  title = "Author Submission Templates & Guidelines",
  subtitle = "Download official IEEE manuscript templates in LaTeX and Microsoft Word formats",
}: PaperTemplatesProps) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleCopyLink = (name: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(name);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const templates = [
    {
      name: "IEEE LaTeX Template Package",
      format: "LaTeX (zip)",
      icon: FileCode,
      description: "Complete IEEEtran class package including sample .tex, IEEEtran.cls, bibliography style, and build script for conference proceedings.",
      fileSize: "1.2 MB (.ZIP)",
      downloadUrl: "https://www.ieee.org/content/dam/ieee-org/ieee/web/org/conferences/conference-template-a4.zip",
      instructions: "Compile using pdflatex or xelatex. Ensure all fonts are embedded and margins match standard US Letter format.",
    },
    {
      name: "IEEE Microsoft Word Template",
      format: "MS Word (.DOCX)",
      icon: FileText,
      description: "Pre-styled Microsoft Word template with built-in styles for title, author affiliations, abstract, headings, and equations.",
      fileSize: "480 KB (.DOCX)",
      downloadUrl: "https://www.ieee.org/content/dam/ieee-org/ieee/web/org/conferences/conference-template-letter.docx",
      instructions: "Replace the sample text directly. Do not modify page margins, font sizes, or column widths.",
    },
  ];

  const guidelines = [
    {
      label: "Regular & Special Session Papers",
      limit: "Up to 6 pages",
      detail: "Up to 2 additional overlength pages allowed at $100 per page upon acceptance.",
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

  return (
    <SectionContainer id="templates" fullWidthBg="bg-white">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">Paper Templates</span>
            <span className="block text-[#115eff]">& Author Guidelines</span>
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Template Cards */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="text-lg font-bold text-slate-900">
              Download Official Conference Templates
            </h3>

            <div className="space-y-4">
              {templates.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <div
                    key={tpl.name}
                    className="p-6 bg-slate-50/70 border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white border border-slate-200 text-[#115eff] rounded-lg flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-[#115eff] transition-colors">
                            {tpl.name}
                          </h4>
                          <span className="text-xs font-semibold text-slate-500">
                            {tpl.format} • {tpl.fileSize}
                          </span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-600">
                        Official IEEE
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      {tpl.description}
                    </p>

                    <div className="p-3 bg-white border border-slate-200/80 rounded-md text-xs text-slate-500 mb-5">
                      <strong className="text-slate-700">Usage Note: </strong>
                      {tpl.instructions}
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href={tpl.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-md transition-all shadow-xs"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Template</span>
                      </a>

                      <button
                        onClick={() => handleCopyLink(tpl.name, tpl.downloadUrl)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-xs rounded-md transition-colors"
                      >
                        {copiedLink === tpl.name ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notice Callout */}
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>IEEE PDF eXpress Compliance: </strong>
                All final camera-ready papers must be validated through IEEE PDF eXpress before final submission to ensure compatibility with the IEEE Xplore® Digital Library. Detailed PDF eXpress conference credentials will be provided upon paper acceptance.
              </div>
            </div>
          </div>

          {/* Right Column: Submission Specifications & Checklist */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Page Length Standards */}
            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 mb-4">
                Page Length & Type Limits
              </h3>

              <div className="space-y-3.5">
                {guidelines.map((g) => (
                  <div key={g.label} className="p-3 bg-white border border-slate-200 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {g.label}
                      </span>
                      <span className="px-2 py-0.5 bg-blue-50 text-[#115eff] font-bold text-xs rounded border border-blue-100">
                        {g.limit}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {g.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Manuscript Quality Checklist */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3">
                Pre-Submission Checklist
              </h3>

              <ul className="space-y-2.5 text-xs text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0 mt-0.5" />
                  <span>Document is strictly formatted in US Letter size (8.5&quot; x 11&quot;).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0 mt-0.5" />
                  <span>All author affiliations, names, and emails are correctly positioned.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0 mt-0.5" />
                  <span>Abstract does not exceed 250 words and provides a self-contained summary.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0 mt-0.5" />
                  <span>All figures, graphs, and schematics have a minimum resolution of 300 DPI.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0 mt-0.5" />
                  <span>No page numbers, headers, or footers appear in the draft manuscript.</span>
                </li>
              </ul>

              <div className="pt-3 border-t border-slate-100">
                <a
                  href="https://www.ieee.org/conferences/publishing/templates.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#115eff] hover:underline"
                >
                  <span>Visit IEEE Official Author Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>

        </div>
      </div>
    </SectionContainer>
  );
}
