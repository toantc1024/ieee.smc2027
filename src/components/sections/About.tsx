"use client";

import React from "react";
import { ArrowUpRight, Award, BookOpen, Building2, CheckCircle2, ShieldCheck } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export function About() {
  return (
    <SectionContainer id="about" fullWidthBg="bg-white">
      {/* Section Header Strip with Top-Right Corner Grid Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-grid-tr opacity-50" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1">
            About the Conference & Host Institution
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About IEEE SMC 2027 & HCM-UTE
          </h2>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-sm font-semibold text-[#115eff] bg-white border border-[#ccd7e2] px-4 py-2 rounded-full shadow-2xs">
          <span>Global Impact • Over 50 Years of IEEE SMC Excellence</span>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* Left Column: Narrative with 25% larger text */}
        <div className="lg:col-span-7 space-y-5 text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
          <p>
            The <strong>IEEE Systems, Man, and Cybernetics (SMC) Society</strong> is the world&apos;s leading international academic community committed to advancing the theory, practice, and real-world deployment of systems science and engineering, human-machine systems, and cybernetic intelligence.
          </p>
          <p>
            For its 2027 edition, the conference is proudly hosted in <strong>Ho Chi Minh City, Vietnam</strong> by the <strong>Ho Chi Minh City University of Technology and Education (HCM-UTE)</strong> — a premier national institution established in 1962 renowned for pioneering engineering education, robotics, mechatronics, and artificial intelligence.
          </p>
          <p>
            Under the guiding theme <em>&ldquo;{CONFERENCE_INFO.theme}&rdquo;</em>, IEEE SMC 2027 will convene over 1,200 international scholars, engineers, and industry leaders to discuss cutting-edge advances in brain-computer interfaces, autonomous swarm systems, resilient cyber-physical infrastructure, and human-AI teaming.
          </p>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-md flex items-start gap-3.5">
              <ShieldCheck className="w-6 h-6 text-[#115eff] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">IEEE Xplore Inclusion</h4>
                <p className="text-sm text-slate-600 mt-1">
                  All accepted & presented papers will be submitted to IEEE Xplore, indexed in Scopus, EI Compendex & Web of Science.
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200/80 rounded-md flex items-start gap-3.5">
              <Building2 className="w-6 h-6 text-[#115eff] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">HCM-UTE Host Campus</h4>
                <p className="text-sm text-slate-600 mt-1">
                  State-of-the-art Grand Hall and modern auditoriums located conveniently along Metro Line 1 in Ho Chi Minh City.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Affiliated Transactions & Publication Highlights */}
        <div className="lg:col-span-5 p-6 sm:p-7 bg-slate-50/70 border border-slate-200/80 rounded-md flex flex-col justify-between">
          <div>
            <div className="text-sm font-bold text-slate-900 mb-3.5 pb-2.5 border-b border-slate-200 flex items-center justify-between">
              <span>Affiliated IEEE SMC Transactions</span>
              <span className="text-xs font-bold text-[#115eff] bg-blue-100/70 px-2.5 py-1 rounded">
                Flagship Journals
              </span>
            </div>

            <p className="text-sm text-slate-600 mb-4">
              Selected outstanding papers will be invited for expanded versions in high-impact IEEE Transactions:
            </p>

            <ul className="space-y-3 text-sm text-slate-800">
              <li className="p-3.5 bg-white border border-slate-200 rounded-md flex items-center justify-between hover:border-[#115eff] hover:shadow-xs transition-all">
                <span className="font-semibold text-slate-900">
                  IEEE Trans. on Systems, Man, and Cybernetics: Systems
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#115eff]" />
              </li>
              <li className="p-3.5 bg-white border border-slate-200 rounded-md flex items-center justify-between hover:border-[#115eff] hover:shadow-xs transition-all">
                <span className="font-semibold text-slate-900">
                  IEEE Trans. on Human-Machine Systems
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#115eff]" />
              </li>
              <li className="p-3.5 bg-white border border-slate-200 rounded-md flex items-center justify-between hover:border-[#115eff] hover:shadow-xs transition-all">
                <span className="font-semibold text-slate-900">
                  IEEE Trans. on Computational Social Systems
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#115eff]" />
              </li>
              <li className="p-3.5 bg-white border border-slate-200 rounded-md flex items-center justify-between hover:border-[#115eff] hover:shadow-xs transition-all">
                <span className="font-semibold text-slate-900">
                  IEEE Systems, Man, and Cybernetics Magazine
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#115eff]" />
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-3.5 border-t border-slate-200 flex items-center justify-between text-sm text-slate-600">
            <span>Indexed in IEEE Xplore & Scopus</span>
            <span className="font-bold text-[#115eff]">Peer-Reviewed</span>
          </div>
        </div>

      </div>

    </SectionContainer>
  );
}
