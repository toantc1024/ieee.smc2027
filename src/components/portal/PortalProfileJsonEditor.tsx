"use client";

import React from "react";
import { Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/media/ImageUploadField";
import { DynamicJsonFieldsEditor } from "@/components/shared/DynamicJsonFieldsEditor";
import type { UnstructuredRegistrationFormData } from "@/types";

export interface PortalBasicIdentityState {
  fullName: string;
  phone: string;
  affiliation: string;
  country: string;
  avatarUrl: string;
}

interface PortalProfileJsonEditorProps {
  editBasic: PortalBasicIdentityState;
  editJson: UnstructuredRegistrationFormData;
  saving: boolean;
  onChangeBasic: (next: PortalBasicIdentityState) => void;
  onChangeJson: (next: UnstructuredRegistrationFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PortalProfileJsonEditor({
  editBasic,
  editJson,
  saving,
  onChangeBasic,
  onChangeJson,
  onSubmit,
}: PortalProfileJsonEditorProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Identity & Media Library Uploads
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ImageUploadField
            label="Badge Portrait Photo"
            value={editBasic.avatarUrl}
            onChange={(url) => onChangeBasic({ ...editBasic, avatarUrl: url })}
            folder="public/avatars"
            accept="image/*"
          />

          <ImageUploadField
            label="IEEE / Student / Paper Proof"
            value={editJson.proofDocumentUrl || ""}
            onChange={(url) =>
              onChangeJson({ ...editJson, proofDocumentUrl: url })
            }
            folder="public/proofs"
            accept="image/*,application/pdf"
            aspect="document"
          />

          <ImageUploadField
            label="Passport Bio Page Scan"
            value={editJson.passportScanUrl || ""}
            onChange={(url) =>
              onChangeJson({ ...editJson, passportScanUrl: url })
            }
            folder="private/passports"
            accept="image/*,application/pdf"
            aspect="document"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input
              value={editBasic.fullName}
              onChange={(e) =>
                onChangeBasic({ ...editBasic, fullName: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone</Label>
            <Input
              value={editBasic.phone}
              onChange={(e) =>
                onChangeBasic({ ...editBasic, phone: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Affiliation</Label>
            <Input
              value={editBasic.affiliation}
              onChange={(e) =>
                onChangeBasic({ ...editBasic, affiliation: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Country</Label>
            <Input
              value={editBasic.country}
              onChange={(e) =>
                onChangeBasic({ ...editBasic, country: e.target.value })
              }
            />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Unstructured JSON Attributes — Passport, Travel, Dietary & Tax Invoice
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Passport Number</Label>
            <Input
              value={editJson.passportNumber || ""}
              onChange={(e) =>
                onChangeJson({ ...editJson, passportNumber: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Passport Issue Date</Label>
            <Input
              type="date"
              value={editJson.passportIssueDate || ""}
              onChange={(e) =>
                onChangeJson({ ...editJson, passportIssueDate: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Passport Expiry Date</Label>
            <Input
              type="date"
              value={editJson.passportExpiryDate || ""}
              onChange={(e) =>
                onChangeJson({
                  ...editJson,
                  passportExpiryDate: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Dietary Preference</Label>
            <Input
              value={editJson.dietaryRequirement || ""}
              onChange={(e) =>
                onChangeJson({
                  ...editJson,
                  dietaryRequirement: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Arrival Flight</Label>
            <Input
              value={editJson.arrivalFlight || ""}
              onChange={(e) =>
                onChangeJson({ ...editJson, arrivalFlight: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Hotel in HCMC</Label>
            <Input
              value={editJson.hotelName || ""}
              onChange={(e) =>
                onChangeJson({ ...editJson, hotelName: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <Label>Billing Organization</Label>
            <Input
              value={editJson.invoiceCompanyName || ""}
              onChange={(e) =>
                onChangeJson({
                  ...editJson,
                  invoiceCompanyName: e.target.value,
                })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Tax Identification Code</Label>
            <Input
              value={editJson.invoiceTaxCode || ""}
              onChange={(e) =>
                onChangeJson({ ...editJson, invoiceTaxCode: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Billing Address</Label>
            <Input
              value={editJson.invoiceAddress || ""}
              onChange={(e) =>
                onChangeJson({ ...editJson, invoiceAddress: e.target.value })
              }
            />
          </div>
        </div>

        <DynamicJsonFieldsEditor
          fields={editJson.customFields || {}}
          onChange={(customFields) =>
            onChangeJson({ ...editJson, customFields })
          }
        />

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="ute" disabled={saving}>
            {saving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Profile & JSON Data
          </Button>
        </div>
      </Card>
    </form>
  );
}
