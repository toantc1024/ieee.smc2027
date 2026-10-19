"use client";

import React from "react";
import { QrCode, CreditCard, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface RegistrationFeeSummaryCardProps {
  categoryLabel: string;
  baseFeeFormatted: string;
  extraPagesCount: number;
  extraPageTotalFormatted: string | null;
  extraBanquetTickets: number;
  extraBanquetTotalFormatted: string | null;
  computedTotalFormatted: string;
  paymentMethod: "PAYOO_VIETQR" | "PAYOO_CARD";
  loading: boolean;
  onChangePaymentMethod: (method: "PAYOO_VIETQR" | "PAYOO_CARD") => void;
  onBack: () => void;
}

export function RegistrationFeeSummaryCard({
  categoryLabel,
  baseFeeFormatted,
  extraPagesCount,
  extraPageTotalFormatted,
  extraBanquetTickets,
  extraBanquetTotalFormatted,
  computedTotalFormatted,
  paymentMethod,
  loading,
  onChangePaymentMethod,
  onBack,
}: RegistrationFeeSummaryCardProps) {
  return (
    <Card className="sticky top-24">
      <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
        Registration Fee Summary
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Category</span>
          <span className="font-bold text-slate-900">{categoryLabel}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Base Registration</span>
          <span className="font-semibold text-slate-800">{baseFeeFormatted}</span>
        </div>
        {extraPageTotalFormatted && (
          <div className="flex justify-between">
            <span className="text-slate-500">Extra Pages × {extraPagesCount}</span>
            <span className="font-semibold text-slate-800">
              {extraPageTotalFormatted}
            </span>
          </div>
        )}
        {extraBanquetTotalFormatted && (
          <div className="flex justify-between">
            <span className="text-slate-500">
              Extra Banquet × {extraBanquetTickets}
            </span>
            <span className="font-semibold text-slate-800">
              {extraBanquetTotalFormatted}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
          <span className="font-bold text-slate-900">Total Payable</span>
          <span className="text-xl font-black text-[#005496]">
            {computedTotalFormatted}
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        <Label>Select Payoo Payment Channel</Label>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => onChangePaymentMethod("PAYOO_VIETQR")}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              paymentMethod === "PAYOO_VIETQR"
                ? "border-[#005496] bg-blue-50/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <QrCode className="size-5 text-[#005496] shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">
                Payoo Dynamic VietQR
              </p>
              <p className="text-[11px] text-slate-500">
                Instant NAPAS 24/7 bank transfer
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChangePaymentMethod("PAYOO_CARD")}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
              paymentMethod === "PAYOO_CARD"
                ? "border-[#005496] bg-blue-50/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <CreditCard className="size-5 text-[#005496] shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-900">
                Payoo International Card
              </p>
              <p className="text-[11px] text-slate-500">
                Visa, Mastercard, JCB, UnionPay
              </p>
            </div>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 pt-2">
        <Button
          type="submit"
          variant="ute"
          size="lg"
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Submitting Registration...
            </>
          ) : (
            <>
              Proceed to Payoo Checkout
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="w-full"
        >
          <ArrowLeft className="size-4" />
          Back to Categories
        </Button>
      </div>
    </Card>
  );
}
