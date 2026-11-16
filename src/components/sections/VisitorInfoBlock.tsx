"use client";

import React from "react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface VisitorInfoItem {
  title: string;
  description: string;
  linkLabel?: string;
  linkUrl?: string;
}

export const DEFAULT_VISITOR_INFO_ITEMS: VisitorInfoItem[] = [
  {
    title: "Weather in October",
    description:
      "Warm tropical climate with average temperatures of 26°C – 32°C. Light rain gear is recommended for occasional afternoon showers.",
  },
  {
    title: "Currency & Payment",
    description:
      "Vietnamese Dong. VietQR and card payments are accepted across hotels, malls, and restaurants.",
  },
  {
    title: "Ride-Hailing & Taxis",
    description:
      "Grab is widely used for cars and bikes. Recommended metered taxi operators include Vinasun Taxi and Mai Linh Taxi.",
  },
  {
    title: "Secretariat Assistance",
    description: "Have questions regarding invitations or lodging? Contact the host secretariat.",
    linkLabel: CONFERENCE_INFO.contactEmail,
    linkUrl: `mailto:${CONFERENCE_INFO.contactEmail}`,
  },
];

export interface VisitorInfoBlockProps {
  title?: string;
  subtitle?: string;
  items?: VisitorInfoItem[];
}

export function VisitorInfoBlock({
  title = "Practical Visitor Information",
  subtitle = "",
  items = DEFAULT_VISITOR_INFO_ITEMS,
}: VisitorInfoBlockProps) {
  const list = Array.isArray(items) ? items : [];

  return (
    <SectionContainer id="visitor-info" fullWidthBg="bg-white">
      <div className="px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white border border-blue-100/90 rounded-sm p-6 sm:p-8 shadow-2xs">
          <div className="mb-5">
            <h3 className="text-lg sm:text-xl font-bold text-[#004776]">{title}</h3>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
            )}
          </div>

          {list.length === 0 ? (
            <div className="rounded-md border border-dashed border-blue-200 bg-blue-50/30 p-6 text-center text-sm text-slate-500">
              No visitor tips added yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm text-slate-700">
              {list.map((item, idx) => (
                <div
                  key={idx}
                  {...subItemAttr(["items", idx])}
                  className="bg-blue-50/35 p-4 rounded-sm border border-blue-100/90 flex flex-col justify-between gap-2"
                >
                  <div>
                    <strong className="block text-[#004776] mb-1.5 font-bold">
                      {item.title}
                    </strong>
                    <p className="leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                  {item.linkLabel && (
                    <a
                      href={item.linkUrl || "#"}
                      className="text-[#115eff] font-semibold hover:underline break-all"
                    >
                      {item.linkLabel}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}

