"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
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
            Conference Venue & City Guide
          </h2>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <a
            href={CONFERENCE_INFO.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-[#ccd7e2] font-semibold text-xs sm:text-sm rounded-[0.26rem] shadow-2xs transition-all hover:border-[#115eff]"
          >
            <MapPin className="w-4 h-4 text-[#115eff]" />
            <span>Open in Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>

      {/* Main Venue Overview: Two Columns with Vertical Thin Divider */}
      <div className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#ccd7e2]">
        
        {/* Left Column: Sheraton Saigon Grand Opera Hotel Narrative */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#115eff] bg-blue-50 px-3 py-1 rounded-[0.26rem]">
            <span>Official Conference Hotel & Headquarters</span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sheraton Saigon Grand Opera Hotel
          </h3>

          <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
            IEEE SMC 2027 will take place at the iconic <strong>Sheraton Saigon Grand Opera Hotel</strong>, located at 88 Dong Khoi Street, District 1, Ho Chi Minh City, Vietnam.
          </p>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            Positioned in the heart of Saigon&apos;s vibrant commercial and cultural epicenter, the venue is steps away from historical landmarks including the Saigon Opera House, Notre Dame Cathedral, and the Central Post Office.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href="https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-[0.26rem] shadow-xs transition-all"
            >
              <span>Explore Venue Details</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>

            <a
              href={CONFERENCE_INFO.visaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-[0.26rem] transition-all"
            >
              <span>Vietnam e-Visa Portal</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </div>

        {/* Right Column: Key Logistics & Host Details */}
        <div className="lg:col-span-5 p-6 sm:p-8 lg:p-10 bg-slate-50/70 border-t lg:border-t-0 lg:border-l border-[#ccd7e2] flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
              Key Destination Facts
            </span>
            <h4 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
              Sheraton Saigon Grand Opera Hotel
            </h4>
          </div>

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
                <strong>Host Institution:</strong> Ho Chi Minh City University of Technology and Engineering-Vietnam (HCM-UTE).
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
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all group">
          <div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4">
              <Image
                src="/assets/3d/visa-travel-3d.png"
                alt="Vietnam Visa Applications"
                width={96}
                height={96}
                className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
              />
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
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all group">
          <div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4">
              <Image
                src="/assets/3d/airport-plane-3d.png"
                alt="Tan Son Nhat Airport"
                width={96}
                height={96}
                className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
              />
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
        <div className="p-6 sm:p-7 bg-white border border-slate-200 rounded-md flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all group">
          <div>
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4">
              <Image
                src="/assets/3d/hotel-venue-3d.png"
                alt="Sheraton Saigon Grand Opera Hotel"
                width={96}
                height={96}
                className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
              />
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
