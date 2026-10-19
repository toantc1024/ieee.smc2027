"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  User,
  QrCode,
  FileText,
  Printer,
  Search,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Plane,
  Globe,
  Save,
  Loader2,
  Code2,
  Plus,
  Trash2,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImageUploadField } from "@/components/media/ImageUploadField";
import {
  REGISTRATION_FEES,
  formatVND,
  formatUSD,
  getVietQrUrl,
} from "@/lib/conference-registration";
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

  // Editable state synced with regData + JSON formData
  const [editBasic, setEditBasic] = useState({
    fullName: "",
    phone: "",
    affiliation: "",
    country: "",
    avatarUrl: "",
  });

  const [editJson, setEditJson] = useState<UnstructuredRegistrationFormData>({});
  const [customKey, setCustomKey] = useState("");
  const [customVal, setCustomVal] = useState("");

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

    // Otherwise auto-load from logged-in session
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchByCode(searchCode);
  };

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

      // Also sync to /api/profile if logged in
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

  const addCustomField = () => {
    const k = customKey.trim();
    if (!k) return;
    setEditJson((prev) => ({
      ...prev,
      customFields: {
        ...(prev.customFields || {}),
        [k]: customVal.trim(),
      },
    }));
    setCustomKey("");
    setCustomVal("");
  };

  const removeCustomField = (key: string) => {
    setEditJson((prev) => {
      const next = { ...(prev.customFields || {}) };
      delete next[key];
      return { ...prev, customFields: next };
    });
  };

  const visaStatus =
    (regData?.formData as UnstructuredRegistrationFormData)?.visaApprovalStatus ||
    (regData?.needsVisaSupport ? "PENDING_APPROVAL" : "NOT_REQUESTED");

  return (
    <main className="min-h-screen bg-slate-50/70 pb-20">
      <div className="bg-white border-b border-slate-200">
        <SectionContainer id="portal-header" fullWidthBg="bg-white" className="py-10 sm:py-12">
          <div className="max-w-4xl space-y-3">
            <Badge variant="ute" className="px-3 py-1">
              <User className="size-3.5" />
              Delegate Portal & Digital Badge
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Delegate Profile & <span className="text-[#005496]">Digital Badge Portal</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Manage your JSON-based delegate profile, complete Payoo checkout, print your QR conference badge, and download your Official Receipt or Visa Support Letter.
            </p>

            <form
              onSubmit={handleSearchSubmit}
              className="pt-3 flex flex-col sm:flex-row gap-3 max-w-xl"
            >
              <div className="relative grow">
                <Search className="size-4 text-slate-400 absolute left-3.5 top-3" />
                <Input
                  type="text"
                  placeholder="Enter registration code, e.g. SMC27-A8B9C2..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="ute" disabled={loading}>
                {loading ? "Loading..." : "Look Up"}
              </Button>
            </form>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="portal-body" fullWidthBg="transparent" className="pt-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {!regData && !loading && (
          <Card className="p-10 text-center max-w-2xl mx-auto items-center my-6">
            <div className="size-16 rounded-2xl bg-blue-50 text-[#005496] flex items-center justify-center">
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
            {/* Delegate Header Banner */}
            <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {regData.avatarUrl ? (
                  <img
                    src={regData.avatarUrl}
                    alt={regData.fullName}
                    className="size-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="size-16 rounded-2xl bg-blue-100 text-[#005496] flex items-center justify-center font-black text-2xl shrink-0">
                    {regData.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {regData.fullName}
                    </h2>
                    <Badge
                      variant={regData.paymentStatus === "PAID" ? "success" : "warning"}
                    >
                      {regData.paymentStatus}
                    </Badge>
                    <Badge variant="ute">{regData.participantType}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {regData.affiliation} · {regData.country} · Code:{" "}
                    <strong className="text-[#005496]">{regData.registrationCode}</strong>
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                >
                  <Printer className="size-4" />
                  Print Badge
                </Button>

                <Button
                  type="button"
                  variant={regData.paymentStatus === "PAID" ? "ute" : "secondary"}
                  size="sm"
                  disabled={regData.paymentStatus !== "PAID"}
                  onClick={() => handleGenerateDocument("RECEIPT_INVOICE")}
                >
                  <FileText className="size-4" />
                  Official Receipt
                </Button>

                {regData.needsVisaSupport && (
                  <Button
                    type="button"
                    variant={regData.paymentStatus === "PAID" ? "default" : "secondary"}
                    size="sm"
                    disabled={regData.paymentStatus !== "PAID"}
                    onClick={() => handleGenerateDocument("VISA_SUPPORT_LETTER")}
                  >
                    <Plane className="size-4" />
                    Visa Support Letter
                  </Button>
                )}
              </div>
            </Card>

            {/* Navigation Tabs */}
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

            {/* TAB 1: OVERVIEW & PAYOO */}
            {activeTab === "OVERVIEW" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <Card className="items-center text-center">
                    <div className="w-full bg-[#005496] text-white rounded-xl p-4">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                        IEEE SMC 2027 · Ho Chi Minh City
                      </p>
                      <h3 className="text-lg font-extrabold mt-0.5">
                        OFFICIAL DELEGATE PASS
                      </h3>
                    </div>

                    {regData.avatarUrl && (
                      <img
                        src={regData.avatarUrl}
                        alt={regData.fullName}
                        className="size-24 rounded-full object-cover border-4 border-blue-100"
                      />
                    )}

                    <div>
                      <h4 className="text-xl font-black text-slate-900">
                        {regData.fullName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {regData.affiliation}
                      </p>
                      <Badge variant="ute" className="mt-2">
                        {REGISTRATION_FEES[regData.participantType as keyof typeof REGISTRATION_FEES]?.label ||
                          regData.participantType}
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
                </div>

                <div className="lg:col-span-7 space-y-6">
                  <Card>
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Payoo Payment & Milestone Status
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 font-bold uppercase block">
                          Registration Fee
                        </span>
                        <span className="text-base font-black text-slate-900 mt-1 block">
                          {regData.currency === "VND"
                            ? formatVND(regData.feeAmount)
                            : formatUSD(regData.feeAmount)}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 font-bold uppercase block">
                          Payment Status
                        </span>
                        <span className="text-base font-black text-slate-900 mt-1 block">
                          {regData.paymentStatus}
                        </span>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-400 font-bold uppercase block">
                          Visa Letter Status
                        </span>
                        <span className="text-base font-black text-[#005496] mt-1 block">
                          {visaStatus}
                        </span>
                      </div>
                    </div>

                    {regData.paymentStatus !== "PAID" ? (
                      <div className="space-y-4 pt-2">
                        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                          <img
                            src={getVietQrUrl(regData.registrationCode, regData.feeAmount)}
                            alt="Payoo VietQR"
                            className="w-40 h-40 object-contain rounded-xl bg-white p-2 border border-slate-200"
                          />
                          <div className="space-y-2 text-xs">
                            <p className="font-bold text-slate-900 text-sm">
                              Complete Payment via Payoo Gateway
                            </p>
                            <p className="text-slate-600">
                              Scan the dynamic VietQR code or use the temporary Payoo sandbox button below to test instant reconciliation and unlock your Official Receipt and Visa Support Letter.
                            </p>
                            <Button
                              type="button"
                              variant="ute"
                              disabled={simulatingPayoo}
                              onClick={handleSimulatePayoo}
                            >
                              {simulatingPayoo ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <CreditCard className="size-4" />
                              )}
                              Complete Temporary Payoo Payment Now
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
                        <div className="text-xs text-emerald-900">
                          <p className="font-bold text-sm">
                            Payment Verified — Ref: {regData.transactionRef || "PAYOO"}
                          </p>
                          <p className="mt-0.5">
                            Your Official Payment Receipt and Visa Support Letter are ready for download.
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ute"
                          size="sm"
                          onClick={() => handleGenerateDocument("RECEIPT_INVOICE")}
                        >
                          Download Receipt
                        </Button>
                      </div>
                    )}
                  </Card>

                  {/* Summary of JSON formData fields */}
                  <Card>
                    <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                      Delegate Unstructured JSON Profile Summary
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50">
                        <span className="text-slate-400 font-bold uppercase block">
                          PaperCept ID
                        </span>
                        <span className="font-semibold text-slate-800">
                          {editJson.paperId || "None"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50">
                        <span className="text-slate-400 font-bold uppercase block">
                          Dietary Preference
                        </span>
                        <span className="font-semibold text-slate-800">
                          {editJson.dietaryRequirement || "Normal"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50">
                        <span className="text-slate-400 font-bold uppercase block">
                          Passport Number
                        </span>
                        <span className="font-semibold text-slate-800">
                          {editJson.passportNumber || "Not provided"}
                        </span>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50">
                        <span className="text-slate-400 font-bold uppercase block">
                          Flight / Hotel
                        </span>
                        <span className="font-semibold text-slate-800">
                          {editJson.arrivalFlight || "TBD"} · {editJson.hotelName || "TBD"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* TAB 2: EDIT JSON FORM DATA & MEDIA UPLOADS */}
            {activeTab === "EDIT_JSON" && (
              <form onSubmit={handleSaveProfileAndJson} className="space-y-6">
                <Card>
                  <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Identity & Media Library Uploads
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ImageUploadField
                      label="Badge Portrait Photo"
                      value={editBasic.avatarUrl}
                      onChange={(url) =>
                        setEditBasic((prev) => ({ ...prev, avatarUrl: url }))
                      }
                      folder="public/avatars"
                      accept="image/*"
                    />

                    <ImageUploadField
                      label="IEEE / Student / Paper Proof"
                      value={editJson.proofDocumentUrl || ""}
                      onChange={(url) =>
                        setEditJson((prev) => ({ ...prev, proofDocumentUrl: url }))
                      }
                      folder="public/proofs"
                      accept="image/*,application/pdf"
                      aspect="document"
                    />

                    <ImageUploadField
                      label="Passport Bio Page Scan"
                      value={editJson.passportScanUrl || ""}
                      onChange={(url) =>
                        setEditJson((prev) => ({ ...prev, passportScanUrl: url }))
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
                          setEditBasic((prev) => ({ ...prev, fullName: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Phone</Label>
                      <Input
                        value={editBasic.phone}
                        onChange={(e) =>
                          setEditBasic((prev) => ({ ...prev, phone: e.target.value }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Affiliation</Label>
                      <Input
                        value={editBasic.affiliation}
                        onChange={(e) =>
                          setEditBasic((prev) => ({
                            ...prev,
                            affiliation: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Country</Label>
                      <Input
                        value={editBasic.country}
                        onChange={(e) =>
                          setEditBasic((prev) => ({ ...prev, country: e.target.value }))
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
                          setEditJson((prev) => ({
                            ...prev,
                            passportNumber: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Passport Issue Date</Label>
                      <Input
                        type="date"
                        value={editJson.passportIssueDate || ""}
                        onChange={(e) =>
                          setEditJson((prev) => ({
                            ...prev,
                            passportIssueDate: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Passport Expiry Date</Label>
                      <Input
                        type="date"
                        value={editJson.passportExpiryDate || ""}
                        onChange={(e) =>
                          setEditJson((prev) => ({
                            ...prev,
                            passportExpiryDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Dietary Preference</Label>
                      <Input
                        value={editJson.dietaryRequirement || ""}
                        onChange={(e) =>
                          setEditJson((prev) => ({
                            ...prev,
                            dietaryRequirement: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Arrival Flight</Label>
                      <Input
                        value={editJson.arrivalFlight || ""}
                        onChange={(e) =>
                          setEditJson((prev) => ({
                            ...prev,
                            arrivalFlight: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Hotel in HCMC</Label>
                      <Input
                        value={editJson.hotelName || ""}
                        onChange={(e) =>
                          setEditJson((prev) => ({
                            ...prev,
                            hotelName: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label>Billing Organization</Label>
                      <Input
                        value={editJson.invoiceCompanyName || ""}
                        onChange={(e) =>
                          setEditJson((prev) => ({
                            ...prev,
                            invoiceCompanyName: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tax Identification Code</Label>
                      <Input
                        value={editJson.invoiceTaxCode || ""}
                        onChange={(e) =>
                          setEditJson((prev) => ({
                            ...prev,
                            invoiceTaxCode: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Billing Address</Label>
                      <Input
                        value={editJson.invoiceAddress || ""}
                        onChange={(e) =>
                          setEditJson((prev) => ({
                            ...prev,
                            invoiceAddress: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Dynamic Key-Value JSON Builder */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <Label>Custom Unstructured JSON Fields</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input
                        placeholder="Field Key"
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        className="sm:w-1/3"
                      />
                      <Input
                        placeholder="Field Value"
                        value={customVal}
                        onChange={(e) => setCustomVal(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" onClick={addCustomField}>
                        <Plus className="size-4" />
                        Add
                      </Button>
                    </div>

                    {editJson.customFields &&
                      Object.keys(editJson.customFields).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(editJson.customFields).map(([k, v]) => (
                            <div
                              key={k}
                              className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs"
                            >
                              <span className="font-bold text-slate-700">{k}:</span>
                              <span className="text-slate-600">{v}</span>
                              <button
                                type="button"
                                onClick={() => removeCustomField(k)}
                                className="text-slate-400 hover:text-red-600"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>

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
            )}

            {/* TAB 3: RAW JSON INSPECTOR */}
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
          <Loader2 className="size-8 animate-spin text-[#005496]" />
        </div>
      }
    >
      <PortalContent />
    </Suspense>
  );
}
