"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

export interface ConferenceVideoProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  viewDetailsUrl?: string;
  videoUrl?: string;
  venueName?: string;
  location?: string;
}

export function ConferenceVideo({
  badge = "IEEE SMC 2027",
  title = "IEEE SMC 2027 Comes to Ho Chi Minh City",
  subtitle = "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors — a hub for insights and memorable moments.",
  viewDetailsUrl = "#venue",
  videoUrl = "https://www.youtube.com/embed/I1UGApHrQKo?si=pJEHr9cVC0WN1JFF",
  venueName = "Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City",
  location = "Ho Chi Minh City, Vietnam",
}: ConferenceVideoProps) {
  // Normalize against legacy 2026 props if passed from database
  const safeBadge = badge?.includes("2026") ? "IEEE SMC 2027" : (badge || "IEEE SMC 2027");
  const safeTitle = title?.includes("2026") ? "IEEE SMC 2027 Comes to Ho Chi Minh City" : (title || "IEEE SMC 2027 Comes to Ho Chi Minh City");
  const safeSubtitle = subtitle?.includes("Pacific Northwest")
    ? "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors — a hub for insights and memorable moments."
    : (subtitle || "Where systems science, human-machine interaction, and cybernetics meet vibrant Southeast Asian energy and global flavors — a hub for insights and memorable moments.");
  const safeViewDetailsUrl = (viewDetailsUrl?.includes("2026") || !viewDetailsUrl) ? "#venue" : viewDetailsUrl;

  return (
    <SectionContainer id="video" fullWidthBg="bg-slate-50/50" className="relative overflow-hidden">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 relative z-10 w-full">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">IEEE SMC 2027</span>
            <span className="block text-[#115eff]">Comes to Ho Chi Minh City</span>
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
            {safeSubtitle}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative overflow-hidden px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch relative z-10">
          
          {/* Left Column: Embedded Video Player */}
          <div className="lg:col-span-7 flex flex-col h-full">
            <div className="relative w-full h-full min-h-[300px] aspect-video lg:aspect-auto rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md group">
              <iframe
                src={videoUrl}
                title="IEEE SMC 2027 Video Presentation"
                className="w-full h-full object-cover absolute inset-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>

          {/* Right Column: Clean Card with Single Paragraph & View Details Button */}
          <div className="lg:col-span-5 flex flex-col h-full min-h-[280px] lg:min-h-0">
            <div className="relative overflow-hidden p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-col justify-between h-full">
              {/* Subtle Corner Royal Blue Dot Accent */}
              <div className="corner-dot-tr opacity-60 pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <h3 className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-[#004776] tracking-tight leading-snug">
                  Experience IEEE SMC in Ho Chi Minh City
                </h3>

                <p className="text-sm sm:text-base font-normal text-slate-600 leading-relaxed text-justify sm:text-left">
                  A world-class gathering situated at the iconic Sheraton Saigon Grand Opera Hotel in downtown Ho Chi Minh City, neighboring cultural landmarks and Vietnam&apos;s dynamic technological hub — where systems science, human-machine interaction, and cybernetics meet vibrant innovation and global collaboration for insights and memorable moments.
                </p>
              </div>

              {/* View Details Button Full Width */}
              <div className="relative z-10 w-full pt-6 mt-6 border-t border-slate-100">
                <a
                  href={safeViewDetailsUrl}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold text-xs sm:text-sm rounded-md transition-all shadow-xs group cursor-pointer"
                >
                  <span>Explore Venue &amp; City Details</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </SectionContainer>
  );
}

export default ConferenceVideo;
