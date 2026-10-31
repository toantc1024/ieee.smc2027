"use client";

import React from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  formatVND,
  formatUSD,
  getVietQrUrl,
} from "@/lib/conference-registration";
import type { UnstructuredRegistrationFormData } from "@/types";

interface PortalPayooStatusCardProps {
  regData: {
    registrationCode: string;
    feeAmount: number;
    currency: string;
    paymentStatus: string;
    transactionRef?: string | null;
  };
  visaStatus: string;
  formData: UnstructuredRegistrationFormData;
  simulatingPayoo: boolean;
  onSimulatePayoo: () => void;
  onDownloadReceipt: () => void;
}

export function PortalPayooStatusCard({
  regData,
  visaStatus,
  formData,
  simulatingPayoo,
  onSimulatePayoo,
  onDownloadReceipt,
}: PortalPayooStatusCardProps) {
  const isPaid = regData.paymentStatus === "PAID";

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Payoo Payment & Milestone Status
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-bold uppercase block">
              Registration Fee
            </span>
            <span className="text-base font-black text-slate-900 mt-1 block">
              {regData.currency === "VND"
                ? formatVND(regData.feeAmount)
                : formatUSD(regData.feeAmount)}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-bold uppercase block">
              Payment Status
            </span>
            <span className="text-base font-black text-slate-900 mt-1 block">
              {regData.paymentStatus}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-bold uppercase block">
              Visa Letter Status
            </span>
            <span className="text-base font-black text-[#115eff] mt-1 block">
              {visaStatus}
            </span>
          </div>
        </div>

        {!isPaid ? (
          <div className="space-y-4 pt-2">
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={getVietQrUrl(regData.registrationCode, regData.feeAmount)}
                alt="Payoo VietQR"
                className="w-40 h-40 object-contain rounded-xl bg-white p-2 border border-slate-200"
              />
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 text-sm">
                  Complete Payment via Payoo Gateway
                </p>
                <p className="text-slate-600">
                  Scan the dynamic VietQR code or use the temporary Payoo sandbox button below to test instant reconciliation and unlock your Official Receipt and Visa Support Letter.
                </p>
                <Button
                  type="button"
                  variant="ute"
                  disabled={simulatingPayoo}
                  onClick={onSimulatePayoo}
                >
                  {simulatingPayoo ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CreditCard className="size-4" />
                  )}
                  Complete Temporary Payoo Payment Now
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
            <div className="text-xs text-emerald-900">
              <p className="font-bold text-sm">
                Payment Verified — Ref: {regData.transactionRef || "PAYOO"}
              </p>
              <p className="mt-0.5">
                Your Official Payment Receipt and Visa Support Letter are ready for download.
              </p>
            </div>
            <Button
              type="button"
              variant="ute"
              size="sm"
              onClick={onDownloadReceipt}
            >
              Download Receipt
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Delegate Unstructured JSON Profile Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-slate-400 font-bold uppercase block">
              PaperCept ID
            </span>
            <span className="font-semibold text-slate-800">
              {formData.paperId || "None"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-slate-400 font-bold uppercase block">
              Dietary Preference
            </span>
            <span className="font-semibold text-slate-800">
              {formData.dietaryRequirement || "Normal"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-slate-400 font-bold uppercase block">
              Passport Number
            </span>
            <span className="font-semibold text-slate-800">
              {formData.passportNumber || "Not provided"}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50">
            <span className="text-slate-400 font-bold uppercase block">
              Flight / Hotel
            </span>
            <span className="font-semibold text-slate-800">
              {formData.arrivalFlight || "TBD"} · {formData.hotelName || "TBD"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
