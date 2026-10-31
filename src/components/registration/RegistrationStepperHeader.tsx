"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Badge } from "@/components/ui/badge";

export type RegistrationStep = "TIER" | "INFO" | "PAYMENT";

interface RegistrationStepperHeaderProps {
  currentStep: RegistrationStep;
}

export function RegistrationStepperHeader({
  currentStep,
}: RegistrationStepperHeaderProps) {
  return (
    <div className="bg-white border-b border-slate-200">
      <SectionContainer id="reg-header" fullWidthBg="bg-white" className="py-10 sm:py-12">
        <div className="max-w-4xl space-y-3">
          <Badge variant="ute" className="px-3 py-1">
            <ShieldCheck className="size-3.5" />
            Official Delegate Registration
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Conference Registration <span className="text-[#115eff]">IEEE SMC 2027</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Ho Chi Minh City, Vietnam · October 6–10, 2027. Complete your registration to receive your delegate code, Payoo checkout, and Visa Support Letter.
          </p>

          <div className="pt-4 grid grid-cols-3 gap-3 max-w-2xl text-xs sm:text-sm font-bold">
            <div
              className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                currentStep === "TIER"
                  ? "bg-blue-50/80 border-[#115eff] text-[#115eff]"
                  : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              <span className="size-6 rounded-full flex items-center justify-center bg-current text-white text-xs">
                1
              </span>
              <span className="truncate">Category & Fee</span>
            </div>

            <div
              className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                currentStep === "INFO"
                  ? "bg-blue-50/80 border-[#115eff] text-[#115eff]"
                  : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              <span className="size-6 rounded-full flex items-center justify-center bg-current text-white text-xs">
                2
              </span>
              <span className="truncate">Delegate Profile</span>
            </div>

            <div
              className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                currentStep === "PAYMENT"
                  ? "bg-emerald-50 border-emerald-600 text-emerald-700"
                  : "bg-white border-slate-200 text-slate-500"
              }`}
            >
              <span className="size-6 rounded-full flex items-center justify-center bg-current text-white text-xs">
                3
              </span>
              <span className="truncate">Payoo Checkout</span>
            </div>
          </div>
        </div>
      </SectionContainer>
    </div>
  );
}
