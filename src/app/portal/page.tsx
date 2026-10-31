"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  QrCode,
  ChevronRight,
  Loader2,
  Code2,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import { PortalSearchHeader } from "@/components/portal/PortalSearchHeader";
import { DelegateBannerCard } from "@/components/portal/DelegateBannerCard";
import { DigitalBadgePassCard } from "@/components/portal/DigitalBadgePassCard";
import { PortalPayooStatusCard } from "@/components/portal/PortalPayooStatusCard";
import {
  PortalProfileJsonEditor,
  PortalBasicIdentityState,
} from "@/components/portal/PortalProfileJsonEditor";
import QRCode from "qrcode";
import type { UnstructuredRegistrationFormData } from "@/types";

function PortalContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [searchCode, setSearchCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [simulatingPayoo, setSimulatingPayoo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [regData, setRegData] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [qrBadgeDataUrl, setQrBadgeDataUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "EDIT_JSON" | "RAW_JSON">("OVERVIEW");

  const [editBasic, setEditBasic] = useState<PortalBasicIdentityState>({
    fullName: "",
    phone: "",
    affiliation: "",
    country: "",
    avatarUrl: "",
  });

  const [editJson, setEditJson] = useState<UnstructuredRegistrationFormData>({});

  const hydrateStateFromRegistration = async (reg: any) => {
    setRegData(reg);
    const form: UnstructuredRegistrationFormData =
      reg.formData && typeof reg.formData === "object" ? reg.formData : {};

    setEditBasic({
      fullName: reg.fullName || "",
      phone: reg.phone || "",
      affiliation: reg.affiliation || "",
      country: reg.country || "",
      avatarUrl: reg.avatarUrl || "",
    });

    setEditJson({
      ...form,
      paperId: reg.paperId || form.paperId || "",
      paperTitle: reg.paperTitle || form.paperTitle || "",
      passportNumber: reg.passportNumber || form.passportNumber || "",
      needsVisaSupport: Boolean(reg.needsVisaSupport ?? form.needsVisaSupport),
      dietaryRequirement: reg.dietaryRequirement || form.dietaryRequirement || "Normal",
      travelNotes: reg.travelNotes || form.travelNotes || "",
      customFields: form.customFields || {},
    });

    const qrSvg = await QRCode.toDataURL(
      JSON.stringify({
        code: reg.registrationCode,
        name: reg.fullName,
        type: reg.participantType,
      }),
      { margin: 1, width: 280, color: { dark: "#002244", light: "#ffffff" } }
    );
    setQrBadgeDataUrl(qrSvg);
  };

  const fetchByCode = async (codeToFetch: string) => {
    if (!codeToFetch.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/registration?code=${encodeURIComponent(codeToFetch.trim())}`
      );
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "No delegate registration found with this code.");
      }
      await hydrateStateFromRegistration(json.data.registration);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Error looking up registration record."
      );
      setRegData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchByCode(initialCode);
      return;
    }

    setLoading(true);
    fetch("/api/registration?mine=1")
      .then((res) => (res.ok ? res.json() : null))
      .then(async (json) => {
        if (json?.success && json.data) {
          if (json.data.user) setSessionUser(json.data.user);
          if (json.data.registration) {
            setSearchCode(json.data.registration.registrationCode);
            await hydrateStateFromRegistration(json.data.registration);
          }
        }
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  }, [initialCode]);

  const handleSaveProfileAndJson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData) return;

    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/registration/${regData.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationCode: regData.registrationCode,
          fullName: editBasic.fullName,
          phone: editBasic.phone,
          affiliation: editBasic.affiliation,
          country: editBasic.country,
          avatarUrl: editBasic.avatarUrl || null,
          dietaryRequirement: editJson.dietaryRequirement,
          travelNotes: editJson.travelNotes,
          needsVisaSupport: editJson.needsVisaSupport,
          passportNumber: editJson.passportNumber,
          paperId: editJson.paperId,
          paperTitle: editJson.paperTitle,
          formData: editJson,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to update profile");
      }

      fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editBasic.fullName,
          avatar: editBasic.avatarUrl || null,
          profileData: {
            phone: editBasic.phone,
            affiliation: editBasic.affiliation,
            country: editBasic.country,
            ...editJson,
          },
        }),
      }).catch(() => null);

      await hydrateStateFromRegistration(json.data.registration);
      setSuccessMsg("Delegate profile and JSON formData saved to PostgreSQL.");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleSimulatePayoo = async () => {
    if (!regData) return;
    setSimulatingPayoo(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const res = await fetch("/api/payment/payoo/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationCode: regData.registrationCode,
          method: regData.paymentMethod || "PAYOO_VIETQR",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Payoo payment confirmation failed");
      }
      await hydrateStateFromRegistration(json.data.registration);
      setSuccessMsg(
        `Payoo payment confirmed (${json.data.transactionRef}). Official Receipt unlocked!`
      );
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Payoo simulation failed");
    } finally {
      setSimulatingPayoo(false);
    }
  };

  const handleGenerateDocument = async (
    documentType: "RECEIPT_INVOICE" | "VISA_SUPPORT_LETTER"
  ) => {
    if (!regData) return;
    setErrorMsg("");
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationCode: regData.registrationCode,
          documentType,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Document generation failed");
      }
      if (json.data?.document?.downloadUrl) {
        window.open(json.data.document.downloadUrl, "_blank");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Unable to generate document");
    }
  };

  const visaStatus =
    (regData?.formData as UnstructuredRegistrationFormData)?.visaApprovalStatus ||
    (regData?.needsVisaSupport ? "PENDING_APPROVAL" : "NOT_REQUESTED");

  return (
    <main className="min-h-screen bg-slate-50/70 pb-20">
      <PortalSearchHeader
        searchCode={searchCode}
        loading={loading}
        onChangeSearchCode={setSearchCode}
        onSearchSubmit={(e) => {
          e.preventDefault();
          fetchByCode(searchCode);
        }}
      />

      <SectionContainer id="portal-body" fullWidthBg="transparent" className="pt-8">
        {errorMsg && (
          <div className="mb-6">
            <StatusAlertBanner
              variant="error"
              message={errorMsg}
              onDismiss={() => setErrorMsg("")}
            />
          </div>
        )}

        {successMsg && (
          <div className="mb-6">
            <StatusAlertBanner
              variant="success"
              message={successMsg}
              onDismiss={() => setSuccessMsg("")}
            />
          </div>
        )}

        {!regData && !loading && (
          <Card className="p-10 text-center max-w-2xl mx-auto items-center my-6">
            <div className="size-16 rounded-2xl bg-blue-50 text-[#115eff] flex items-center justify-center">
              <QrCode className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              {sessionUser
                ? `Welcome, ${sessionUser.name}. No registration linked yet.`
                : "Enter your registration code to view your badge"}
            </h3>
            <p className="text-sm text-slate-500 max-w-md">
              Complete the conference registration form to generate your unique SMC27 delegate code, or sign in via Email Link / Google OAuth.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/registration">
                <Button variant="ute">
                  Register for IEEE SMC 2027
                  <ChevronRight className="size-4" />
                </Button>
              </Link>
              {!sessionUser && (
                <Link href="/admin/login">
                  <Button variant="outline">Sign In with Email Link / Google</Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {regData && (
          <div className="space-y-6">
            <DelegateBannerCard
              regData={regData}
              onPrintBadge={() => window.print()}
              onDownloadReceipt={() => handleGenerateDocument("RECEIPT_INVOICE")}
              onDownloadVisa={() => handleGenerateDocument("VISA_SUPPORT_LETTER")}
            />

            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
              <Button
                type="button"
                variant={activeTab === "OVERVIEW" ? "ute" : "outline"}
                size="sm"
                onClick={() => setActiveTab("OVERVIEW")}
              >
                <QrCode className="size-4" />
                Badge & Payoo Status
              </Button>
              <Button
                type="button"
                variant={activeTab === "EDIT_JSON" ? "ute" : "outline"}
                size="sm"
                onClick={() => setActiveTab("EDIT_JSON")}
              >
                <User className="size-4" />
                Edit Profile & JSON Form Data
              </Button>
              <Button
                type="button"
                variant={activeTab === "RAW_JSON" ? "ute" : "outline"}
                size="sm"
                onClick={() => setActiveTab("RAW_JSON")}
              >
                <Code2 className="size-4" />
                Unstructured JSON Inspector
              </Button>
            </div>

            {activeTab === "OVERVIEW" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <DigitalBadgePassCard
                    regData={regData}
                    qrBadgeDataUrl={qrBadgeDataUrl}
                  />
                </div>
                <div className="lg:col-span-7">
                  <PortalPayooStatusCard
                    regData={regData}
                    visaStatus={visaStatus}
                    formData={editJson}
                    simulatingPayoo={simulatingPayoo}
                    onSimulatePayoo={handleSimulatePayoo}
                    onDownloadReceipt={() => handleGenerateDocument("RECEIPT_INVOICE")}
                  />
                </div>
              </div>
            )}

            {activeTab === "EDIT_JSON" && (
              <PortalProfileJsonEditor
                editBasic={editBasic}
                editJson={editJson}
                saving={saving}
                onChangeBasic={setEditBasic}
                onChangeJson={setEditJson}
                onSubmit={handleSaveProfileAndJson}
              />
            )}

            {activeTab === "RAW_JSON" && (
              <Card>
                <h3 className="text-base font-bold text-slate-900">
                  PostgreSQL Unstructured JSON Payload (`Registration.formData`)
                </h3>
                <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(editJson, null, 2)}
                </pre>
              </Card>
            )}
          </div>
        )}
      </SectionContainer>
    </main>
  );
}

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="size-8 animate-spin text-[#115eff]" />
        </div>
      }
    >
      <PortalContent />
    </Suspense>
  );
}
