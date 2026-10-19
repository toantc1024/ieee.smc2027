"use client";

import React from "react";
import { Printer, FileText, Plane } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface DelegateBannerCardProps {
  regData: {
    registrationCode: string;
    fullName: string;
    affiliation: string;
    country: string;
    avatarUrl?: string | null;
    paymentStatus: string;
    participantType: string;
    needsVisaSupport?: boolean;
  };
  onPrintBadge: () => void;
  onDownloadReceipt: () => void;
  onDownloadVisa: () => void;
}

export function DelegateBannerCard({
  regData,
  onPrintBadge,
  onDownloadReceipt,
  onDownloadVisa,
}: DelegateBannerCardProps) {
  const isPaid = regData.paymentStatus === "PAID";

  return (
    <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        {regData.avatarUrl ? (
          <img
            src={regData.avatarUrl}
            alt={regData.fullName}
            className="size-16 rounded-2xl object-cover border border-slate-200 shrink-0"
          />
        ) : (
          <div className="size-16 rounded-2xl bg-blue-100 text-[#005496] flex items-center justify-center font-black text-2xl shrink-0">
            {regData.fullName.charAt(0)}
          </div>
        )}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900">
              {regData.fullName}
            </h2>
            <Badge variant={isPaid ? "success" : "warning"}>
              {regData.paymentStatus}
            </Badge>
            <Badge variant="ute">{regData.participantType}</Badge>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {regData.affiliation} · {regData.country} · Code:{" "}
            <strong className="text-[#005496]">{regData.registrationCode}</strong>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onPrintBadge}>
          <Printer className="size-4" />
          Print Badge
        </Button>

        <Button
          type="button"
          variant={isPaid ? "ute" : "secondary"}
          size="sm"
          disabled={!isPaid}
          onClick={onDownloadReceipt}
        >
          <FileText className="size-4" />
          Official Receipt
        </Button>

        {regData.needsVisaSupport && (
          <Button
            type="button"
            variant={isPaid ? "default" : "secondary"}
            size="sm"
            disabled={!isPaid}
            onClick={onDownloadVisa}
          >
            <Plane className="size-4" />
            Visa Support Letter
          </Button>
        )}
      </div>
    </Card>
  );
}
