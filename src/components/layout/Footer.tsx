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
import { cn } from "@/lib/utils";
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

export {
  DEFAULT_FOOTER_CONFIG,
  type FooterLinkItem,
  type FooterLinkGroup,
  type FooterSocialLink,
};

const FLOWER_WHITE = "/assets/flower-ute-white.png";

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
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  if (platform === "youtube") {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    );
  }

  if (platform === "smc") {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    );
  }

  return <Globe className="w-5 h-5" />;
}

export function Footer(props: FooterProps = {}) {
  const pathname = usePathname();
  const builderCtx = useContext(BuilderBlockContext);
  const isHiddenOnAdmin =
    Boolean(pathname?.startsWith("/admin")) &&
    !props.previewInBuilder &&
    !builderCtx;
  const [remoteConfig, setRemoteConfig] = useState<Partial<FooterProps> | null>(
    null
  );

  const hasExplicitOverrides =
    props.linkGroups !== undefined ||
    props.heading !== undefined ||
    props.contactEmail !== undefined;

  useEffect(() => {
    if (
      isHiddenOnAdmin ||
      hasExplicitOverrides ||
      builderCtx ||
      typeof window === "undefined"
    ) {
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
      .catch(() => {});

    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<Partial<FooterProps>>).detail;
      if (detail && !cancelled) setRemoteConfig(detail);
    };
    window.addEventListener("smc:footer-updated", onUpdated);

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== "undefined") {
      channel = new BroadcastChannel("smc_footer_sync");
      channel.onmessage = (ev) => {
        if (ev.data && !cancelled) setRemoteConfig(ev.data);
      };
    }

    return () => {
      cancelled = true;
      window.removeEventListener("smc:footer-updated", onUpdated);
      channel?.close();
    };
  }, [isHiddenOnAdmin, hasExplicitOverrides, builderCtx]);

  if (isHiddenOnAdmin) {
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
  const rawLinkGroups =
    props.linkGroups !== undefined
      ? Array.isArray(props.linkGroups)
        ? props.linkGroups
        : []
      : base.linkGroups;
  const activeLinkGroups = rawLinkGroups.map((group) => ({
    ...group,
    links: Array.isArray(group.links)
      ? group.links.map((link) => {
          const isStaticCfpPdf =
            typeof link.href === "string" &&
            (link.href === "/cfp-ieee-smc-2027.pdf" ||
              link.href === "/CFP - IEEE SMC 2027.pdf");
          return isStaticCfpPdf && cfpPdfUrl
            ? { ...link, href: cfpPdfUrl }
            : link;
        })
      : [],
  }));
  const activeSocialLinks =
    props.socialLinks !== undefined
      ? Array.isArray(props.socialLinks)
        ? props.socialLinks
        : []
      : base.socialLinks;
  const copyrightText = props.copyrightText ?? base.copyrightText;
  const footerRightText = props.footerRightText ?? base.footerRightText;

  return (
    <footer className="page-border-x-light relative z-40 bg-blue-600 text-white">
      <div className="relative overflow-hidden bg-blue-600">
        {/* Giant HCM-UTE white flower watermark matching hcmute-website-frontend 1:1 */}
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-[45rem] h-[45rem] sm:w-[60rem] sm:h-[60rem] opacity-[0.075] pointer-events-none rotate-[30deg]">
          <Image src={FLOWER_WHITE} alt="" fill className="object-contain" />
        </div>

        {/* Optional Top CFP Action Band */}
        {(heading || cfpButtonLabel || portalButtonLabel) && (
          <div className="relative z-10 border-b border-white/20">
            <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] py-7 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8">
                {(badgeText || datesText) && (
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/15 border border-white/25 text-xs font-semibold text-white mb-2.5">
                    {badgeText && <span>{badgeText}</span>}
                    {badgeText && datesText && <span className="text-white/50">•</span>}
                    {datesText && <span>{datesText}</span>}
                  </div>
                )}
                {heading && (
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                    {heading}
                  </h3>
                )}
                {description && (
                  <p className="mt-1.5 text-sm text-white/90 max-w-2xl leading-relaxed">
                    {description}
                  </p>
                )}
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-2.5">
                {cfpButtonLabel && (
                  <a
                    href={cfpPdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 bg-white hover:bg-blue-50 text-blue-700 font-bold text-sm rounded-lg transition-all shadow-sm hover:shadow-md group"
                  >
                    <FileDown className="w-4 h-4 text-blue-700" />
                    <span>{cfpButtonLabel}</span>
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                )}
                {portalButtonLabel && (
                  <a
                    href={websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 h-10 px-4 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-sm rounded-lg transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{portalButtonLabel}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main 12-Column Footer Grid matching hcmute-website-frontend 1:1 */}
        <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] py-10 lg:py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Brand Identity & Contact (lg:col-span-4) */}
            <div className="lg:col-span-4">
              <div className="flex items-center gap-3 mb-6">
                <a
                  href="https://hcmute.edu.vn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center transition-opacity hover:opacity-90 max-w-full"
                  title="HCM-UTE • Ho Chi Minh City University of Technology and Engineering"
                >
                  <Image
                    src="/logo/rectangle-logo.png"
                    alt="HCM-UTE • Ho Chi Minh City University of Technology and Engineering"
                    width={240}
                    height={56}
                    className="h-14 sm:h-16 w-auto object-contain"
                  />
                </a>
              </div>

              {(secondaryDescription || universityNote) && (
                <p className="text-white/95 text-sm leading-relaxed mb-6">
                  {secondaryDescription || universityNote}
                </p>
              )}

              <div className="space-y-3 text-sm">
                {(venueName || address) && (
                  <div className="flex items-start gap-3 text-white/95">
                    <MapPin className="w-4 h-4 mt-1 text-white shrink-0" />
                    <span>
                      {venueName}
                      {venueName && address ? `, ${address}` : address}
                    </span>
                  </div>
                )}
                {hotline && (
                  <div className="flex items-center gap-3 text-white/95">
                    <Phone className="w-4 h-4 text-white shrink-0" />
                    <a
                      href={`tel:${hotlineRaw}`}
                      className="hover:text-white transition-colors"
                    >
                      {hotline}
                    </a>
                  </div>
                )}
                {contactEmail && (
                  <div className="flex items-center gap-3 text-white/95">
                    <Mail className="w-4 h-4 text-white shrink-0" />
                    <a
                      href={`mailto:${contactEmail}`}
                      className="hover:text-white transition-colors"
                    >
                      {contactEmail}
                    </a>
                  </div>
                )}
              </div>

              {activeSocialLinks.length > 0 && (
                <div className="flex items-center gap-3 mt-6">
                  {activeSocialLinks.map((social, sIdx) => (
                    <a
                      key={`${social.name}-${sIdx}`}
                      href={social.href || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      {...subItemAttr(["socialLinks", sIdx])}
                      className="p-2 rounded-[var(--radius)] bg-white/10 border border-white/20 text-white transition-all duration-300 backdrop-blur-sm hover:bg-white/20"
                      title={social.name}
                      aria-label={social.name}
                    >
                      {renderSocialIcon(social)}
                      <span className="sr-only">{social.name}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Content Columns (lg:col-span-8) */}
            <div className="lg:col-span-8">
              <div
                className={cn(
                  "grid gap-8",
                  activeLinkGroups.length === 1
                    ? "grid-cols-1"
                    : activeLinkGroups.length === 2
                      ? "grid-cols-1 sm:grid-cols-2"
                      : activeLinkGroups.length === 3
                        ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
                        : activeLinkGroups.length >= 5
                          ? "grid-cols-2 md:grid-cols-5"
                          : "grid-cols-2 md:grid-cols-4"
                )}
              >
                {activeLinkGroups.map((group, gIdx) => (
                  <div
                    key={`${group.heading}-${gIdx}`}
                    {...subItemAttr(["linkGroups", gIdx])}
                  >
                    <h3 className="text-white font-semibold text-sm uppercase mb-4 tracking-wide">
                      {group.heading}
                    </h3>
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
                                className="text-white/90 text-sm hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                              >
                                <span>{link.label}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all duration-200 shrink-0" />
                              </a>
                            ) : (
                              <Link
                                href={resolvedHref}
                                prefetch={false}
                                className="text-white/90 text-sm hover:text-white transition-colors duration-200 inline-flex items-center gap-1 group"
                              >
                                <span>{link.label}</span>
                                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 transition-all duration-200 shrink-0" />
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

      {/* Bottom Copyright Bar matching hcmute-website-frontend 1:1 */}
      <div className="relative border-t border-white/20">
        <div className="w-full max-w-[var(--site-width)] mx-auto px-[var(--site-px)] lg:px-[var(--site-px-lg)] py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {copyrightText ? (
              <p className="text-white/90 text-sm text-center md:text-left">
                {copyrightText}
              </p>
            ) : (
              <div />
            )}
            {footerRightText && (
              <p className="text-white/80 text-sm">{footerRightText}</p>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
