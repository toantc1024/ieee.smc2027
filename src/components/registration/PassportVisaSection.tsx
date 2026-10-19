"use client";

import React from "react";
import { Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/media/ImageUploadField";
import type { UnstructuredRegistrationFormData } from "@/types";

interface PassportVisaSectionProps {
  formData: UnstructuredRegistrationFormData;
  onChange: (next: UnstructuredRegistrationFormData) => void;
}

export function PassportVisaSection({
  formData,
  onChange,
}: PassportVisaSectionProps) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <Globe className="size-5 text-[#005496]" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Passport & Visa Support Letter
            </h3>
            <p className="text-xs text-slate-500">
              Required for international delegates requesting an official Vietnam entry visa letter
            </p>
          </div>
        </div>

        <label className="inline-flex items-center gap-2 text-xs font-bold text-[#005496] cursor-pointer">
          <input
            type="checkbox"
            checked={Boolean(formData.needsVisaSupport)}
            onChange={(e) =>
              onChange({ ...formData, needsVisaSupport: e.target.checked })
            }
            className="size-4 accent-[#005496] rounded"
          />
          Request Visa Letter
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Passport Number</Label>
          <Input
            placeholder="B12345678"
            value={formData.passportNumber || ""}
            onChange={(e) =>
              onChange({ ...formData, passportNumber: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Nationality</Label>
          <Input
            placeholder="Nationality on passport"
            value={formData.nationality || ""}
            onChange={(e) =>
              onChange({ ...formData, nationality: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Passport Issue Date</Label>
          <Input
            type="date"
            value={formData.passportIssueDate || ""}
            onChange={(e) =>
              onChange({ ...formData, passportIssueDate: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Passport Expiry Date</Label>
          <Input
            type="date"
            value={formData.passportExpiryDate || ""}
            onChange={(e) =>
              onChange({ ...formData, passportExpiryDate: e.target.value })
            }
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label>Vietnamese Embassy / Consulate City for Visa Application</Label>
          <Input
            placeholder="Beijing, Shanghai, Tokyo, Seoul, Frankfurt..."
            value={formData.embassyCity || ""}
            onChange={(e) =>
              onChange({ ...formData, embassyCity: e.target.value })
            }
          />
        </div>
      </div>

      {formData.needsVisaSupport && (
        <ImageUploadField
          label="Passport Biographical Page Scan"
          description="Upload a clear scan or photo of your passport information page for Admin verification."
          value={formData.passportScanUrl || ""}
          onChange={(url) => onChange({ ...formData, passportScanUrl: url })}
          folder="private/passports"
          accept="image/*,application/pdf"
          aspect="document"
        />
      )}
    </Card>
  );
}
