"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Copy, Check, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  CONFERENCE_BANK_INFO,
  formatVND,
  formatUSD,
} from "@/lib/conference-registration";

interface PayooCheckoutStepProps {
  registeredData: {
    registration: {
      registrationCode: string;
      fullName: string;
      email: string;
      affiliation: string;
      country: string;
      feeAmount: number;
      currency: string;
      paymentStatus: string;
      transactionRef?: string | null;
    };
    payment: {
      vietQrUrl: string;
      transferSyntax: string;
    };
    badgeQrUrl?: string;
  };
  simulatingPayoo: boolean;
  onSimulatePayoo: () => void;
}

export function PayooCheckoutStep({
  registeredData,
  simulatingPayoo,
  onSimulatePayoo,
}: PayooCheckoutStepProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const { registration, payment, badgeQrUrl } = registeredData;
  const isPaid = registration.paymentStatus === "PAID";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-7 space-y-6">
        <Card>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <Badge variant={isPaid ? "success" : "warning"}>
                {isPaid ? "PAYMENT CONFIRMED" : "AWAITING PAYOO PAYMENT"}
              </Badge>
              <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                Payoo Payment Gateway — {registration.registrationCode}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-bold uppercase">
                Amount Due
              </p>
              <p className="text-xl font-black text-[#005496]">
                {registration.currency === "VND"
                  ? formatVND(registration.feeAmount)
                  : formatUSD(registration.feeAmount)}
              </p>
            </div>
          </div>

          {isPaid ? (
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
              <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
              <h3 className="text-lg font-extrabold text-emerald-950">
                Payoo Payment Completed & Verified
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Transaction Reference: <strong>{registration.transactionRef}</strong>. A confirmation email with your receipt link has been dispatched to{" "}
                <strong>{registration.email}</strong>.
              </p>
              <div className="pt-2">
                <Link
                  href={`/portal?code=${encodeURIComponent(
                    registration.registrationCode
                  )}`}
                >
                  <Button variant="ute">
                    Open Delegate Portal & Download Receipt
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="flex flex-col items-center p-4 rounded-2xl border border-slate-200 bg-slate-50">
                  <img
                    src={payment.vietQrUrl}
                    alt="Payoo VietQR"
                    className="w-52 h-52 object-contain rounded-xl bg-white p-2 border border-slate-200"
                  />
                  <span className="text-[11px] font-bold text-slate-500 mt-2">
                    Scan with any banking app or Payoo QR
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 block font-bold uppercase text-[10px]">
                      Beneficiary Bank
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {CONFERENCE_BANK_INFO.bankName}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block font-bold uppercase text-[10px]">
                        Account Number
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {CONFERENCE_BANK_INFO.accountNo}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopy("acc", CONFERENCE_BANK_INFO.accountNo)
                      }
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 cursor-pointer"
                    >
                      {copiedKey === "acc" ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-[#005496] block font-bold uppercase text-[10px]">
                        Required Transfer Memo
                      </span>
                      <span className="font-mono font-extrabold text-[#005496] text-sm">
                        {payment.transferSyntax}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy("memo", payment.transferSyntax)}
                      className="p-1.5 rounded-lg bg-white border border-blue-200 text-[#005496] cursor-pointer"
                    >
                      {copiedKey === "memo" ? (
                        <Check className="size-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                    Temporary Payoo Sandbox Reconciliation
                  </p>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Simulate instant Payoo webhook confirmation to mark this registration as PAID and dispatch the milestone receipt email.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ute"
                  disabled={simulatingPayoo}
                  onClick={onSimulatePayoo}
                >
                  {simulatingPayoo ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  Complete Temporary Payoo Payment
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <Card className="text-center items-center">
          <Badge variant="ute">Digital Conference Badge</Badge>
          <h3 className="text-lg font-extrabold text-slate-900">
            {registration.fullName}
          </h3>
          <p className="text-xs text-slate-500 -mt-3">
            {registration.affiliation} · {registration.country}
          </p>

          {badgeQrUrl && (
            <img
              src={badgeQrUrl}
              alt="Badge QR"
              className="w-44 h-44 mx-auto rounded-2xl border border-slate-200 p-2 bg-white"
            />
          )}

          <div className="font-mono text-base font-black text-[#005496] bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-200">
            {registration.registrationCode}
          </div>

          <Link
            href={`/portal?code=${encodeURIComponent(
              registration.registrationCode
            )}`}
            className="w-full"
          >
            <Button variant="outline" className="w-full">
              Go to Delegate Profile Portal
              <ArrowRight className="size-4" />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
