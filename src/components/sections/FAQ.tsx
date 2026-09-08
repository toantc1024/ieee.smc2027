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
      {/* Section Header Strip with Top-Right Corner Grid Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-grid-tr opacity-50" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1">
            Author & Attendee Assistance
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>
        <span className="relative z-10 text-sm font-semibold text-[#115eff] bg-white border border-[#ccd7e2] px-4 py-2 rounded-full shadow-2xs">
          Conference Policies & Author Guidance
        </span>
      </div>

      {/* Category Tabs: Full Width Divider */}
      <div className="px-4 sm:px-6 py-3.5 border-b border-[#ccd7e2] bg-slate-50/30 flex flex-wrap items-center gap-2.5">
        <span className="text-sm font-medium text-slate-600 mr-2">Category:</span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`min-h-[40px] px-5 py-2 text-sm font-semibold rounded-[0.26rem] transition-colors ${
              activeCategory === cat
                ? "bg-[#115eff] text-white shadow-2xs"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-[#ccd7e2]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ Accordion List: Full Width Dividers */}
      <div className="divide-y divide-[#ccd7e2] bg-white">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={idx} className="px-4 sm:px-6 py-5 sm:py-6 transition-colors hover:bg-slate-50/60">
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full text-left flex items-start justify-between gap-4 focus:outline-none"
              >
                <div className="flex items-start gap-3.5">
                  <span className="text-sm font-bold text-[#115eff] bg-blue-50 border border-blue-200 px-3 py-1 rounded-md mt-0.5 shrink-0">
                    {faq.category}
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                    {faq.question}
                  </span>
                </div>
                <div className="text-slate-400 p-1 shrink-0">
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-[#115eff]" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="mt-4 pl-0 sm:pl-20 text-base sm:text-lg text-slate-700 leading-relaxed font-normal animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Prompt Footer */}
      <div className="px-4 sm:px-6 py-6 sm:py-7 bg-slate-50 border-t border-[#ccd7e2] flex flex-wrap items-center justify-between gap-4">
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
