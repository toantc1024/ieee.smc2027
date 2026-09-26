"use client";

import React from "react";
import Image from "next/image";
import { SectionContainer } from "@/components/layout/SectionContainer";

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
  title = "Welcome Message from the General Chairs",
  subtitle = "Welcome to IEEE SMC 2027 • Ho Chi Minh City",
  salutation = "Dear Colleagues & Honored Participants,",
  theme = "Human-Centric Intelligence: Shaping the Digital Future",
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
            , to be held on <strong className="text-[#004776]">October 6–10, 2027</strong> in the dynamic, historic, and culturally vibrant metropolis of <strong className="text-[#004776]">Ho Chi Minh City, Vietnam</strong>, hosted by the <strong className="text-[#004776]">Ho Chi Minh City University of Technology and Engineering (HCMUTE)</strong> in joint technical sponsorship with the <strong className="text-[#004776]">IEEE Systems, Man, and Cybernetics Society</strong>.
          </p>

          {/* Letter Paragraph 2: Technical Scope */}
          <p className="text-base sm:text-lg text-[#004776]/90 leading-relaxed font-normal text-justify">
            This year’s comprehensive scientific program features world-class plenary keynote addresses, thought-provoking industry-academia panel discussions, special invited sessions, workshops, interactive poster presentations, and memorable cultural networking galas. From cyber-physical-social systems and artificial intelligence to cognitive computing, autonomous bionic systems, robotics, and cybersecurity, SMC 2027 provides an open international forum to discuss challenges and design intelligent systems that prioritize human well-being and societal benefit.
          </p>

          {/* Letter Paragraph 3: Ho Chi Minh City & In-Person Experience */}
          <p className="text-base sm:text-lg text-[#004776]/90 leading-relaxed font-normal text-justify">
            Ho Chi Minh City, a thriving center of scientific innovation, youthful entrepreneurship, and rich historical heritage in Southeast Asia, offers the ideal backdrop for discovery and global partnerships. To maximize engagement, collaboration, and spontaneous intellectual exchange, we <strong className="text-[#004776]">strongly encourage in-person participation</strong> at the historic <strong className="text-[#004776]">Sheraton Saigon Grand Opera Hotel</strong>, while providing flexible online presentation avenues for colleagues facing travel constraints.
          </p>

          {/* Closing & Signatures */}
          {showSignatures && (
            <div>
              <p className="text-base sm:text-lg font-semibold text-[#004776]  mb-2 sm:mb-4">
                Sincerely and warmly yours,
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-12">
                {/* Chair Card 1: Prof. Ha Hai Phan */}
                <div className="group relative flex flex-col">
                  {/* The Card Box - Border only, white by default, hover border turns primary blue */}
                  <div className="relative rounded-2xl bg-white border border-slate-200 group-hover:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-visible">
                    {/* Top: Image Canvas with White Background (Hover: Solid Primary Blue) */}
                    <div className="relative w-full h-72 sm:h-80 rounded-t-2xl bg-white group-hover:bg-[#115eff] transition-colors duration-300">
                      {/* Clipped background elements (dots only) behind the cutout */}
                      <div className="absolute inset-0 rounded-t-2xl overflow-hidden pointer-events-none">
                        {/* Blue Dot Pattern: single diagonal gradient (triangle covering bottom-left, bottom-right, and top-right 50%, no top-left) */}
                        <div
                          className="absolute inset-0 bg-dot-pattern opacity-50 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />

                        {/* Crisp White Dot Pattern in hover (blue) state: single diagonal gradient */}
                        <div
                          className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />
                      </div>

                      {/* Head Over Card: Cutout sits in front of the dot pattern, overflows over the top edge */}
                      <div className="absolute bottom-0 inset-x-0 flex items-end justify-center pointer-events-none z-10">
                        <Image
                          src="/chairs/prof-ha-hai-phan.png"
                          alt="Prof. Ha Hai Phan"
                          width={360}
                          height={440}
                          className="h-80 sm:h-96 w-auto max-w-none object-contain object-bottom transition-transform duration-300 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    {/* Bottom: FULL WIDTH of the card (no padding or margin outside), flat top (no rounded top).
                        White by default, solid primary blue on hover with white text.
                        Divider: color like two side border with opacity, no full white on hover */}
                    <div className="relative z-20 w-full -mt-4 p-5 sm:p-6 bg-white group-hover:bg-[#115eff] rounded-b-2xl border-t border-slate-200 group-hover:border-slate-200/40 transition-colors duration-300 flex flex-col justify-between flex-1 overflow-hidden">
                      <div className="relative z-10">
                        <span className="inline-block text-xs font-semibold uppercase tracking-wider mb-2 px-2.5 py-0.5 rounded transition-colors bg-[#115eff] text-white border border-[#115eff] group-hover:bg-white group-hover:text-[#115eff] group-hover:border-white">
                          General Chair
                        </span>
                        <h4 className="text-lg sm:text-xl font-bold text-[#004776] group-hover:!text-white tracking-tight leading-snug transition-colors duration-300">
                          Prof. Ha Hai Phan
                        </h4>
                        <p className="text-xs sm:text-sm text-[#004776]/70 group-hover:!text-white/90 mt-1 font-medium transition-colors duration-300">
                          HCM-UTE, Vietnam
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chair Card 2: Prof. Rodney Roberts */}
                <div className="group relative flex flex-col">
                  {/* The Card Box - Border only, white by default, hover border turns primary blue */}
                  <div className="relative rounded-2xl bg-white border border-slate-200 group-hover:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-visible">
                    {/* Top: Image Canvas with White Background (Hover: Solid Primary Blue) */}
                    <div className="relative w-full h-72 sm:h-80 rounded-t-2xl bg-white group-hover:bg-[#115eff] transition-colors duration-300">
                      {/* Clipped background elements (dots only) behind the cutout */}
                      <div className="absolute inset-0 rounded-t-2xl overflow-hidden pointer-events-none">
                        {/* Blue Dot Pattern: single diagonal gradient (triangle covering bottom-left, bottom-right, and top-right 50%, no top-left) */}
                        <div
                          className="absolute inset-0 bg-dot-pattern opacity-50 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />

                        {/* Crisp White Dot Pattern in hover (blue) state: single diagonal gradient */}
                        <div
                          className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />
                      </div>

                      {/* Head Over Card: Cutout sits in front of the dot pattern, overflows over the top edge */}
                      <div className="absolute bottom-0 inset-x-0 flex items-end justify-center pointer-events-none z-10">
                        <Image
                          src="/chairs/prof-rodney-roberts.png"
                          alt="Prof. Rodney Roberts"
                          width={360}
                          height={440}
                          className="h-80 sm:h-96 w-auto max-w-none object-contain object-bottom transition-transform duration-300 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    {/* Bottom: FULL WIDTH of the card (no padding or margin outside), flat top (no rounded top).
                        White by default, solid primary blue on hover with white text.
                        Divider: color like two side border with opacity, no full white on hover */}
                    <div className="relative z-20 w-full -mt-4 p-5 sm:p-6 bg-white group-hover:bg-[#115eff] rounded-b-2xl border-t border-slate-200 group-hover:border-slate-200/40 transition-colors duration-300 flex flex-col justify-between flex-1 overflow-hidden">
                      <div className="relative z-10">
                        <span className="inline-block text-xs font-semibold uppercase tracking-wider mb-2 px-2.5 py-0.5 rounded transition-colors bg-[#115eff] text-white border border-[#115eff] group-hover:bg-white group-hover:text-[#115eff] group-hover:border-white">
                          General Co-Chair
                        </span>
                        <h4 className="text-lg sm:text-xl font-bold text-[#004776] group-hover:!text-white tracking-tight leading-snug transition-colors duration-300">
                          Prof. Rodney Roberts
                        </h4>
                        <p className="text-xs sm:text-sm text-[#004776]/70 group-hover:!text-white/90 mt-1 font-medium transition-colors duration-300">
                          President, IEEE SMC Society
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chair Card 3: Prof. Vladik Kreinovich */}
                <div className="group relative flex flex-col sm:col-span-2 md:col-span-1">
                  {/* The Card Box - Border only, white by default, hover border turns primary blue */}
                  <div className="relative rounded-2xl bg-white border border-slate-200 group-hover:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-visible">
                    {/* Top: Image Canvas with White Background (Hover: Solid Primary Blue) */}
                    <div className="relative w-full h-72 sm:h-80 rounded-t-2xl bg-white group-hover:bg-[#115eff] transition-colors duration-300">
                      {/* Clipped background elements (dots only) behind the cutout */}
                      <div className="absolute inset-0 rounded-t-2xl overflow-hidden pointer-events-none">
                        {/* Blue Dot Pattern: single diagonal gradient (triangle covering bottom-left, bottom-right, and top-right 50%, no top-left) */}
                        <div
                          className="absolute inset-0 bg-dot-pattern opacity-50 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />

                        {/* Crisp White Dot Pattern in hover (blue) state: single diagonal gradient */}
                        <div
                          className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                          style={{
                            maskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                            WebkitMaskImage: "linear-gradient(to bottom right, transparent 25%, black 75%)",
                          }}
                        />
                      </div>

                      {/* Head Over Card: Cutout sits in front of the dot pattern, overflows over the top edge */}
                      <div className="absolute bottom-0 inset-x-0 flex items-end justify-center pointer-events-none z-10">
                        <Image
                          src="/chairs/prof-vladik-kreinovich.png"
                          alt="Prof. Vladik Kreinovich"
                          width={360}
                          height={440}
                          className="h-80 sm:h-96 w-auto max-w-none object-contain object-bottom transition-transform duration-300 ease-out group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                    </div>

                    {/* Bottom: FULL WIDTH of the card (no padding or margin outside), flat top (no rounded top).
                        White by default, solid primary blue on hover with white text.
                        Divider: color like two side border with opacity, no full white on hover */}
                    <div className="relative z-20 w-full -mt-4 p-5 sm:p-6 bg-white group-hover:bg-[#115eff] rounded-b-2xl border-t border-slate-200 group-hover:border-slate-200/40 transition-colors duration-300 flex flex-col justify-between flex-1 overflow-hidden">
                      <div className="relative z-10">
                        <span className="inline-block text-xs font-semibold uppercase tracking-wider mb-2 px-2.5 py-0.5 rounded transition-colors bg-[#115eff] text-white border border-[#115eff] group-hover:bg-white group-hover:text-[#115eff] group-hover:border-white">
                          Program Chair
                        </span>
                        <h4 className="text-lg sm:text-xl font-bold text-[#004776] group-hover:!text-white tracking-tight leading-snug transition-colors duration-300">
                          Prof. Vladik Kreinovich
                        </h4>
                        <p className="text-xs sm:text-sm text-[#004776]/70 group-hover:!text-white/90 mt-1 font-medium transition-colors duration-300">
                          University of Texas at El Paso, USA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
