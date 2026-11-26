"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Copy, Check, ExternalLink } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface ContactCardItem {
  iconImage?: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryValue: string;
  secondaryValue?: string;
  copyValue?: string;
  actionLabel: string;
  actionUrl: string;
  copyButtonLabel?: string;
}

export function buildDefaultContactCards({
  email = CONFERENCE_INFO.contactEmail,
  location = "Ho Chi Minh City, Vietnam",
  venue = CONFERENCE_INFO.venue,
  address = CONFERENCE_INFO.address,
  website = CONFERENCE_INFO.website,
  hotline = CONFERENCE_INFO.hotline,
  googleMapsUrl = CONFERENCE_INFO.googleMapsUrl,
}: {
  email?: string;
  location?: string;
  venue?: string;
  address?: string;
  website?: string;
  hotline?: string;
  googleMapsUrl?: string;
}): ContactCardItem[] {
  const normalizedWebsite = website.startsWith("http")
    ? website
    : `https://${website}`;

  return [
    {
      iconImage: "/assets/3d-icons/email__3d-icon.jpg",
      eyebrow: "E-mail",
      title: "Official Support Desk",
      description:
        "For questions regarding paper submission, proposals, registration, or partner sponsorships.",
      primaryValue: email,
      copyValue: email,
      actionLabel: "Compose",
      actionUrl: `mailto:${email}`,
      copyButtonLabel: "Copy",
    },
    {
      iconImage: "/assets/3d-icons/location__3d-icon.jpg",
      eyebrow: "Location",
      title: location,
      description:
        "Official host city offering vibrant innovation, cultural heritage, and world-class hospitality in Vietnam.",
      primaryValue: venue,
      secondaryValue: address,
      copyValue: `${venue}, ${address}`,
      actionLabel: "Google Maps",
      actionUrl: googleMapsUrl,
      copyButtonLabel: "Copy Address",
    },
    {
      iconImage: "/assets/3d-icons/portal__3d-icon.png",
      eyebrow: "Website & Hotline",
      title: "Official Web Portal",
      description: `Access official announcements, CFP guidelines, submission portals, and secretariat hotline support: ${hotline}.`,
      primaryValue: normalizedWebsite,
      copyValue: normalizedWebsite,
      actionLabel: "Open Portal",
      actionUrl: normalizedWebsite,
      copyButtonLabel: "Copy URL",
    },
  ];
}

export interface ContactCardsProps {
  title?: string;
  titleAccent?: string;
  subtitle?: string;
  email?: string;
  location?: string;
  venue?: string;
  address?: string;
  hotline?: string;
  googleMapsUrl?: string;
  website?: string;
  cards?: ContactCardItem[];
}

export function ContactCards({
  title = "Contact Us",
  titleAccent = "& Get in Touch",
  subtitle = "Have questions regarding paper submissions, proposals, or conference participation? We are here to assist you.",
  email = CONFERENCE_INFO.contactEmail,
  location = "Ho Chi Minh City, Vietnam",
  venue = CONFERENCE_INFO.venue,
  address = CONFERENCE_INFO.address,
  hotline = CONFERENCE_INFO.hotline,
  googleMapsUrl = CONFERENCE_INFO.googleMapsUrl,
  website = CONFERENCE_INFO.website,
  cards,
}: ContactCardsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const displayEmail = email || CONFERENCE_INFO.contactEmail;
  const displayLocation = location || "Ho Chi Minh City, Vietnam";
  const displayVenue = venue || CONFERENCE_INFO.venue;
  const displayWebsite = website || CONFERENCE_INFO.website;

  const resolvedCards = Array.isArray(cards)
    ? cards
    : buildDefaultContactCards({
        email: displayEmail,
        location: displayLocation,
        venue: displayVenue,
        address,
        website: displayWebsite,
        hotline,
        googleMapsUrl,
      });

  const handleCopy = (key: string, text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <SectionContainer id="contact" fullWidthBg="bg-slate-50/50">
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] w-full">
            {title.includes("&") ? (
              <>
                <span className="block text-[#004776]">{title.split("&")[0].trim()}</span>
                <span className="block text-[#115eff]">&amp; {title.split("&").slice(1).join("&").trim()}</span>
              </>
            ) : (
              <>
                <span className="block text-[#004776]">{title}</span>
                {titleAccent && (
                  <span className="block text-[#115eff]">{titleAccent}</span>
                )}
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium max-w-2xl">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-8 sm:py-12">
        {resolvedCards.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-white p-8 text-center text-sm text-slate-500">
            No contact cards added yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resolvedCards.map((card, idx) => {
              const copyKey = `contact-${idx}`;
              return (
                <div
                  key={idx}
                  {...subItemAttr(["cards", idx])}
                  className="relative overflow-hidden bg-white border border-border/80 ring-1 ring-border/50 hover:border-primary hover:bg-primary rounded-xl shadow-2xs hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="corner-grid-tr opacity-40 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />
                  <div className="corner-dot-bl opacity-30 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none" />

                  <div
                    className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                    style={{
                      maskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
                      WebkitMaskImage: "radial-gradient(ellipse at top right, black 20%, transparent 80%)",
                    }}
                  />
                  <Image
                    src="/assets/flower-ute-white.png"
                    alt=""
                    width={240}
                    height={240}
                    unoptimized
                    className="pointer-events-none absolute -bottom-16 -right-16 z-[1] rotate-[25deg] select-none opacity-0 transition-opacity duration-300 group-hover:opacity-20"
                    aria-hidden="true"
                  />

                  <div className="p-6 sm:p-7 relative z-10 flex-1 flex flex-col justify-between">
                    <div>
                      {card.iconImage && (
                        <div className="w-16 h-16 rounded-sm bg-white shadow-sm border border-blue-50 flex items-center justify-center p-1.5 overflow-hidden mb-5 group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
                          <Image
                            src={card.iconImage}
                            alt={card.title}
                            width={60}
                            height={60}
                            unoptimized
                            className="w-full h-full object-contain rounded-sm"
                          />
                        </div>
                      )}

                      {card.eyebrow && (
                        <div className="text-xs sm:text-sm font-bold text-slate-500 group-hover:!text-blue-100 mb-1.5 transition-colors duration-300">
                          {card.eyebrow}
                        </div>
                      )}
                      <h3 className="text-lg sm:text-xl font-bold text-[#004776] group-hover:!text-white mb-2 leading-snug transition-colors duration-300">
                        {card.title}
                      </h3>
                      <p className="text-sm sm:text-base text-slate-600 group-hover:!text-white/90 leading-relaxed mb-4 transition-colors duration-300">
                        {card.description}
                      </p>

                      {card.primaryValue && (
                        <div className="p-3.5 bg-blue-50/40 border border-blue-100/90 rounded-sm text-sm sm:text-base font-semibold text-[#004776] break-all mb-2 group-hover:bg-white/10 group-hover:border-white/25 group-hover:!text-white transition-all duration-300">
                          <span className="group-hover:!text-white block">{card.primaryValue}</span>
                          {card.secondaryValue && (
                            <span className="block text-slate-500 group-hover:!text-blue-100 mt-1 transition-colors duration-300 text-xs sm:text-sm font-normal break-normal">
                              {card.secondaryValue}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="w-full border-t border-blue-100/80 group-hover:border-white/20 transition-colors duration-300" />

                  <div className="p-4 sm:px-6 sm:py-4 bg-blue-50/35 group-hover:bg-white/5 transition-colors duration-300 relative z-10">
                    <div className="grid grid-cols-2 gap-3 w-full">
                      <a
                        href={card.actionUrl || "#"}
                        target={card.actionUrl?.startsWith("http") ? "_blank" : undefined}
                        rel={card.actionUrl?.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="w-full inline-flex items-center justify-center gap-1.5 min-h-[46px] py-2.5 px-3 rounded-sm text-sm sm:text-[15px] font-bold bg-white text-[#115eff] border border-blue-100/90 hover:bg-blue-50 group-hover:bg-white group-hover:!text-[#115eff] group-hover:border-white shadow-2xs group-hover:shadow transition-all duration-300"
                      >
                        <span>{card.actionLabel || "Open"}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>

                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(copyKey, card.copyValue || card.primaryValue)
                        }
                        className="w-full inline-flex items-center justify-center gap-1.5 min-h-[46px] py-2.5 px-3 rounded-sm text-sm sm:text-[15px] font-bold bg-white text-[#004776] border border-blue-100/90 hover:bg-blue-50/70 group-hover:bg-white/20 group-hover:!text-white group-hover:border-white/30 group-hover:hover:bg-white/30 shadow-2xs transition-all duration-300 cursor-pointer"
                      >
                        {copiedKey === copyKey ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-600 group-hover:!text-emerald-300" />
                            <span className="text-emerald-600 group-hover:!text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span>{card.copyButtonLabel || "Copy"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

export default ContactCards;
