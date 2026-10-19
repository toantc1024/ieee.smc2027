"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Search,
  CheckCircle2,
  Download,
  Plane,
  ShieldCheck,
  Code2,
  Trash2,
  ExternalLink,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { ManagementPageHeader } from "@/components/ui/management-page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatVND, formatUSD } from "@/lib/conference-registration";
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
  const [jsonEditorText, setJsonEditorText] = useState("{}");
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
      setErrorMsg(err instanceof Error ? err.message : "Failed to load registrations");
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

  const handleSaveJsonModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectReg) return;

    setSavingJson(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      let parsed: UnstructuredRegistrationFormData = {};
      try {
        parsed = JSON.parse(jsonEditorText || "{}");
      } catch {
        throw new Error("Invalid JSON syntax in formData.");
      }

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

      setSuccessMsg(`Saved unstructured JSON formData for ${inspectReg.registrationCode}`);
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

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {["ALL", "PAID", "PENDING"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === st
                    ? "bg-[#005496] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search code, name, email, PaperCept ID..."
              className="h-9 pl-8 text-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="size-6 animate-spin text-[#005496]" />
            <span className="text-xs">Loading delegate registrations...</span>
          </div>
        ) : registrations.length === 0 ? (
          <div className="py-14 text-center text-xs text-slate-400">
            No registrations found matching current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">Delegate</th>
                  <th className="py-3 px-3">Category & PaperCept</th>
                  <th className="py-3 px-3">Payoo & Fee</th>
                  <th className="py-3 px-3">Proof & Visa Flow</th>
                  <th className="py-3 px-3 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map((reg) => {
                  const form: UnstructuredRegistrationFormData =
                    reg.formData && typeof reg.formData === "object"
                      ? reg.formData
                      : {};
                  const visaStatus =
                    form.visaApprovalStatus ||
                    (reg.needsVisaSupport ? "PENDING_APPROVAL" : "NOT_REQUESTED");

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {reg.avatarUrl ? (
                            <img
                              src={reg.avatarUrl}
                              alt={reg.fullName}
                              className="size-9 rounded-full object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="size-9 rounded-full bg-blue-50 text-[#005496] font-bold flex items-center justify-center">
                              {reg.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900">
                                {reg.fullName}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-[#005496] bg-blue-50 px-1.5 py-0.5 rounded">
                                {reg.registrationCode}
                              </span>
                            </div>
                            <p className="text-slate-500 text-[11px]">
                              {reg.email} · {reg.country}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <Badge variant="ute">{reg.participantType}</Badge>
                        {(reg.paperId || form.paperId) && (
                          <p className="text-[11px] text-slate-600 mt-1 font-mono">
                            PaperCept: {reg.paperId || form.paperId}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <div className="font-bold text-slate-900">
                          {reg.currency === "VND"
                            ? formatVND(reg.feeAmount)
                            : formatUSD(reg.feeAmount)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <Badge
                            variant={
                              reg.paymentStatus === "PAID" ? "success" : "warning"
                            }
                          >
                            {reg.paymentStatus}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            {reg.paymentMethod || "PAYOO"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Badge
                            variant={
                              visaStatus === "APPROVED"
                                ? "success"
                                : visaStatus === "PENDING_APPROVAL"
                                  ? "warning"
                                  : "secondary"
                            }
                          >
                            Visa: {visaStatus}
                          </Badge>
                          {form.proofVerified && (
                            <Badge variant="success">Proof Verified</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px]">
                          {form.proofDocumentUrl && (
                            <a
                              href={form.proofDocumentUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#005496] font-semibold hover:underline inline-flex items-center gap-0.5"
                            >
                              Proof File <ExternalLink className="size-3" />
                            </a>
                          )}
                          {form.passportScanUrl && (
                            <a
                              href={form.passportScanUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[#005496] font-semibold hover:underline inline-flex items-center gap-0.5"
                            >
                              Passport Scan <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-right">
                        <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                          {reg.paymentStatus !== "PAID" && (
                            <Button
                              type="button"
                              variant="ute"
                              size="sm"
                              onClick={() => handleConfirmPayoo(reg)}
                            >
                              <CreditCard className="size-3.5" />
                              Confirm Payoo
                            </Button>
                          )}

                          {visaStatus !== "APPROVED" && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveVisa(reg)}
                            >
                              <Plane className="size-3.5" />
                              Approve Visa
                            </Button>
                          )}

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerifyProof(reg)}
                          >
                            <ShieldCheck className="size-3.5" />
                            {form.proofVerified ? "Unverify" : "Verify Proof"}
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setInspectReg(reg);
                              setJsonEditorText(
                                JSON.stringify(reg.formData || {}, null, 2)
                              );
                            }}
                          >
                            <Code2 className="size-3.5" />
                            JSON
                          </Button>

                          <button
                            type="button"
                            onClick={() => handleDelete(reg)}
                            className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* JSON FORMDATA INSPECTOR & EDITOR MODAL */}
      {inspectReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Unstructured JSON `Registration.formData` —{" "}
                  {inspectReg.registrationCode}
                </h3>
                <p className="text-xs text-slate-500">
                  {inspectReg.fullName} · {inspectReg.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectReg(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="size-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveJsonModal}
              className="flex-1 overflow-y-auto p-6 space-y-4"
            >
              <div className="space-y-1.5">
                <Label>PostgreSQL JSONB Payload</Label>
                <Textarea
                  rows={14}
                  value={jsonEditorText}
                  onChange={(e) => setJsonEditorText(e.target.value)}
                  className="font-mono text-xs bg-slate-900 text-emerald-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInspectReg(null)}
                >
                  Close
                </Button>
                <Button type="submit" variant="ute" disabled={savingJson}>
                  {savingJson ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save JSON to PostgreSQL
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
