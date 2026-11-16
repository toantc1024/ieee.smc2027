"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { REGISTRATION_RATES } from "@/components/sections/PaymentMethods";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface RegistrationRateRow {
  category: string;
  earlyBird: string;
  standard: string;
  late: string;
  note: string;
  popular?: boolean;
}

export interface RegistrationFeeTableBlockProps {
  title?: string;
  subtitle?: string;
  scheduleHeading?: string;
  earlyBirdNote?: string;
  includedBadge?: string;
  colCategory?: string;
  colEarlyBird?: string;
  colStandard?: string;
  colLate?: string;
  colEntitlements?: string;
  rates?: RegistrationRateRow[];
}

export function RegistrationFeeTableBlock({
  title = "Registration & Fee Schedule",
  subtitle = "Official registration fee schedule and entitlements for IEEE SMC 2027 participants and authors",
  scheduleHeading = "Registration Fee Schedule",
  earlyBirdNote = "All prices in USD. Early bird registration deadline: July 05, 2027",
  includedBadge = "IEEE Scopus & Xplore Proceedings Included",
  colCategory = "Registration Category",
  colEarlyBird = "Early Bird",
  colStandard = "Standard",
  colLate = "Late / On-Site",
  colEntitlements = "Entitlements",
  rates = REGISTRATION_RATES,
}: RegistrationFeeTableBlockProps) {
  const rows = Array.isArray(rates) ? rates : [];

  return (
    <SectionContainer id="registration-fees" fullWidthBg="bg-slate-50/50">
      <div className="relative overflow-hidden px-4 sm:px-6 pt-10 sm:pt-14 pb-6 w-full">
        <div className="corner-dot-tr opacity-70 pointer-events-none" />
        <div className="space-y-3 w-full relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-[1.2]">
            {title.includes("&") ? (
              <>
                <span className="block text-[#004776]">{title.split("&")[0].trim()} &amp;</span>
                <span className="block text-[#115eff]">{title.split("&").slice(1).join("&").trim()}</span>
              </>
            ) : (
              <span className="block text-[#004776]">{title}</span>
            )}
          </h2>
          {subtitle && (
            <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white border border-blue-100/90 rounded-sm overflow-hidden shadow-xs">
          <div className="p-5 sm:p-6 border-b border-blue-100/85 bg-blue-50/35 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-[#004776]">
                {scheduleHeading}
              </h3>
              {earlyBirdNote && (
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {earlyBirdNote}
                </p>
              )}
            </div>
            {includedBadge && (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-sm border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{includedBadge}</span>
              </div>
            )}
          </div>

          {rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No registration fee categories added yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm sm:text-base text-slate-700">
                <thead className="bg-blue-50/50 text-xs sm:text-sm font-bold text-[#004776] border-b border-blue-100/90">
                  <tr>
                    <th className="py-4 px-4 sm:px-6">{colCategory}</th>
                    <th className="py-4 px-4">{colEarlyBird}</th>
                    <th className="py-4 px-4">{colStandard}</th>
                    <th className="py-4 px-4">{colLate}</th>
                    <th className="py-4 px-4 sm:px-6">{colEntitlements}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-100/70">
                  {rows.map((rate, idx) => (
                    <tr
                      key={idx}
                      {...subItemAttr(["rates", idx])}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        rate.popular ? "bg-blue-50/20" : ""
                      }`}
                    >
                      <td className="py-4 px-4 sm:px-6 font-bold text-slate-900 flex items-center gap-2 text-sm sm:text-base">
                        <span>{rate.category}</span>
                        {rate.popular && (
                          <span className="px-2 py-0.5 rounded-sm text-xs font-extrabold bg-[#115eff] text-white">
                            Main
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#115eff] text-sm sm:text-base">
                        {rate.earlyBird}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-900 text-sm sm:text-base">
                        {rate.standard}
                      </td>
                      <td className="py-4 px-4 text-slate-500 text-sm sm:text-base">
                        {rate.late}
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-xs sm:text-sm text-slate-600 max-w-xs leading-relaxed">
                        {rate.note}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
