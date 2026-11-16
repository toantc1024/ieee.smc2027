"use client";

import React from "react";
import { CheckCircle2, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  REGISTRATION_FEES,
  FeeTier,
  formatVND,
  formatUSD,
} from "@/lib/conference-registration";
import { subItemAttr } from "@/modules/website-builder/utils/sub-item-path";

interface CategorySelectionStepProps {
  selectedTier: FeeTier["id"];
  currency: "VND" | "USD";
  tiers?: FeeTier[];
  heading?: string;
  subheading?: string;
  continueLabel?: string;
  onSelectTier: (tier: FeeTier["id"]) => void;
  onChangeCurrency: (currency: "VND" | "USD") => void;
  onNext: () => void;
}

export function CategorySelectionStep({
  selectedTier,
  currency,
  tiers,
  heading = "1. Select Delegate Category",
  subheading = "Registration fees cover technical sessions, proceedings, delegate kit, and gala banquet.",
  continueLabel = "Continue to Delegate Details",
  onSelectTier,
  onChangeCurrency,
  onNext,
}: CategorySelectionStepProps) {
  const tierList =
    Array.isArray(tiers) && tiers.length > 0
      ? tiers
      : (Object.values(REGISTRATION_FEES) as FeeTier[]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {heading}
          </h2>
          {subheading && <p className="text-sm text-slate-500">{subheading}</p>}
        </div>

        <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => onChangeCurrency("VND")}
            className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              currency === "VND"
                ? "bg-[#115eff] text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            VND
          </button>
          <button
            type="button"
            onClick={() => onChangeCurrency("USD")}
            className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
              currency === "USD"
                ? "bg-[#115eff] text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            USD
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {tierList.map((tier, idx) => {
          const isSelected = selectedTier === tier.id;

          return (
            <div
              key={tier.id || idx}
              {...subItemAttr(["tiers", idx])}
              onClick={() => onSelectTier(tier.id)}
              className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? "border-[#115eff] bg-white shadow-lg ring-4 ring-[#115eff]/10"
                  : "border-slate-200 bg-white/90 hover:border-slate-300"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <Badge variant={isSelected ? "ute" : "secondary"}>
                    {tier.badge}
                  </Badge>
                  {isSelected && <CheckCircle2 className="size-5 text-[#115eff]" />}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 mb-1">
                  {tier.label}
                </h3>
                <p className="text-xs text-slate-500 mb-5">{tier.description}</p>
              </div>

              <div>
                <div className="pt-4 border-t border-slate-100 mb-4">
                  <div className="text-2xl font-black text-slate-900">
                    {currency === "VND"
                      ? formatVND(Number(tier.vnd) || 0)
                      : formatUSD(Number(tier.usd) || 0)}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    Equivalent to{" "}
                    {currency === "VND"
                      ? formatUSD(Number(tier.usd) || 0)
                      : formatVND(Number(tier.vnd) || 0)}
                  </div>
                </div>

                <ul className="space-y-2 text-xs text-slate-600">
                  {(tier.features || []).map((perk: string, i: number) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{perk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" variant="ute" size="lg" onClick={onNext}>
          {continueLabel}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
