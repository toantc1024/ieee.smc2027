"use client";

import React from "react";
import Image from "next/image";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { getClayAvatarForMember } from "@/components/sections/CommitteesSection";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface ChairMember {
  name: string;
  role: string;
  affiliation: string;
  country: string;
  image: string;
  gender?: "auto" | "male" | "female";
}

export const CHAIR_MEMBERS: ChairMember[] = [
  {
    name: "Prof. Yo-Ping Huang",
    role: "General Chair",
    affiliation: "National Taipei University of Technology",
    country: "Taiwan",
    image: "/chairs/prof-yo-ping-huang.png",
  },
  {
    name: "Prof. Saeid Nahavandi",
    role: "Honorary Chair",
    affiliation: "President, IEEE SMC Society • Swinburne Univ.",
    country: "Australia",
    image: "/chairs/prof-saeid-nahavandi.png",
  },
  {
    name: "Assoc. Prof. Dinh-Thanh Chau",
    role: "General Chair",
    affiliation: "Vice President, HCM-UTE",
    country: "Vietnam",
    image: "/chairs/prof-dinh-thanh-chau.png",
  },
  {
    name: "Assoc. Prof. Hieu-Giang Le",
    role: "Honorary Chair",
    affiliation: "Acting President, HCM-UTE",
    country: "Vietnam",
    image: "/chairs/prof-hieu-giang-le.png",
  },
];

export const DEFAULT_WELCOME_LETTER_HTML = `<p>It is our great pleasure and honor to welcome you to the <strong>2027 IEEE International Conference on Systems, Man, and Cybernetics</strong>, to be held on <strong>October 6–10, 2027</strong> in the dynamic, historic, and culturally vibrant metropolis of <strong>Ho Chi Minh City, Vietnam</strong>, hosted by the <strong>Ho Chi Minh City University of Technology and Engineering</strong> in joint technical sponsorship with the <strong>IEEE Systems, Man, and Cybernetics Society</strong>.</p><p>This year’s comprehensive scientific program features world-class plenary keynote addresses, thought-provoking industry-academia panel discussions, special invited sessions, workshops, interactive poster presentations, and memorable cultural networking galas. Under the overarching theme of <strong>"Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures"</strong>, SMC 2027 provides an open international forum to discuss challenges and design intelligent systems that prioritize human well-being and societal sustainability across Systems Science &amp; Engineering, Cybernetics, and Human-Machine Systems.</p><p>Ho Chi Minh City, a thriving center of scientific innovation, youthful entrepreneurship, and rich historical heritage in Southeast Asia, offers the ideal backdrop for discovery and global partnerships. To maximize engagement, collaboration, and spontaneous intellectual exchange, we <strong>strongly encourage in-person participation</strong> at the iconic <strong>Sheraton Saigon Grand Opera Hotel</strong>, while providing flexible online presentation avenues for colleagues facing travel constraints.</p>`;

export interface WelcomeLetterProps {
  heading?: string;
  title?: string;
  subtitle?: string;
  salutation?: string;
  theme?: string;
  conferenceName?: string;
  datesLocation?: string;
  closingText?: string;
  showSignatures?: boolean;
  chairs?: ChairMember[];
  body?: string;
}

export function WelcomeLetter({
  heading,
  title = "Welcome Message from the General Chairs & Honorary Chairs",
  subtitle,
  salutation = "Dear Colleagues & Honored Participants,",
  theme = "Human-AI Symbiosis: Engineering Intelligent, Autonomous, and Sustainable Futures",
  conferenceName = "IEEE SMC 2027",
  datesLocation = "October 6–10, 2027 • Ho Chi Minh City, Vietnam",
  closingText = "Sincerely and warmly yours,",
  showSignatures = true,
  chairs = CHAIR_MEMBERS,
  body,
}: WelcomeLetterProps) {
  const safeChairs = Array.isArray(chairs) ? chairs : [];

  return (
    <SectionContainer id="welcome" fullWidthBg="bg-white">
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-4 sm:pb-6 w-full">
        <div className="corner-dot-tr opacity-75 pointer-events-none" />

        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2] w-full">
            {heading ? (
              <span className="block text-[#004776]">{heading}</span>
            ) : (
              <>
                <span className="block text-[#004776]">
                  Join us at the {conferenceName}
                </span>
                <span className="block text-[#115eff]">
                  in Ho Chi Minh City, Vietnam
                </span>
              </>
            )}
          </h2>

          <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium">
            {title}
          </p>
          {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
          <p className="text-sm font-medium text-[#115eff]">{datesLocation}</p>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-10 sm:pb-14 pt-2 sm:pt-4">
        <div className="w-full space-y-6">
          <div className="flex items-center gap-3 text-lg sm:text-xl font-bold text-[#004776] border-l-4 border-[#115eff] pl-3.5 py-0.5">
            <span>{salutation}</span>
          </div>

          {body && body !== "<p></p>" ? (
            <div
              className="space-y-4 text-base leading-relaxed text-[#004776]/90 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[#115eff] [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <>
              <p className="text-base sm:text-lg text-[#004776]/90 leading-relaxed font-normal text-justify">
                It is our great pleasure and honor to welcome you to the{" "}
                <strong className="text-[#004776] font-bold">
                  2027 IEEE International Conference on Systems, Man, and Cybernetics
                </strong>
                , to be held on <strong className="text-[#004776]">October 6–10, 2027</strong> in the dynamic, historic, and culturally vibrant metropolis of <strong className="text-[#004776]">Ho Chi Minh City, Vietnam</strong>, hosted by the <strong className="text-[#004776]">Ho Chi Minh City University of Technology and Engineering</strong> in joint technical sponsorship with the <strong className="text-[#004776]">IEEE Systems, Man, and Cybernetics Society</strong>.
              </p>

              <p className="text-base sm:text-lg text-[#004776]/90 leading-relaxed font-normal text-justify">
                This year’s comprehensive scientific program features world-class plenary keynote addresses, thought-provoking industry-academia panel discussions, special invited sessions, workshops, interactive poster presentations, and memorable cultural networking galas. Under the overarching theme of <strong className="text-[#004776]">&ldquo;{theme}&rdquo;</strong>, SMC 2027 provides an open international forum to discuss challenges and design intelligent systems that prioritize human well-being and societal sustainability across Systems Science &amp; Engineering, Cybernetics, and Human-Machine Systems.
              </p>

              <p className="text-base sm:text-lg text-[#004776]/90 leading-relaxed font-normal text-justify">
                Ho Chi Minh City, a thriving center of scientific innovation, youthful entrepreneurship, and rich historical heritage in Southeast Asia, offers the ideal backdrop for discovery and global partnerships. To maximize engagement, collaboration, and spontaneous intellectual exchange, we <strong className="text-[#004776]">strongly encourage in-person participation</strong> at the iconic <strong className="text-[#004776]">Sheraton Saigon Grand Opera Hotel</strong>, while providing flexible online presentation avenues for colleagues facing travel constraints.
              </p>
            </>
          )}

          {showSignatures && safeChairs.length > 0 && (
            <div>
              {closingText && (
                <p className="text-base sm:text-lg font-semibold text-[#004776] mb-2 sm:mb-4">
                  {closingText}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 sm:pt-8">
                {safeChairs.map((chair, idx) => (
                  <div
                    key={`${chair.name}-${idx}`}
                    {...subItemAttr(["chairs", idx])}
                    className="group relative flex flex-col"
                  >
                    <div className="relative rounded-sm bg-white border border-blue-100/90 group-hover:border-[#115eff] transition-all duration-300 flex flex-col flex-1 overflow-hidden shadow-2xs hover:shadow-md">
                      <div className="relative w-full h-64 sm:h-72 bg-blue-50/35 group-hover:bg-[#115eff] transition-colors duration-300 overflow-hidden flex items-end justify-center pt-4 px-2">
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div
                            className="absolute inset-0 bg-dot-pattern opacity-50 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"
                            style={{
                              maskImage: "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
                              WebkitMaskImage: "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
                            }}
                          />
                          <div
                            className="absolute inset-0 bg-dot-pattern-white opacity-0 group-hover:opacity-45 transition-opacity duration-300 pointer-events-none"
                            style={{
                              maskImage: "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
                              WebkitMaskImage: "linear-gradient(to bottom, transparent 18%, rgba(0,0,0,0.45) 52%, black 92%)",
                            }}
                          />
                        </div>

                        <div className="relative w-full h-full flex items-end justify-center z-10">
                          <Image
                            src={
                              chair.image ||
                              getClayAvatarForMember(
                                chair.name,
                                chair.gender === "male" || chair.gender === "female"
                                  ? chair.gender
                                  : undefined
                              )
                            }
                            alt={chair.name}
                            width={360}
                            height={440}
                            unoptimized
                            className="h-full w-auto max-h-full max-w-full object-contain object-bottom transition-transform duration-300 ease-out group-hover:scale-105"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          />
                        </div>
                      </div>

                      <div className="relative z-20 w-full p-4 sm:p-5 bg-white group-hover:bg-[#115eff] border-t border-blue-100/85 group-hover:border-white/20 transition-colors duration-300 flex flex-col justify-between flex-1 items-center text-center">
                        <div className="relative z-10 flex flex-col items-center text-center">
                          <span className="inline-block text-xs font-bold mb-2 px-2.5 py-0.5 rounded transition-colors bg-blue-50 text-[#115eff] border border-blue-200 group-hover:bg-white group-hover:text-[#115eff] group-hover:border-white">
                            {chair.role}
                          </span>
                          <h4 className="text-base sm:text-[17px] font-bold text-[#004776] group-hover:!text-white tracking-tight leading-snug transition-colors duration-300">
                            {chair.name}
                          </h4>
                          <p className="text-xs sm:text-sm text-[#004776]/80 group-hover:!text-white/90 mt-1 font-medium leading-relaxed transition-colors duration-300">
                            {chair.affiliation}
                            {chair.country ? `, ${chair.country}` : ""}
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
