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
import { Skeleton } from "@/components/ui/skeleton";

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
    <Card className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 shadow-none">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          {["ALL", "PAID", "PENDING"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => onStatusFilterChange(st)}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-[#115eff] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="size-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search code, name, email, PaperCept ID..."
            className="h-8 pl-8.5 pr-3 text-xs bg-slate-50 border-slate-200 rounded-lg focus:bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 py-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={`skeleton-reg-${idx}`}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 rounded" />
                  <Skeleton className="h-3 w-48 rounded" />
                </div>
              </div>
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-5 w-20 rounded" />
              <Skeleton className="h-5 w-28 rounded-full" />
              <div className="flex items-center gap-1.5">
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : registrations.length === 0 ? (
        <div className="py-14 text-center text-xs text-slate-400 font-medium">
          No registrations found matching current filter.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase text-xs font-semibold tracking-wider">
                <th className="py-3 px-4">Delegate</th>
                <th className="py-3 px-4">Category & PaperCept</th>
                <th className="py-3 px-4">Payoo & Fee</th>
                <th className="py-3 px-4">Proof & Visa Flow</th>
                <th className="py-3 px-4 text-right">Workflow Actions</th>
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
                  <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {reg.avatarUrl ? (
                          <img
                            src={reg.avatarUrl}
                            alt={reg.fullName}
                            className="size-9 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="size-9 rounded-full bg-[#115eff] text-white font-bold flex items-center justify-center text-xs">
                            {reg.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-semibold text-slate-900 text-sm">
                              {reg.fullName}
                            </span>
                            <span className="text-[11px] font-medium text-[#004776] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                              {reg.registrationCode}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs">
                            {reg.email} · {reg.country}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="ute" className="font-medium text-xs">{reg.participantType}</Badge>
                      {(reg.paperId || form.paperId) && (
                        <p className="text-xs text-slate-600 mt-1 font-medium">
                          PaperCept: {reg.paperId || form.paperId}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900 text-sm">
                        {reg.currency === "VND"
                          ? formatVND(reg.feeAmount)
                          : formatUSD(reg.feeAmount)}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Badge
                          variant={
                            reg.paymentStatus === "PAID" ? "success" : "warning"
                          }
                          className="font-medium text-[11px]"
                        >
                          {reg.paymentStatus}
                        </Badge>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {reg.paymentMethod || "PAYOO"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge
                          variant={
                            visaStatus === "APPROVED"
                              ? "success"
                              : visaStatus === "PENDING_APPROVAL"
                                ? "warning"
                                : "secondary"
                          }
                          className="font-medium text-[11px]"
                        >
                          Visa: {visaStatus}
                        </Badge>
                        {form.proofVerified && (
                          <Badge variant="success" className="font-medium text-[11px]">Proof Verified</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        {form.proofDocumentUrl && (
                          <a
                            href={form.proofDocumentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#115eff] font-medium hover:underline inline-flex items-center gap-0.5"
                          >
                            Proof File <ExternalLink className="size-3" />
                          </a>
                        )}
                        {form.passportScanUrl && (
                          <a
                            href={form.passportScanUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#115eff] font-medium hover:underline inline-flex items-center gap-0.5"
                          >
                            Passport Scan <ExternalLink className="size-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        {reg.paymentStatus !== "PAID" && (
                          <Button
                            type="button"
                            variant="ute"
                            size="sm"
                            className="h-8 px-2.5 text-xs font-medium"
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
                            className="h-8 px-2.5 text-xs font-medium"
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
                          className="h-8 px-2.5 text-xs font-medium"
                          onClick={() => onVerifyProof(reg)}
                        >
                          <ShieldCheck className="size-3.5" />
                          {form.proofVerified ? "Unverify" : "Verify Proof"}
                        </Button>

                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-8 px-2.5 text-xs font-medium"
                          onClick={() => onInspectJson(reg)}
                        >
                          <Code2 className="size-3.5" />
                          JSON
                        </Button>

                        <button
                          type="button"
                          onClick={() => onDelete(reg)}
                          className="size-8 inline-flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
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
