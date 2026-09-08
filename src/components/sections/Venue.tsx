"use client";

import React from "react";
import {
  MapPin,
  Plane,
  Hotel,
  FileCheck,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export function Venue() {
  return (
    <SectionContainer id="venue" fullWidthBg="bg-white">
      {/* Section Header Strip with Top-Right Corner Dot Accent */}
      <div className="relative overflow-hidden border-b border-[#ccd7e2] px-4 sm:px-6 py-5 sm:py-6 bg-slate-50/60 flex flex-wrap items-center justify-between gap-4">
        <div className="corner-dot-tr opacity-60" />
        <div className="relative z-10">
          <span className="text-sm font-bold text-[#115eff] block mb-1 uppercase tracking-wider">
            Destination & Accommodation
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Venue, Travel & Visa Information
          </h2>
        </div>
        <div className="relative z-10 flex items-center gap-2 text-sm font-semibold text-[#115eff] bg-white border border-[#ccd7e2] px-4 py-2 rounded-full shadow-2xs">
          <MapPin className="w-4 h-4 text-[#115eff]" />
          <span>Sheraton Saigon • Ho Chi Minh City, Vietnam</span>
        </div>
      </div>

      {/* Main Venue Feature Block */}
      <div className="px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center border-b border-[#ccd7e2]">
        <div className="lg:col-span-7">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-200/80 text-sm text-[#115eff] font-bold rounded-md mb-3">
            Official Conference Venue & Accommodation
          </div>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {CONFERENCE_INFO.venue}
          </h3>
          <p className="mt-2 text-base sm:text-lg font-semibold text-[#115eff]">
            {CONFERENCE_INFO.address}
          </p>
          <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            IEEE SMC 2027 will take place at the 5-star <strong>Sheraton Saigon Grand Opera Hotel</strong> on historic Dong Khoi Street in central Ho Chi Minh City. Hosted by <strong>HCMUTE</strong>, the venue features world-class ballrooms, breakout suites for technical tracks, and premier event facilities.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <a
              href="https://maps.google.com/?q=Sheraton+Saigon+Grand+Opera+Hotel+88+Dong+Khoi+Ho+Chi+Minh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-7 py-3.5 bg-[#115eff] hover:bg-blue-700 text-white text-base font-bold rounded-[0.26rem] transition-all shadow-sm hover:shadow-md"
            >
              <span>Open in Google Maps</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href={CONFERENCE_INFO.visaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 min-h-[52px] px-6 py-3.5 bg-white hover:bg-blue-50 border border-[#ccd7e2] text-[#115eff] text-base font-semibold rounded-[0.26rem] transition-colors"
            >
              <span>Apply for Vietnam e-Visa</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Venue Quick Highlights Card */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-200/80 p-6 sm:p-7 rounded-md">
          <h4 className="text-base font-bold text-slate-900 mb-3.5 pb-2.5 border-b border-slate-200 flex items-center justify-between">
            <span>Venue & Host Information</span>
            <span className="text-xs text-[#115eff] font-bold">Ho Chi Minh City</span>
          </h4>
          <ul className="space-y-3.5 text-sm text-slate-700">
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#115eff] mt-1.5 shrink-0" />
              <span>
                <strong>Conference Hotel:</strong> Sheraton Saigon Grand Opera Hotel, No. 88 Dong Khoi, Saigon Ward, Ho Chi Minh City.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#115eff] mt-1.5 shrink-0" />
              <span>
                <strong>Host Institution:</strong> Ho Chi Minh City University of Technology and Engineering-Vietnam (HCMUTE).
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#115eff] mt-1.5 shrink-0" />
              <span>
                <strong>Official Visa Applications:</strong> Vietnam electronic visa portal is accessible at <a href={CONFERENCE_INFO.visaUrl} target="_blank" rel="noopener noreferrer" className="text-[#115eff] font-bold underline">https://evisa.gov.vn</a>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#115eff] mt-1.5 shrink-0" />
              <span>
                <strong>Direct Contact:</strong> E-mail: <a href={`mailto:${CONFERENCE_INFO.contactEmail}`} className="text-[#115eff] font-semibold">{CONFERENCE_INFO.contactEmail}</a> | Hotline: {CONFERENCE_INFO.hotline}
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Travel, Transit & Accommodation Grid */}
      <div className="px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Official Vietnam Visa Portal */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-[#115eff] rounded-md flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              Vietnam Visa Applications
            </h4>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Citizens of all countries are eligible for a 90-day single or multiple-entry electronic visa (e-Visa) via the official government portal.
            </p>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100">
            <a
              href={CONFERENCE_INFO.visaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold text-[#115eff] hover:underline flex items-center gap-1"
            >
              <span>evisa.gov.vn</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Card 2: International Flight Arrival */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-[#115eff] rounded-md flex items-center justify-center mb-4">
              <Plane className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              Tan Son Nhat Airport (SGN)
            </h4>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Tan Son Nhat International Airport (SGN) is located 7 km (~20–30 mins) from the venue. Airport taxis, hotel transfers, and Grab ride-hailing are readily available.
            </p>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100 text-sm font-semibold text-[#115eff]">
            Distance to venue: ~7 km (20–30 mins)
          </div>
        </div>

        {/* Card 3: Downtown Location & Transit */}
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-[#115eff] rounded-md flex items-center justify-center mb-4">
              <Hotel className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">
              Dong Khoi District & Metro Line 1
            </h4>
            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Steps away from Saigon Opera House, Nguyen Hue Walking Street, and Metro Line 1 Station, with easy access to dining, landmarks, and hotels.
            </p>
          </div>
          <div className="mt-6 pt-3.5 border-t border-slate-100 text-sm font-semibold text-[#115eff]">
            District 1, Ho Chi Minh City
          </div>
        </div>

      </div>
    </SectionContainer>
  );
}
