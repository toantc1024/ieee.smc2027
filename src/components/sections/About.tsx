"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { GridPattern } from "@/components/ui/grid-pattern";
import { CONFERENCE_INFO } from "@/data/conference";

const AFFILIATED_PUBLICATIONS = [
  { name: "IEEE Trans. on Systems, Man, and Cybernetics: Systems", href: "https://www.ieeesmc.org" },
  { name: "IEEE Trans. on Human-Machine Systems", href: "https://www.ieeesmc.org" },
  { name: "IEEE Trans. on Computational Social Systems", href: "https://www.ieeesmc.org" },
  { name: "IEEE Systems, Man, and Cybernetics Magazine", href: "https://www.ieeesmc.org" },
];

export function About() {
  return (
    <SectionContainer id="about" fullWidthBg="bg-white">
      {/* Subtle top-right grid pattern with natural radial fade mask (hcmute style) */}
      <div className="pointer-events-none absolute top-0 right-0 h-80 w-80 select-none overflow-hidden">
        <GridPattern
          width={32}
          height={32}
          className="stroke-[#115eff]/[0.10] fill-transparent [mask-image:radial-gradient(ellipse_at_top_right,white_20%,transparent_75%)]"
        />
      </div>

      <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
        {/* Left: Shorter Concise Summary */}
        <div className="lg:col-span-5 space-y-3">
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-normal">
            <strong>IEEE SMC 2027</strong> is the flagship conference of the IEEE Systems, Man, and Cybernetics Society, hosted by <strong>HCM-UTE</strong> on <strong>October 6–10, 2027</strong> in Ho Chi Minh City, Vietnam.
          </p>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Theme: <em>&ldquo;{CONFERENCE_INFO.theme}&rdquo;</em>. Presented papers will appear in <strong>IEEE Xplore®</strong> and index in Scopus, EI Compendex, and Web of Science.
          </p>
        </div>

        {/* Right: Bigger Affiliated IEEE SMC Society Publications */}
        <div className="lg:col-span-7 p-6 sm:p-7 bg-slate-50 border border-slate-200 rounded-md shadow-2xs">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-200">
            Affiliated IEEE SMC Publications
          </h3>
          <ul className="space-y-3">
            {AFFILIATED_PUBLICATIONS.map((pub, idx) => (
              <li key={idx}>
                <a
                  href={pub.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 sm:p-4 bg-white border border-slate-200 hover:border-[#115eff] rounded-md flex items-center justify-between transition-all hover:shadow-xs group block"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#115eff] transition-colors pr-3">
                    {pub.name}
                  </span>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#115eff] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionContainer>
  );
}
