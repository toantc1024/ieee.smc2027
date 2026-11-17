"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Building2,
  Globe2,
  Copy,
  Check,
  Receipt,
  FileCheck2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";
import {
  DEFAULT_PAYMENT_CHANNELS,
  type PaymentChannelItem,
} from "@/components/sections/PaymentChannelsBlock";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface PaymentMethodsProps {
  rates?: typeof REGISTRATION_RATES;
  title?: string;
  subtitle?: string;
  scheduleHeading?: string;
  earlyBirdNote?: string;
  includedBadge?: string;
  showFeeTable?: boolean;
  showPaymentChannels?: boolean;
  channelsHeading?: string;
  paymentChannels?: PaymentChannelItem[];
  showVatInvoice?: boolean;
  vatInvoice?: {
    title?: string;
    description?: string;
    email?: string;
    buttonLabel?: string;
    emailSubject?: string;
  };
}

export const REGISTRATION_RATES = [
  {
    category: "IEEE Member Author",
    earlyBird: "$650 USD",
    standard: "$750 USD",
    late: "$850 USD",
    note: "Includes 1 paper upload up to 6 pages, conference kit, banquet & all sessions",
    popular: true,
  },
  {
    category: "Non-IEEE Member Author",
    earlyBird: "$780 USD",
    standard: "$890 USD",
    late: "$990 USD",
    note: "Includes 1 paper upload up to 6 pages, conference kit, banquet & all sessions",
    popular: false,
  },
  {
    category: "IEEE Student Member",
    earlyBird: "$350 USD",
    standard: "$420 USD",
    late: "$490 USD",
    note: "Requires valid student ID verification; covers 1 student paper or attendee pass",
    popular: false,
  },
  {
    category: "Non-Member Student",
    earlyBird: "$420 USD",
    standard: "$490 USD",
    late: "$560 USD",
    note: "Valid student proof required; covers technical access & kit",
    popular: false,
  },
  {
    category: "Attendee / Industry Participant",
    earlyBird: "$450 USD",
    standard: "$520 USD",
    late: "$600 USD",
    note: "Access to all technical keynotes, workshops, and exhibition zones",
    popular: false,
  },
];

export function PaymentMethods({
  rates = REGISTRATION_RATES,
  title = "Registration & Payment Methods",
  subtitle = "Official registration fees and payment instructions for IEEE SMC 2027 participants and authors",
  scheduleHeading = "Registration Fee Schedule",
  earlyBirdNote = "All prices in USD. Early bird registration deadline: July 05, 2027",
  includedBadge = "IEEE Scopus & Xplore Proceedings Included",
  showFeeTable = true,
  showPaymentChannels = true,
  channelsHeading = "Official Payment Channels",
  paymentChannels = DEFAULT_PAYMENT_CHANNELS,
  showVatInvoice = true,
  vatInvoice,
}: PaymentMethodsProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const safeRates = Array.isArray(rates) ? rates : [];
  const safeChannels = Array.isArray(paymentChannels) ? paymentChannels : [];

  const handleCopy = (key: string, value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const vatTitle = vatInvoice?.title || "Official VAT e-Invoice Request";
  const vatDesc =
    vatInvoice?.description ||
    "Delegates and institutions requiring an official financial e-invoice issued by Ho Chi Minh City University of Technology and Engineering, please submit your organization tax ID, legal address, and payment confirmation to the Finance Secretariat:";
  const vatEmail = vatInvoice?.email || CONFERENCE_INFO.contactEmail;
  const vatBtnLabel = vatInvoice?.buttonLabel || "Request VAT Invoice";
  const vatSubject = vatInvoice?.emailSubject || "IEEE SMC 2027 VAT Invoice Request";

  return (
    <SectionContainer id="registration" fullWidthBg="bg-slate-50/50">
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

          <p className="text-sm sm:text-base lg:text-[17px] text-[#004776]/80 font-medium max-w-3xl leading-relaxed">
            {subtitle}
          </p>
        </div>
      </div>

      {showFeeTable && (
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

            {safeRates.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No registration fee categories added yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm sm:text-base text-slate-700">
                  <thead className="bg-blue-50/50 text-xs sm:text-sm font-bold text-[#004776] border-b border-blue-100/90">
                    <tr>
                      <th className="py-4 px-4 sm:px-6">Registration Category</th>
                      <th className="py-4 px-4">Early Bird</th>
                      <th className="py-4 px-4">Standard</th>
                      <th className="py-4 px-4">Late / On-Site</th>
                      <th className="py-4 px-4 sm:px-6">Entitlements</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-100/70">
                    {safeRates.map((rate, idx) => (
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
                        <td className="py-4 px-4 text-slate-500 text-sm sm:text-base">{rate.late}</td>
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
      )}

      {showPaymentChannels && safeChannels.length > 0 && (
        <div className="px-4 sm:px-6 py-6 sm:py-8">
          <h3 className="text-xl sm:text-2xl font-bold text-[#004776] mb-6">
            {channelsHeading}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {safeChannels.map((channel, idx) => {
              const Icon =
                channel.iconType === "globe"
                  ? Globe2
                  : channel.iconType === "card"
                    ? CreditCard
                    : Building2;

              return (
                <div
                  key={idx}
                  {...subItemAttr(["paymentChannels", idx])}
                  className="p-6 sm:p-7 bg-white border border-blue-100/90 hover:border-[#115eff] rounded-sm shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-12 h-12 rounded-sm bg-blue-50 text-[#115eff] border border-blue-100 flex items-center justify-center mb-4 group-hover:bg-[#115eff] group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>

                    {channel.badge && (
                      <div className="text-xs sm:text-sm font-bold text-slate-500 mb-1.5">
                        {channel.badge}
                      </div>
                    )}
                    <h4 className="text-lg sm:text-xl font-bold text-[#004776] mb-2 leading-snug">
                      {channel.title}
                    </h4>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {channel.description}
                    </p>

                    {Array.isArray(channel.details) && channel.details.length > 0 && (
                      <div className="space-y-2.5 text-sm bg-blue-50/40 border border-blue-100/90 rounded-sm p-3.5">
                        {channel.details.map((detail, dIdx) => {
                          const copyId = `pm-${idx}-${dIdx}`;
                          return (
                            <div
                              key={dIdx}
                              {...subItemAttr(["paymentChannels", idx, "details", dIdx])}
                              className={dIdx > 0 ? "pt-1.5 border-t border-blue-100/70" : ""}
                            >
                              <span className="text-slate-500 block text-xs">
                                {detail.label}
                              </span>
                              <div className="flex items-center justify-between gap-2 mt-0.5">
                                <span className="font-bold text-slate-900 break-words">
                                  {channel.iconType === "card" && dIdx === 0 && (
                                    <FileCheck2 className="w-4 h-4 text-[#115eff] inline mr-1.5" />
                                  )}
                                  {detail.value}
                                </span>
                                {detail.copyValue && (
                                  <button
                                    type="button"
                                    onClick={() => handleCopy(copyId, detail.copyValue || detail.value)}
                                    className="text-slate-500 hover:text-slate-900 cursor-pointer p-1 shrink-0"
                                    title={`Copy ${detail.label}`}
                                  >
                                    {copiedKey === copyId ? (
                                      <Check className="w-4 h-4 text-emerald-600" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {Array.isArray(channel.tags) && channel.tags.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {channel.tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2.5 py-0.5 bg-white border border-blue-100/90 rounded-sm text-xs font-bold text-[#004776]"
                              >
                                {tag.label}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {(channel.ctaLabel || channel.footerLeft || channel.footerRight) && (
                    <div className="space-y-3">
                      {channel.ctaLabel && (
                        <div className="mt-6 pt-4 border-t border-blue-50">
                          <a
                            href={channel.ctaUrl || "/registration"}
                            className="w-full min-h-[46px] py-2.5 px-4 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-[15px] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                          >
                            <span>{channel.ctaLabel}</span>
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                      {(channel.footerLeft || channel.footerRight) && (
                        <div className="mt-4 pt-3 border-t border-blue-50 flex items-center justify-between text-xs sm:text-sm text-slate-500">
                          <span>{channel.footerLeft}</span>
                          <span className="text-[#115eff] font-semibold">{channel.footerRight}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showVatInvoice && (
        <div className="px-4 sm:px-6 pb-12">
          <div className="p-5 sm:p-7 bg-white border border-blue-100/90 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-sm bg-blue-50 text-[#115eff] border border-blue-100 shrink-0">
                <Receipt className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-[#004776]">
                  {vatTitle}
                </h4>
                <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
                  {vatDesc}{" "}
                  <strong className="text-[#115eff] font-semibold">{vatEmail}</strong>.
                </p>
              </div>
            </div>

            {vatBtnLabel && (
              <a
                href={`mailto:${vatEmail}?subject=${encodeURIComponent(vatSubject)}`}
                className="shrink-0 min-h-[46px] px-6 py-2.5 bg-white hover:bg-slate-50 text-[#115eff] font-bold text-sm sm:text-base rounded-[0.26rem] border border-[#115eff] transition-colors whitespace-nowrap flex items-center justify-center"
              >
                {vatBtnLabel}
              </a>
            )}
          </div>
        </div>
      )}
    </SectionContainer>
  );
}

export default PaymentMethods;
