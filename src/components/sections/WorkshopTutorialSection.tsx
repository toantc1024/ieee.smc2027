"use client";

import React from "react";
import { BookOpen, FileCheck } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface WorkshopTutorialCard {
  iconType?: "workshop" | "tutorial";
  title: string;
  description: string;
  bullets: Array<{ text: string }>;
  footerLabel: string;
  footerValue: string;
  footerHref?: string;
}

export function buildDefaultWorkshopCards(
  proposalDeadline = "February 15, 2027",
  contactEmail = "smc2027@hcmute.edu.vn"
): WorkshopTutorialCard[] {
  return [
    {
      iconType: "workshop",
      title: "Technical Workshop Proposals",
      description:
        "Workshops provide an informal setting where researchers discuss emerging topics, share preliminary findings, and establish interdisciplinary research collaborations.",
      bullets: [
        { text: "Format: Half-day 3.5 hours or Full-day 7 hours" },
        { text: "Includes invited talks and peer-reviewed contributed presentations" },
        { text: "Indexed in IEEE Xplore digital library" },
      ],
      footerLabel: "Proposal Deadline",
      footerValue: proposalDeadline,
    },
    {
      iconType: "tutorial",
      title: "Hands-On Tutorials",
      description:
        "Tutorials deliver state-of-the-art educational overviews and software training on contemporary algorithms, robotics toolkits, and machine intelligence architectures.",
      bullets: [
        { text: "Format: 2-hour or 3-hour focused instruction" },
        { text: "Targeted at graduate students and industry practitioners" },
        { text: "Interactive code notebooks and hardware demonstration" },
      ],
      footerLabel: "Submission Contact",
      footerValue: contactEmail,
      footerHref: `mailto:${contactEmail}`,
    },
  ];
}

export interface WorkshopTutorialProps {
  title?: string;
  subtitle?: string;
  proposalDeadline?: string;
  contactEmail?: string;
  cards?: WorkshopTutorialCard[];
}

export function WorkshopTutorialSection({
  title = "Workshops & Tutorial Proposals",
  subtitle = "Propose hands-on tutorials and specialized workshops preceding the main technical conference program",
  proposalDeadline = "February 15, 2027",
  contactEmail = "smc2027@hcmute.edu.vn",
  cards,
}: WorkshopTutorialProps) {
  const safeCards = Array.isArray(cards)
    ? cards
    : buildDefaultWorkshopCards(proposalDeadline, contactEmail);

  return (
    <SectionContainer id="workshops" fullWidthBg="bg-white">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full">
        <div className="space-y-3 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>

        {safeCards.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center text-sm text-slate-500">
            No workshop or tutorial cards added yet.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeCards.map((card, idx) => {
              const Icon = card.iconType === "tutorial" ? BookOpen : FileCheck;
              return (
                <div
                  key={idx}
                  {...subItemAttr(["cards", idx])}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{card.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {card.description}
                    </p>
                    {Array.isArray(card.bullets) && card.bullets.length > 0 && (
                      <ul className="space-y-2 text-xs text-slate-600">
                        {card.bullets.map((b, bIdx) => (
                          <li
                            key={bIdx}
                            {...subItemAttr(["cards", idx, "bullets", bIdx])}
                            className="flex items-center gap-2"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0" />
                            <span>{b.text}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {(card.footerLabel || card.footerValue) && (
                    <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500">{card.footerLabel}</span>
                      {card.footerHref ? (
                        <a href={card.footerHref} className="font-bold text-indigo-600 hover:underline">
                          {card.footerValue}
                        </a>
                      ) : (
                        <span className="font-bold text-indigo-600">{card.footerValue}</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
