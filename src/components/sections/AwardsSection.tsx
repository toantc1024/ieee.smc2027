"use client";

import React from "react";
import { Award, Trophy, Medal, Star } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface EditableAwardItem {
  title: string;
  description: string;
  prize: string;
  iconType?: "trophy" | "medal" | "award" | "star";
  recognitionLabel?: string;
}

interface AwardsProps {
  awards?: EditableAwardItem[];
  title?: string;
  subtitle?: string;
}

export const AWARDS_LIST: Array<EditableAwardItem & { icon: typeof Trophy }> = [
  {
    icon: Trophy,
    iconType: "trophy",
    title: "Best Overall Conference Paper Award",
    description: "Honoring the paper demonstrating the highest scientific novelty, rigorous methodology, and exceptional practical impact across all conference tracks.",
    prize: "Commemorative Plaque & Honorarium",
    recognitionLabel: "Recognition",
  },
  {
    icon: Medal,
    iconType: "medal",
    title: "Best Student Paper Award",
    description: "Awarded to the most outstanding paper whose primary author and presenter is a matriculated student at the time of submission.",
    prize: "Student Travel Grant & IEEE SMC Certificate",
    recognitionLabel: "Recognition",
  },
  {
    icon: Award,
    iconType: "award",
    title: "Franklin V. Taylor Memorial Award",
    description: "Prestigious IEEE SMC Society award recognizing exemplary research advancing human-machine systems science and engineering.",
    prize: "Society Plaque & Plenary Recognition",
    recognitionLabel: "Recognition",
  },
  {
    icon: Star,
    iconType: "star",
    title: "Norbert Wiener Award for Cybernetics",
    description: "Recognizing outstanding academic contribution to cybernetics theory, adaptive systems, and autonomous biological-computational models.",
    prize: "Honorary Medal & Featured IEEE Xplore Open Access",
    recognitionLabel: "Recognition",
  },
];

function resolveAwardIcon(iconType: EditableAwardItem["iconType"], idx: number) {
  switch (iconType) {
    case "trophy":
      return Trophy;
    case "medal":
      return Medal;
    case "award":
      return Award;
    case "star":
      return Star;
    default:
      return AWARDS_LIST[idx % AWARDS_LIST.length].icon;
  }
}

export function AwardsSection({
  awards = AWARDS_LIST,
  title = "IEEE SMC 2027 Conference Awards",
  subtitle = "Recognizing excellence in research rigor, student innovation, and scientific novelty across systems, cybernetics, and human-machine interaction",
}: AwardsProps) {
  const safeAwards = Array.isArray(awards) ? awards : [];

  return (
    <SectionContainer id="awards" fullWidthBg="bg-slate-50">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full">
        <div className="space-y-3 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>

        {safeAwards.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-blue-200 bg-white p-8 text-center text-sm text-slate-500">
            No conference awards added yet.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeAwards.map((award, idx) => {
              const Icon = resolveAwardIcon(award.iconType, idx);
              return (
                <div
                  key={idx}
                  {...subItemAttr(["awards", idx])}
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
                    <span className="text-slate-400 font-medium">
                      {award.recognitionLabel || "Recognition"}
                    </span>
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      {award.prize}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
