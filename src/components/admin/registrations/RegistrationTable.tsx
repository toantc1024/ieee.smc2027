"use client";

import React from "react";
import {
  CreditCard,
  Search,
  Plane,
  ShieldCheck,
  Code2,
  Trash2,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatVND, formatUSD } from "@/lib/conference-registration";
import type { UnstructuredRegistrationFormData } from "@/types";

interface RegistrationTableProps {
  registrations: any[];
  loading: boolean;
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
  onConfirmPayoo: (reg: any) => void;
  onApproveVisa: (reg: any) => void;
  onVerifyProof: (reg: any) => void;
  onInspectJson: (reg: any) => void;
  onDelete: (reg: any) => void;
}

export function RegistrationTable({
  registrations,
  loading,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onConfirmPayoo,
  onApproveVisa,
  onVerifyProof,
  onInspectJson,
  onDelete,
}: RegistrationTableProps) {
  return (
    <Card className="p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {["ALL", "PAID", "PENDING"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
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
            onChange={(e) => onSearchChange(e.target.value)}
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
                            onClick={() => onConfirmPayoo(reg)}
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
                            onClick={() => onApproveVisa(reg)}
                          >
                            <Plane className="size-3.5" />
                            Approve Visa
                          </Button>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => onVerifyProof(reg)}
                        >
                          <ShieldCheck className="size-3.5" />
                          {form.proofVerified ? "Unverify" : "Verify Proof"}
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onInspectJson(reg)}
                        >
                          <Code2 className="size-3.5" />
                          JSON
                        </Button>

                        <button
                          type="button"
                          onClick={() => onDelete(reg)}
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
  );
}
