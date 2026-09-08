"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowUpRight, Globe, FileDown } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { PaperCeptIcon } from "@/components/common/ProviderIcons";

export function Footer() {
  return (
    <footer className="w-full bg-[#115eff] text-white relative overflow-hidden">
      
      {/* High-Tech Dot Pattern Accents in Footer Corners */}
      <div className="corner-dot-dark-tr opacity-35" />
      <div className="corner-dot-dark-bl opacity-30" />

      {/* Decorative HCM-UTE Flower Motif Background */}
      <div 
        className="absolute right-4 sm:right-10 md:right-16 bottom-16 sm:bottom-20 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 opacity-15 pointer-events-none select-none z-0"
        aria-hidden="true"
      >
        <img
          src="/assets/flower-ute-white.png"
          alt="HCM-UTE Lotus Flower Motif"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Main Footer Container with Two Continuous Side Vertical Borders */}
      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="w-full border-x border-white/20 flex flex-col">
          
          {/* Top Banner: Host University & CFP Action Bar */}
          <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-white/20 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <div className="text-xs font-bold text-white uppercase tracking-wider bg-white/15 px-3 py-1 rounded-[0.26rem] inline-block mb-3 border border-white/25">
                Official Host Institution • IEEE SMC 2027
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                IEEE SMC 2027 • {CONFERENCE_INFO.dates} • Ho Chi Minh City, Vietnam
              </h3>
              <p className="mt-2 text-sm text-blue-100 max-w-2xl font-normal leading-relaxed">
                Flagship global conference on systems science, human–machine systems, and cybernetics, hosted by HCMUTE in Ho Chi Minh City.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href={CONFERENCE_INFO.cfpPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[50px] px-6 py-3.5 bg-white hover:bg-blue-50 text-[#115eff] font-bold text-sm rounded-[0.26rem] transition-all shadow-md hover:shadow-lg"
              >
                <FileDown className="w-4 h-4 text-[#115eff]" />
                <span>Download Official CFP (PDF)</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
              <a
                href={CONFERENCE_INFO.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs rounded-[0.26rem] transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visit Conference Portal</span>
              </a>
            </div>
          </div>

          {/* Main Footer Content Grid */}
          <div className="px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
            
            {/* Column 1: HCMUTE Official Square Logo & Identity + Contact Details */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-md inline-block shadow-sm">
                  <img
                    src="/logo/square-logo.png"
                    alt="HCMUTE Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-base sm:text-lg leading-tight">
                      HCMUTE
                    </span>
                    <span className="text-blue-200/60">•</span>
                    <span className="text-white font-bold text-sm sm:text-base leading-tight">
                      IEEE SMC 2027
                    </span>
                  </div>
                  <span className="text-blue-100 text-xs font-medium leading-tight mt-0.5">
                    Ho Chi Minh City University of Technology and Engineering
                  </span>
                </div>
              </div>

              <p className="text-blue-100 text-sm leading-relaxed max-w-md">
                Hosted by Ho Chi Minh City University of Technology and Engineering-Vietnam under the theme <em>&ldquo;{CONFERENCE_INFO.theme}&rdquo;</em>.
              </p>

              <div className="space-y-2.5 text-sm text-blue-100 pt-2">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-200 mt-1 shrink-0" />
                  <span>
                    <strong>Venue:</strong> {CONFERENCE_INFO.venue}, {CONFERENCE_INFO.address}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-blue-200 shrink-0" />
                  <a href={`tel:${CONFERENCE_INFO.hotlineRaw}`} className="hover:text-white transition-colors">
                    Hotline: {CONFERENCE_INFO.hotline}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-blue-200 shrink-0" />
                  <a href={`mailto:${CONFERENCE_INFO.contactEmail}`} className="hover:text-white transition-colors">
                    Email: {CONFERENCE_INFO.contactEmail}
                  </a>
                </div>
              </div>

              {/* Social Media Links matching HCMUTE style */}
              <div className="flex items-center gap-2.5 pt-2">
                <a
                  href="https://facebook.com/hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  title="HCMUTE Facebook"
                  aria-label="Facebook"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="https://www.youtube.com/@UTETVChannel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  title="HCMUTE YouTube"
                  aria-label="YouTube"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
                <a
                  href={CONFERENCE_INFO.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-colors"
                  title="Conference Website"
                  aria-label="Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Categorized Navigation Links */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                
                {/* Column 2: Conference & About */}
                <div>
                  <h4 className="text-white font-bold text-sm tracking-normal mb-4 border-b border-white/20 pb-2">
                    Conference
                  </h4>
                  <ul className="space-y-2.5 text-sm text-blue-100">
                    <li>
                      <Link href="#about" className="hover:text-white transition-colors">
                        About IEEE SMC 2027
                      </Link>
                    </li>
                    <li>
                      <Link href="#about" className="hover:text-white transition-colors">
                        Host: HCMUTE Vietnam
                      </Link>
                    </li>
                    <li>
                      <Link href="#dates" className="hover:text-white transition-colors">
                        Important Dates & Milestones
                      </Link>
                    </li>
                    <li>
                      <Link href="#committee" className="hover:text-white transition-colors">
                        Organizing Committee
                      </Link>
                    </li>
                    <li>
                      <a href={CONFERENCE_INFO.cfpPdfUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors font-medium text-white flex items-center gap-1">
                        <span>CFP PDF Document</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </li>
                  </ul>
                </div>

                {/* Column 3: Call for Papers & Technical */}
                <div>
                  <h4 className="text-white font-bold text-sm tracking-normal mb-4 border-b border-white/20 pb-2">
                    Authors & CFP
                  </h4>
                  <ul className="space-y-2.5 text-sm text-blue-100">
                    <li>
                      <Link href="#cfp" className="hover:text-white transition-colors">
                        Call for Papers Guidelines
                      </Link>
                    </li>
                    <li>
                      <Link href="#tracks" className="hover:text-white transition-colors">
                        Systems Science & Eng. (SSE)
                      </Link>
                    </li>
                    <li>
                      <Link href="#tracks" className="hover:text-white transition-colors">
                        Cybernetics Track (CYB)
                      </Link>
                    </li>
                    <li>
                      <Link href="#tracks" className="hover:text-white transition-colors">
                        Human-Machine Systems (HMS)
                      </Link>
                    </li>
                    <li>
                      <Link href="#cfp" className="hover:text-white transition-colors flex items-center gap-1">
                        <PaperCeptIcon className="w-3.5 h-3.5" />
                        <span>PaperCept Submission</span>
                      </Link>
                    </li>
                  </ul>
                </div>

                {/* Column 4: Venue & Assistance */}
                <div>
                  <h4 className="text-white font-bold text-sm tracking-normal mb-4 border-b border-white/20 pb-2">
                    Venue & Travel
                  </h4>
                  <ul className="space-y-2.5 text-sm text-blue-100">
                    <li>
                      <Link href="#venue" className="hover:text-white transition-colors">
                        Sheraton Saigon Hotel
                      </Link>
                    </li>
                    <li>
                      <a
                        href={CONFERENCE_INFO.visaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-white transition-colors flex items-center gap-1 text-white font-medium"
                      >
                        <span>Vietnam e-Visa Portal</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    </li>
                    <li>
                      <Link href="#venue" className="hover:text-white transition-colors">
                        Accommodation & Travel
                      </Link>
                    </li>
                    <li>
                      <Link href="#faq" className="hover:text-white transition-colors">
                        Frequently Asked Questions
                      </Link>
                    </li>
                    <li>
                      <a
                        href={`mailto:${CONFERENCE_INFO.contactEmail}`}
                        className="hover:text-white transition-colors"
                      >
                        Contact Secretariat
                      </a>
                    </li>
                  </ul>
                </div>

              </div>
            </div>

          </div>

          {/* Bottom Sub-Bar matching HCMUTE copyright */}
          <div className="border-t border-white/20 bg-blue-950/30 px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-200">
            <p className="text-center sm:text-left">
              © 2027 IEEE SMC Society & Ho Chi Minh City University of Technology and Engineering-Vietnam. All rights reserved.
            </p>
            <p className="text-blue-200/80">
              Sheraton Saigon Grand Opera Hotel • {CONFERENCE_INFO.address}
            </p>
          </div>

        </div>
      </div>

    </footer>
  );
}
