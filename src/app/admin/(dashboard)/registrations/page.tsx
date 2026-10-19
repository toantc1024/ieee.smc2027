"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Download } from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import { JsonCodeEditorModal } from "@/components/shared/JsonCodeEditorModal";
import { RegistrationTable } from "@/components/admin/registrations/RegistrationTable";
import type { UnstructuredRegistrationFormData } from "@/types";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Inspect / Edit JSON Modal
  const [inspectReg, setInspectReg] = useState<any | null>(null);
  const [savingJson, setSavingJson] = useState(false);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("q", search.trim());
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await fetch(`/api/registration?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to load registrations");
      }
      setRegistrations(json.data.registrations || []);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to load registrations"
      );
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const handleConfirmPayoo = async (reg: any) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/payment/payoo/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationCode: reg.registrationCode,
          method: reg.paymentMethod || "PAYOO_VIETQR",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Payoo confirmation failed");
      }
      setSuccessMsg(
        `Confirmed Payoo payment for ${reg.registrationCode} and sent receipt email.`
      );
      await loadRegistrations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Payoo update failed");
    }
  };

  const handleApproveVisa = async (reg: any) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const currentForm: UnstructuredRegistrationFormData =
        reg.formData && typeof reg.formData === "object" ? reg.formData : {};

      const res = await fetch(`/api/registration/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          needsVisaSupport: true,
          formData: {
            ...currentForm,
            needsVisaSupport: true,
            visaApprovalStatus: "APPROVED",
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to approve Visa Support Letter");
      }
      setSuccessMsg(
        `Approved Visa Support Letter for ${reg.registrationCode} and dispatched milestone email.`
      );
      await loadRegistrations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Visa approval failed");
    }
  };

  const handleVerifyProof = async (reg: any) => {
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const currentForm: UnstructuredRegistrationFormData =
        reg.formData && typeof reg.formData === "object" ? reg.formData : {};

      const res = await fetch(`/api/registration/${reg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: {
            ...currentForm,
            proofVerified: !currentForm.proofVerified,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to toggle proof verification");
      }
      setSuccessMsg(`Updated proof verification for ${reg.registrationCode}`);
      await loadRegistrations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Proof update failed");
    }
  };

  const handleSaveJsonModal = async (parsed: Record<string, unknown>) => {
    if (!inspectReg) return;

    setSavingJson(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/registration/${inspectReg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: parsed,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to save formData JSON");
      }

      setSuccessMsg(
        `Saved unstructured JSON formData for ${inspectReg.registrationCode}`
      );
      setInspectReg(null);
      await loadRegistrations();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSavingJson(false);
    }
  };

  const handleDelete = async (reg: any) => {
    if (!window.confirm(`Delete registration ${reg.registrationCode}?`)) return;
    try {
      const res = await fetch(`/api/registration/${reg.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await loadRegistrations();
      }
    } catch {
      setErrorMsg("Failed to delete registration");
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Code",
      "FullName",
      "Email",
      "Affiliation",
      "Country",
      "Category",
      "PaperID",
      "Fee",
      "Currency",
      "PaymentStatus",
      "TransactionRef",
      "VisaStatus",
      "Dietary",
      "InvoiceCompany",
      "InvoiceTaxCode",
    ];
    const rows = registrations.map((r) => {
      const f: UnstructuredRegistrationFormData =
        r.formData && typeof r.formData === "object" ? r.formData : {};
      return [
        r.registrationCode,
        `"${(r.fullName || "").replace(/"/g, '""')}"`,
        r.email,
        `"${(r.affiliation || "").replace(/"/g, '""')}"`,
        r.country,
        r.participantType,
        r.paperId || f.paperId || "",
        r.feeAmount,
        r.currency,
        r.paymentStatus,
        r.transactionRef || "",
        f.visaApprovalStatus || "NOT_REQUESTED",
        f.dietaryRequirement || r.dietaryRequirement || "",
        `"${(f.invoiceCompanyName || "").replace(/"/g, '""')}"`,
        f.invoiceTaxCode || "",
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ieee-smc-2027-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <ManagementPageHeader
        imageIcon="/assets/3d-icons/online-portal__hcmute-3d-icon.png"
        backgroundImage="/assets/manage-users-bg.jpg"
        title="Registrations, Payoo & Visa Approvals"
        description="Inspect delegate JSON formData, verify IEEE/Student proof uploads, reconcile Payoo VietQR & Card payments, and approve official Visa Support Letters."
      >
        <Button type="button" variant="ute" size="sm" onClick={handleExportCsv}>
          <Download className="size-4" />
          Export Financial CSV
        </Button>
      </ManagementPageHeader>

      <StatusAlertBanner
        variant="error"
        message={errorMsg}
        onDismiss={() => setErrorMsg("")}
      />
      <StatusAlertBanner
        variant="success"
        message={successMsg}
        onDismiss={() => setSuccessMsg("")}
      />

      <RegistrationTable
        registrations={registrations}
        loading={loading}
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onConfirmPayoo={handleConfirmPayoo}
        onApproveVisa={handleApproveVisa}
        onVerifyProof={handleVerifyProof}
        onInspectJson={(reg) => setInspectReg(reg)}
        onDelete={handleDelete}
      />

      {inspectReg && (
        <JsonCodeEditorModal
          open={Boolean(inspectReg)}
          title={`Unstructured JSON Registration.formData — ${inspectReg.registrationCode}`}
          subtitle={`${inspectReg.fullName} · ${inspectReg.email}`}
          initialJson={
            inspectReg.formData && typeof inspectReg.formData === "object"
              ? inspectReg.formData
              : {}
          }
          onSave={handleSaveJsonModal}
          onClose={() => setInspectReg(null)}
          saving={savingJson}
        />
      )}
    </div>
  );
}
