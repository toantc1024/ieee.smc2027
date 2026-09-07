"use client";

import React from "react";
import { MapPin, Plane, Hotel, FileCheck, ArrowUpRight, Train, Compass, ShieldCheck } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export function Venue() {
  return (
    <SectionContainer id="venue" fullWidthBg="bg-white">
      {/* Section Header Strip with Top-Right Corner Dot Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-dot-tr opacity-60" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1">
            Destination & Host Campus
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Venue, Travel & Accommodation
          </h2>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-sm font-semibold text-[#115eff] bg-white border border-[#ccd7e2] px-4 py-2 rounded-full shadow-2xs">
          <MapPin className="w-4 h-4 text-[#115eff]" />
          <span>HCM-UTE • Ho Chi Minh City, Vietnam</span>
        </div>
      </div>

      {/* Main Venue Feature Block */}
      <div className="px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#ccd7e2]">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/80 text-sm text-[#115eff] font-bold rounded-md mb-3">
            Official Conference Venue
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            HCM-UTE Grand Convention Center & Campus
          </h3>
          <p className="mt-2 text-base sm:text-lg font-semibold text-[#115eff]">
            01 Vo Van Ngan Street, Linh Chieu Ward, Thu Duc City, Ho Chi Minh City, Vietnam
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Ho Chi Minh City University of Technology and Education (HCM-UTE) offers a premier university setting equipped with modern plenary auditoriums, high-definition audio-visual systems, parallel track breakout rooms, and dedicated poster exhibition galleries. Located at the heart of Thu Duc Innovation City, the campus is directly connected via Metro Line 1 to downtown Ho Chi Minh City.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="https://maps.google.com/?q=01+Vo+Van+Ngan+Linh+Chieu+Thu+Duc+Ho+Chi+Minh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 py-3.5 bg-[#115eff] hover:bg-blue-700 text-white text-base font-bold rounded-[0.26rem] transition-all shadow-sm hover:shadow-md"
            >
              <span>Open in Google Maps</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href="https://hcmute.edu.vn"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-6 py-3.5 bg-white hover:bg-blue-50 border border-[#ccd7e2] text-[#115eff] text-base font-semibold rounded-[0.26rem] transition-colors"
            >
              <span>Explore HCM-UTE Campus Tour</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Venue Quick Highlights Card */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 p-6 sm:p-7 rounded-md">
          <h4 className="text-base font-bold text-slate-900 mb-3.5 pb-2.5 border-b border-slate-200 flex items-center justify-between">
            <span>Conference Facilities at HCM-UTE</span>
            <span className="text-xs text-[#115eff] font-bold">Campus Map</span>
          </h4>
          <ul className="space-y-3.5 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#115eff] mt-1.5 shrink-0" />
              <span>
                <strong>Grand Hall (Auditorium A):</strong> 1,200-seat plenary auditorium equipped with multi-language interpretation booths and 4K LED broadcast displays.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#115eff] mt-1.5 shrink-0" />
              <span>
                <strong>Parallel Track Halls:</strong> 12 concurrent breakout rooms with hybrid digital presentation gear for Systems, HMS, and Cybernetics tracks.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#115eff] mt-1.5 shrink-0" />
              <span>
                <strong>Exhibition & Poster Pavilion:</strong> High-ceiling atrium for interactive demos, robotics testing arena, and coffee breaks.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Travel, Transit & Accommodation Grid with 25% Larger Text */}
      <div className="px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Transit 1: Metro & Ground Travel */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-[#115eff] rounded-md flex items-center justify-center mb-4">
              <Train className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              Metro Line 1 (Ben Thanh – Suoi Tien)
            </h4>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Take Ho Chi Minh City&apos;s modern Metro Line 1 directly to <strong>Thu Duc Station</strong> or <strong>Binh Thai Station</strong>, located a short walking distance or 3-minute electric shuttle ride from HCM-UTE.
            </p>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100 text-sm font-semibold text-[#115eff]">
            Direct connection to District 1 (15 mins)
          </div>
        </div>

        {/* Transit 2: International Flight Arrival */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-[#115eff] rounded-md flex items-center justify-center mb-4">
              <Plane className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              Airport & International Arrivals
            </h4>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              <strong>Tan Son Nhat International Airport (SGN)</strong> connects with over 60 direct international destinations. Official airport taxis and Grab are available 24/7 (approx. 35–45 minutes to HCM-UTE).
            </p>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100 text-sm font-semibold text-[#115eff]">
            Distance to campus: ~14 km
          </div>
        </div>

        {/* Transit 3: Accommodation & Hotels */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-[#115eff] rounded-md flex items-center justify-center mb-4">
              <Hotel className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              Hotels & Accommodation
            </h4>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Special conference rates negotiated with partner hotels in Thu Duc City and central District 1/Binh Thanh (e.g., Vinpearl Landmark 81, Mia Saigon Luxury Boutique, and business hotels near campus).
            </p>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100 text-sm font-semibold text-[#115eff]">
            Special IEEE SMC negotiated rates
          </div>
        </div>

      </div>
    </SectionContainer>
  );
}
