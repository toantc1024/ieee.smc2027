"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  MapPin,
  Phone,
  Mail,
  ArrowUpRight,
  Globe,
  FileDown,
} from "lucide-react";
import { CONFERENCE_INFO } from "@/data/conference";

const AGENT_BACKGROUND = "/assets/cta-background.webp";
const SQUARE_LOGO_WHITE = "/logo/square-logo-white.png";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://facebook.com/hcmute.edu.vn",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@UTETVChannel",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "HCM-UTE Official Portal",
    href: "https://hcmute.edu.vn",
    icon: <Globe className="w-4 h-4" />,
  },
  {
    name: "IEEE SMC Society",
    href: "https://www.ieeesmc.org",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

const linkGroups = [
  {
    heading: "Conference",
    links: [
      { label: "About IEEE SMC 2027", href: "#about" },
      { label: "Organizing Committee", href: "#welcome" },
      { label: "Important Dates & Timeline", href: "#dates" },
      { label: "Conference Video & Scope", href: "#video" },
      { label: "HCM-UTE Host University", href: "https://hcmute.edu.vn" },
    ],
  },
  {
    heading: "Authors & CFP",
    links: [
      { label: "Call for Papers Guidelines", href: "#cfp" },
      { label: "Download CFP PDF", href: CONFERENCE_INFO.cfpPdfUrl },
      { label: "Online Submission Portal", href: "#cfp" },
      { label: "Special Session Proposals", href: "#cfp" },
      { label: "Workshop & Tutorial Tracks", href: "#tracks" },
    ],
  },
  {
    heading: "Technical Tracks",
    links: [
      { label: "Systems Science & Eng. (SSE)", href: "#tracks" },
      { label: "Cybernetics Systems (CYB)", href: "#tracks" },
      { label: "Human-Machine Systems (HMS)", href: "#tracks" },
      { label: "AI & Autonomous Symbiosis", href: "#tracks" },
      { label: "Paper Formatting Guidelines", href: "#cfp" },
    ],
  },
  {
    heading: "Venue & Support",
    links: [
      { label: "Sheraton Saigon Grand Opera", href: "#venue" },
      { label: "Ho Chi Minh City Guide", href: "#venue" },
      { label: "Vietnam e-Visa Information", href: CONFERENCE_INFO.visaUrl },
      { label: "Frequently Asked Questions", href: "#faq" },
      { label: "Contact Organizing Secretariat", href: "#contact" },
    ],
  },
];

export function Footer() {
  const pathname = usePathname();

  // Hide footer on CMS admin dashboard pages
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer className="w-full bg-[#115eff] text-white relative z-40 overflow-hidden">
      {/* Background Texture & Royal Blue Overlay matching hcmute-website-frontend */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Image
          src={AGENT_BACKGROUND}
          alt=""
          fill
          priority
          className="object-cover opacity-75"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-[#115eff]/85 pointer-events-none" />

      {/* Decorative High-Tech Grid & Dot Pattern */}
      <div className="absolute inset-0 bg-dot-dark opacity-20 pointer-events-none" aria-hidden="true" />
      <div className="corner-dot-dark-tr opacity-40 pointer-events-none" aria-hidden="true" />
      <div className="corner-dot-dark-bl opacity-30 pointer-events-none" aria-hidden="true" />

      {/* Main Footer Container with Two Continuous Side Vertical Borders */}
      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="w-full border-x border-white/20 flex flex-col relative">
          
          {/* Top Banner: Host University & CFP Action Bar */}
          <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 border-b border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/15 border border-white/25 text-xs font-semibold text-white uppercase tracking-wider mb-2.5 backdrop-blur-xs">
                <span>Flagship Conference</span>
                <span className="text-white/50">•</span>
                <span>{CONFERENCE_INFO.dates}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
                IEEE SMC 2027 • Ho Chi Minh City, Vietnam
              </h3>
              <p className="mt-2 text-sm text-blue-100 max-w-2xl font-normal leading-relaxed">
                The 2027 IEEE International Conference on Systems, Man, and Cybernetics, hosted by Ho Chi Minh City University of Technology and Engineering (HCM-UTE). Theme: <em>&ldquo;{CONFERENCE_INFO.theme}&rdquo;</em>.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <a
                href={CONFERENCE_INFO.cfpPdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-white hover:bg-blue-50 text-[#115eff] font-bold text-sm rounded-[0.26rem] transition-all shadow-md hover:shadow-lg group"
              >
                <FileDown className="w-4 h-4 text-[#115eff]" />
                <span>Download Official CFP (PDF)</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href={CONFERENCE_INFO.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-xs rounded-[0.26rem] transition-colors backdrop-blur-xs"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Visit Conference Portal</span>
              </a>
            </div>
          </div>

          {/* Main Footer Content Grid */}
          <div className="relative z-10 px-4 sm:px-6 py-10 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Column 1: HCMUTE Official Square Logo & Identity + Contact Details */}
            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-3.5">
                <div className="relative w-14 h-14 sm:w-16 sm:h-16 shrink-0 bg-white/10 rounded-lg p-1.5 border border-white/20 backdrop-blur-xs">
                  <Image
                    src={SQUARE_LOGO_WHITE}
                    alt="HCM-UTE Official White Logo"
                    fill
                    sizes="(max-width: 640px) 56px, 64px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-extrabold text-base sm:text-lg leading-tight tracking-tight">
                      HCM-UTE
                    </span>
                    <span className="text-white/40">•</span>
                    <span className="text-white font-bold text-sm sm:text-base leading-tight tracking-tight">
                      IEEE SMC 2027
                    </span>
                  </div>
                  <span className="text-blue-100 text-xs font-medium leading-snug mt-1">
                    Trường Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh
                  </span>
                  <span className="text-blue-200/80 text-[11px] leading-tight">
                    Ho Chi Minh City University of Technology and Engineering
                  </span>
                </div>
              </div>

              <p className="text-blue-100 text-sm leading-relaxed max-w-md font-normal">
                Hosted by HCM-UTE Vietnam under the theme <em>&ldquo;{CONFERENCE_INFO.theme}&rdquo;</em>. Bringing together worldwide researchers and industry innovators in systems science, human–machine symbiosis, and cybernetics.
              </p>

              <div className="space-y-3 text-sm text-blue-100 pt-1">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-white mt-1 shrink-0" />
                  <span>
                    <strong>Venue:</strong> {CONFERENCE_INFO.venue}, {CONFERENCE_INFO.address}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-white shrink-0" />
                  <a href={`tel:${CONFERENCE_INFO.hotlineRaw}`} className="hover:text-white transition-colors">
                    Hotline: {CONFERENCE_INFO.hotline}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-white shrink-0" />
                  <a href={`mailto:${CONFERENCE_INFO.contactEmail}`} className="hover:text-white transition-colors">
                    Email: {CONFERENCE_INFO.contactEmail}
                  </a>
                </div>
              </div>

              {/* Social Media Links matching hcmute-website-frontend */}
              <div className="flex items-center gap-2.5 pt-2">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-[var(--radius)] bg-white/10 border border-white/20 text-white transition-all duration-300 backdrop-blur-sm hover:bg-white/25 hover:scale-105"
                    title={social.name}
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Categorized Navigation Links with Micro-animations */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                {linkGroups.map((group) => (
                  <div key={group.heading}>
                    <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 border-b border-white/15 pb-2">
                      {group.heading}
                    </h4>
                    <ul className="space-y-2.5">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="text-blue-100 text-sm hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                          >
                            <span>{link.label}</span>
                            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all duration-200 shrink-0" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* FULL WIDTH DIVIDER & SUB-BAR matching hcmute-website-frontend */}
      <div className="relative border-t border-white/15">
        <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="w-full border-x border-white/20 px-4 sm:px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
            <p className="text-blue-100 text-center md:text-left leading-relaxed">
              © {new Date().getFullYear()} IEEE SMC Society & Trường Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh (HCM-UTE). Tất cả các quyền được bảo lưu.
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 text-blue-200/90 text-xs">
              <span>Sheraton Saigon Grand Opera Hotel • TP. Hồ Chí Minh</span>
              <span className="hidden sm:inline text-white/30">•</span>
              <span>Phòng Quản trị Thương hiệu & Truyền thông HCM-UTE</span>
            </div>
          </div>
        </div>
      </div>

    </footer>
  );
}

export default Footer;
