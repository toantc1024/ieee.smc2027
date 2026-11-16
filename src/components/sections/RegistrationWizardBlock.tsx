"use client";

import React, { useMemo, useState, useEffect } from "react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import { StatusAlertBanner } from "@/components/shared/StatusAlertBanner";
import {
  RegistrationStepperHeader,
  RegistrationStep,
} from "@/components/registration/RegistrationStepperHeader";
import { CategorySelectionStep } from "@/components/registration/CategorySelectionStep";
import {
  DelegateIdentitySection,
  BasicIdentityState,
} from "@/components/registration/DelegateIdentitySection";
import { PaperceptSubmissionSection } from "@/components/registration/PaperceptSubmissionSection";
import { PassportVisaSection } from "@/components/registration/PassportVisaSection";
import { DietaryTravelSection } from "@/components/registration/DietaryTravelSection";
import { InvoiceCustomJsonSection } from "@/components/registration/InvoiceCustomJsonSection";
import { RegistrationFeeSummaryCard } from "@/components/registration/RegistrationFeeSummaryCard";
import { PayooCheckoutStep } from "@/components/registration/PayooCheckoutStep";
import {
  REGISTRATION_FEES,
  FeeTier,
  formatVND,
  formatUSD,
} from "@/lib/conference-registration";
import type { UnstructuredRegistrationFormData } from "@/types";

export interface EditableRegistrationTier {
  id: FeeTier["id"];
  label: string;
  badge: string;
  vnd: number;
  usd: number;
  description: string;
  requiresPaper?: boolean;
  features: Array<{ text: string }>;
}

export const DEFAULT_EDITABLE_REGISTRATION_TIERS: EditableRegistrationTier[] =
  (Object.values(REGISTRATION_FEES) as FeeTier[]).map((tier) => ({
    id: tier.id,
    label: tier.label,
    badge: tier.badge,
    vnd: tier.vnd,
    usd: tier.usd,
    description: tier.description,
    requiresPaper: tier.requiresPaper,
    features: tier.features.map((text) => ({ text })),
  }));

export interface RegistrationWizardBlockProps {
  title?: string;
  subtitle?: string;
  continueLabel?: string;
  defaultCurrency?: "VND" | "USD";
  extraPageVnd?: number;
  extraPageUsd?: number;
  extraBanquetVnd?: number;
  extraBanquetUsd?: number;
  tiers?: EditableRegistrationTier[];
}

export function RegistrationWizardBlock({
  title = "1. Select Delegate Category",
  subtitle = "Registration fees cover technical sessions, proceedings, delegate kit, and gala banquet.",
  continueLabel = "Continue to Delegate Details",
  defaultCurrency = "VND",
  extraPageVnd = 3750000,
  extraPageUsd = 150,
  extraBanquetVnd = 2250000,
  extraBanquetUsd = 90,
  tiers = DEFAULT_EDITABLE_REGISTRATION_TIERS,
}: RegistrationWizardBlockProps) {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>("TIER");
  const [selectedTier, setSelectedTier] = useState<FeeTier["id"]>("AUTHOR");
  const [currency, setCurrency] = useState<"VND" | "USD">(defaultCurrency);

  useEffect(() => {
    setCurrency(defaultCurrency);
  }, [defaultCurrency]);

  const normalizedTiers = useMemo<FeeTier[]>(() => {
    if (!Array.isArray(tiers) || tiers.length === 0) {
      return Object.values(REGISTRATION_FEES) as FeeTier[];
    }
    return tiers.map((t, index) => {
      const fallback =
        REGISTRATION_FEES[t.id] ||
        (Object.values(REGISTRATION_FEES)[index] as FeeTier) ||
        REGISTRATION_FEES.AUTHOR;
      return {
        id: t.id || fallback.id,
        label: t.label || fallback.label,
        badge: t.badge || fallback.badge,
        vnd: Number(t.vnd) || fallback.vnd,
        usd: Number(t.usd) || fallback.usd,
        description: t.description ?? fallback.description,
        requiresPaper: t.requiresPaper ?? fallback.requiresPaper,
        features: Array.isArray(t.features)
          ? t.features
              .map((f) => (typeof f === "string" ? f : f?.text || ""))
              .filter(Boolean)
          : fallback.features,
      };
    });
  }, [tiers]);

  const [basicInfo, setBasicInfo] = useState<BasicIdentityState>({
    fullName: "",
    email: "",
    phone: "",
    affiliation: "",
    country: "Vietnam",
    avatarUrl: "",
    paymentMethod: "PAYOO_VIETQR",
  });

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

  const [loading, setLoading] = useState(false);
  const [simulatingPayoo, setSimulatingPayoo] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registeredData, setRegisteredData] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
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

  const activeTier =
    normalizedTiers.find((t) => t.id === selectedTier) ||
    normalizedTiers[0] ||
    REGISTRATION_FEES.AUTHOR;

  const baseFee = currency === "VND" ? activeTier.vnd : activeTier.usd;
  const extraPageTotal =
    Math.max(0, Number(jsonForm.extraPagesCount || 0)) *
    (currency === "VND" ? Number(extraPageVnd) : Number(extraPageUsd));
  const extraBanquetTotal =
    Math.max(0, Number(jsonForm.extraBanquetTickets || 0)) *
    (currency === "VND" ? Number(extraBanquetVnd) : Number(extraBanquetUsd));
  const computedTotalFee = baseFee + extraPageTotal + extraBanquetTotal;

  const formatMoney = (amount: number) =>
    currency === "VND" ? formatVND(amount) : formatUSD(amount);

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
    if (activeTier.requiresPaper && !jsonForm.paperId?.trim()) {
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
        err instanceof Error ? err.message : "Failed to complete Payoo payment"
      );
    } finally {
      setSimulatingPayoo(false);
    }
  };

  return (
    <div className="w-full bg-slate-50/70 pb-14">
      <RegistrationStepperHeader currentStep={currentStep} />

      <SectionContainer id="reg-content" fullWidthBg="transparent" className="pt-8">
        {errorMsg && (
          <div className="mb-6">
            <StatusAlertBanner
              variant="error"
              message={errorMsg}
              onDismiss={() => setErrorMsg("")}
            />
          </div>
        )}

        {currentStep === "TIER" && (
          <CategorySelectionStep
            selectedTier={selectedTier}
            currency={currency}
            tiers={normalizedTiers}
            heading={title}
            subheading={subtitle}
            continueLabel={continueLabel}
            onSelectTier={setSelectedTier}
            onChangeCurrency={setCurrency}
            onNext={() => {
              setCurrentStep("INFO");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}

        {currentStep === "INFO" && (
          <form
            onSubmit={handleSubmitRegistration}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            <div className="lg:col-span-8 space-y-6">
              <DelegateIdentitySection
                value={basicInfo}
                onChange={setBasicInfo}
              />

              <PaperceptSubmissionSection
                isAuthorTier={selectedTier === "AUTHOR"}
                formData={jsonForm}
                onChange={setJsonForm}
              />

              <PassportVisaSection
                formData={jsonForm}
                onChange={setJsonForm}
              />

              <DietaryTravelSection
                formData={jsonForm}
                onChange={setJsonForm}
              />

              <InvoiceCustomJsonSection
                formData={jsonForm}
                onChange={setJsonForm}
              />
            </div>

            <div className="lg:col-span-4 space-y-6">
              <RegistrationFeeSummaryCard
                categoryLabel={activeTier.label}
                baseFeeFormatted={formatMoney(baseFee)}
                extraPagesCount={Number(jsonForm.extraPagesCount || 0)}
                extraPageTotalFormatted={
                  extraPageTotal > 0 ? formatMoney(extraPageTotal) : null
                }
                extraBanquetTickets={Number(jsonForm.extraBanquetTickets || 0)}
                extraBanquetTotalFormatted={
                  extraBanquetTotal > 0 ? formatMoney(extraBanquetTotal) : null
                }
                computedTotalFormatted={formatMoney(computedTotalFee)}
                paymentMethod={basicInfo.paymentMethod}
                loading={loading}
                onChangePaymentMethod={(paymentMethod) =>
                  setBasicInfo((prev) => ({ ...prev, paymentMethod }))
                }
                onBack={() => setCurrentStep("TIER")}
              />
            </div>
          </form>
        )}

        {currentStep === "PAYMENT" && registeredData && (
          <PayooCheckoutStep
            registeredData={registeredData}
            simulatingPayoo={simulatingPayoo}
            onSimulatePayoo={handleSimulatePayooPayment}
          />
        )}
      </SectionContainer>
    </div>
  );
}
