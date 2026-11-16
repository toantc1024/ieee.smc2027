"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Building2, Compass, ExternalLink, Mail, MapPin } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export interface VenueOverviewBlockProps {
  title?: string;
  subtitle?: string;
  venueName?: string;
  description?: string;
  secondaryDescription?: string;
  address?: string;
  hostInstitution?: string;
  contactEmail?: string;
  hotline?: string;
  image?: string;
  imageBadge?: string;
  imageCaptionLabel?: string;
  googleMapsUrl?: string;
  hotelBookingUrl?: string;
  visaUrl?: string;
  travelGuideUrl?: string;
  showHeaderButtons?: boolean;
}

export function VenueOverviewBlock({
  title = "Conference Venue & Ho Chi Minh City",
  subtitle = "Sheraton Saigon Grand Opera Hotel • Ho Chi Minh City, Vietnam",
  venueName = CONFERENCE_INFO.venue,
  description = "IEEE SMC 2027 will take place at the iconic Sheraton Saigon Grand Opera Hotel in the heart of District 1.",
  secondaryDescription = "Positioned in Saigon's vibrant commercial and cultural epicenter, the venue is steps away from historical landmarks including the Saigon Opera House, Notre Dame Cathedral, and the Central Post Office.",
  address = CONFERENCE_INFO.address,
  hostInstitution = "Ho Chi Minh City University of Technology and Engineering",
  contactEmail = CONFERENCE_INFO.contactEmail,
  hotline = CONFERENCE_INFO.hotline,
  image = "/images/sheraton-saigon-card.jpg",
  imageBadge = "District 1 • HCMC",
  imageCaptionLabel = "Official Conference Venue",
  googleMapsUrl = CONFERENCE_INFO.googleMapsUrl,
  hotelBookingUrl = "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
  visaUrl = CONFERENCE_INFO.visaUrl,
  travelGuideUrl = "/travel",
  showHeaderButtons = true,
}: VenueOverviewBlockProps) {
  return (
    <SectionContainer id="venue" fullWidthBg="bg-white">
      <span id="travel" className="sr-only -top-24 relative" />

      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 w-full">
          <div className="space-y-3 flex-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] w-full">
              {title.includes("&") ? (
                <>
                  <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                  <span className="block text-[#115eff]">&amp; {title.split("&").slice(1).join("&").trim()}</span>
                </>
              ) : (
                <span className="block text-[#004776]">{title}</span>
              )}
            </h2>
            {subtitle && (
              <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {showHeaderButtons && (
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
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
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
    </SectionContainer>
  );
}
