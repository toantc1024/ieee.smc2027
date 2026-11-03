"use client";

import React from "react";
import { Compass, Plane, Hotel, Navigation, ExternalLink, MapPin } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

interface TravelAccommodationProps {
  title?: string;
  subtitle?: string;
  hotelBookingUrl?: string;
  airportDistance?: string;
}

export function TravelAccommodationSection({
  title = "Travel & Accommodation Guide",
  subtitle = "Information for attendees traveling to Ho Chi Minh City, airport transit, and hotel accommodations",
  hotelBookingUrl = "https://www.marriott.com/en-us/hotels/sgnsi-sheraton-saigon-grand-opera-hotel/overview/",
  airportDistance = "7 km (~20–30 mins from Tan Son Nhat Airport)",
}: TravelAccommodationProps) {
  return (
    <SectionContainer id="travel-guide" fullWidthBg="bg-white">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-8 w-full">
        <div className="space-y-3 max-w-4xl">
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-slate-900 leading-tight">
            {title}
          </h2>
          <p className="text-base sm:text-lg text-slate-600 font-medium">
            {subtitle}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Venue Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
                <Hotel className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Official Conference Hotel</h3>
              <p className="text-xs font-semibold text-cyan-700 mb-2">Sheraton Saigon Grand Opera Hotel</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Located in District 1 along historic Dong Khoi street, within walking distance of the Saigon Opera House, Notre Dame Cathedral, and the Saigon River.
              </p>
            </div>
            <a
              href={hotelBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              <span>Book Conference Rate</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Airport Transit Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Airport Transit (SGN)</h3>
              <p className="text-xs font-semibold text-slate-700 mb-2">Tan Son Nhat International Airport</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Distance: {airportDistance}. Official metered taxis (Vinasun, Mai Linh) and ride-hailing apps (Grab, Be) operate 24/7 directly outside international arrivals.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500">
              Estimated Taxi Fare: 150,000 – 250,000 VND ($6 – $10 USD)
            </div>
          </div>

          {/* City Orientation Card */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
                <Navigation className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">City Navigation</h3>
              <p className="text-xs font-semibold text-slate-700 mb-2">District 1 Center</p>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                The city center is pedestrian-friendly with hundreds of dining establishments, coffee shops, and cultural landmarks within a 10-minute walk from the venue.
              </p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-500">
              Local Time Zone: Indochina Time (ICT, UTC+7)
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
