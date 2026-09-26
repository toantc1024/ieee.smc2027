"use client";

import React, { useState } from "react";
import {
  Mail,
  MapPin,
  Globe,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export interface ContactCardsProps {
  title?: string;
  subtitle?: string;
  email?: string;
  location?: string;
  venue?: string;
  website?: string;
}

export function ContactCards({
  title = "Contact Us",
  subtitle = "Have questions regarding paper submissions, proposals, or conference participation? We are here to assist you.",
  email = CONFERENCE_INFO.contactEmail,
  location = "Ho Chi Minh City, Vietnam",
  venue = CONFERENCE_INFO.venue,
  website = CONFERENCE_INFO.website,
}: ContactCardsProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Guarantee no legacy 2026 data can display even if passed via DB props
  const displayEmail = email?.includes("2026") ? CONFERENCE_INFO.contactEmail : (email || CONFERENCE_INFO.contactEmail);
  const displayLocation = location?.includes("Bellevue") ? "Ho Chi Minh City, Vietnam" : (location || "Ho Chi Minh City, Vietnam");
  const displayVenue = venue?.includes("Meydenbauer") ? CONFERENCE_INFO.venue : (venue || CONFERENCE_INFO.venue);
  const displayWebsite = website?.includes("2026") ? CONFERENCE_INFO.website : (website || CONFERENCE_INFO.website);

  const handleCopy = (type: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <SectionContainer id="contact" fullWidthBg="bg-slate-50/50">
      {/* Section Header matching standard HCMUTE 2-line headline style */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">Contact Us</span>
            <span className="block text-[#115eff]">& Get in Touch</span>
          </h2>
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Main Content: 3 Prominent Cards matching IEEE SMC format */}
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Email */}
          <div className="relative overflow-hidden p-6 sm:p-7 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns on Card Hover */}
            <div className="corner-grid-tr opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
            <div className="corner-dot-bl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-[#115eff] rounded-xl flex items-center justify-center mb-5 border border-blue-100 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <Mail className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                E-mail
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Official Support Desk
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                For questions regarding paper submission, proposals, registration, or partner sponsorships.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 break-all mb-2">
                {displayEmail}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={`mailto:${displayEmail}`}
                className="text-xs font-bold text-[#115eff] hover:underline inline-flex items-center gap-1"
              >
                <span>Compose Email</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleCopy("email", displayEmail)}
                className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedType === "email" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Location & Venue */}
          <div className="relative overflow-hidden p-6 sm:p-7 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns on Card Hover */}
            <div className="corner-grid-tr opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
            <div className="corner-dot-bl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-[#115eff] rounded-xl flex items-center justify-center mb-5 border border-blue-100 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <MapPin className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Location
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {displayLocation}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Official host city offering vibrant innovation, cultural heritage, and world-class hospitality in Vietnam.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-700 leading-relaxed">
                <strong className="text-slate-900 font-semibold">{displayVenue}</strong>
                <span className="block text-slate-500 mt-1">
                  {CONFERENCE_INFO.address}
                </span>
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={CONFERENCE_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#115eff] hover:underline inline-flex items-center gap-1"
              >
                <span>Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <span className="text-xs text-slate-400">Host City</span>
            </div>
          </div>

          {/* Card 3: Website & Digital Services */}
          <div className="relative overflow-hidden p-6 sm:p-7 bg-white border border-slate-200 hover:border-[#115eff] rounded-xl shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns on Card Hover */}
            <div className="corner-grid-tr opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none" />
            <div className="corner-dot-bl opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-[#115eff] rounded-xl flex items-center justify-center mb-5 border border-blue-100 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                <Globe className="w-7 h-7" />
              </div>

              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Website & Hotline
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Official Web Portal
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                Access official announcements, CFP guidelines, submission portals, and secretariat hotline support: {CONFERENCE_INFO.hotline}.
              </p>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs font-mono text-slate-800 break-all">
                {displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`}
              </div>
            </div>

            <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href={displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#115eff] hover:underline inline-flex items-center gap-1"
              >
                <span>Open Website</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                onClick={() => handleCopy("website", displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`)}
                className="text-xs text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 cursor-pointer"
              >
                {copiedType === "website" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
    </SectionContainer>
  );
}

export default ContactCards;
