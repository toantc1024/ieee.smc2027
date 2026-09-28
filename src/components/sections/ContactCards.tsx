"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
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

  // Guarantee no legacy 2026 or old domain data can display even if passed via DB props
  const displayEmail = email?.includes("2026") ? CONFERENCE_INFO.contactEmail : (email || CONFERENCE_INFO.contactEmail);
  const displayLocation = location?.includes("Bellevue") ? "Ho Chi Minh City, Vietnam" : (location || "Ho Chi Minh City, Vietnam");
  const displayVenue = venue?.includes("Meydenbauer") ? CONFERENCE_INFO.venue : (venue || CONFERENCE_INFO.venue);
  const displayWebsite = (!website || website.includes("2026") || website.includes("hcmute.edu.vn"))
    ? CONFERENCE_INFO.website
    : website;

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
          <div className="relative overflow-hidden bg-white border border-slate-200 hover:border-[#115eff] hover:bg-[#115eff] rounded-2xl shadow-2xs hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns */}
            <div className="corner-grid-tr opacity-40 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
            <div className="corner-dot-bl opacity-30 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

            {/* High-tech Crisp White Pattern on Card Hover */}
            <div
              className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
              style={{
                maskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
              }}
            />
            {/* Ambient light glow on hover */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Card Body */}
            <div className="p-6 sm:p-7 relative z-10 flex-1 flex flex-col justify-between">
              <div>
                {/* 3D Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden mb-5 group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <Image
                    src="/assets/3d-icons/email__3d-icon.jpg"
                    alt="Official Support Email"
                    width={60}
                    height={60}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:!text-blue-100 mb-1 transition-colors duration-300">
                  E-mail
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:!text-white mb-2 transition-colors duration-300">
                  Official Support Desk
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 group-hover:!text-white/90 leading-relaxed mb-4 transition-colors duration-300">
                  For questions regarding paper submission, proposals, registration, or partner sponsorships.
                </p>

                {/* Email Display Box: Pure white on hover */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 break-all mb-2 group-hover:bg-white/10 group-hover:border-white/25 group-hover:!text-white hover:!text-white transition-all duration-300">
                  <span className="group-hover:!text-white">{displayEmail}</span>
                </div>
              </div>
            </div>

            {/* Full-width Divider */}
            <div className="w-full border-t border-slate-200/80 group-hover:border-white/20 transition-colors duration-300" />

            {/* Bottom Full-Width Action Buttons (50/50 2 buttons) */}
            <div className="p-4 sm:px-6 sm:py-4 bg-slate-50/60 group-hover:bg-white/5 transition-colors duration-300 relative z-10">
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <a
                  href={`mailto:${displayEmail}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-white text-[#115eff] border border-slate-200 hover:bg-blue-50 group-hover:bg-white group-hover:!text-[#115eff] group-hover:border-white shadow-2xs group-hover:shadow transition-all duration-300"
                >
                  <span>Compose</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy("email", displayEmail)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 group-hover:bg-white/20 group-hover:!text-white group-hover:border-white/30 group-hover:hover:bg-white/30 shadow-2xs transition-all duration-300 cursor-pointer"
                >
                  {copiedType === "email" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 group-hover:!text-emerald-300" />
                      <span className="text-emerald-600 group-hover:!text-emerald-300">Copied</span>
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

          {/* Card 2: Location & Venue */}
          <div className="relative overflow-hidden bg-white border border-slate-200 hover:border-[#115eff] hover:bg-[#115eff] rounded-2xl shadow-2xs hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns */}
            <div className="corner-grid-tr opacity-40 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
            <div className="corner-dot-bl opacity-30 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

            {/* High-tech Crisp White Pattern on Card Hover */}
            <div
              className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
              style={{
                maskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
              }}
            />
            {/* Ambient light glow on hover */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Card Body */}
            <div className="p-6 sm:p-7 relative z-10 flex-1 flex flex-col justify-between">
              <div>
                {/* 3D Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden mb-5 group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <Image
                    src="/assets/3d-icons/location__3d-icon.jpg"
                    alt="Conference Venue Location"
                    width={60}
                    height={60}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:!text-blue-100 mb-1 transition-colors duration-300">
                  Location
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:!text-white mb-2 transition-colors duration-300">
                  {displayLocation}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 group-hover:!text-white/90 leading-relaxed mb-4 transition-colors duration-300">
                  Official host city offering vibrant innovation, cultural heritage, and world-class hospitality in Vietnam.
                </p>

                {/* Address Display Box: Pure white on hover */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed group-hover:bg-white/10 group-hover:border-white/25 group-hover:!text-white transition-all duration-300">
                  <strong className="text-slate-900 group-hover:!text-white font-semibold transition-colors duration-300 block">
                    {displayVenue}
                  </strong>
                  <span className="block text-slate-500 group-hover:!text-blue-100 mt-1 transition-colors duration-300">
                    {CONFERENCE_INFO.address}
                  </span>
                </div>
              </div>
            </div>

            {/* Full-width Divider */}
            <div className="w-full border-t border-slate-200/80 group-hover:border-white/20 transition-colors duration-300" />

            {/* Bottom Full-Width Action Buttons (50/50 2 buttons) */}
            <div className="p-4 sm:px-6 sm:py-4 bg-slate-50/60 group-hover:bg-white/5 transition-colors duration-300 relative z-10">
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <a
                  href={CONFERENCE_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-white text-[#115eff] border border-slate-200 hover:bg-blue-50 group-hover:bg-white group-hover:!text-[#115eff] group-hover:border-white shadow-2xs group-hover:shadow transition-all duration-300"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy("location", `${displayVenue}, ${CONFERENCE_INFO.address}`)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 group-hover:bg-white/20 group-hover:!text-white group-hover:border-white/30 group-hover:hover:bg-white/30 shadow-2xs transition-all duration-300 cursor-pointer"
                >
                  {copiedType === "location" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 group-hover:!text-emerald-300" />
                      <span className="text-emerald-600 group-hover:!text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Address</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Website & Digital Services */}
          <div className="relative overflow-hidden bg-white border border-slate-200 hover:border-[#115eff] hover:bg-[#115eff] rounded-2xl shadow-2xs hover:shadow-xl hover:shadow-blue-500/15 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
            {/* HCMUTE Brand Patterns */}
            <div className="corner-grid-tr opacity-40 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
            <div className="corner-dot-bl opacity-30 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

            {/* High-tech Crisp White Pattern on Card Hover */}
            <div
              className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
              style={{
                maskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
                WebkitMaskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
              }}
            />
            {/* Ambient light glow on hover */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Card Body */}
            <div className="p-6 sm:p-7 relative z-10 flex-1 flex flex-col justify-between">
              <div>
                {/* 3D Icon Container */}
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center p-1.5 overflow-hidden mb-5 group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                  <Image
                    src="/assets/3d-icons/portal__3d-icon.png"
                    alt="Official Conference Portal"
                    width={60}
                    height={60}
                    className="w-full h-full object-contain rounded-xl"
                  />
                </div>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:!text-blue-100 mb-1 transition-colors duration-300">
                  Website & Hotline
                </div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:!text-white mb-2 transition-colors duration-300">
                  Official Web Portal
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 group-hover:!text-white/90 leading-relaxed mb-4 transition-colors duration-300">
                  Access official announcements, CFP guidelines, submission portals, and secretariat hotline support: {CONFERENCE_INFO.hotline}.
                </p>

                {/* URL Display Box: Pure white on hover */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 break-all group-hover:bg-white/10 group-hover:border-white/25 group-hover:!text-white hover:!text-white transition-all duration-300">
                  <span className="group-hover:!text-white">
                    {displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Full-width Divider */}
            <div className="w-full border-t border-slate-200/80 group-hover:border-white/20 transition-colors duration-300" />

            {/* Bottom Full-Width Action Buttons (50/50 2 buttons) */}
            <div className="p-4 sm:px-6 sm:py-4 bg-slate-50/60 group-hover:bg-white/5 transition-colors duration-300 relative z-10">
              <div className="grid grid-cols-2 gap-2.5 w-full">
                <a
                  href={displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-white text-[#115eff] border border-slate-200 hover:bg-blue-50 group-hover:bg-white group-hover:!text-[#115eff] group-hover:border-white shadow-2xs group-hover:shadow transition-all duration-300"
                >
                  <span>Open Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleCopy("website", displayWebsite.startsWith("http") ? displayWebsite : `https://${displayWebsite}`)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 group-hover:bg-white/20 group-hover:!text-white group-hover:border-white/30 group-hover:hover:bg-white/30 shadow-2xs transition-all duration-300 cursor-pointer"
                >
                  {copiedType === "website" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 group-hover:!text-emerald-300" />
                      <span className="text-emerald-600 group-hover:!text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy URL</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </SectionContainer>
  );
}

export default ContactCards;
