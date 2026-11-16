"use client";

import React from "react";
import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface TransitHighlightCard {
  image?: string;
  title: string;
  description: string;
  footerText?: string;
  linkLabel?: string;
  linkUrl?: string;
}

export const DEFAULT_TRANSIT_CARDS: TransitHighlightCard[] = [
  {
    image: "/assets/3d/visa-travel-3d.png",
    title: "Vietnam Visa Applications",
    description:
      "Citizens of all countries are eligible for a 90-day single or multiple-entry electronic visa via the official government portal.",
    linkLabel: "evisa.gov.vn",
    linkUrl: CONFERENCE_INFO.visaUrl,
  },
  {
    image: "/assets/3d/airport-plane-3d.png",
    title: "Tan Son Nhat Airport",
    description:
      "Tan Son Nhat International Airport is located 7 km from the venue. Airport taxis, hotel transfers, and ride-hailing are readily available.",
    footerText: "Distance to venue: ~7 km, 20–30 mins",
  },
  {
    image: "/assets/3d/hotel-venue-3d.png",
    title: "Dong Khoi District & Metro Line 1",
    description:
      "Steps away from Saigon Opera House, Nguyen Hue Walking Street, and Metro Line 1 Station, with easy access to dining, landmarks, and hotels.",
    footerText: "District 1, Ho Chi Minh City",
  },
];

export interface TransitLogisticsBlockProps {
  title?: string;
  subtitle?: string;
  cards?: TransitHighlightCard[];
}

export function TransitLogisticsBlock({
  title = "",
  subtitle = "",
  cards = DEFAULT_TRANSIT_CARDS,
}: TransitLogisticsBlockProps) {
  const list = Array.isArray(cards) ? cards : [];

  return (
    <SectionContainer id="transit-logistics" fullWidthBg="bg-white">
      {(title || subtitle) && (
        <div className="px-4 sm:px-6 pt-10 sm:pt-12 pb-2 space-y-2">
          {title && (
            <h2 className="text-2xl sm:text-3xl font-bold text-[#004776] tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-[#004776]/80 font-medium">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="px-4 sm:px-6 py-8 sm:py-10">
        {list.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center text-sm text-slate-500">
            No transit cards configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {list.map((card, idx) => (
              <div
                key={idx}
                {...subItemAttr(["cards", idx])}
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
                        className="text-sm font-bold text-[#115eff] hover:underline inline-flex items-center gap-1"
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
      </div>
    </SectionContainer>
  );
}

