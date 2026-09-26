"use client";

import React from "react";
import Image from "next/image";
import { SectionContainer } from "@/components/layout/SectionContainer";

export interface ChairMember {
  name: string;
  role: "General Chair" | "Honorary Chair";
  affiliation: string;
  country: string;
  image: string;
}

export const CHAIR_MEMBERS: ChairMember[] = [
  {
    name: "Assoc. Prof. Dinh-Thanh Chau",
    role: "General Chair",
    affiliation: "Vice President, HCM-UTE",
    country: "Vietnam",
    image: "/chairs/prof-dinh-thanh-chau.png",
  },
  {
    name: "Prof. Yo-Ping Huang",
    role: "General Chair",
    affiliation: "National Taipei University of Technology",
    country: "Taiwan",
    image: "/chairs/prof-yo-ping-huang.png",
  },
  {
    name: "Assoc. Prof. Hieu-Giang Le",
    role: "Honorary Chair",
    affiliation: "Acting President, HCM-UTE",
    country: "Vietnam",
    image: "/chairs/prof-hieu-giang-le.png",
  },
  {
    name: "Prof. Saeid Nahavandi",
    role: "Honorary Chair",
    affiliation: "President, IEEE SMC Society • Swinburne Univ.",
    country: "Australia",
    image: "/chairs/prof-saeid-nahavandi.png",
  },
];

export interface WelcomeLetterProps {
  heading?: string;
  title?: string;
  subtitle?: string;
  salutation?: string;
  theme?: string;
  conferenceName?: string;
  datesLocation?: string;
  showSignatures?: boolean;
}

export function WelcomeLetter({
  heading = "Join us at the IEEE SMC 2027 in Ho Chi Minh City, Vietnam",
  title = "Welcome Message from the General Chairs & Honorary Chairs",
  subtitle = "Welcome to IEEE SMC 2027 • Ho Chi Minh City",
  salutation = "Dear Colleagues & Honored Participants,",
  theme = "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures",
  conferenceName = "IEEE SMC 2027",
  datesLocation = "October 6–10, 2027 • Ho Chi Minh City, Vietnam",
  showSignatures = true,
}: WelcomeLetterProps) {
  return (
    <SectionContainer id="welcome" fullWidthBg="bg-white">
      {/* Section Header matching HCMUTE Tin tức & Sự kiện nổi bật text style without bottom divider */}
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        {/* Subtle HCMUTE Royal Blue Dot Pattern in Top-Right Corner */}
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          {/* Big Bold 2-Line Headline matching HCMUTE signature style */}
          <h2 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold uppercase tracking-tight leading-[1.2] w-full">
            <span className="block text-[#004776]">
              Join us at the {conferenceName}
            </span>
            <span className="block text-[#115eff]">
              in Ho Chi Minh City, Vietnam
            </span>
          </h2>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#004776]/80 font-medium">
            {title}
          </p>
        </div>
      </div>

      {/* Main Letter Body */}
      <div className="px-4 sm:px-6 pb-10 sm:pb-14 pt-2 sm:pt-4">
        <div className="w-full space-y-6">
          {/* Salutation */}
          <div className="flex items-center gap-3 text-lg sm:text-xl font-bold text-[#004776] border-l-4 border-[#115eff] pl-3.5 py-0.5">
            <span>{salutation}</span>
          </div>

          {/* Letter Paragraph 1: Welcome & Theme */}
          <p className="text-base sm:text-lg text-[#004776]/90 leading-relaxed font-normal text-justify">
            It is our great pleasure and honor to welcome you to the{" "}
            <strong className="text-[#004776] font-bold">
              2027 IEEE International Conference on Systems, Man, and Cybernetics (SMC 2027)
            </strong>
            , to be held on <strong className="text-[#004776]">October 6–10, 2027</strong> in the dynamic, historic, and culturally vibrant metropolis of <strong className="text-[#004776]">Ho Chi Minh City, Vietnam</strong>, hosted by the <strong className="text-[#004776]">Ho Chi Minh City University of Technology and Engineering (HCM-UTE)</strong> in joint technical sponsorship with the <strong className="text-[#004776]">IEEE Systems, Man, and Cybernetics Society</strong>.
          </p>

          {/* Letter Paragraph 2: Technical Scope */}
          <p className="text-base sm:text-lg text-[#004776]/90 leading-relaxed font-normal text-justify">
            This year’s comprehensive scientific program features world-class plenary keynote addresses, thought-provoking industry-academia panel discussions, special invited sessions, workshops, interactive poster presentations, and memorable cultural networking galas. Under the overarching theme of <strong className="text-[#004776]">&ldquo;{theme}&rdquo;</strong>, SMC 2027 provides an open international forum to discuss challenges and design intelligent systems that prioritize human well-being and societal sustainability across Systems Science &amp; Engineering, Cybernetics, and Human-Machine Systems.
          </p>

          {/* Letter Paragraph 3: Ho Chi Minh City & In-Person Experience */}
          <p className="text-base sm:text-lg text-[#004776]/90 leading-relaxed font-normal text-justify">
            Ho Chi Minh City, a thriving center of scientific innovation, youthful entrepreneurship, and rich historical heritage in Southeast Asia, offers the ideal backdrop for discovery and global partnerships. To maximize engagement, collaboration, and spontaneous intellectual exchange, we <strong className="text-[#004776]">strongly encourage in-person participation</strong> at the iconic <strong className="text-[#004776]">Sheraton Saigon Grand Opera Hotel</strong>, while providing flexible online presentation avenues for colleagues facing travel constraints.
          </p>

          {/* Closing & Signatures */}
          {showSignatures && (
            <div>
              <p className="text-base sm:text-lg font-semibold text-[#004776] mb-2 sm:mb-4">
                Sincerely and warmly yours,
              </p>

              {/* Four Chairs Grid: General Chairs & Honorary Chairs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 sm:pt-8">
                {CHAIR_MEMBERS.map((chair) => (
                  <div key={chair.name} className="group relative flex flex-col">
                    {/* The Card Box - Clean overflow-hidden container */}
                    <div className="relative rounded-2xl bg-white border border-slate-200 group-hover:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-hidden shadow-2xs hover:shadow-md">
                      
                      {/* Top: Image Canvas with White Background (Hover: Solid Primary Blue) */}
                      <div className="relative w-full h-64 sm:h-72 bg-slate-50/70 group-hover:bg-[#115eff] transition-colors duration-300 overflow-hidden flex items-end justify-center pt-4 px-2">
                        {/* Clipped background elements (dots only) behind the cutout */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          {/* Blue Dot Pattern */}
                          <div
                            className="absolute inset-0 bg-dot-pattern opacity-50 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                            style={{
                              maskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                              WebkitMaskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            }}
                          />

                          {/* Crisp White Dot Pattern in hover (blue) state */}
                          <div
                            className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                            style={{
                              maskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                              WebkitMaskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            }}
                          />
                        </div>

                        {/* Image strictly scaled and fitted inside the container without any horizontal or vertical overflow */}
                        <div className="relative w-full h-full flex items-end justify-center z-10">
                          <Image
                            src={chair.image}
                            alt={chair.name}
                            width={360}
                            height={440}
                            className="h-full w-auto max-h-full max-w-full object-contain object-bottom transition-transform duration-300 ease-out group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </div>
                      </div>

                      {/* Bottom Details Section */}
                      <div className="relative z-20 w-full p-5 bg-white group-hover:bg-[#115eff] border-t border-slate-200 group-hover:border-white/20 transition-colors duration-300 flex flex-col justify-between flex-1">
                        <div className="relative z-10">
                          <span className="inline-block text-[11px] font-bold uppercase tracking-wider mb-2 px-2.5 py-0.5 rounded transition-colors bg-blue-50 text-[#115eff] border border-blue-200 group-hover:bg-white group-hover:text-[#115eff] group-hover:border-white">
                            {chair.role}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-[#004776] group-hover:!text-white tracking-tight leading-snug transition-colors duration-300">
                            {chair.name}
                          </h4>
                          <p className="text-xs text-[#004776]/70 group-hover:!text-white/90 mt-1.5 font-medium leading-relaxed transition-colors duration-300">
                            {chair.affiliation}, {chair.country}
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}

export default WelcomeLetter;
