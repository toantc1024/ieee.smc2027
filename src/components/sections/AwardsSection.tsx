"use client";

import React from "react";
import { Award, Trophy, Medal, Star } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

interface AwardsProps {
  title?: string;
  subtitle?: string;
}

const AWARDS_LIST = [
  {
    icon: Trophy,
    title: "Best Overall Conference Paper Award",
    description: "Honoring the paper demonstrating the highest scientific novelty, rigorous methodology, and exceptional practical impact across all conference tracks.",
    prize: "Commemorative Plaque & Honorarium",
  },
  {
    icon: Medal,
    title: "Best Student Paper Award",
    description: "Awarded to the most outstanding paper whose primary author and presenter is a matriculated student at the time of submission.",
    prize: "Student Travel Grant & IEEE SMC Certificate",
  },
  {
    icon: Award,
    title: "Franklin V. Taylor Memorial Award",
    description: "Prestigious IEEE SMC Society award recognizing exemplary research advancing human-machine systems science and engineering.",
    prize: "Society Plaque & Plenary Recognition",
  },
  {
    icon: Star,
    title: "Norbert Wiener Award for Cybernetics",
    description: "Recognizing outstanding academic contribution to cybernetics theory, adaptive systems, and autonomous biological-computational models.",
    prize: "Honorary Medal & Featured IEEE Xplore Open Access",
  },
];

export function AwardsSection({
  title = "IEEE SMC 2027 Conference Awards",
  subtitle = "Recognizing excellence in research rigor, student innovation, and scientific novelty across systems, cybernetics, and human-machine interaction",
}: AwardsProps) {
  return (
    <SectionContainer id="awards" fullWidthBg="bg-slate-50">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full">
        <div className="space-y-3 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {AWARDS_LIST.map((award, idx) => {
            const Icon = award.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 transition-all flex flex-col justify-between shadow-xs"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{award.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    {award.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Recognition</span>
                  <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                    {award.prize}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SectionContainer>
  );
}
