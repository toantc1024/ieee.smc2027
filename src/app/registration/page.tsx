"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  QrCode,
  CheckCircle2,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  Building,
  Globe,
  FileText,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CreditCard,
  Plane,
  Utensils,
  Receipt,
  Plus,
  Trash2,
  Loader2,
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
  CONFERENCE_BANK_INFO,
  FeeTier,
  formatVND,
  formatUSD,
} from "@/lib/conference-registration";
import type { UnstructuredRegistrationFormData } from "@/types";

type Step = "TIER" | "INFO" | "PAYMENT";

const EXTRA_PAGE_RATE = { VND: 3750000, USD: 150 };
const EXTRA_BANQUET_RATE = { VND: 2250000, USD: 90 };

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<Step>("TIER");
  const [selectedTier, setSelectedTier] = useState<FeeTier["id"]>("AUTHOR");
  const [currency, setCurrency] = useState<"VND" | "USD">("VND");

  // Core Identity State
  const [basicInfo, setBasicInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    affiliation: "",
    country: "Vietnam",
    avatarUrl: "",
    paymentMethod: "PAYOO_VIETQR" as "PAYOO_VIETQR" | "PAYOO_CARD",
  });

  // Unstructured JSON formData State
  const [jsonForm, setJsonForm] = useState<UnstructuredRegistrationFormData>({
    paperId: "",
    paperTitle: "",
    secondaryPaperId: "",
    extraPagesCount: 0,
    extraBanquetTickets: 0,
    ieeeMemberNumber: "",
    proofDocumentUrl: "",
    passportNumber: "",
    passportIssueDate: "",
    passportExpiryDate: "",
    nationality: "Vietnam",
    embassyCity: "",
    passportScanUrl: "",
    needsVisaSupport: false,
    dietaryRequirement: "Normal",
    allergyDetails: "",
    arrivalFlight: "",
    arrivalDateTime: "",
    departureFlight: "",
    departureDateTime: "",
    hotelName: "",
    airportShuttleRequired: false,
    travelNotes: "",
    invoiceCompanyName: "",
    invoiceTaxCode: "",
    invoiceAddress: "",
    customFields: {},
  });

  const [customKey, setCustomKey] = useState("");
  const [customVal, setCustomVal] = useState("");

  const [loading, setLoading] = useState(false);
  const [simulatingPayoo, setSimulatingPayoo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registeredData, setRegisteredData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Pre-fill from logged-in user profile if authenticated
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json?.success && json.data?.user) {
          const u = json.data.user;
          const p =
            u.profileData && typeof u.profileData === "object" ? u.profileData : {};
          setBasicInfo((prev) => ({
            ...prev,
            fullName: u.name || prev.fullName,
            email: u.email || prev.email,
            avatarUrl: u.avatar || prev.avatarUrl,
            phone: p.phone || prev.phone,
            affiliation: p.affiliation || prev.affiliation,
            country: p.country || prev.country,
          }));
          setJsonForm((prev) => ({
            ...prev,
            ieeeMemberNumber: p.ieeeMemberNumber || prev.ieeeMemberNumber,
            passportNumber: p.passportNumber || prev.passportNumber,
            passportIssueDate: p.passportIssueDate || prev.passportIssueDate,
            passportExpiryDate: p.passportExpiryDate || prev.passportExpiryDate,
            nationality: p.nationality || p.country || prev.nationality,
            passportScanUrl: p.passportScanUrl || prev.passportScanUrl,
            proofDocumentUrl: p.proofDocumentUrl || prev.proofDocumentUrl,
            dietaryRequirement: p.dietaryRequirement || prev.dietaryRequirement,
            invoiceCompanyName: p.invoiceCompanyName || prev.invoiceCompanyName,
            invoiceTaxCode: p.invoiceTaxCode || prev.invoiceTaxCode,
            invoiceAddress: p.invoiceAddress || prev.invoiceAddress,
            customFields: p.customFields || prev.customFields || {},
          }));
        }
      })
      .catch(() => null);
  }, []);

  const activeTier = REGISTRATION_FEES[selectedTier];
  const baseFee = currency === "VND" ? activeTier.vnd : activeTier.usd;
  const extraPageTotal =
    Math.max(0, Number(jsonForm.extraPagesCount || 0)) *
    (currency === "VND" ? EXTRA_PAGE_RATE.VND : EXTRA_PAGE_RATE.USD);
  const extraBanquetTotal =
    Math.max(0, Number(jsonForm.extraBanquetTickets || 0)) *
    (currency === "VND" ? EXTRA_BANQUET_RATE.VND : EXTRA_BANQUET_RATE.USD);
  const computedTotalFee = baseFee + extraPageTotal + extraBanquetTotal;

  const formatMoney = (amount: number) =>
    currency === "VND" ? formatVND(amount) : formatUSD(amount);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const addCustomField = () => {
    const k = customKey.trim();
    if (!k) return;
    setJsonForm((prev) => ({
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
    setJsonForm((prev) => {
      const next = { ...(prev.customFields || {}) };
      delete next[key];
      return { ...prev, customFields: next };
    });
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!basicInfo.fullName.trim()) {
      setErrorMsg("Please enter the delegate full name.");
      return;
    }
    if (!basicInfo.email.trim() || !basicInfo.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!basicInfo.affiliation.trim()) {
      setErrorMsg("Please enter your university or organization affiliation.");
      return;
    }
    if (selectedTier === "AUTHOR" && !jsonForm.paperId?.trim()) {
      setErrorMsg("Author delegates must provide an accepted PaperCept Paper ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: basicInfo.fullName,
          email: basicInfo.email,
          phone: basicInfo.phone,
          affiliation: basicInfo.affiliation,
          country: basicInfo.country,
          avatarUrl: basicInfo.avatarUrl || null,
          participantType: selectedTier,
          paymentMethod: basicInfo.paymentMethod,
          currency,
          paperId: jsonForm.paperId,
          paperTitle: jsonForm.paperTitle,
          passportNumber: jsonForm.passportNumber,
          needsVisaSupport: jsonForm.needsVisaSupport,
          dietaryRequirement: jsonForm.dietaryRequirement,
          travelNotes: jsonForm.travelNotes,
          formData: jsonForm,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Unable to complete registration.");
      }

      setRegisteredData(json.data);
      setCurrentStep("PAYMENT");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "A server connection error occurred."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatePayooPayment = async () => {
    if (!registeredData?.registration?.registrationCode) return;
    setSimulatingPayoo(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/payment/payoo/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationCode: registeredData.registration.registrationCode,
          method: basicInfo.paymentMethod,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Payoo payment confirmation failed");
      }

      setRegisteredData((prev: any) => ({
        ...prev,
        registration: json.data.registration,
      }));
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to complete temporary Payoo payment"
      );
    } finally {
      setSimulatingPayoo(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/70 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <SectionContainer id="reg-header" fullWidthBg="bg-white" className="py-10 sm:py-12">
          <div className="max-w-4xl space-y-3">
            <Badge variant="ute" className="px-3 py-1">
              <ShieldCheck className="size-3.5" />
              Official Delegate Registration
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Conference Registration <span className="text-[#005496]">IEEE SMC 2027</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600">
              Ho Chi Minh City, Vietnam · October 6–10, 2027. Complete your registration to receive your delegate code, Payoo checkout, and Visa Support Letter.
            </p>

            {/* Stepper */}
            <div className="pt-4 grid grid-cols-3 gap-3 max-w-2xl text-xs sm:text-sm font-bold">
              <div
                className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                  currentStep === "TIER"
                    ? "bg-blue-50/80 border-[#005496] text-[#005496]"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                <span className="size-6 rounded-full flex items-center justify-center bg-current text-white text-xs">
                  1
                </span>
                <span className="truncate">Category & Fee</span>
              </div>

              <div
                className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                  currentStep === "INFO"
                    ? "bg-blue-50/80 border-[#005496] text-[#005496]"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                <span className="size-6 rounded-full flex items-center justify-center bg-current text-white text-xs">
                  2
                </span>
                <span className="truncate">Delegate Profile</span>
              </div>

              <div
                className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                  currentStep === "PAYMENT"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-500"
                }`}
              >
                <span className="size-6 rounded-full flex items-center justify-center bg-current text-white text-xs">
                  3
                </span>
                <span className="truncate">Payoo Checkout</span>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="reg-content" fullWidthBg="transparent" className="pt-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: CATEGORY & FEE */}
        {currentStep === "TIER" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  1. Select Delegate Category
                </h2>
                <p className="text-sm text-slate-500">
                  Registration fees cover technical sessions, proceedings, delegate kit, and gala banquet.
                </p>
              </div>

              <div className="inline-flex items-center bg-white border border-slate-200 rounded-xl p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCurrency("VND")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    currency === "VND"
                      ? "bg-[#005496] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  VND
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-3.5 py-1.5 rounded-lg cursor-pointer transition-colors ${
                    currency === "USD"
                      ? "bg-[#005496] text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  USD
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {(Object.keys(REGISTRATION_FEES) as Array<FeeTier["id"]>).map((key) => {
                const tier = REGISTRATION_FEES[key];
                const isSelected = selectedTier === key;

                return (
                  <div
                    key={key}
                    onClick={() => setSelectedTier(key)}
                    className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-[#005496] bg-white shadow-lg ring-4 ring-[#005496]/10"
                        : "border-slate-200 bg-white/90 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <Badge variant={isSelected ? "ute" : "secondary"}>
                          {tier.badge}
                        </Badge>
                        {isSelected && <CheckCircle2 className="size-5 text-[#005496]" />}
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 mb-1">
                        {tier.label}
                      </h3>
                      <p className="text-xs text-slate-500 mb-5">{tier.description}</p>
                    </div>

                    <div>
                      <div className="pt-4 border-t border-slate-100 mb-4">
                        <div className="text-2xl font-black text-slate-900">
                          {currency === "VND" ? formatVND(tier.vnd) : formatUSD(tier.usd)}
                        </div>
                        <div className="text-xs text-slate-400 font-medium">
                          Equivalent to{" "}
                          {currency === "VND" ? formatUSD(tier.usd) : formatVND(tier.vnd)}
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-600">
                        {tier.features.map((perk: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{perk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="ute"
                size="lg"
                onClick={() => {
                  setCurrentStep("INFO");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Continue to Delegate Details
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: JSON-BASED DELEGATE DETAILS & MEDIA UPLOADS */}
        {currentStep === "INFO" && (
          <form onSubmit={handleSubmitRegistration} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              {/* 1. Core Relational Identity & Badge Avatar */}
              <Card>
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <User className="size-5 text-[#005496]" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Core Delegate Identity & Badge Photo
                    </h3>
                    <p className="text-xs text-slate-500">
                      Primary identity fields linked to your conference badge and user account
                    </p>
                  </div>
                </div>

                <ImageUploadField
                  label="Delegate Badge Photo"
                  description="Upload a portrait photo or select from the Media Library for your printed conference badge."
                  value={basicInfo.avatarUrl}
                  onChange={(url) => setBasicInfo((prev) => ({ ...prev, avatarUrl: url }))}
                  folder="public/avatars"
                  accept="image/*"
                  aspect="square"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Full Name *</Label>
                    <Input
                      required
                      placeholder="Prof. Nguyen Van A"
                      value={basicInfo.fullName}
                      onChange={(e) =>
                        setBasicInfo((prev) => ({ ...prev, fullName: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Email Address *</Label>
                    <Input
                      type="email"
                      required
                      placeholder="delegate@university.edu"
                      value={basicInfo.email}
                      onChange={(e) =>
                        setBasicInfo((prev) => ({ ...prev, email: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Phone / Mobile</Label>
                    <Input
                      placeholder="+84 901 234 567"
                      value={basicInfo.phone}
                      onChange={(e) =>
                        setBasicInfo((prev) => ({ ...prev, phone: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Country / Region *</Label>
                    <Input
                      required
                      placeholder="Vietnam, China, Japan, USA..."
                      value={basicInfo.country}
                      onChange={(e) =>
                        setBasicInfo((prev) => ({ ...prev, country: e.target.value }))
                      }
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label>University / Organization Affiliation *</Label>
                    <Input
                      required
                      placeholder="Ho Chi Minh City University of Technology and Education"
                      value={basicInfo.affiliation}
                      onChange={(e) =>
                        setBasicInfo((prev) => ({ ...prev, affiliation: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* 2. PaperCept & Academic Verification (JSON formData) */}
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
                    <Label>
                      PaperCept Paper ID {selectedTier === "AUTHOR" ? "*" : ""}
                    </Label>
                    <Input
                      required={selectedTier === "AUTHOR"}
                      placeholder="SMC27-1042"
                      value={jsonForm.paperId || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({ ...prev, paperId: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>IEEE Membership Number</Label>
                    <Input
                      placeholder="98765432"
                      value={jsonForm.ieeeMemberNumber || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          ieeeMemberNumber: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label>Accepted Paper Title</Label>
                    <Input
                      placeholder="Cybernetic Human-Machine Teaming for Autonomous Systems..."
                      value={jsonForm.paperTitle || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({ ...prev, paperTitle: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Extra Pages Beyond 6 Pages</Label>
                    <Input
                      type="number"
                      min={0}
                      max={4}
                      value={jsonForm.extraPagesCount || 0}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          extraPagesCount: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Additional Gala Banquet Tickets</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      value={jsonForm.extraBanquetTickets || 0}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          extraBanquetTickets: Number(e.target.value || 0),
                        }))
                      }
                    />
                  </div>
                </div>

                <ImageUploadField
                  label="IEEE Membership / Student ID / PaperCept Proof"
                  description="Upload image or PDF proof of IEEE membership, student status, or PaperCept acceptance letter."
                  value={jsonForm.proofDocumentUrl || ""}
                  onChange={(url) =>
                    setJsonForm((prev) => ({ ...prev, proofDocumentUrl: url }))
                  }
                  folder="public/proofs"
                  accept="image/*,application/pdf"
                  aspect="document"
                />
              </Card>

              {/* 3. Passport & Visa Support Letter (JSON formData) */}
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
                      checked={Boolean(jsonForm.needsVisaSupport)}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          needsVisaSupport: e.target.checked,
                        }))
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
                      value={jsonForm.passportNumber || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          passportNumber: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Nationality</Label>
                    <Input
                      placeholder="Nationality on passport"
                      value={jsonForm.nationality || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({ ...prev, nationality: e.target.value }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Passport Issue Date</Label>
                    <Input
                      type="date"
                      value={jsonForm.passportIssueDate || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
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
                      value={jsonForm.passportExpiryDate || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          passportExpiryDate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label>Vietnamese Embassy / Consulate City for Visa Application</Label>
                    <Input
                      placeholder="Beijing, Shanghai, Tokyo, Seoul, Frankfurt..."
                      value={jsonForm.embassyCity || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({ ...prev, embassyCity: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {jsonForm.needsVisaSupport && (
                  <ImageUploadField
                    label="Passport Biographical Page Scan"
                    description="Upload a clear scan or photo of your passport information page for Admin verification."
                    value={jsonForm.passportScanUrl || ""}
                    onChange={(url) =>
                      setJsonForm((prev) => ({ ...prev, passportScanUrl: url }))
                    }
                    folder="private/passports"
                    accept="image/*,application/pdf"
                    aspect="document"
                  />
                )}
              </Card>

              {/* 4. Dietary & Flight / Hotel Logistics (JSON formData) */}
              <Card>
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Plane className="size-5 text-[#005496]" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Dietary Preferences & Travel Logistics
                    </h3>
                    <p className="text-xs text-slate-500">
                      Catering and airport shuttle coordination in Ho Chi Minh City
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Dietary Preference</Label>
                    <select
                      value={jsonForm.dietaryRequirement || "Normal"}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          dietaryRequirement: e.target.value,
                        }))
                      }
                      className="flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900"
                    >
                      <option value="Normal">Standard Menu</option>
                      <option value="Vegetarian">Vegetarian</option>
                      <option value="Halal">Halal Certified</option>
                      <option value="Vegan">Strict Vegan</option>
                      <option value="Gluten-Free">Gluten-Free</option>
                      <option value="Allergy">Food Allergy</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Allergy / Special Catering Notes</Label>
                    <Input
                      placeholder="Peanut allergy, lactose intolerance..."
                      value={jsonForm.allergyDetails || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          allergyDetails: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Arrival Flight Number</Label>
                    <Input
                      placeholder="VN210 / CZ3069"
                      value={jsonForm.arrivalFlight || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          arrivalFlight: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Arrival Date & Time</Label>
                    <Input
                      type="datetime-local"
                      value={jsonForm.arrivalDateTime || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          arrivalDateTime: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Hotel in Ho Chi Minh City</Label>
                    <Input
                      placeholder="Rex Hotel Saigon / Majestic Saigon..."
                      value={jsonForm.hotelName || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({ ...prev, hotelName: e.target.value }))
                      }
                    />
                  </div>

                  <div className="flex items-end pb-2">
                    <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(jsonForm.airportShuttleRequired)}
                        onChange={(e) =>
                          setJsonForm((prev) => ({
                            ...prev,
                            airportShuttleRequired: e.target.checked,
                          }))
                        }
                        className="size-4 accent-[#005496] rounded"
                      />
                      Request Tan Son Nhat Airport Shuttle Info
                    </label>
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label>Additional Travel Notes</Label>
                    <Textarea
                      placeholder="Any special accessibility or arrival notes..."
                      value={jsonForm.travelNotes || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({ ...prev, travelNotes: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* 5. Tax Invoice & Custom Dynamic JSON Fields */}
              <Card>
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <Receipt className="size-5 text-[#005496]" />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Institutional Invoice & Custom JSON Metadata
                    </h3>
                    <p className="text-xs text-slate-500">
                      Billing information for your university reimbursement and custom key-value attributes
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label>Billing Organization Name</Label>
                    <Input
                      placeholder="Organization name for receipt"
                      value={jsonForm.invoiceCompanyName || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          invoiceCompanyName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tax Code / VAT Number</Label>
                    <Input
                      placeholder="0301234567"
                      value={jsonForm.invoiceTaxCode || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          invoiceTaxCode: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1.5">
                    <Label>Billing Address</Label>
                    <Input
                      placeholder="Full institutional billing address"
                      value={jsonForm.invoiceAddress || ""}
                      onChange={(e) =>
                        setJsonForm((prev) => ({
                          ...prev,
                          invoiceAddress: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* Unstructured Custom Key-Value Builder */}
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <Label>Additional Unstructured JSON Attributes</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Attribute key, e.g. GrantNumber"
                      value={customKey}
                      onChange={(e) => setCustomKey(e.target.value)}
                      className="sm:w-1/3"
                    />
                    <Input
                      placeholder="Value, e.g. NSFC-2027-8821"
                      value={customVal}
                      onChange={(e) => setCustomVal(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" onClick={addCustomField}>
                      <Plus className="size-4" />
                      Add Field
                    </Button>
                  </div>

                  {jsonForm.customFields &&
                    Object.keys(jsonForm.customFields).length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {Object.entries(jsonForm.customFields).map(([k, v]) => (
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
              </Card>
            </div>

            {/* Right Sticky Summary */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="sticky top-24">
                <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Registration Fee Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category</span>
                    <span className="font-bold text-slate-900">{activeTier.label}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base Registration</span>
                    <span className="font-semibold text-slate-800">
                      {formatMoney(baseFee)}
                    </span>
                  </div>
                  {extraPageTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Extra Pages × {jsonForm.extraPagesCount}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatMoney(extraPageTotal)}
                      </span>
                    </div>
                  )}
                  {extraBanquetTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">
                        Extra Banquet × {jsonForm.extraBanquetTickets}
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatMoney(extraBanquetTotal)}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                    <span className="font-bold text-slate-900">Total Payable</span>
                    <span className="text-xl font-black text-[#005496]">
                      {formatMoney(computedTotalFee)}
                    </span>
                  </div>
                </div>

                {/* Payoo Method Selector */}
                <div className="space-y-2 pt-2">
                  <Label>Select Payoo Payment Channel</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setBasicInfo((prev) => ({
                          ...prev,
                          paymentMethod: "PAYOO_VIETQR",
                        }))
                      }
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        basicInfo.paymentMethod === "PAYOO_VIETQR"
                          ? "border-[#005496] bg-blue-50/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <QrCode className="size-5 text-[#005496] shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Payoo Dynamic VietQR
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Instant NAPAS 24/7 bank transfer
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setBasicInfo((prev) => ({
                          ...prev,
                          paymentMethod: "PAYOO_CARD",
                        }))
                      }
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        basicInfo.paymentMethod === "PAYOO_CARD"
                          ? "border-[#005496] bg-blue-50/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <CreditCard className="size-5 text-[#005496] shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          Payoo International Card
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Visa, Mastercard, JCB, UnionPay
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <Button
                    type="submit"
                    variant="ute"
                    size="lg"
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Submitting Registration...
                      </>
                    ) : (
                      <>
                        Proceed to Payoo Checkout
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCurrentStep("TIER")}
                    className="w-full"
                  >
                    <ArrowLeft className="size-4" />
                    Back to Categories
                  </Button>
                </div>
              </Card>
            </div>
          </form>
        )}

        {/* STEP 3: PAYOO CHECKOUT & INSTANT CONFIRMATION */}
        {currentStep === "PAYMENT" && registeredData && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <Badge
                      variant={
                        registeredData.registration.paymentStatus === "PAID"
                          ? "success"
                          : "warning"
                      }
                    >
                      {registeredData.registration.paymentStatus === "PAID"
                        ? "PAYMENT CONFIRMED"
                        : "AWAITING PAYOO PAYMENT"}
                    </Badge>
                    <h2 className="text-xl font-extrabold text-slate-900 mt-2">
                      Payoo Payment Gateway —{" "}
                      {registeredData.registration.registrationCode}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase">
                      Amount Due
                    </p>
                    <p className="text-xl font-black text-[#005496]">
                      {registeredData.registration.currency === "VND"
                        ? formatVND(registeredData.registration.feeAmount)
                        : formatUSD(registeredData.registration.feeAmount)}
                    </p>
                  </div>
                </div>

                {registeredData.registration.paymentStatus === "PAID" ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3">
                    <CheckCircle2 className="size-12 text-emerald-600 mx-auto" />
                    <h3 className="text-lg font-extrabold text-emerald-950">
                      Payoo Payment Completed & Verified
                    </h3>
                    <p className="text-xs text-emerald-800 max-w-md mx-auto">
                      Transaction Reference:{" "}
                      <strong>{registeredData.registration.transactionRef}</strong>. A confirmation email with your receipt link has been dispatched to{" "}
                      <strong>{registeredData.registration.email}</strong>.
                    </p>
                    <div className="pt-2">
                      <Link
                        href={`/portal?code=${encodeURIComponent(
                          registeredData.registration.registrationCode
                        )}`}
                      >
                        <Button variant="ute">
                          Open Delegate Portal & Download Receipt
                          <ArrowRight className="size-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                      <div className="flex flex-col items-center p-4 rounded-2xl border border-slate-200 bg-slate-50">
                        <img
                          src={registeredData.payment.vietQrUrl}
                          alt="Payoo VietQR"
                          className="w-52 h-52 object-contain rounded-xl bg-white p-2 border border-slate-200"
                        />
                        <span className="text-[11px] font-bold text-slate-500 mt-2">
                          Scan with any banking app or Payoo QR
                        </span>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                          <span className="text-slate-400 block font-bold uppercase text-[10px]">
                            Beneficiary Bank
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {CONFERENCE_BANK_INFO.bankName}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                          <div>
                            <span className="text-slate-400 block font-bold uppercase text-[10px]">
                              Account Number
                            </span>
                            <span className="font-mono font-bold text-slate-900 text-sm">
                              {CONFERENCE_BANK_INFO.accountNo}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy("acc", CONFERENCE_BANK_INFO.accountNo)
                            }
                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600"
                          >
                            {copiedKey === "acc" ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>

                        <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                          <div>
                            <span className="text-[#005496] block font-bold uppercase text-[10px]">
                              Required Transfer Memo
                            </span>
                            <span className="font-mono font-extrabold text-[#005496] text-sm">
                              {registeredData.payment.transferSyntax}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                "memo",
                                registeredData.payment.transferSyntax
                              )
                            }
                            className="p-1.5 rounded-lg bg-white border border-blue-200 text-[#005496]"
                          >
                            {copiedKey === "memo" ? (
                              <Check className="size-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Temporary Payoo Instant Completion Sandbox */}
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-wider text-amber-900">
                          Temporary Payoo Sandbox Reconciliation
                        </p>
                        <p className="text-xs text-amber-800 mt-0.5">
                          Simulate instant Payoo webhook confirmation to mark this registration as PAID and dispatch the milestone receipt email.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ute"
                        disabled={simulatingPayoo}
                        onClick={handleSimulatePayooPayment}
                      >
                        {simulatingPayoo ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="size-4" />
                        )}
                        Complete Temporary Payoo Payment
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <Card className="text-center items-center">
                <Badge variant="ute">Digital Conference Badge</Badge>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {registeredData.registration.fullName}
                </h3>
                <p className="text-xs text-slate-500 -mt-3">
                  {registeredData.registration.affiliation} ·{" "}
                  {registeredData.registration.country}
                </p>

                {registeredData.badgeQrUrl && (
                  <img
                    src={registeredData.badgeQrUrl}
                    alt="Badge QR"
                    className="w-44 h-44 mx-auto rounded-2xl border border-slate-200 p-2 bg-white"
                  />
                )}

                <div className="font-mono text-base font-black text-[#005496] bg-blue-50 px-4 py-1.5 rounded-xl border border-blue-200">
                  {registeredData.registration.registrationCode}
                </div>

                <Link
                  href={`/portal?code=${encodeURIComponent(
                    registeredData.registration.registrationCode
                  )}`}
                  className="w-full"
                >
                  <Button variant="outline" className="w-full">
                    Go to Delegate Profile Portal
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </SectionContainer>
    </main>
  );
}
