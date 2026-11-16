"use client";

import React from "react";
import { Receipt } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { CONFERENCE_INFO } from "@/data/conference";

export interface VatInvoiceNoticeBlockProps {
  title?: string;
  description?: string;
  email?: string;
  buttonLabel?: string;
  emailSubject?: string;
}

export function VatInvoiceNoticeBlock({
  title = "Official VAT e-Invoice Request",
  description = "Delegates and institutions requiring an official financial e-invoice issued by Ho Chi Minh City University of Technology and Engineering, please submit your organization tax ID, legal address, and payment confirmation to the Finance Secretariat:",
  email = CONFERENCE_INFO.contactEmail,
  buttonLabel = "Request VAT Invoice",
  emailSubject = "IEEE SMC 2027 VAT Invoice Request",
}: VatInvoiceNoticeBlockProps) {
  return (
    <SectionContainer id="vat-invoice" fullWidthBg="bg-slate-50/50">
      <div className="px-4 sm:px-6 pb-12 pt-4">
        <div className="p-5 sm:p-7 bg-white border border-blue-100/90 rounded-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-2.5 rounded-sm bg-blue-50 text-[#115eff] border border-blue-100 shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-[#004776]">
                {title}
              </h4>
              <p className="text-sm sm:text-base text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {description}{" "}
                {email && (
                  <strong className="text-[#115eff] font-semibold">{email}</strong>
                )}
              </p>
            </div>
          </div>

          {buttonLabel && (
            <a
              href={`mailto:${email || CONFERENCE_INFO.contactEmail}?subject=${encodeURIComponent(
                emailSubject || "IEEE SMC 2027 VAT Invoice Request"
              )}`}
              className="shrink-0 min-h-[46px] px-6 py-2.5 bg-white hover:bg-slate-50 text-[#115eff] font-bold text-sm sm:text-base rounded-[0.26rem] border border-[#115eff] transition-colors whitespace-nowrap flex items-center justify-center"
            >
              {buttonLabel}
            </a>
          )}
        </div>
      </div>
    </SectionContainer>
  );
}
