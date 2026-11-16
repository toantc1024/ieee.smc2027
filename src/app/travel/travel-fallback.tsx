"use client";

import React from "react";
import { VenueOverviewBlock } from "@/components/sections/VenueOverviewBlock";
import { TransitLogisticsBlock } from "@/components/sections/TransitLogisticsBlock";
import { TravelAccommodationSection } from "@/components/sections/TravelAccommodationSection";
import { VisaInformationSection } from "@/components/sections/VisaInformationSection";
import { VisitorInfoBlock } from "@/components/sections/VisitorInfoBlock";
import { CityAttractionsBlock } from "@/components/sections/CityAttractionsBlock";
import { ContactCards } from "@/components/sections/ContactCards";

export function TravelFallbackView() {
  return (
    <main className="min-h-screen bg-white">
      <VenueOverviewBlock />
      <TransitLogisticsBlock />
      <TravelAccommodationSection />
      <VisaInformationSection />
      <VisitorInfoBlock />
      <CityAttractionsBlock />
      <ContactCards title="Hospitality & Travel Inquiries" />
    </main>
  );
}
