"use client";

import React from "react";
import { Compass, Plane, Hotel, Navigation, ExternalLink } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface TravelAccommodationCard {
  iconType?: "hotel" | "plane" | "compass" | "navigation";
  title: string;
  subtitle: string;
  description: string;
  footerNote?: string;
  buttonLabel?: string;
  buttonUrl?: string;
}

export function buildDefaultTravelCards(
  hotelBookingUrl = "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
  airportDistance = "7 km from Tan Son Nhat Airport"
): TravelAccommodationCard[] {
  return [
    {
      iconType: "hotel",
      title: "Official Conference Hotel",
      subtitle: "Sheraton Saigon Grand Opera Hotel",
      description:
        "Located in District 1 along historic Dong Khoi street, within walking distance of the Saigon Opera House, Notre Dame Cathedral, and the Saigon River.",
      buttonLabel: "Book Conference Rate",
      buttonUrl: hotelBookingUrl,
    },
    {
      iconType: "plane",
      title: "Airport Transit",
      subtitle: "Tan Son Nhat International Airport",
      description: `Distance: ${airportDistance}. Official metered taxis and ride-hailing apps operate 24/7 directly outside international arrivals.`,
      footerNote: "Estimated Taxi Fare: 150,000 – 250,000 VND / $6 – $10 USD",
    },
    {
      iconType: "navigation",
      title: "City Navigation",
      subtitle: "District 1 Center",
      description:
        "The city center is pedestrian-friendly with hundreds of dining establishments, coffee shops, and cultural landmarks within a 10-minute walk from the venue.",
      footerNote: "Local Time Zone: Indochina Time UTC+7",
    },
  ];
}

interface TravelAccommodationProps {
  title?: string;
  subtitle?: string;
  hotelBookingUrl?: string;
  airportDistance?: string;
  cards?: TravelAccommodationCard[];
}

export function TravelAccommodationSection({
  title = "Travel & Accommodation Guide",
  subtitle = "Information for attendees traveling to Ho Chi Minh City, airport transit, and hotel accommodations",
  hotelBookingUrl = "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
  airportDistance = "7 km from Tan Son Nhat Airport",
  cards,
}: TravelAccommodationProps) {
  const safeCards = Array.isArray(cards)
    ? cards
    : buildDefaultTravelCards(hotelBookingUrl, airportDistance);

  return (
    <SectionContainer id="travel-guide" fullWidthBg="bg-white">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full">
        <div className="space-y-3 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>

        {safeCards.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center text-sm text-slate-500">
            No travel cards configured yet.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {safeCards.map((card, idx) => {
              const Icon =
                card.iconType === "plane"
                  ? Plane
                  : card.iconType === "compass"
                    ? Compass
                    : card.iconType === "navigation"
                      ? Navigation
                      : Hotel;
              return (
                <div
                  key={idx}
                  {...subItemAttr(["cards", idx])}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1.5">{card.title}</h3>
                    {card.subtitle && (
                      <p className="text-xs font-semibold text-cyan-700 mb-2">{card.subtitle}</p>
                    )}
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">
                      {card.description}
                    </p>
                  </div>

                  {(card.buttonLabel || card.footerNote) && (
                    <div className="space-y-2.5">
                      {card.footerNote && (
                        <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500">
                          {card.footerNote}
                        </div>
                      )}
                      {card.buttonLabel && (
                        <a
                          href={card.buttonUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
                        >
                          <span>{card.buttonLabel}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
