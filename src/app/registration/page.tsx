"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CreditCard,
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
  Download,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Plane,
  Utensils,
  BookOpen,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import {
  REGISTRATION_FEES,
  CONFERENCE_BANK_INFO,
  FeeTier,
  formatVND,
  formatUSD,
  getVietQrUrl,
  getTransferSyntax,
} from "@/lib/conference-registration";

type Step = "TIER" | "INFO" | "PAYMENT" | "SUCCESS";

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState<Step>("TIER");
  const [selectedTier, setSelectedTier] = useState<FeeTier["id"]>("AUTHOR");
  const [currency, setCurrency] = useState<"VND" | "USD">("VND");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    affiliation: "",
    country: "Vietnam",
    paperId: "",
    paperTitle: "",
    passportNumber: "",
    needsVisaSupport: false,
    dietaryRequirement: "None",
    travelNotes: "",
    paymentMethod: "VIETQR",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [registeredData, setRegisteredData] = useState<any>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const activeTier = REGISTRATION_FEES[selectedTier];

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleNextFromTier = () => {
    setCurrentStep("INFO");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToTier = () => {
    setCurrentStep("TIER");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToInfo = () => {
    setCurrentStep("INFO");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Validate
    if (!formData.fullName.trim()) {
      setErrorMsg("Vui lòng nhập họ và tên đại biểu.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }
    if (!formData.affiliation.trim()) {
      setErrorMsg("Vui lòng nhập đơn vị công tác / trường đại học.");
      return;
    }
    if (selectedTier === "AUTHOR" && !formData.paperId.trim()) {
      setErrorMsg("Đại biểu Tác giả bắt buộc phải nhập Mã bài báo (Paper ID).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          participantType: selectedTier,
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể đăng ký. Vui lòng thử lại.");
      }

      setRegisteredData(data);
      setCurrentStep("PAYMENT");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMsg(err.message || "Đã xảy ra lỗi kết nối máy chủ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50/60 pb-20">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <SectionContainer id="reg-header" fullWidthBg="bg-white" className="py-10 sm:py-14">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#115eff] border border-blue-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cổng Đăng Ký Đại Biểu Chính Thức</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Đăng Ký Tham Dự <span className="text-[#115eff]">IEEE SMC 2027</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 font-medium">
              Ho Chi Minh City, Vietnam • October 6–10, 2027. Vui lòng chọn phân loại đại biểu và hoàn tất biểu mẫu để nhận mã định danh, VietQR thanh toán tự động và thư hỗ trợ Visa.
            </p>

            {/* Stepper Bar */}
            <div className="pt-6">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl text-xs sm:text-sm font-semibold">
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                    currentStep === "TIER"
                      ? "bg-blue-50 border-[#115eff] text-[#115eff]"
                      : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-current text-white text-xs font-bold shrink-0">
                    1
                  </span>
                  <span className="truncate">Phân loại & Lệ phí</span>
                </div>

                <div
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                    currentStep === "INFO"
                      ? "bg-blue-50 border-[#115eff] text-[#115eff]"
                      : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-current text-white text-xs font-bold shrink-0">
                    2
                  </span>
                  <span className="truncate">Hồ sơ Đại biểu</span>
                </div>

                <div
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all ${
                    currentStep === "PAYMENT" || currentStep === "SUCCESS"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                      : "bg-white border-slate-200 text-slate-500"
                  }`}
                >
                  <span className="w-6 h-6 rounded-full flex items-center justify-center bg-current text-white text-xs font-bold shrink-0">
                    3
                  </span>
                  <span className="truncate">VietQR Thanh toán</span>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="reg-content" fullWidthBg="transparent" className="pt-8">
        {/* Error notification banner */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            STEP 1: SELECT TIER & FEE
        ════════════════════════════════════════════════════════════════ */}
        {currentStep === "TIER" && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  1. Chọn Hạng mục Đại biểu
                </h2>
                <p className="text-sm text-slate-500">
                  Lệ phí bao gồm toàn bộ quyền lợi tham dự khoa học, kỷ yếu, tài liệu và tiệc ngoại giao.
                </p>
              </div>

              {/* Currency Selector */}
              <div className="inline-flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setCurrency("VND")}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                    currency === "VND"
                      ? "bg-[#115eff] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  VNĐ (Napas 24/7)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1.5 rounded-md cursor-pointer transition-colors ${
                    currency === "USD"
                      ? "bg-[#115eff] text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  USD (International)
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
                        ? "border-[#115eff] bg-white shadow-lg ring-4 ring-blue-50"
                        : "border-slate-200 bg-white hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            isSelected
                              ? "bg-blue-100 text-[#115eff]"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {tier.badge}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-[#115eff] bg-[#115eff] text-white"
                              : "border-slate-300"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                        {tier.label}
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                        {tier.description}
                      </p>

                      <div className="my-4 py-3 border-y border-slate-100">
                        <div className="text-2xl font-black text-[#115eff]">
                          {currency === "VND" ? formatVND(tier.vnd) : formatUSD(tier.usd)}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {currency === "VND"
                            ? `Tương đương ${formatUSD(tier.usd)}`
                            : `Tương đương ${formatVND(tier.vnd)}`}
                        </div>
                      </div>

                      <ul className="space-y-2 text-xs text-slate-600">
                        {tier.features.map((feat, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleNextFromTier}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#115eff] text-white hover:bg-[#0a4de6]"
                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}
                      >
                        <span>{isSelected ? "Tiếp tục điền hồ sơ" : "Chọn gói này"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            STEP 2: PARTICIPANT INFORMATION FORM
        ════════════════════════════════════════════════════════════════ */}
        {currentStep === "INFO" && (
          <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Bước 2/3
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Thông Tin Đại Biểu & Nhu Cầu Tham Dự
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 block">Đang chọn:</span>
                <span className="font-bold text-[#115eff] text-sm">
                  {activeTier.label}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitRegistration} className="mt-8 space-y-6">
              {/* If AUTHOR tier, prompt for Paper ID & Title */}
              {selectedTier === "AUTHOR" && (
                <div className="p-4 sm:p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#004776]">
                    <FileText className="w-4 h-4 text-[#115eff]" />
                    <span>Thông tin Bài Báo (Dành cho Tác giả)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Mã Bài Báo (Paper ID) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ví dụ: SMC2027-142"
                        value={formData.paperId}
                        onChange={(e) => setFormData({ ...formData, paperId: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tiêu Đề Bài Báo (Paper Title)
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Deep Reinforcement Learning for Cyber-Physical Systems..."
                        value={formData.paperTitle}
                        onChange={(e) => setFormData({ ...formData, paperTitle: e.target.value })}
                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Họ và Tên (Full Name) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Nguyen Van A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Tên sẽ được in trực tiếp lên Thẻ đại biểu & Giấy chứng nhận
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="email@organization.edu.vn"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                    />
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Nhận mã tham dự, biên lai điện tử & thông báo khẩn
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Điện Thoại Liên Hệ
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="+84 981 479 507"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quốc Gia (Country / Region) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Vietnam / Japan / USA / China..."
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cơ quan / Trường Đại học / Viện nghiên cứu (Affiliation) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Ho Chi Minh City University of Technology and Engineering (HCMUTE)"
                      value={formData.affiliation}
                      onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                      className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Hộ Chiếu / CCCD (Passport / National ID)
                  </label>
                  <input
                    type="text"
                    placeholder="Bắt buộc nếu cần Thư hỗ trợ Visa"
                    value={formData.passportNumber}
                    onChange={(e) => setFormData({ ...formData, passportNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Yêu Cầu Chế Độ Ăn Uống (Dietary Requirements)
                  </label>
                  <select
                    value={formData.dietaryRequirement}
                    onChange={(e) => setFormData({ ...formData, dietaryRequirement: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                  >
                    <option value="None">Bình thường (Standard)</option>
                    <option value="Vegetarian">Ăn chay (Vegetarian)</option>
                    <option value="Halal">Chuẩn Halal (Hồi giáo)</option>
                    <option value="GlutenFree">Không chứa Gluten (Gluten-free)</option>
                    <option value="Allergy">Dị ứng hải sản / Đậu phộng</option>
                  </select>
                </div>
              </div>

              {/* Visa Checkbox */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.needsVisaSupport}
                    onChange={(e) => setFormData({ ...formData, needsVisaSupport: e.target.checked })}
                    className="mt-1 h-4 w-4 text-[#115eff] rounded border-slate-300 focus:ring-[#115eff]"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 block">
                      Yêu cầu Ban tổ chức cấp Thư hỗ trợ Visa (Visa Support Letter)
                    </span>
                    <span className="text-slate-500">
                      Hệ thống sẽ tự động xuất file PDF thư mời chính thức có chữ ký số của Ban tổ chức sau khi hoàn tất lệ phí.
                    </span>
                  </div>
                </label>
              </div>

              {/* Travel Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú lịch trình di chuyển & lưu trú (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ví dụ: Dự kiến đến sân bay Tân Sơn Nhất ngày 05/10, lưu trú tại khách sạn Sheraton..."
                  value={formData.travelNotes}
                  onChange={(e) => setFormData({ ...formData, travelNotes: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleBackToTier}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Quay lại</span>
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3 rounded-xl bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Đang xử lý khởi tạo đơn...</span>
                  ) : (
                    <>
                      <span>Xác nhận & Chuyển sang Thanh toán VietQR</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════════
            STEP 3: VIETQR & PAYMENT CONFIRMATION
        ════════════════════════════════════════════════════════════════ */}
        {currentStep === "PAYMENT" && registeredData && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Success Message Card */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-emerald-950">
                    Đăng Ký Thành Công!
                  </h3>
                  <p className="text-xs sm:text-sm text-emerald-800 mt-0.5">
                    Mã hồ sơ đại biểu của bạn:{" "}
                    <span className="font-mono font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded">
                      {registeredData.registration.registrationCode}
                    </span>
                  </p>
                </div>
              </div>

              <Link
                href={`/portal?code=${registeredData.registration.registrationCode}`}
                className="shrink-0 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Vào Hồ sơ Đại biểu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Split Grid: Left = VietQR Code, Right = Transfer Details */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* VietQR Scanner Card */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-xs">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#115eff] mb-4">
                  <QrCode className="w-3.5 h-3.5" />
                  <span>VietQR Napas 24/7 Tự Động</span>
                </div>

                <div className="relative p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-xs hover:border-[#115eff] transition-colors">
                  {/* Real-time VietQR Image generated according to NAPAS spec */}
                  <img
                    src={registeredData.payment.vietQrUrl}
                    alt="VietQR Chuyển khoản"
                    className="w-64 h-64 object-contain rounded-lg"
                  />
                </div>

                <p className="text-xs text-slate-500 mt-4 leading-relaxed max-w-xs">
                  Mở ứng dụng ngân hàng bất kỳ (Vietcombank, MB, Techcombank, VPBank...) và quét mã để tự động điền số tiền và cú pháp đối soát.
                </p>

                <a
                  href={registeredData.payment.vietQrUrl}
                  download={`VietQR_${registeredData.registration.registrationCode}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#115eff] hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh mã QR về điện thoại</span>
                </a>
              </div>

              {/* Transfer Details Card */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-xs">
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-1">
                    Thông Tin Chuyển Khoản Ngân Hàng
                  </h3>
                  <p className="text-xs text-slate-500 mb-6">
                    Hệ thống sẽ tự động đối soát tài chính khi giao dịch hoàn tất.
                  </p>

                  <div className="space-y-3.5">
                    {/* Bank Name */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase block">
                          Ngân Hàng Thụ Hưởng
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {CONFERENCE_BANK_INFO.bankName}
                        </span>
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase block">
                          Số Tài Khoản (Account Number)
                        </span>
                        <span className="font-mono text-base sm:text-lg font-black text-[#115eff]">
                          {CONFERENCE_BANK_INFO.accountNo}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("acc", CONFERENCE_BANK_INFO.accountNo)}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                        title="Sao chép số tài khoản"
                      >
                        {copiedKey === "acc" ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Account Name */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold uppercase block">
                          Tên Chủ Tài Khoản (Beneficiary)
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {CONFERENCE_BANK_INFO.accountName}
                        </span>
                      </div>
                    </div>

                    {/* Transfer Amount */}
                    <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-blue-600 font-bold uppercase block">
                          Số Tiền Thanh Toán (Amount)
                        </span>
                        <span className="text-lg sm:text-2xl font-black text-[#115eff]">
                          {registeredData.registration.currency === "VND"
                            ? formatVND(registeredData.registration.feeAmount)
                            : formatUSD(registeredData.registration.feeAmount)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("amount", String(registeredData.registration.feeAmount))}
                        className="p-2 rounded-lg bg-white border border-blue-200 hover:bg-blue-100 text-[#115eff] transition-colors cursor-pointer"
                        title="Sao chép số tiền"
                      >
                        {copiedKey === "amount" ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Syntax Content */}
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-amber-700 font-bold uppercase block">
                          Nội Dung Chuyển Khoản (Bắt buộc chính xác để tự động đối soát)
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-black text-amber-950">
                          {registeredData.payment.transferSyntax}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("syntax", registeredData.payment.transferSyntax)}
                        className="p-2 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-amber-800 transition-colors cursor-pointer"
                        title="Sao chép nội dung"
                      >
                        {copiedKey === "syntax" ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Hóa đơn điện tử VAT & Thư mời tự động cấp</span>
                  </div>

                  <Link
                    href={`/portal?code=${registeredData.registration.registrationCode}`}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <span>Trang Hồ Sơ & Thẻ Đại Biểu Số</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </SectionContainer>
    </main>
  );
}
