"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Phone, Mail, Search, Menu, X, ArrowUpRight, FileDown } from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";
import { PaperCeptIcon } from "@/components/common/ProviderIcons";

const NAV_LINKS = [
  { name: "About", href: "#about" },
  { name: "Tracks", href: "#tracks" },
  { name: "Dates", href: "#dates" },
  { name: "Committee", href: "#committee" },
  { name: "Venue", href: "#venue" },
  { name: "FAQ", href: "#faq" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeNav, setActiveNav] = useState<string>("About");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Utility Bar (Exact HCM-UTE Blue #115eff with Two Side Borders) */}
      <div className="hidden lg:block bg-[#115eff] text-white relative z-50 text-xs border-b border-white/20">
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Two Side Vertical Borders aligned with site width - Full height touching top & bottom */}
          <div className="w-full border-x border-white/20 px-4 sm:px-6 py-2 flex items-center justify-between">
            
            {/* Left: Contact info + University & Society portal links */}
            <div className="flex items-center gap-4">
              <a
                href={`tel:${CONFERENCE_INFO.hotlineRaw}`}
                className="flex items-center gap-1.5 text-blue-100 hover:text-white font-medium transition-colors"
                title="Conference Hotline"
              >
                <Phone className="w-3.5 h-3.5 text-blue-200" />
                <span>{CONFERENCE_INFO.hotline}</span>
              </a>

              <a
                href={`mailto:${CONFERENCE_INFO.contactEmail}`}
                className="flex items-center gap-1.5 text-blue-100 hover:text-white font-medium transition-colors"
                title="Conference Secretariat Email"
              >
                <Mail className="w-3.5 h-3.5 text-blue-200" />
                <span>{CONFERENCE_INFO.contactEmail}</span>
              </a>

              <div className="flex items-center gap-2 pl-2 border-l border-white/20 text-blue-100">
                <a
                  href="https://www.ieeesmc.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors"
                >
                  IEEE SMC Society
                </a>
                <span className="text-white/30">•</span>
                <a
                  href={CONFERENCE_INFO.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors font-medium text-blue-100"
                >
                  HCM-UTE SMC 2027
                </a>
                <span className="text-white/30">•</span>
                <a
                  href={CONFERENCE_INFO.cfpPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-0.5 rounded hover:bg-white/10 hover:text-white transition-colors flex items-center gap-1 font-semibold"
                >
                  <FileDown className="w-3 h-3 text-blue-200" />
                  <span>CFP PDF</span>
                </a>
              </div>
            </div>

            {/* Right: Search & Location info */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-blue-100 hidden xl:inline font-medium">
                {CONFERENCE_INFO.datesShort} • Ho Chi Minh City, Vietnam
              </span>
              <span className="text-white/30 hidden xl:inline">•</span>
              
              {/* Search Trigger Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="px-2 py-1 rounded text-blue-100 hover:text-white hover:bg-white/15 transition-colors flex items-center gap-1.5"
                title="Search conference topics"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
                <span className="text-xs hidden sm:inline">Search</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Main Sticky Navbar with Two Side Vertical Borders - Flat border without shadow */}
      <header className="sticky top-0 z-40 w-full transition-all duration-200 bg-white border-b border-[#ccd7e2]">
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          {/* Two Side Vertical Borders Aligned with topbar & main container */}
          <div className="w-full border-x border-[#ccd7e2] px-4 sm:px-6">
            <div className="flex items-center justify-between h-16 sm:h-20">
              
              {/* Left: HCM-UTE official horizontal tagline logo */}
              <Link
                href="/"
                className="flex items-center shrink-0 group focus:outline-none py-1"
                title="HCM-UTE • IEEE SMC 2027"
              >
                <img
                  src="/logo/tagline.png"
                  alt="HCM-UTE - HCMC University of Technology and Education"
                  className="h-10 sm:h-12 md:h-13 w-auto max-w-[260px] sm:max-w-[340px] object-contain transition-transform duration-200 group-hover:scale-102 shrink-0"
                />
              </Link>

              {/* Right: Desktop Navigation + Customized Prominent CTA Button */}
              <div className="hidden lg:flex items-center gap-1 xl:gap-2">
                <nav className="flex items-center gap-1 xl:gap-1.5">
                  {NAV_LINKS.map((link) => {
                    const isActive = activeNav === link.name;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setActiveNav(link.name)}
                        className={`inline-flex items-center px-3.5 xl:px-4 py-2 text-sm xl:text-[15px] font-semibold rounded-[0.26rem] transition-all duration-150 select-none ${
                          isActive
                            ? "bg-slate-100 text-black font-bold shadow-2xs"
                            : "text-slate-700 hover:bg-slate-100 hover:text-black"
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>

                {/* Customized Taller CTA Button with 25% Larger Text */}
                <a
                  href="#cfp"
                  className="ml-2 inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-2.5 text-sm sm:text-base font-bold text-white bg-[#115eff] hover:bg-[#0a4de6] rounded-[0.26rem] shadow-sm hover:shadow-md transition-all duration-150"
                >
                  <PaperCeptIcon className="w-4 h-4 text-white" />
                  <span>Call for Papers</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              {/* Mobile Right Controls: Hamburger */}
              <div className="flex lg:hidden items-center gap-2">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Open Navigation Menu"
                  className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-[#115eff] transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>

            </div>

          </div>
        </div>

        {/* Mobile Dropdown Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#ccd7e2] bg-white px-5 py-6 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col space-y-2">
              <div className="text-xs font-semibold text-slate-500 px-2 pb-1">
                Navigation
              </div>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => {
                    setActiveNav(link.name);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-sm font-medium py-2.5 px-3 rounded-[0.26rem] transition-colors flex items-center justify-between ${
                    activeNav === link.name
                      ? "text-black font-bold bg-slate-100"
                      : "text-slate-700 hover:bg-slate-100 hover:text-black"
                  }`}
                >
                  <span>{link.name}</span>
                  <span className="text-[#115eff] text-xs">→</span>
                </Link>
              ))}

              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2.5">
                <a
                  href="#cfp"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 min-h-[48px] py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white text-sm font-bold rounded-[0.26rem] shadow-sm"
                >
                  <PaperCeptIcon className="w-4 h-4 text-white" />
                  <span>Call for Papers (PaperCept)</span>
                </a>
                <div className="text-center text-xs text-slate-500">
                  {CONFERENCE_INFO.venue} • {CONFERENCE_INFO.location}
                </div>
              </div>

            </div>
          </div>
        )}
      </header>

      {/* Quick Search Modal */}
      {searchOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-md shadow-2xl border border-slate-200 p-5 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-150">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Search className="w-4 h-4 text-[#115eff]" />
                <span>Search Conference Topics & Guidelines</span>
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4">
              <input
                type="text"
                autoFocus
                placeholder="Search systems, cybernetics, BCI, deadlines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-[#115eff] focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>

            <div className="mt-4 text-xs text-slate-500">
              Popular searches:{" "}
              <a href="#tracks" onClick={() => setSearchOpen(false)} className="text-[#115eff] hover:underline font-medium">
                Robotics & Intelligent Sensing
              </a>
              ,{" "}
              <a href="#dates" onClick={() => setSearchOpen(false)} className="text-[#115eff] hover:underline font-medium">
                April 08 Deadline
              </a>
              ,{" "}
              <a href="#venue" onClick={() => setSearchOpen(false)} className="text-[#115eff] hover:underline font-medium">
                Sheraton Saigon Hotel
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
