"use client";

import React from "react";
import { FileText, Download, ArrowUpRight, ShieldCheck, Database, Award, CheckCircle } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { EasyChairIcon } from "@/components/common/ProviderIcons";

export function CallForPapers() {
  return (
    <SectionContainer id="cfp" fullWidthBg="bg-white">
      {/* Section Header Strip with Top-Right Corner Dot Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-dot-tr opacity-60" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1">
            Author Guidelines & Paper Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Call for Papers (CFP)
          </h2>
        </div>

        <a
          href={CONFERENCE_INFO.submissionPortal}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 py-3.5 bg-[#115eff] hover:bg-[#0a4de6] text-white text-base font-bold rounded-[0.26rem] transition-all shadow-sm hover:shadow-md"
        >
          <EasyChairIcon className="w-5 h-5 text-white" />
          <span>Open EasyChair Submission Portal</span>
          <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      {/* Main CFP Overview */}
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        <div className="max-w-3xl">
          <p className="text-lg text-slate-700 leading-relaxed font-normal">
            The IEEE SMC 2027 Program Committee cordially invites original, high-quality research contributions spanning theoretical advances, methodologies, and engineering applications across systems science, human-machine symbiosis, and cybernetics.
          </p>
        </div>

        {/* Paper Tracks Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Regular Papers */}
          <div className="p-6 sm:p-7 border border-slate-200 bg-white rounded-md relative hover:border-[#115eff] hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-sm font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-md">
                  Category 1
                </span>
                <span className="text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                  6–8 Pages
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Regular Research Papers
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Complete, original research papers reporting novel theoretical derivations, experimental validations, or major system architectures.
              </p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-slate-100 text-sm text-slate-700 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>6 standard pages (IEEE format)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Up to 2 extra pages allowed</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Oral presentation in sessions</span>
              </div>
            </div>
          </div>

          {/* Card 2: Special Sessions */}
          <div className="p-6 sm:p-7 border border-slate-200 bg-white rounded-md relative hover:border-[#115eff] hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-sm font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-md">
                  Category 2
                </span>
                <span className="text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                  Organized Tracks
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Special Session Papers
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Focused contributions submitted to accepted special sessions exploring targeted or emerging multidisciplinary problems.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-sm text-slate-700 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Identical peer-review standard</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Organized by leading domain experts</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Dedicated themed podium session</span>
              </div>
            </div>
          </div>

          {/* Card 3: Industry & Work-in-Progress */}
          <div className="p-6 sm:p-7 border border-slate-200 bg-white rounded-md relative hover:border-[#115eff] hover:shadow-lg transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-sm font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-md">
                  Category 3
                </span>
                <span className="text-sm font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-md">
                  4–6 Pages
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Industry & Short Papers
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Industrial deployments, testbed reports, late-breaking discoveries, and interactive poster presentations.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-sm text-slate-700 space-y-2.5">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>4 to 6 IEEE format pages</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Rapid review and early feedback</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-[#115eff] shrink-0" />
                <span>Poster & interactive demo showcase</span>
              </div>
            </div>
          </div>

        </div>

        {/* Submission Rules & Publication Strip */}
        <div className="mt-8 p-6 sm:p-7 bg-slate-50 border border-slate-200/80 rounded-md grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-[#115eff] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Peer Review & Integrity</h4>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Single-blind peer review with at least three independent referees per manuscript. Plagiarism checks are strictly enforced via CrossCheck.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Database className="w-6 h-6 text-[#115eff] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">IEEE Xplore & Indexing</h4>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Accepted papers presented at the conference will be published in the IEEE SMC 2027 proceedings and submitted to IEEE Xplore.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <Award className="w-6 h-6 text-[#115eff] mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-slate-900">Best Paper Awards</h4>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                Franklin V. Taylor Memorial Award, Best Student Paper Award, and Outstanding Systems Application Award will be presented at the banquet.
              </p>
            </div>
          </div>
        </div>

      </div>
    </SectionContainer>
  );
}
