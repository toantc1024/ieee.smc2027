"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Building2,
  ExternalLink,
  Clock,
  Navigation,
  Calendar,
  Phone,
  ArrowLeft,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO, MUST_VISIT_ATTRACTIONS } from "@/data/conference";

export default function TravelPage() {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "walk" | "culture">("all");

  const filteredAttractions = MUST_VISIT_ATTRACTIONS.filter((item) => {
    if (selectedFilter === "walk") {
      return (
        item.id === "nguyen-hue" ||
        item.id === "post-office" ||
        item.id === "notre-dame" ||
        item.id === "ben-thanh" ||
        item.id === "independence-palace"
      );
    }
    if (selectedFilter === "culture") {
      return (
        item.id === "fine-arts" ||
        item.id === "war-museum" ||
        item.id === "cu-chi" ||
        item.id === "notre-dame"
      );
    }
    return true;
  });

  return (
    <main className="min-h-screen bg-white">
      <SectionContainer id="travel-page" fullWidthBg="bg-white" className="pb-16 sm:pb-24">
        {/* ── Page Header: Aligned with the vertical border lines ── */}
        <div className="relative overflow-hidden px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6 w-full border-b border-slate-200">
          {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
          <div className="corner-dot-tr opacity-75 pointer-events-none" />

          <div className="space-y-3.5 max-w-4xl relative z-10">
            {/* Back to Home Link */}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#115eff] hover:text-[#0a4de6] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2]">
              <span className="block text-[#004776]">Travel & Accommodation</span>
              <span className="block text-[#115eff]">& Ho Chi Minh City Guide</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              Essential guide to the conference venue at Sheraton Saigon Grand Opera Hotel, international arrivals, visa regulations, and iconic destinations in Ho Chi Minh City.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pt-1">
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <Calendar className="w-4 h-4 text-[#115eff]" />
                {CONFERENCE_INFO.dates}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1.5 font-medium text-slate-700">
                <MapPin className="w-4 h-4 text-[#115eff]" />
                Ho Chi Minh City, Vietnam
              </span>
            </div>
          </div>
        </div>

        {/* ── Page Body Sections inside border-x container ── */}
        <div className="px-4 sm:px-6 lg:px-8 pt-10 space-y-12">
          {/* 1. Conference Headquarters: Sheraton Saigon */}
          <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
              {/* Left Content */}
              <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    Sheraton Saigon Grand Opera Hotel
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-[#115eff] uppercase tracking-wider">
                    Official Conference Venue & Headquarters
                  </p>

                  <p className="mt-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                    Located at 88 Dong Khoi Street in the heart of Saigon&apos;s historic District 1, the 5-star <strong>Sheraton Saigon Grand Opera Hotel</strong> provides world-class convention facilities, executive ballrooms, and luxury accommodation for IEEE SMC 2027 delegates.
                  </p>

                  <div className="mt-6 space-y-3 pt-4 border-t border-slate-100 text-sm text-slate-700">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#115eff] mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900">Address:</strong> No. 88 Dong Khoi, Saigon Ward, District 1, Ho Chi Minh City, Vietnam
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-[#115eff] mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900">Host Institution:</strong> Ho Chi Minh City University of Technology and Engineering (HCM-UTE)
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-[#115eff] mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-slate-900">Secretariat Hotline:</strong> {CONFERENCE_INFO.hotline}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <a
                    href={CONFERENCE_INFO.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs transition-all"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href="https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm rounded-lg transition-all shadow-2xs"
                  >
                    <span>Hotel Booking & Floorplans</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Right Photo */}
              <div className="lg:col-span-5 relative min-h-[300px] lg:min-h-full bg-slate-900">
                <Image
                  src="/images/sheraton-saigon-card.jpg"
                  alt="Sheraton Saigon Grand Opera Hotel"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs p-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/20">
                  <p className="font-bold text-sm">88 Dong Khoi, District 1</p>
                  <p className="text-blue-200 text-[11px]">Heart of Saigon&apos;s cultural and culinary center</p>
                </div>
              </div>
            </div>
          </section>

          {/* 2. Travel Logistics & Transit Cards */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Vietnam e-Visa */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-[#115eff] transition-all">
              <div>
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <Image
                    src="/assets/3d/visa-travel-3d.png"
                    alt="Vietnam Visa"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Vietnam Visa Applications
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Citizens of all countries can apply for a 90-day multiple-entry electronic visa (e-Visa) via the official government immigration portal.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100">
                <a
                  href={CONFERENCE_INFO.visaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm font-bold text-[#115eff] hover:underline inline-flex items-center gap-1.5"
                >
                  <span>Official e-Visa Portal (evisa.gov.vn)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Card 2: Airport */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-[#115eff] transition-all">
              <div>
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <Image
                    src="/assets/3d/airport-plane-3d.png"
                    alt="Airport Plane"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Tan Son Nhat Airport (SGN)
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Located 7 km (~20–30 mins) from the conference hotel. Official airport metered taxis (Vinasun, Mai Linh) and Grab ride-hailing are readily available 24/7.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs sm:text-sm font-semibold text-[#115eff]">
                Distance to Hotel: ~7 km (20–30 mins)
              </div>
            </div>

            {/* Card 3: Metro & District 1 */}
            <div className="p-6 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between shadow-2xs hover:border-[#115eff] transition-all">
              <div>
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <Image
                    src="/assets/3d/hotel-venue-3d.png"
                    alt="District 1 Transit"
                    width={64}
                    height={64}
                    className="w-full h-full object-contain"
                  />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Downtown Transit & Metro Line 1
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Walking distance to Saigon Opera House, Nguyen Hue Boulevard, and the Ben Thanh – Suoi Tien Metro Line 1 Opera House Station.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 text-xs sm:text-sm font-semibold text-[#115eff]">
                District 1, Ho Chi Minh City
              </div>
            </div>
          </section>

          {/* 3. Must-Visit Places in Ho Chi Minh City (Top 8 Attractions) */}
          <section id="travel-attractions" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Must-Visit Places in Ho Chi Minh City
                </h2>
                <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  Iconic historical landmarks, architectural monuments, and cultural destinations for conference delegates, conveniently accessible from the Sheraton Saigon.
                </p>
              </div>

              {/* Completely Rounded Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full shrink-0 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setSelectedFilter("all")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    selectedFilter === "all"
                      ? "bg-white text-[#115eff] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  All Places (8)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("walk")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    selectedFilter === "walk"
                      ? "bg-white text-[#115eff] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Walking Distance
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFilter("culture")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                    selectedFilter === "culture"
                      ? "bg-white text-[#115eff] shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  History & Heritage
                </button>
              </div>
            </div>

            {/* Attractions Grid - No #1 #2 badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAttractions.map((attraction) => (
                <div
                  key={attraction.id}
                  className="group bg-white border border-slate-200 hover:border-[#115eff] rounded-xl overflow-hidden shadow-2xs hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Photo with Badge & Overlay */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      <Image
                        src={attraction.image}
                        alt={attraction.name}
                        fill
                        className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                      {/* Top Badge (Without #1 #2) */}
                      <div className="absolute top-2.5 left-2.5 z-10">
                        <span className="text-[11px] font-bold text-white bg-slate-900/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                          {attraction.badge}
                        </span>
                      </div>

                      {/* Bottom Distance Pill */}
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-md">
                        <Navigation className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                        <span className="truncate">{attraction.distanceFromVenue}</span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 space-y-2.5">
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#115eff] transition-colors leading-snug">
                          {attraction.name}
                        </h3>
                        <p className="text-xs font-medium text-[#115eff] mt-0.5 italic">
                          {attraction.vietnameseName}
                        </p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {attraction.description}
                      </p>

                      <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11.5px] text-slate-600">
                        <div className="flex items-start gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#115eff] mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{attraction.openingHours}</span>
                        </div>
                        <div className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{attraction.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Footer */}
                  <div className="p-3 sm:px-4 sm:py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        attraction.mapsQuery
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-bold text-[#115eff] bg-white border border-blue-100 hover:bg-blue-50 transition-colors shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-[#115eff]/70" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Practical Travel Advice for Delegates */}
          <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Practical Visitor Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-700">
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <strong className="block text-slate-900 mb-1">Weather in October</strong>
                Warm tropical climate with average temperatures of 26°C – 32°C. Light rain gear is recommended for occasional afternoon showers.
              </div>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <strong className="block text-slate-900 mb-1">Currency & Payment</strong>
                Vietnamese Dong (VND). VietQR and card payments (Visa, Mastercard) are universally accepted across hotels, malls, and restaurants.
              </div>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <strong className="block text-slate-900 mb-1">Ride-Hailing & Taxis</strong>
                Grab is widely used for cars and bikes. Recommended metered taxi operators: Vinasun Taxi (028 38 27 27 27) and Mai Linh Taxi (1055).
              </div>
              <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <strong className="block text-slate-900 mb-1">Secretariat Assistance</strong>
                Have questions regarding invitations or lodging? Contact the host secretariat at{" "}
                <a href={`mailto:${CONFERENCE_INFO.contactEmail}`} className="text-[#115eff] underline">
                  {CONFERENCE_INFO.contactEmail}
                </a>.
              </div>
            </div>
          </section>
        </div>
      </SectionContainer>
    </main>
  );
}
