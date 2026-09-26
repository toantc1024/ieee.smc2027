"use client";

import React from "react";
import Image from "next/image";
import {
  MapPin,
  Building2,
  Mail,
  ArrowUpRight,
  ExternalLink,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export function Venue() {
  return (
    <SectionContainer id="venue" fullWidthBg="bg-white">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 w-full">
          <div className="space-y-3 flex-1">
            <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
              <span className="block text-[#004776]">Conference Venue</span>
              <span className="block text-[#115eff]">& City Guide</span>
            </h2>
            <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
              {CONFERENCE_INFO.venue} • Ho Chi Minh City, Vietnam
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-3">
            <a
              href={CONFERENCE_INFO.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-xs sm:text-sm rounded-[0.26rem] shadow-2xs transition-all hover:border-[#115eff]"
            >
              <MapPin className="w-4 h-4 text-[#115eff]" />
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Venue Overview: Two Columns */}
      <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column: Sheraton Saigon Grand Opera Hotel Narrative & Details */}
          <div className="lg:col-span-7 p-6 sm:p-8 bg-slate-50/60 border border-slate-200 rounded-2xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#115eff] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <span>Official Conference Hotel & Headquarters</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Sheraton Saigon Grand Opera Hotel
              </h3>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                IEEE SMC 2027 will take place at the iconic <strong>Sheraton Saigon Grand Opera Hotel</strong>, located at 88 Dong Khoi Street, District 1, Ho Chi Minh City, Vietnam.
              </p>

              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                Positioned in the heart of Saigon&apos;s vibrant commercial and cultural epicenter, the venue is steps away from historical landmarks including the Saigon Opera House, Notre Dame Cathedral, and the Central Post Office.
              </p>

              {/* Quick Venue Key Details */}
              <div className="space-y-3 pt-3 border-t border-slate-200/80 text-sm text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#115eff] mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Address:</strong> No. 88 Dong Khoi, Saigon Ward, District 1, Ho Chi Minh City, Vietnam.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-4 h-4 text-[#115eff] mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Host Institution:</strong> Ho Chi Minh City University of Technology and Engineering (HCM-UTE).
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#115eff] mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Inquiries:</strong>{" "}
                    <a href={`mailto:${CONFERENCE_INFO.contactEmail}`} className="text-[#115eff] font-semibold hover:underline">
                      {CONFERENCE_INFO.contactEmail}
                    </a>{" "}
                    | Hotline: {CONFERENCE_INFO.hotline}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold text-xs sm:text-sm rounded-md shadow-xs transition-all"
              >
                <span>Explore Venue Details</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <a
                href={CONFERENCE_INFO.visaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm rounded-md transition-all shadow-2xs"
              >
                <span>Vietnam e-Visa Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              </a>
            </div>
          </div>

          {/* Right Column: Clean, Unobstructed Photography of the Venue */}
          <div className="lg:col-span-5 relative min-h-[340px] lg:min-h-full rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group">
            <Image
              src="/images/sheraton-saigon-card.jpg"
              alt="Sheraton Saigon Grand Opera Hotel"
              fill
              className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20 pointer-events-none" />

            {/* Top Badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className="text-xs font-semibold text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                District 1 • HCMC
              </span>
            </div>

            {/* Bottom Caption Pill */}
            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="p-3.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-white">
                <p className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold mb-0.5">
                  Official Conference Venue
                </p>
                <p className="text-sm sm:text-base font-bold text-white">
                  Sheraton Saigon Grand Opera Hotel
                </p>
              </div>
            </div>
          </div>

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
