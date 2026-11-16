"use client";

import React, { useContext, useEffect, useState } from "react";
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
import {
  BuilderBlockContext,
  subItemAttr,
} from "@/modules/website-builder/utils/sub-item-path";
import {
  DEFAULT_FOOTER_CONFIG,
  normalizeFooterHref,
  type FooterLinkItem,
  type FooterLinkGroup,
  type FooterSocialLink,
} from "@/lib/footer-config";

export { DEFAULT_FOOTER_CONFIG, type FooterLinkItem, type FooterLinkGroup, type FooterSocialLink };

const AGENT_BACKGROUND = "/assets/cta-background.webp";

export interface FooterProps {
  badgeText?: string;
  datesText?: string;
  heading?: string;
  description?: string;
  universityNote?: string;
  secondaryDescription?: string;
  cfpButtonLabel?: string;
  cfpPdfUrl?: string;
  portalButtonLabel?: string;
  websiteUrl?: string;
  venueName?: string;
  address?: string;
  hotline?: string;
  hotlineRaw?: string;
  contactEmail?: string;
  linkGroups?: FooterLinkGroup[];
  socialLinks?: FooterSocialLink[];
  copyrightText?: string;
  footerRightText?: string;
  previewInBuilder?: boolean;
}

function renderSocialIcon(social: FooterSocialLink) {
  const platform =
    social.platform ||
    (social.href?.includes("facebook")
      ? "facebook"
      : social.href?.includes("youtube")
        ? "youtube"
        : social.href?.includes("ieeesmc")
          ? "smc"
          : "globe");

  if (platform === "facebook") {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  if (platform === "smc") {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  }

  return <Globe className="w-4 h-4" />;
}

export function Footer(props: FooterProps = {}) {
  const pathname = usePathname();
  const builderCtx = useContext(BuilderBlockContext);
  const [remoteConfig, setRemoteConfig] = useState<Partial<FooterProps> | null>(
    null
  );

  const hasExplicitOverrides =
    props.linkGroups !== undefined ||
    props.heading !== undefined ||
    props.contactEmail !== undefined;

  useEffect(() => {
    if (hasExplicitOverrides || builderCtx || typeof window === "undefined") {
      return;
    }
    let cancelled = false;
    fetch("/api/footer")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.footer && typeof data.footer === "object") {
          setRemoteConfig(data.footer);
        }
      })
      .catch(() => {
        // Fallback silently to DEFAULT_FOOTER_CONFIG
      });
    return () => {
      cancelled = true;
    };
  }, [hasExplicitOverrides, builderCtx]);

  // Hide footer on CMS admin dashboard pages unless inside builder preview
  if (pathname?.startsWith("/admin") && !props.previewInBuilder && !builderCtx) {
    return null;
  }

  const base = { ...DEFAULT_FOOTER_CONFIG, ...remoteConfig };
  const badgeText = props.badgeText ?? base.badgeText;
  const datesText = props.datesText ?? base.datesText;
  const heading = props.heading ?? base.heading;
  const description = props.description ?? base.description;
  const universityNote = props.universityNote ?? base.universityNote;
  const secondaryDescription =
    props.secondaryDescription ?? base.secondaryDescription;
  const cfpButtonLabel = props.cfpButtonLabel ?? base.cfpButtonLabel;
  const cfpPdfUrl = props.cfpPdfUrl ?? base.cfpPdfUrl;
  const portalButtonLabel = props.portalButtonLabel ?? base.portalButtonLabel;
  const websiteUrl = props.websiteUrl ?? base.websiteUrl;
  const venueName = props.venueName ?? base.venueName;
  const address = props.address ?? base.address;
  const hotline = props.hotline ?? base.hotline;
  const hotlineRaw = props.hotlineRaw ?? base.hotlineRaw;
  const contactEmail = props.contactEmail ?? base.contactEmail;
  const activeLinkGroups =
    props.linkGroups !== undefined
      ? Array.isArray(props.linkGroups)
        ? props.linkGroups
        : []
      : base.linkGroups;
  const activeSocialLinks =
    props.socialLinks !== undefined
      ? Array.isArray(props.socialLinks)
        ? props.socialLinks
        : []
      : base.socialLinks;
  const copyrightText = props.copyrightText ?? base.copyrightText;
  const footerRightText = props.footerRightText ?? base.footerRightText;

  return (
    <footer className="page-border-x-light w-full bg-[#115eff] text-white relative z-40 overflow-hidden">
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
      <div
        className="absolute inset-0 bg-dot-dark opacity-20 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="corner-dot-dark-tr opacity-40 pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="corner-dot-dark-bl opacity-30 pointer-events-none"
        aria-hidden="true"
      />

      {/* Main Footer Container with Two Continuous Side Vertical Borders */}
      <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] relative z-10">
        <div className="w-full flex flex-col relative">
          {/* Top Banner: Host University & CFP Action Bar */}
          <div className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 border-b border-white/15 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-white/15 border border-white/25 text-xs font-semibold text-white mb-2.5 backdrop-blur-xs">
                <span>{badgeText}</span>
                <span className="text-white/50">•</span>
                <span>{datesText}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-[1.75rem] font-bold text-white tracking-tight leading-snug">
                {heading}
              </h3>
              <p className="mt-2 text-sm sm:text-[15px] text-blue-100 max-w-2xl font-normal leading-relaxed">
                {description}
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              {cfpButtonLabel && (
                <a
                  href={cfpPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 bg-white hover:bg-blue-50 text-[#115eff] font-bold text-sm sm:text-base rounded-[0.26rem] transition-all shadow-md hover:shadow-lg group"
                >
                  <FileDown className="w-4.5 h-4.5 text-[#115eff]" />
                  <span>{cfpButtonLabel}</span>
                  <ArrowUpRight className="w-4.5 h-4.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
              {portalButtonLabel && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm rounded-[0.26rem] transition-colors backdrop-blur-xs"
                >
                  <Globe className="w-4 h-4" />
                  <span>{portalButtonLabel}</span>
                </a>
              )}
            </div>
          </div>

          {/* Main Footer Content Grid */}
          <div className="relative z-10 px-4 sm:px-6 py-8 sm:py-10 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Column 1: HCM-UTE Official Rectangle Logo & Contact Details */}
            <div className="lg:col-span-5 space-y-4">
              <div className="space-y-3">
                <a
                  href="https://hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center transition-opacity hover:opacity-90 max-w-full"
                  title="HCM-UTE • Ho Chi Minh City University of Technology and Engineering"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/logo/rectangle-logo.png"
                    alt="HCM-UTE • Ho Chi Minh City University of Technology and Engineering"
                    className="h-10 sm:h-11 w-auto max-w-[260px] sm:max-w-[320px] object-contain drop-shadow-xs select-none"
                  />
                </a>
                <p className="text-blue-100/90 text-sm font-medium leading-relaxed max-w-md">
                  {universityNote}
                </p>
              </div>

              <p className="text-blue-100 text-sm leading-relaxed max-w-md font-normal">
                {secondaryDescription}
              </p>

              <div className="space-y-3 text-sm text-blue-100 pt-1">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-white mt-0.5 shrink-0" />
                  <span>
                    <strong>Venue:</strong> {venueName}, {address}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-white shrink-0" />
                  <a
                    href={`tel:${hotlineRaw}`}
                    className="hover:text-white transition-colors"
                  >
                    Hotline: {hotline}
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-white shrink-0" />
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:text-white transition-colors"
                  >
                    Email: {contactEmail}
                  </a>
                </div>
              </div>

              {/* Social Media Links */}
              <div className="flex items-center gap-2.5 pt-2">
                {activeSocialLinks.map((social, sIdx) => (
                  <a
                    key={`${social.name}-${sIdx}`}
                    href={social.href || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...subItemAttr(["socialLinks", sIdx])}
                    className="p-2.5 rounded-[var(--radius)] bg-white/10 border border-white/20 text-white transition-all duration-300 backdrop-blur-sm hover:bg-white/25 hover:scale-105"
                    title={social.name}
                    aria-label={social.name}
                  >
                    {renderSocialIcon(social)}
                  </a>
                ))}
              </div>
            </div>

            {/* Categorized Navigation Links */}
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                {activeLinkGroups.map((group, gIdx) => (
                  <div
                    key={`${group.heading}-${gIdx}`}
                    {...subItemAttr(["linkGroups", gIdx])}
                  >
                    <h4 className="text-white font-bold text-sm mb-3.5 border-b border-white/20 pb-2">
                      {group.heading}
                    </h4>
                    <ul className="space-y-2">
                      {(group.links || []).map((link, lIdx) => {
                        const resolvedHref = normalizeFooterHref(link.href);
                        const isExternal =
                          resolvedHref.startsWith("http://") ||
                          resolvedHref.startsWith("https://") ||
                          resolvedHref.startsWith("mailto:") ||
                          resolvedHref.startsWith("tel:") ||
                          resolvedHref.endsWith(".pdf");
                        return (
                          <li
                            key={`${link.label}-${lIdx}`}
                            {...subItemAttr([
                              "linkGroups",
                              gIdx,
                              "links",
                              lIdx,
                            ])}
                          >
                            {isExternal ? (
                              <a
                                href={resolvedHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-100 text-sm hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                              >
                                <span>{link.label}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all duration-200 shrink-0" />
                              </a>
                            ) : (
                              <Link
                                href={resolvedHref}
                                className="text-blue-100 text-sm hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                              >
                                <span>{link.label}</span>
                                <ArrowUpRight className="w-3.5 h-3.5 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all duration-200 shrink-0" />
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FULL WIDTH DIVIDER & SUB-BAR */}
      <div className="relative border-t border-white/15">
        <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)]">
          <div className="w-full px-4 sm:px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-[13px]">
            <p className="text-blue-100 text-center md:text-left leading-relaxed">
              {copyrightText}
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 sm:gap-3 text-blue-200/90 text-xs sm:text-[13px]">
              <span>{footerRightText}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
