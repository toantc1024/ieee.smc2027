"use client";

import React from "react";
import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/media/ImageUploadField";
import type { UnstructuredRegistrationFormData } from "@/types";

interface PaperceptSubmissionSectionProps {
  isAuthorTier: boolean;
  formData: UnstructuredRegistrationFormData;
  onChange: (next: UnstructuredRegistrationFormData) => void;
}

export function PaperceptSubmissionSection({
  isAuthorTier,
  formData,
  onChange,
}: PaperceptSubmissionSectionProps) {
  return (
    <Card>
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <FileText className="size-5 text-[#005496]" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            PaperCept Submission & Academic Proof
          </h3>
          <p className="text-xs text-slate-500">
            Stored in structured JSON formData for manuscript verification and fee surcharges
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>PaperCept Paper ID {isAuthorTier ? "*" : ""}</Label>
          <Input
            required={isAuthorTier}
            placeholder="SMC27-1042"
            value={formData.paperId || ""}
            onChange={(e) => onChange({ ...formData, paperId: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>IEEE Membership Number</Label>
          <Input
            placeholder="98765432"
            value={formData.ieeeMemberNumber || ""}
            onChange={(e) =>
              onChange({ ...formData, ieeeMemberNumber: e.target.value })
            }
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label>Accepted Paper Title</Label>
          <Input
            placeholder="Cybernetic Human-Machine Teaming for Autonomous Systems..."
            value={formData.paperTitle || ""}
            onChange={(e) => onChange({ ...formData, paperTitle: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Extra Pages Beyond 6 Pages</Label>
          <Input
            type="number"
            min={0}
            max={4}
            value={formData.extraPagesCount || 0}
            onChange={(e) =>
              onChange({
                ...formData,
                extraPagesCount: Number(e.target.value || 0),
              })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Additional Gala Banquet Tickets</Label>
          <Input
            type="number"
            min={0}
            max={10}
            value={formData.extraBanquetTickets || 0}
            onChange={(e) =>
              onChange({
                ...formData,
                extraBanquetTickets: Number(e.target.value || 0),
              })
            }
          />
        </div>
      </div>

      <ImageUploadField
        label="IEEE Membership / Student ID / PaperCept Proof"
        description="Upload image or PDF proof of IEEE membership, student status, or PaperCept acceptance letter."
        value={formData.proofDocumentUrl || ""}
        onChange={(url) => onChange({ ...formData, proofDocumentUrl: url })}
        folder="public/proofs"
        accept="image/*,application/pdf"
        aspect="document"
      />
    </Card>
  );
}
