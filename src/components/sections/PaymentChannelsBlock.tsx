"use client";

import React, { useState } from "react";
import { Building2, Check, Copy, CreditCard, ExternalLink, FileCheck2, Globe2 } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_BANK_INFO } from "@/lib/conference-registration";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

export interface PaymentChannelDetailItem {
  label: string;
  value: string;
  copyValue?: string;
}

export interface PaymentChannelTag {
  label: string;
}

export interface PaymentChannelItem {
  iconType: "bank" | "globe" | "card";
  badge: string;
  title: string;
  description: string;
  details: PaymentChannelDetailItem[];
  tags?: PaymentChannelTag[];
  footerLeft?: string;
  footerRight?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export const DEFAULT_PAYMENT_CHANNELS: PaymentChannelItem[] = [
  {
    iconType: "bank",
    badge: "Domestic Vietnam",
    title: "Domestic Bank Transfer",
    description:
      "For authors and delegates in Vietnam paying registration fees via VietQR or Napas 24/7 interbank transfer.",
    details: [
      { label: "Beneficiary Organization", value: CONFERENCE_BANK_INFO.accountName },
      { label: "Account Number", value: CONFERENCE_BANK_INFO.accountNo, copyValue: CONFERENCE_BANK_INFO.accountNo },
      { label: "Bank Name", value: CONFERENCE_BANK_INFO.bankName },
      { label: "Payment Reference", value: "SMC2027 PaperID Author Name", copyValue: "SMC2027 [PaperID] [Author Name]" },
    ],
    footerLeft: "VAT e-Invoice Available",
    footerRight: "Automated Reconciliation",
  },
  {
    iconType: "globe",
    badge: "International Authors",
    title: "International Wire Transfer",
    description:
      "Recommended for international overseas wire payments in USD. All bank remittance charges must be borne by the sender.",
    details: [
      { label: "Beneficiary Name", value: CONFERENCE_BANK_INFO.accountName },
      { label: "Beneficiary Bank", value: "Joint Stock Commercial Bank for Foreign Trade of Vietnam" },
      { label: "SWIFT Code", value: CONFERENCE_BANK_INFO.swiftBic, copyValue: CONFERENCE_BANK_INFO.swiftBic },
      { label: "Payment Reference", value: "IEEE SMC 2027 - Paper ID" },
    ],
    footerLeft: "Currency: USD",
    footerRight: "SWIFT Verified",
  },
  {
    iconType: "card",
    badge: "Online Portal",
    title: "Online Card Payment Portal",
    description:
      "Instant confirmation using international credit cards via the official payment gateway.",
    details: [
      { label: "Instant Receipt & Confirmation", value: "Upon completion, registration is confirmed and early-bird status is locked." },
    ],
    tags: [{ label: "VISA" }, { label: "MasterCard" }, { label: "JCB" }],
    ctaLabel: "Access Payment Portal",
    ctaUrl: "/registration",
  },
];

export interface PaymentChannelsBlockProps {
  title?: string;
  subtitle?: string;
  channels?: PaymentChannelItem[];
}

export function PaymentChannelsBlock({
  title = "Official Payment Channels",
  subtitle = "",
  channels = DEFAULT_PAYMENT_CHANNELS,
}: PaymentChannelsBlockProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const list = Array.isArray(channels) ? channels : [];

  const handleCopy = (key: string, value: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <SectionContainer id="payment-channels" fullWidthBg="bg-slate-50/50">
      <div className="px-4 sm:px-6 py-8 sm:py-10">
        {title && (
          <div className="mb-6">
            <h3 className="text-xl sm:text-2xl font-bold text-[#004776]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
            )}
          </div>
        )}

        {list.length === 0 ? (
          <div className="rounded-md border border-dashed border-blue-200 bg-white p-8 text-center text-sm text-slate-500">
            No payment channels configured.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {list.map((channel, idx) => {
              const Icon =
                channel.iconType === "globe"
                  ? Globe2
                  : channel.iconType === "card"
                    ? CreditCard
                    : Building2;

              return (
                <div
                  key={idx}
                  {...subItemAttr(["channels", idx])}
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
                          const copyId = `${idx}-${dIdx}`;
                          return (
                            <div
                              key={dIdx}
                              {...subItemAttr(["channels", idx, "details", dIdx])}
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

                  {channel.ctaLabel ? (
                    <div className="mt-6 pt-4 border-t border-blue-50">
                      <a
                        href={channel.ctaUrl || "/registration"}
                        className="w-full min-h-[46px] py-2.5 px-4 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-sm sm:text-[15px] rounded-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                      >
                        <span>{channel.ctaLabel}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  ) : (channel.footerLeft || channel.footerRight) ? (
                    <div className="mt-4 pt-3 border-t border-blue-50 flex items-center justify-between text-xs sm:text-sm text-slate-500">
                      <span>{channel.footerLeft}</span>
                      <span className="text-[#115eff] font-semibold">{channel.footerRight}</span>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionContainer>
  );
}
