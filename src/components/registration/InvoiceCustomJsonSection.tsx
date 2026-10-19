"use client";

import React from "react";
import { Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DynamicJsonFieldsEditor } from "@/components/shared/DynamicJsonFieldsEditor";
import type { UnstructuredRegistrationFormData } from "@/types";

interface InvoiceCustomJsonSectionProps {
  formData: UnstructuredRegistrationFormData;
  onChange: (next: UnstructuredRegistrationFormData) => void;
}

export function InvoiceCustomJsonSection({
  formData,
  onChange,
}: InvoiceCustomJsonSectionProps) {
  return (
    <Card>
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
        <Receipt className="size-5 text-[#005496]" />
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Institutional Invoice & Custom JSON Metadata
          </h3>
          <p className="text-xs text-slate-500">
            Billing information for university reimbursement and custom key-value attributes
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Billing Organization Name</Label>
          <Input
            placeholder="Organization name for receipt"
            value={formData.invoiceCompanyName || ""}
            onChange={(e) =>
              onChange({ ...formData, invoiceCompanyName: e.target.value })
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label>Tax Code / VAT Number</Label>
          <Input
            placeholder="0301234567"
            value={formData.invoiceTaxCode || ""}
            onChange={(e) =>
              onChange({ ...formData, invoiceTaxCode: e.target.value })
            }
          />
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label>Billing Address</Label>
          <Input
            placeholder="Full institutional billing address"
            value={formData.invoiceAddress || ""}
            onChange={(e) =>
              onChange({ ...formData, invoiceAddress: e.target.value })
            }
          />
        </div>
      </div>

      <DynamicJsonFieldsEditor
        fields={formData.customFields || {}}
        onChange={(customFields) => onChange({ ...formData, customFields })}
      />
    </Card>
  );
}
