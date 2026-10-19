"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { REGISTRATION_FEES } from "@/lib/conference-registration";

interface DigitalBadgePassCardProps {
  regData: {
    registrationCode: string;
    fullName: string;
    affiliation: string;
    avatarUrl?: string | null;
    participantType: string;
  };
  qrBadgeDataUrl?: string;
}

export function DigitalBadgePassCard({
  regData,
  qrBadgeDataUrl,
}: DigitalBadgePassCardProps) {
  const tierLabel =
    REGISTRATION_FEES[regData.participantType as keyof typeof REGISTRATION_FEES]
      ?.label || regData.participantType;

  return (
    <Card className="items-center text-center">
      <div className="w-full bg-[#005496] text-white rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
          IEEE SMC 2027 · Ho Chi Minh City
        </p>
        <h3 className="text-lg font-extrabold mt-0.5">OFFICIAL DELEGATE PASS</h3>
      </div>

      {regData.avatarUrl && (
        <img
          src={regData.avatarUrl}
          alt={regData.fullName}
          className="size-24 rounded-full object-cover border-4 border-blue-100"
        />
      )}

      <div>
        <h4 className="text-xl font-black text-slate-900">{regData.fullName}</h4>
        <p className="text-xs text-slate-500 mt-1">{regData.affiliation}</p>
        <Badge variant="ute" className="mt-2">
          {tierLabel}
        </Badge>
      </div>

      {qrBadgeDataUrl && (
        <img
          src={qrBadgeDataUrl}
          alt="Delegate QR Badge"
          className="w-44 h-44 rounded-2xl border border-slate-200 p-2 bg-white"
        />
      )}

      <div className="font-mono text-sm font-black text-[#005496] bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-200">
        {regData.registrationCode}
      </div>
    </Card>
  );
}
