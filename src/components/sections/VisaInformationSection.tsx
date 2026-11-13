"use client";

import React from "react";
import { Plane, FileText, CheckCircle, ExternalLink, Mail, ShieldAlert } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";

interface VisaInformationProps {
  title?: string;
  subtitle?: string;
  evisaUrl?: string;
  visaLetterEmail?: string;
}

export function VisaInformationSection({
  title = "Vietnam Visa & Entry Requirements",
  subtitle = "Complete travel and entry guidance for international delegates attending IEEE SMC 2027 in Ho Chi Minh City",
  evisaUrl = "https://evisa.xuatnhapcanh.gov.vn",
  visaLetterEmail = "smc2027@hcmute.edu.vn",
}: VisaInformationProps) {
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 90-day e-Visa Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">90-Day Electronic Visa (e-Visa)</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Citizens of all countries and territories are eligible to apply for a 90-day electronic visa (single or multiple entry) through the official Vietnam Immigration Department portal.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Processing Time: Typically 3 to 5 business days</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Passport Validity: Must have at least 6 months validity</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Entry Ports: Valid for entry via Tan Son Nhat Airport (SGN)</span>
                </li>
              </ul>
            </div>
            <a
              href={evisaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              <span>Vietnam Immigration e-Visa Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Visa Invitation Letter Box */}
          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Official Visa Support Letters</h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Registered authors and participants requiring an official IEEE SMC 2027 Visa Invitation Letter for consulate processing may request one after completing registration.
              </p>
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-600 space-y-2 mb-6">
                <p className="font-semibold text-slate-900">Required Details for Visa Letters:</p>
                <p>1. Full legal name as printed in passport</p>
                <p>2. Passport number, nationality, date of birth</p>
                <p>3. Accepted paper ID & title (for authors)</p>
                <p>4. Conference registration confirmation code</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Contact Secretariat</span>
              <a href={`mailto:${visaLetterEmail}`} className="font-bold text-blue-600 hover:underline">
                {visaLetterEmail}
              </a>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
