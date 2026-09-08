"use client";

import React from "react";
import {
  FileText,
  FileDown,
  ShieldCheck,
  Database,
  CheckCircle,
  ExternalLink,
  Clock,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { PaperCeptIcon } from "@/components/common/ProviderIcons";

export function CallForPapers() {
  return (
    <SectionContainer id="cfp" fullWidthBg="bg-white">
      {/* Section Header Strip with Top-Right Corner Dot Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-dot-tr opacity-60" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1 uppercase tracking-wider">
            Call for Papers (CFP)
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Submission Guidelines & Categories
          </h2>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <a
            href={CONFERENCE_INFO.cfpPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[50px] px-6 py-3 bg-white hover:bg-blue-50 border border-[#ccd7e2] text-[#115eff] text-sm sm:text-base font-bold rounded-[0.26rem] transition-all shadow-2xs hover:shadow-xs"
          >
            <FileDown className="w-4 h-4" />
            <span>Download CFP (PDF)</span>
          </a>

          <div className="inline-flex items-center justify-center gap-2 min-h-[50px] px-6 py-3 bg-[#115eff]/10 border border-[#115eff]/30 text-[#115eff] text-sm sm:text-base font-bold rounded-[0.26rem]">
            <PaperCeptIcon className="w-4 h-4" />
            <span>PaperCept Link Coming Shortly</span>
          </div>
        </div>
      </div>

      {/* Official Invitation & Submission Mandate from PDF */}
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        
        {/* Exact Introductory Text from CFP PDF */}
        <div className="p-5 sm:p-6 bg-blue-50/50 border border-blue-200/80 rounded-md">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#115eff] text-white text-xs font-bold rounded-md uppercase tracking-wider mb-2.5">
            Official Call for Papers
          </div>
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
            Authors are invited to submit original research papers to <strong>IEEE SMC 2027</strong> in Ho Chi Minh City, Vietnam. Submissions cover three technical pillars—<strong>Systems Science & Engineering (SSE)</strong>, <strong>Human–Machine Systems (HMS)</strong>, and <strong>Cybernetics (CYB)</strong>—under the theme <em>&ldquo;{CONFERENCE_INFO.theme}&rdquo;</em>.
          </p>
        </div>

        {/* Official Paper Submission Rules Box from PDF */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 sm:p-7 border border-[#ccd7e2] bg-white rounded-md shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#115eff] uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4" />
                <span>Official Paper Submission Policy</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                Submission Format & Language
              </h3>
              <p className="text-base text-slate-700 leading-relaxed">
                {CONFERENCE_INFO.submissionNotice}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Clock className="w-4 h-4 text-[#115eff]" />
              <span>Submission Deadline: April 08, 2027 (Workshops, Regular & Special Sessions)</span>
            </div>
          </div>

          <div className="p-6 sm:p-7 border border-[#ccd7e2] bg-white rounded-md shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-[#115eff] uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Proceedings & Copyright</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                IEEE Xplore® Digital Library Publication
              </h3>
              <p className="text-base text-slate-700 leading-relaxed">
                {CONFERENCE_INFO.ieeeXploreNotice}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-[#115eff]">
              <Database className="w-4 h-4" />
              <span>Indexed in Scopus, EI Compendex, and Web of Science</span>
            </div>
          </div>
        </div>

        {/* Paper Tracks Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Regular Papers */}
          <div className="p-6 sm:p-7 border border-slate-200 bg-white rounded-md relative hover:border-[#115eff] hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-sm font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-md">
                  Regular Papers
                </span>
                <span className="text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                  April 08, 2027
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Regular Research Papers
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Original research contributions presenting novel theory, experimental validations, or major system architectures in SSE, CYB, or HMS.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 text-sm text-slate-700 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Standard IEEE 2-column format (PDF)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>PaperCept electronic submission</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Oral presentation in podium sessions</span>
              </div>
            </div>
          </div>

          {/* Card 2: Special Sessions */}
          <div className="p-6 sm:p-7 border border-slate-200 bg-white rounded-md relative hover:border-[#115eff] hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-sm font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-md">
                  Special Sessions
                </span>
                <span className="text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                  April 08, 2027
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Special Session Papers
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Targeted research papers submitted to approved special sessions exploring focused multidisciplinary problems.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-sm text-slate-700 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Proposals deadline: Feb 15, 2027</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Organized by domain experts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Rigorous IEEE peer review</span>
              </div>
            </div>
          </div>

          {/* Card 3: Workshops & Tutorials */}
          <div className="p-6 sm:p-7 border border-slate-200 bg-white rounded-md relative hover:border-[#115eff] hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-sm font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-md">
                  Workshops & Tutorials
                </span>
                <span className="text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                  Feb 15 / Apr 08
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Workshops & Tutorials
              </h3>
              <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Proposals for hands-on workshops, technical tutorials, and accepted workshop technical papers.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-sm text-slate-700 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Proposal submission: Feb 15, 2027</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Acceptance notice: March 04, 2027</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Workshop paper deadline: Apr 08, 2027</span>
              </div>
            </div>
          </div>

        </div>

        {/* Official CFP Document Download Banner */}
        <div className="mt-8 p-6 sm:p-7 bg-slate-50 border border-slate-200/80 rounded-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <FileDown className="w-8 h-8 text-[#115eff] shrink-0" />
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Official Call for Papers (CFP) PDF Document
              </h4>
              <p className="text-sm text-slate-600 mt-0.5">
                Official 2-page CFP brochure with complete track topics, submission dates, and committee directory.
              </p>
            </div>
          </div>

          <a
            href={CONFERENCE_INFO.cfpPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-base rounded-[0.26rem] transition-all shadow-sm hover:shadow-md shrink-0"
          >
            <span>Open CFP PDF</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

      </div>
    </SectionContainer>
  );
}
