"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock, ExternalLink, MapPin, Navigation } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { MUST_VISIT_ATTRACTIONS, type TouristAttraction } from "@/data/conference";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export type AttractionFilterCategory = "all" | "walk" | "culture" | "both";

export interface EditableAttraction extends TouristAttraction {
  filterCategory?: AttractionFilterCategory;
}

const LEGACY_WALK_IDS = new Set([
  "nguyen-hue",
  "post-office",
  "notre-dame",
  "ben-thanh",
  "independence-palace",
]);

const LEGACY_CULTURE_IDS = new Set([
  "fine-arts",
  "war-museum",
  "cu-chi",
  "notre-dame",
]);

export function inferAttractionFilterCategory(item: EditableAttraction): AttractionFilterCategory {
  if (item.filterCategory) return item.filterCategory;
  const isWalk = LEGACY_WALK_IDS.has(item.id);
  const isCulture = LEGACY_CULTURE_IDS.has(item.id);
  if (isWalk && isCulture) return "both";
  if (isWalk) return "walk";
  if (isCulture) return "culture";
  return "all";
}

export const DEFAULT_EDITABLE_ATTRACTIONS: EditableAttraction[] = MUST_VISIT_ATTRACTIONS.map(
  (item) => ({
    ...item,
    filterCategory: inferAttractionFilterCategory(item),
  })
);

export interface CityAttractionsBlockProps {
  title?: string;
  subtitle?: string;
  attractions?: EditableAttraction[];
  calloutText?: string;
  calloutButtonLabel?: string;
  calloutButtonUrl?: string;
  showCallout?: boolean;
}

export function CityAttractionsBlock({
  title = "Must-Visit Places in Ho Chi Minh City",
  subtitle = "Recommended iconic landmarks, historical monuments, and vibrant cultural destinations for conference delegates, located near the conference hotel in District 1.",
  attractions = DEFAULT_EDITABLE_ATTRACTIONS,
  calloutText = "For airport transfer details, climate advice, and full city guides, visit our dedicated travel page.",
  calloutButtonLabel = "Open Travel & Accommodation Page",
  calloutButtonUrl = "/travel",
  showCallout = true,
}: CityAttractionsBlockProps) {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "walk" | "culture">("all");
  const list = Array.isArray(attractions) ? attractions : [];

  const filteredAttractions = list.filter((item) => {
    if (selectedFilter === "all") return true;
    const cat = inferAttractionFilterCategory(item);
    if (selectedFilter === "walk") return cat === "walk" || cat === "both";
    if (selectedFilter === "culture") return cat === "culture" || cat === "both";
    return true;
  });

  return (
    <SectionContainer id="travel-attractions" fullWidthBg="bg-white">
      <div className="px-4 sm:px-6 pt-10 sm:pt-14 pb-12 sm:pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#004776] tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-blue-50/60 rounded-sm shrink-0 border border-blue-100/90 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setSelectedFilter("all")}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                selectedFilter === "all"
                  ? "bg-white text-[#115eff] shadow-xs"
                  : "text-slate-600 hover:text-[#004776]"
              }`}
            >
              All Places · {list.length}
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("walk")}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                selectedFilter === "walk"
                  ? "bg-white text-[#115eff] shadow-xs"
                  : "text-slate-600 hover:text-[#004776]"
              }`}
            >
              Walking Distance
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter("culture")}
              className={`px-3.5 sm:px-4 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer ${
                selectedFilter === "culture"
                  ? "bg-white text-[#115eff] shadow-xs"
                  : "text-slate-600 hover:text-[#004776]"
              }`}
            >
              History &amp; Heritage
            </button>
          </div>
        </div>

        {filteredAttractions.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-8 text-center text-sm text-slate-500">
            No attractions match this category yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredAttractions.map((attraction) => {
              const originalIndex = list.indexOf(attraction);
              return (
                <div
                  key={attraction.id || originalIndex}
                  {...subItemAttr(["attractions", originalIndex >= 0 ? originalIndex : 0])}
                  className="group bg-white border border-blue-100/90 hover:border-[#115eff] rounded-sm overflow-hidden shadow-2xs hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                      {attraction.image && (
                        <Image
                          src={attraction.image}
                          alt={attraction.name}
                          fill
                          unoptimized
                          className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                      {attraction.badge && (
                        <div className="absolute top-2.5 left-2.5 z-10">
                          <span className="text-xs sm:text-[13px] font-bold text-white bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-sm border border-white/20 shadow-xs">
                            {attraction.badge}
                          </span>
                        </div>
                      )}

                      {attraction.distanceFromVenue && (
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center gap-1.5 text-white text-xs font-semibold drop-shadow-md">
                          <Navigation className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                          <span className="truncate">{attraction.distanceFromVenue}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-5 space-y-2.5">
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-[#115eff] transition-colors leading-snug">
                          {attraction.name}
                        </h4>
                        {attraction.vietnameseName && (
                          <p className="text-xs font-medium text-[#115eff] mt-0.5 italic">
                            {attraction.vietnameseName}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {attraction.description}
                      </p>

                      <div className="pt-2 border-t border-blue-50 space-y-1.5 text-xs text-slate-600">
                        {attraction.openingHours && (
                          <div className="flex items-start gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#115eff] mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{attraction.openingHours}</span>
                          </div>
                        )}
                        {attraction.location && (
                          <div className="flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                            <span className="line-clamp-1">{attraction.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 sm:px-4 sm:py-3 bg-blue-50/35 border-t border-blue-50 flex items-center justify-between gap-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        attraction.mapsQuery || attraction.name
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-sm text-xs font-bold text-[#115eff] bg-white border border-blue-100 hover:bg-blue-50 transition-colors shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Google Maps</span>
                      <ExternalLink className="w-3 h-3 text-[#115eff]/70" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCallout && calloutButtonLabel && (
          <div className="mt-10 pt-6 border-t border-blue-100/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-slate-600">{calloutText}</p>
            <Link
              href={calloutButtonUrl || "/travel"}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-sm shadow-xs transition-all shrink-0"
            >
              <span>{calloutButtonLabel}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </SectionContainer>
  );
}

