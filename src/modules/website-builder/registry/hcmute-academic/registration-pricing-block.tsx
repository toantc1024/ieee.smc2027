"use client";

import React from "react";
import {
  CreditCard,
  Check,
  Star,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface PricingTierItem {
  id?: string;
  name: string;
  price: string;
  period?: string;
  badge?: string;
  isPopular?: boolean;
  description?: string;
  features: string;
  ctaText?: string;
  ctaLink?: string;
}

export interface RegistrationPricingBlockProps {
  sectionTitle?: string;
  sectionSubtitle?: string;
  noteText?: string;
  tiers?: PricingTierItem[];
}

export function RegistrationPricingBlock({
  sectionTitle = "",
  sectionSubtitle = "",
  noteText = "",
  tiers,
}: RegistrationPricingBlockProps) {
  const defaultTiers: PricingTierItem[] = [];

  const tierList = Array.isArray(tiers) ? tiers.filter(Boolean) : defaultTiers;

  return (
    <section className="w-full py-12 lg:py-16 bg-white dark:bg-zinc-900 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <CreditCard className="size-3.5" />
            <span>Conference registration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground dark:text-white tracking-tight">
            {sectionTitle}
          </h2>
          {sectionSubtitle && (
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              {sectionSubtitle}
            </p>
          )}
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tierList.map((tier, idx) => {
            const isPop = tier.isPopular;
            const featureList = tier.features
              ? tier.features
                  .split(";")
                  .map((f) => f.trim())
                  .filter(Boolean)
              : [];

            return (
              <div
                key={tier.id || idx}
                className={cn(
                  "relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl transition-all duration-300",
                  isPop
                    ? "bg-slate-900 text-white shadow-xl shadow-blue-900/20 ring-2 ring-blue-600 dark:bg-zinc-950 dark:ring-blue-500 scale-102"
                    : "bg-slate-50/80 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-800 hover:shadow-lg"
                )}
              >
                {/* Popular Floating Badge */}
                {isPop && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-blue-600 text-white text-[11px] font-black shadow-md flex items-center gap-1">
                    <Star className="size-3 fill-current" />
                    <span>{tier.badge || "Popular"}</span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Top info */}
                  <div className="space-y-2">
                    {!isPop && tier.badge && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {tier.badge}
                      </span>
                    )}
                    <h3 className="text-lg sm:text-xl font-black">{tier.name}</h3>
                    {tier.description && (
                      <p
                        className={cn(
                          "text-xs leading-relaxed",
                          isPop ? "text-slate-300" : "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {tier.description}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-slate-200/40 dark:border-zinc-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black tracking-tight">
                        {tier.price}
                      </span>
                    </div>
                    {tier.period && (
                      <p
                        className={cn(
                          "text-[11px] mt-0.5",
                          isPop ? "text-slate-400" : "text-slate-500 dark:text-slate-400"
                        )}
                      >
                        {tier.period}
                      </p>
                    )}
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-2.5 pt-2">
                    <p
                      className={cn(
                        "text-[11px] font-extrabold",
                        isPop ? "text-slate-300" : "text-slate-400"
                      )}
                    >
                      Includes:
                    </p>
                    <ul className="space-y-2">
                      {featureList.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2 text-xs leading-snug">
                          <Check
                            className={cn(
                              "size-4 shrink-0 mt-0.5",
                              isPop ? "text-blue-400" : "text-blue-600 dark:text-blue-400"
                            )}
                          />
                          <span className={isPop ? "text-slate-200" : "text-slate-700 dark:text-slate-300"}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* CTA Button */}
                {tier.ctaLink && <div className="pt-6">
                  <a
                    href={tier.ctaLink}
                    className={cn(
                      "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 cursor-pointer shadow-xs",
                      isPop
                        ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/40 hover:scale-[1.02]"
                        : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 hover:scale-[1.02]"
                    )}
                  >
                    <span>{tier.ctaText || "Register"}</span>
                    <ArrowRight className="size-3.5" />
                  </a>
                </div>}
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        {noteText && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 italic max-w-2xl mx-auto">
            {noteText}
          </p>
        )}
      </div>
    </section>
  );
}
