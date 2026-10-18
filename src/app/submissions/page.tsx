"use client";

import React from "react";
import {
  ExternalLink,
  Download,
  Calendar,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export default function SubmissionsPage() {
  const submissionPortals = [
    {
      name: "PaperCept Conference Portal",
      system: "PaperCept",
      status: "Official IEEE SMC",
      badge: "Primary Portal",
      description:
        "Standard manuscript submission system of the IEEE SMC Society. Includes automated PDF eXpress verification, author management, and peer-review tracking.",
      url: "https://ras.papercept.net",
      primary: true,
    },
    {
      name: "EDAS Conference Management",
      system: "EDAS",
      status: "Mirror Portal",
      badge: "Mirror Portal",
      description:
        "International conference submission portal supporting technical track selection and editorial review status tracking.",
      url: "https://edas.info",
      primary: false,
    },
    {
      name: "Microsoft CMT / B-Young System",
      system: "CMT / B-Young",
      status: "Regional Support",
      badge: "Regional Access",
      description:
        "Dedicated submission and review coordination portal for organized Special Sessions and regional symposium tracks.",
      url: "https://cmt3.research.microsoft.com",
      primary: false,
    },
  ];

  const milestones = [
    {
      date: "April 08, 2027",
      event: "Full Manuscript Submission Deadline for Regular, Special Sessions & Workshops",
      status: "Upcoming",
    },
    {
      date: "May 30, 2027",
      event: "Notification of Paper Acceptance",
      status: "Upcoming",
    },
    {
      date: "July 15, 2027",
      event: "Final Camera-Ready Paper Submission Deadline",
      status: "Upcoming",
    },
    {
      date: "August 05, 2027",
      event: "Author Registration Deadline",
      status: "Upcoming",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50/60 pb-20">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <SectionContainer id="submissions-header" fullWidthBg="bg-white" className="py-10 sm:py-14">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#115eff] border border-blue-100">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Call For Papers & Submission Portals</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Submission Portals & <span className="text-[#115eff]">Author Guidelines</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Official IEEE double-column formatting instructions, LaTeX and Word templates, and direct links to PaperCept, EDAS, and CMT submission systems.
            </p>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="submissions-body" fullWidthBg="transparent" className="pt-8">
        <div className="space-y-10">
          {/* 1. Portals Grid */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              1. Online Submission Portals
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              All manuscripts submitted to IEEE SMC 2027 must be original research not previously published or currently under review elsewhere.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {submissionPortals.map((portal, idx) => (
                <div
                  key={idx}
                  className={`bg-white rounded-3xl border-2 p-6 sm:p-7 flex flex-col justify-between transition-all ${
                    portal.primary
                      ? "border-[#115eff] shadow-lg ring-4 ring-blue-50"
                      : "border-slate-200 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          portal.primary
                            ? "bg-blue-100 text-[#115eff]"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {portal.badge}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{portal.system}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {portal.name}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">
                      {portal.description}
                    </p>
                  </div>

                  <a
                    href={portal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      portal.primary
                        ? "bg-[#115eff] text-white hover:bg-[#0a4de6] shadow-md"
                        : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <span>Open {portal.system} Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Manuscript Templates & Requirements */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              2. Manuscript Formatting & Templates
            </h2>
            <p className="text-sm text-slate-500 mb-6">
              All papers must strictly adhere to the standard IEEE two-column US Letter conference format.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LaTeX Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#115eff] flex items-center justify-center font-black">
                      TeX
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        LaTeX Conference Template
                      </h4>
                      <span className="text-xs text-slate-500">IEEEtran.cls format</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Standard LaTeX archive containing document class files, bibliography styles, and sample BibTeX instructions.
                  </p>
                </div>

                <a
                  href="https://www.ieee.org/conferences/publishing/templates.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#115eff] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download IEEE LaTeX Package</span>
                </a>
              </div>

              {/* Word Card */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black">
                      DOC
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-slate-900">
                        Microsoft Word Template
                      </h4>
                      <span className="text-xs text-slate-500">.DOCX US Letter</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Pre-configured two-column Microsoft Word template with official IEEE typography, margins, headings, and citation styles.
                  </p>
                </div>

                <a
                  href="https://www.ieee.org/conferences/publishing/templates.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#115eff] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Word Template (.docx)</span>
                </a>
              </div>
            </div>

            {/* Checklist */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Pre-Submission Checklist:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Standard length up to 6 pages including figures, tables, and references.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Peer-reviewed according to official IEEE SMC Society quality standards.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Final camera-ready PDFs must pass IEEE PDF eXpress compliance checks.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>At least one author must complete Author Registration for proceedings publication.</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Important Dates */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
              3. Important Submission Deadlines
            </h2>
            <div className="mt-6 space-y-3">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-[#115eff] shrink-0" />
                    <span className="text-sm font-bold text-slate-900">{m.event}</span>
                  </div>
                  <span className="font-mono text-xs font-black text-[#115eff] bg-white px-3 py-1 rounded-lg border border-slate-200 shrink-0">
                    {m.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionContainer>
    </main>
  );
}
