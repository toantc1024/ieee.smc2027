"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Mail,
  ArrowUpRight,
  ExternalLink,
  Clock,
  Navigation,
  Compass,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";
import {
  DEFAULT_TRANSIT_CARDS,
  type TransitHighlightCard,
} from "@/components/sections/TransitLogisticsBlock";
import {
  DEFAULT_EDITABLE_ATTRACTIONS,
  inferAttractionFilterCategory,
  type EditableAttraction,
} from "@/components/sections/CityAttractionsBlock";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface VenueProps {
  image?: string;
  attractions?: EditableAttraction[];
  title?: string;
  subtitle?: string;
  venueName?: string;
  description?: string;
  secondaryDescription?: string;
  address?: string;
  hostInstitution?: string;
  contactEmail?: string;
  hotline?: string;
  imageBadge?: string;
  imageCaptionLabel?: string;
  googleMapsUrl?: string;
  hotelBookingUrl?: string;
  visaUrl?: string;
  travelGuideUrl?: string;
  showTransitCards?: boolean;
  transitCards?: TransitHighlightCard[];
  showAttractions?: boolean;
  attractionsHeading?: string;
  attractionsSubtitle?: string;
  showCallout?: boolean;
  calloutText?: string;
  calloutButtonLabel?: string;
  calloutButtonUrl?: string;
}

export function Venue({
  image = "/images/sheraton-saigon-card.jpg",
  attractions = DEFAULT_EDITABLE_ATTRACTIONS,
  title = "Travel & Accommodation & Ho Chi Minh City Guide",
  subtitle,
  venueName = CONFERENCE_INFO.venue,
  description = "IEEE SMC 2027 will take place at the iconic Sheraton Saigon Grand Opera Hotel in District 1, Ho Chi Minh City.",
  secondaryDescription = "Positioned in the heart of Saigon's vibrant commercial and cultural epicenter, the venue is steps away from historical landmarks including the Saigon Opera House, Notre Dame Cathedral, and the Central Post Office.",
  address = "No. 88 Dong Khoi, Saigon Ward, District 1, Ho Chi Minh City, Vietnam.",
  hostInstitution = "Ho Chi Minh City University of Technology and Engineering",
  contactEmail = CONFERENCE_INFO.contactEmail,
  hotline = CONFERENCE_INFO.hotline,
  imageBadge = "District 1 • HCMC",
  imageCaptionLabel = "Official Conference Venue",
  googleMapsUrl = CONFERENCE_INFO.googleMapsUrl,
  hotelBookingUrl = "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
  visaUrl = CONFERENCE_INFO.visaUrl,
  travelGuideUrl = "/travel",
  showTransitCards = true,
  transitCards = DEFAULT_TRANSIT_CARDS,
  showAttractions = true,
  attractionsHeading = "Must-Visit Places in Ho Chi Minh City",
  attractionsSubtitle = "Recommended iconic landmarks, historical monuments, and vibrant cultural destinations for conference delegates, located near the conference hotel in District 1.",
  showCallout = true,
  calloutText = "For airport transfer details, climate advice, and full city guides, visit our dedicated travel page.",
  calloutButtonLabel = "Open Dedicated Travel & Accommodation Page",
  calloutButtonUrl = "/travel",
}: VenueProps) {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "walk" | "culture">("all");
  const attractionList = Array.isArray(attractions) ? attractions : [];
  const transitList = Array.isArray(transitCards) ? transitCards : [];

  const filteredAttractions = attractionList.filter((item) => {
    if (selectedFilter === "all") return true;
    const cat = inferAttractionFilterCategory(item);
    if (selectedFilter === "walk") return cat === "walk" || cat === "both";
    if (selectedFilter === "culture") return cat === "culture" || cat === "both";
    return true;
  });

  return (
    <SectionContainer id="venue" fullWidthBg="bg-white">
      <span id="travel" className="sr-only -top-24 relative" />

      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 w-full">
          <div className="space-y-3 flex-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] w-full">
              {title === "Travel & Accommodation & Ho Chi Minh City Guide" ? (
                <>
                  <span className="block text-[#004776]">Travel &amp; Accommodation</span>
                  <span className="block text-[#115eff]">&amp; Ho Chi Minh City Guide</span>
                </>
              ) : title.includes("&") ? (
                <>
                  <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                  <span className="block text-[#115eff]">&amp; {title.split("&").slice(1).join("&").trim()}</span>
                </>
              ) : (
                <span className="block text-[#004776]">{title}</span>
              )}
            </h2>
            <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
              {subtitle || `${venueName} • Ho Chi Minh City, Vietnam`}
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            {travelGuideUrl && (
              <Link
                href={travelGuideUrl}
                className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-[15px] rounded-[0.26rem] shadow-2xs transition-all"
              >
                <Compass className="w-4.5 h-4.5" />
                <span>Full Travel Guide</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            )}
            {googleMapsUrl && (
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 min-h-[46px] px-5 py-2.5 bg-white hover:bg-blue-50/60 text-[#004776] border border-blue-100/90 font-bold text-sm sm:text-[15px] rounded-[0.26rem] shadow-2xs transition-all hover:border-[#115eff]"
              >
                <MapPin className="w-4.5 h-4.5 text-[#115eff]" />
                <span>Open in Google Maps</span>
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-blue-100/85">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          <div className="lg:col-span-7 p-6 sm:p-8 bg-blue-50/35 border border-blue-100/90 rounded-sm flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-xl sm:text-2xl font-bold text-[#004776] tracking-tight">
                {venueName}
              </h3>

              {description && (
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  {description}
                </p>
              )}

              {secondaryDescription && (
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {secondaryDescription}
                </p>
              )}

              <div className="space-y-3.5 pt-3 border-t border-blue-100/80 text-sm sm:text-base text-slate-700">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4.5 h-4.5 text-[#115eff] mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Address:</strong> {address}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="w-4.5 h-4.5 text-[#115eff] mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Host Institution:</strong> {hostInstitution}
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4.5 h-4.5 text-[#115eff] mt-0.5 shrink-0" />
                  <span>
                    <strong className="text-slate-900 font-semibold">Inquiries:</strong>{" "}
                    <a href={`mailto:${contactEmail}`} className="text-[#115eff] font-semibold hover:underline">
                      {contactEmail}
                    </a>
                    {hotline ? ` | Hotline: ${hotline}` : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              {hotelBookingUrl && (
                <a
                  href={hotelBookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-base rounded-sm shadow-xs transition-all"
                >
                  <span>Explore Venue Details</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}

              {visaUrl && (
                <a
                  href={visaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 bg-white hover:bg-blue-50/60 text-[#004776] border border-blue-100/90 font-bold text-sm sm:text-[15px] rounded-sm transition-all shadow-2xs"
                >
                  <span>Vietnam e-Visa Portal</span>
                  <ExternalLink className="w-4 h-4 text-slate-500" />
                </a>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[300px] sm:min-h-[340px] lg:min-h-full rounded-sm overflow-hidden border border-blue-100/90 shadow-2xs group bg-slate-900">
            {image && (
              <Image
                src={image}
                alt={venueName}
                fill
                unoptimized
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/20 pointer-events-none" />

            {imageBadge && (
              <div className="absolute top-4 right-4 z-10">
                <span className="text-xs font-semibold text-white bg-black/50 backdrop-blur-md px-3 py-1 rounded-sm border border-white/20">
                  {imageBadge}
                </span>
              </div>
            )}

            <div className="absolute bottom-4 left-4 right-4 z-10">
              <div className="p-3.5 rounded-sm bg-black/40 backdrop-blur-md border border-white/15 text-white">
                {imageCaptionLabel && (
                  <p className="text-xs text-blue-300 font-semibold mb-0.5">
                    {imageCaptionLabel}
                  </p>
                )}
                <p className="text-sm sm:text-base font-bold text-white">
                  {venueName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTransitCards && transitList.length > 0 && (
        <div className="px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {transitList.map((card, idx) => (
            <div
              key={idx}
              {...subItemAttr(["transitCards", idx])}
              className="p-6 sm:p-7 bg-white border border-blue-100/90 rounded-sm flex flex-col justify-between hover:border-[#115eff] hover:shadow-md transition-all group"
            >
              <div>
                {card.image && (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-4">
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={96}
                      height={96}
                      unoptimized
                      className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                <h4 className="text-lg font-bold text-[#004776] tracking-tight">
                  {card.title}
                </h4>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>
              {(card.linkLabel || card.footerText) && (
                <div className="mt-6 pt-3.5 border-t border-blue-50 text-sm font-semibold text-[#115eff]">
                  {card.linkUrl ? (
                    <a
                      href={card.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-bold text-[#115eff] hover:underline flex items-center gap-1"
                    >
                      <span>{card.linkLabel || card.footerText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span>{card.footerText || card.linkLabel}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAttractions && (
        <div id="travel-attractions" className="px-4 sm:px-6 pt-10 sm:pt-14 pb-12 sm:pb-16 border-t border-blue-100/85">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#004776] tracking-tight">
                {attractionsHeading}
              </h3>
              {attractionsSubtitle && (
                <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
                  {attractionsSubtitle}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1 p-1 bg-blue-50/60 rounded-sm shrink-0 border border-blue-100/90 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setSelectedFilter("all")}
                className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                  selectedFilter === "all"
                    ? "bg-white text-[#115eff] shadow-xs"
                    : "text-slate-600 hover:text-[#004776]"
                }`}
              >
                All Places · {attractionList.length}
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("walk")}
                className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                  selectedFilter === "walk"
                    ? "bg-white text-[#115eff] shadow-xs"
                    : "text-slate-600 hover:text-[#004776]"
                }`}
              >
                Walking Distance
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter("culture")}
                className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                  selectedFilter === "culture"
                    ? "bg-white text-[#115eff] shadow-xs"
                    : "text-slate-600 hover:text-[#004776]"
                }`}
              >
                History &amp; Heritage
              </button>
            </div>
          </div>

          {filteredAttractions.length === 0 ? (
            <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center text-sm text-slate-500">
              No attractions match this category yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredAttractions.map((attraction) => {
                const originalIdx = attractionList.indexOf(attraction);
                return (
                  <div
                    key={attraction.id || originalIdx}
                    {...subItemAttr(["attractions", originalIdx >= 0 ? originalIdx : 0])}
                    className="group bg-white border border-blue-100/90 hover:border-[#115eff] rounded-sm overflow-hidden shadow-2xs hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                        {attraction.image && (
                          <Image
                            src={attraction.image}
                            alt={attraction.name}
                            fill
                            unoptimized
                            className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                        {attraction.badge && (
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className="text-xs sm:text-[13px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-sm border border-white/20 shadow-xs">
                              {attraction.badge}
                            </span>
                          </div>
                        )}

                        {attraction.distanceFromVenue && (
                          <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-md">
                            <Navigation className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                            <span className="truncate">{attraction.distanceFromVenue}</span>
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-5 space-y-2.5">
                        <div>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#115eff] transition-colors leading-snug">
                            {attraction.name}
                          </h4>
                          {attraction.vietnameseName && (
                            <p className="text-xs font-medium text-[#115eff] mt-0.5 italic">
                              {attraction.vietnameseName}
                            </p>
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                          {attraction.description}
                        </p>

                        <div className="pt-2 border-t border-blue-50 space-y-1.5 text-xs text-slate-600">
                          {attraction.openingHours && (
                            <div className="flex items-start gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-[#115eff] mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{attraction.openingHours}</span>
                            </div>
                          )}
                          {attraction.location && (
                            <div className="flex items-start gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                              <span className="line-clamp-1">{attraction.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-3 sm:px-4 sm:py-3 bg-blue-50/35 border-t border-blue-50 flex items-center justify-between gap-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          attraction.mapsQuery || attraction.name
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-sm text-xs font-bold text-[#115eff] bg-white border border-blue-100 hover:bg-blue-50 transition-colors shadow-2xs"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-[#115eff]/70" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showCallout && calloutButtonLabel && (
            <div className="mt-10 pt-6 border-t border-blue-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs sm:text-sm text-slate-600">{calloutText}</p>
              <Link
                href={calloutButtonUrl || "/travel"}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-sm shadow-xs transition-all shrink-0"
              >
                <span>{calloutButtonLabel}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </SectionContainer>
  );
}
