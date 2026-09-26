"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle, Mail } from "lucide-react";
import { FAQS, CONFERENCE_INFO } from "@/data/conference";
import { SectionContainer } from "@/components/layout/SectionContainer";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Submission", "Registration", "Venue", "Visa"];

  const filteredFaqs = FAQS.filter((item) => {
    if (activeCategory === "All") return true;
    return item.category === activeCategory;
  });

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SectionContainer id="faq" fullWidthBg="bg-white">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">Frequently Asked</span>
            <span className="block text-[#115eff]">Questions & Help</span>
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
            Author & Attendee Assistance • Conference Policies & Guidance
          </p>
        </div>
      </div>

      {/* Category Tabs: Full Width Divider */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200 bg-slate-50/30 flex flex-wrap items-center gap-2.5">
        <span className="text-sm font-medium text-slate-600 mr-2">Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`min-h-[40px] px-5 py-2 text-sm font-semibold rounded-[0.26rem] transition-colors cursor-pointer ${
              activeCategory === cat
                ? "bg-[#115eff] text-white shadow-2xs"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List: Aligned in Columns for Exact Text Alignment */}
      <div className="divide-y divide-slate-200 bg-white">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="px-4 sm:px-6 py-5 sm:py-6 transition-colors hover:bg-slate-50/60">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left flex items-start justify-between gap-4 focus:outline-none cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-5 flex-1 min-w-0">
                  {/* Category Tag in a fixed-width column to make all questions and answers align */}
                  <div className="w-24 sm:w-28 shrink-0 pt-0.5">
                    <span className="inline-flex items-center justify-center w-full text-xs font-bold text-[#115eff] bg-blue-50 border border-blue-200 px-2 py-1 rounded-md text-center">
                      {faq.category}
                    </span>
                  </div>

                  {/* Question & Answer aligned together in column */}
                  <div className="flex-1 min-w-0">
                    <span className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-snug block">
                      {faq.question}
                    </span>
                    {isOpen && (
                      <div className="mt-3.5 text-sm sm:text-base lg:text-lg text-slate-700 leading-relaxed font-normal border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-slate-400 p-1 shrink-0 mt-0.5">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#115eff]" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Contact Prompt Footer */}
      <div className="px-4 sm:px-6 py-6 sm:py-7 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 text-sm text-slate-700">
          <HelpCircle className="w-5 h-5 text-[#115eff]" />
          <span>Have an inquiry not answered above regarding registration, visas, or special sessions?</span>
        </div>
        <a
          href={`mailto:${CONFERENCE_INFO.contactEmail}`}
          className="inline-flex items-center gap-2 min-h-[48px] px-6 py-2.5 bg-[#115eff] hover:bg-blue-700 text-white text-sm sm:text-base font-bold rounded-[0.26rem] transition-all shadow-sm"
        >
          <Mail className="w-4 h-4" />
          <span>Contact Conference Secretariat</span>
        </a>
      </div>
    </SectionContainer>
  );
}
