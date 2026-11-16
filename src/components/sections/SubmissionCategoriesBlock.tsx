"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface SubmissionCategoryChecklistItem {
  text: string;
  url?: string;
}

export interface SubmissionCategoryItem {
  image?: string;
  badge: string;
  deadline: string;
  title: string;
  description: string;
  checklist: SubmissionCategoryChecklistItem[];
}

export const DEFAULT_SUBMISSION_CATEGORIES: SubmissionCategoryItem[] = [
  {
    image: "/assets/3d/paper-submission-3d.png",
    badge: "Regular Track",
    deadline: "April 08, 2027",
    title: "Regular Research Papers",
    description:
      "Original research contributions presenting novel theory, experimental validations, or major system architectures in SSE, CYB, or HMS.",
    checklist: [
      { text: "Standard IEEE 2-column PDF format" },
      { text: "Electronic submission portal", url: "https://ras.papercept.net" },
      { text: "Oral presentation in podium sessions" },
    ],
  },
  {
    image: "/assets/3d/special-sessions-3d.png",
    badge: "Special Sessions",
    deadline: "April 08, 2027",
    title: "Special Session Papers",
    description:
      "Targeted research papers submitted to approved special sessions exploring focused multidisciplinary problems.",
    checklist: [
      { text: "Proposals deadline: Feb 15, 2027" },
      { text: "Organized by domain experts" },
      { text: "Rigorous IEEE peer review" },
    ],
  },
  {
    image: "/assets/3d/workshops-3d.png",
    badge: "Workshops & Tutorials",
    deadline: "Feb 15 / Apr 08",
    title: "Workshops & Tutorials",
    description:
      "Proposals for hands-on workshops, technical tutorials, and accepted workshop technical papers.",
    checklist: [
      { text: "Proposal submission: Feb 15, 2027" },
      { text: "Acceptance notice: March 04, 2027" },
      { text: "Workshop paper deadline: Apr 08, 2027" },
    ],
  },
];

export interface SubmissionCategoriesBlockProps {
  title?: string;
  subtitle?: string;
  categories?: SubmissionCategoryItem[];
}

export function SubmissionCategoriesBlock({
  title = "Submission Categories & Paper Tracks",
  subtitle = "Choose the submission format aligned with your research contribution",
  categories = DEFAULT_SUBMISSION_CATEGORIES,
}: SubmissionCategoriesBlockProps) {
  const list = Array.isArray(categories) ? categories : [];

  return (
    <SectionContainer id="submission-categories" fullWidthBg="bg-white">
      {(title || subtitle) && (
        <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-12 pb-4 w-full">
          <div className="corner-dot-tr opacity-75 pointer-events-none" />
          <div className="space-y-2.5 relative z-10">
            {title && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2]">
                {title.includes("&") ? (
                  <>
                    <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                    <span className="block text-[#115eff]">&amp; {title.split("&").slice(1).join("&").trim()}</span>
                  </>
                ) : (
                  <span className="block text-[#004776]">{title}</span>
                )}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 py-6 sm:py-10">
        {list.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center text-sm text-slate-500">
            No submission categories added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {list.map((cat, idx) => (
              <div
                key={idx}
                {...subItemAttr(["categories", idx])}
                className="p-6 sm:p-7 border border-blue-100/90 bg-white rounded-md relative hover:border-[#115eff] hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 flex items-center justify-center">
                      {cat.image && (
                        <Image
                          src={cat.image}
                          alt={cat.title}
                          width={96}
                          height={96}
                          unoptimized
                          className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                        />
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {cat.badge && (
                        <span className="text-xs sm:text-sm font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-md">
                          {cat.badge}
                        </span>
                      )}
                      {cat.deadline && (
                        <span className="text-xs sm:text-sm font-semibold px-3 py-0.5 bg-blue-50/70 text-[#004776] rounded-md">
                          {cat.deadline}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#004776] tracking-tight">
                    {cat.title}
                  </h3>
                  <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                    {cat.description}
                  </p>
                </div>

                {Array.isArray(cat.checklist) && cat.checklist.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-blue-50 text-sm text-slate-700 space-y-2.5">
                    {cat.checklist.map((item, cIdx) => (
                      <div
                        key={cIdx}
                        {...subItemAttr(["categories", idx, "checklist", cIdx])}
                        className="flex items-center gap-2.5"
                      >
                        <CheckCircle className="w-4.5 h-4.5 text-[#115eff] shrink-0" />
                        {item.url ? (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {item.text}
                          </a>
                        ) : (
                          <span>{item.text}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

