"use client";

import React from "react";
import { FileText, CheckCircle, ExternalLink, Mail } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface VisaGuideCard {
  iconType?: "evisa" | "letter";
  title: string;
  description: string;
  bulletsHeading?: string;
  bullets: Array<{ text: string }>;
  buttonLabel?: string;
  buttonUrl?: string;
  contactLabel?: string;
  contactEmail?: string;
}

export function buildDefaultVisaCards(
  evisaUrl = "https://evisa.xuatnhapcanh.gov.vn",
  visaLetterEmail = "smc2027@hcmute.edu.vn"
): VisaGuideCard[] {
  return [
    {
      iconType: "evisa",
      title: "90-Day Electronic Visa",
      description:
        "Citizens of all countries and territories are eligible to apply for a 90-day electronic visa through the official Vietnam Immigration Department portal.",
      bullets: [
        { text: "Processing Time: Typically 3 to 5 business days" },
        { text: "Passport Validity: Must have at least 6 months validity" },
        { text: "Entry Ports: Valid for entry via Tan Son Nhat Airport" },
      ],
      buttonLabel: "Vietnam Immigration e-Visa Portal",
      buttonUrl: evisaUrl,
    },
    {
      iconType: "letter",
      title: "Official Visa Support Letters",
      description:
        "Registered authors and participants requiring an official IEEE SMC 2027 Visa Invitation Letter for consulate processing may request one after completing registration.",
      bulletsHeading: "Required Details for Visa Letters",
      bullets: [
        { text: "1. Full legal name as printed in passport" },
        { text: "2. Passport number, nationality, date of birth" },
        { text: "3. Accepted paper ID and title" },
        { text: "4. Conference registration confirmation code" },
      ],
      contactLabel: "Contact Secretariat",
      contactEmail: visaLetterEmail,
    },
  ];
}

interface VisaInformationProps {
  title?: string;
  subtitle?: string;
  evisaUrl?: string;
  visaLetterEmail?: string;
  cards?: VisaGuideCard[];
}

export function VisaInformationSection({
  title = "Vietnam Visa & Entry Requirements",
  subtitle = "Complete travel and entry guidance for international delegates attending IEEE SMC 2027 in Ho Chi Minh City",
  evisaUrl = "https://evisa.xuatnhapcanh.gov.vn",
  visaLetterEmail = "smc2027@hcmute.edu.vn",
  cards,
}: VisaInformationProps) {
  const safeCards = Array.isArray(cards)
    ? cards
    : buildDefaultVisaCards(evisaUrl, visaLetterEmail);

  return (
    <SectionContainer id="visa" fullWidthBg="bg-white">
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
            No visa cards configured yet.
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {safeCards.map((card, idx) => {
              const isLetter = card.iconType === "letter";
              return (
                <div
                  key={idx}
                  {...subItemAttr(["cards", idx])}
                  className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                        isLetter
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isLetter ? (
                        <Mail className="w-5 h-5" />
                      ) : (
                        <FileText className="w-5 h-5" />
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {card.description}
                    </p>

                    {Array.isArray(card.bullets) && card.bullets.length > 0 && (
                      card.bulletsHeading ? (
                        <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2 mb-6">
                          <p className="font-semibold text-slate-900">
                            {card.bulletsHeading}
                          </p>
                          {card.bullets.map((b, bIdx) => (
                            <p
                              key={bIdx}
                              {...subItemAttr(["cards", idx, "bullets", bIdx])}
                            >
                              {b.text}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <ul className="space-y-2 text-xs text-slate-600 mb-6">
                          {card.bullets.map((b, bIdx) => (
                            <li
                              key={bIdx}
                              {...subItemAttr(["cards", idx, "bullets", bIdx])}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{b.text}</span>
                            </li>
                          ))}
                        </ul>
                      )
                    )}
                  </div>

                  {(card.buttonLabel || card.contactEmail) && (
                    <div className="space-y-3">
                      {card.buttonLabel && (
                        <a
                          href={card.buttonUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                        >
                          <span>{card.buttonLabel}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {card.contactEmail && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {card.contactLabel || "Contact Secretariat"}
                          </span>
                          <a
                            href={`mailto:${card.contactEmail}`}
                            className="font-bold text-blue-600 hover:underline"
                          >
                            {card.contactEmail}
                          </a>
                        </div>
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
