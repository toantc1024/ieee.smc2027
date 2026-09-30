"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  QrCode,
  FileText,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Building,
  Globe,
  Mail,
  Phone,
  Search,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Award,
  Sparkles,
  ChevronRight,
  Plane,
} from "lucide-react";
import { SectionContainer } from "@/components/layout/SectionContainer";
import {
  REGISTRATION_FEES,
  CONFERENCE_BANK_INFO,
  formatVND,
  formatUSD,
  getVietQrUrl,
  getTransferSyntax,
} from "@/lib/conference-registration";
import QRCode from "qrcode";

function PortalContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code") || "";

  const [searchCode, setSearchCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [regData, setRegData] = useState<any>(null);
  const [qrBadgeDataUrl, setQrBadgeDataUrl] = useState<string>("");

  const [printDocument, setPrintDocument] = useState<"RECEIPT" | "VISA" | "BADGE" | null>(null);

  const fetchRegistration = async (codeToFetch: string) => {
    if (!codeToFetch.trim()) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(`/api/registration?code=${encodeURIComponent(codeToFetch.trim())}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không tìm thấy hồ sơ với mã đăng ký này.");
      }

      setRegData(data.registration);

      // Generate local QR Code for check-in badge (Firewall safe, zero CDN)
      const qrSvg = await QRCode.toDataURL(
        JSON.stringify({
          code: data.registration.registrationCode,
          name: data.registration.fullName,
          type: data.registration.participantType,
        }),
        { margin: 1, width: 280, color: { dark: "#002244", light: "#ffffff" } }
      );
      setQrBadgeDataUrl(qrSvg);
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi tra cứu thông tin.");
      setRegData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      fetchRegistration(initialCode);
    }
  }, [initialCode]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRegistration(searchCode);
  };

  const handlePrint = (docType: "RECEIPT" | "VISA" | "BADGE") => {
    setPrintDocument(docType);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  return (
    <main className="min-h-screen bg-slate-50/60 pb-20">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200">
        <SectionContainer id="portal-header" fullWidthBg="bg-white" className="py-10 sm:py-12">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#115eff] border border-blue-100">
              <User className="w-3.5 h-3.5" />
              <span>Hồ Sơ & Thẻ Đại Biểu Hội Nghị</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tra Cứu Hồ Sơ & <span className="text-[#115eff]">Thẻ Đại Biểu SMC 2027</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-600 font-medium">
              Quản lý mã định danh tham dự, xem trạng thái đối soát lệ phí, tải Phiếu thu điện tử (e-Invoice) và Thư hỗ trợ Visa (Visa Support Letter).
            </p>

            {/* Quick search input */}
            <form onSubmit={handleSearchSubmit} className="pt-4 flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative grow">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Nhập mã đăng ký (Ví dụ: SMC27-A8B9C2)..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] focus:border-[#115eff]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs sm:text-sm font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
              >
                {loading ? "Đang tra cứu..." : "Tra Cứu"}
              </button>
            </form>
          </div>
        </SectionContainer>
      </div>

      <SectionContainer id="portal-body" fullWidthBg="transparent" className="pt-8">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {!regData && !loading && (
          <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#115eff] flex items-center justify-center mx-auto">
              <QrCode className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Nhập mã đăng ký để xem thẻ hội nghị
            </h3>
            <p className="text-sm text-slate-500">
              Mã đăng ký được cấp ngay sau khi bạn hoàn tất biểu mẫu đăng ký (cú pháp: SMC27-XXXXXX). Nếu chưa đăng ký, vui lòng truy cập Cổng đăng ký.
            </p>
            <div className="pt-2">
              <Link
                href="/registration"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#115eff] text-white text-xs sm:text-sm font-bold hover:bg-[#0a4de6] transition-colors"
              >
                <span>Đăng ký tham dự ngay</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {regData && (
          <div className="space-y-8">
            {/* Top Overview Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#115eff] flex items-center justify-center font-black text-xl shrink-0">
                  {regData.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                      {regData.fullName}
                    </h2>
                    <span
                      className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        regData.paymentStatus === "PAID"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {regData.paymentStatus === "PAID"
                        ? "ĐÃ THANH TOÁN (PAID)"
                        : "CHỜ ĐỐI SOÁT (PENDING)"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {regData.affiliation} • {regData.country}
                  </p>
                </div>
              </div>

              {/* Action Buttons to Print/Download */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handlePrint("BADGE")}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In Thẻ Đại Biểu (Badge)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePrint("RECEIPT")}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#115eff] border border-blue-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Phiếu Thu Điện Tử (Receipt)</span>
                </button>

                {regData.needsVisaSupport && (
                  <button
                    type="button"
                    onClick={() => handlePrint("VISA")}
                    className="px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Plane className="w-3.5 h-3.5" />
                    <span>Thư Hỗ Trợ Visa (Letter)</span>
                  </button>
                )}
              </div>
            </div>

            {/* Main Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Official Digital Badge Card */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-gradient-to-b from-white to-blue-50/40 border-2 border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center shadow-md relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-3 bg-[#115eff]" />

                  {/* Header Badge */}
                  <div className="mt-2 mb-4 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#004776] block">
                      IEEE SMC SOCIETY • HCM-UTE
                    </span>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wide">
                      IEEE SMC 2027 • HO CHI MINH CITY
                    </span>
                  </div>

                  {/* Avatar or Placeholder */}
                  <div className="w-24 h-24 rounded-full bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-md border-4 border-white my-2">
                    {regData.fullName.charAt(0)}
                  </div>

                  {/* Delegate Name */}
                  <h3 className="text-xl font-black text-slate-900 mt-2 mb-1">
                    {regData.fullName}
                  </h3>
                  <p className="text-xs font-semibold text-slate-600 max-w-xs mb-3">
                    {regData.affiliation}
                  </p>

                  {/* Type Badge */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#115eff] text-white uppercase tracking-wider mb-5">
                    <Award className="w-3.5 h-3.5" />
                    <span>{regData.participantType} DELEGATE</span>
                  </div>

                  {/* Badge QR Code for fast venue checkin */}
                  <div className="p-3 bg-white border-2 border-slate-200 rounded-2xl shadow-xs">
                    {qrBadgeDataUrl ? (
                      <img
                        src={qrBadgeDataUrl}
                        alt="Badge Check-in QR"
                        className="w-44 h-44 object-contain"
                      />
                    ) : (
                      <div className="w-44 h-44 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        Đang nạp mã...
                      </div>
                    )}
                  </div>

                  {/* Checkin Status Indicator */}
                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`inline-block w-2.5 h-2.5 rounded-full ${
                        regData.checkInStatus ? "bg-emerald-500" : "bg-amber-400"
                      }`}
                    />
                    <span className="text-xs font-bold text-slate-700">
                      {regData.checkInStatus
                        ? `Đã điểm danh (${new Date(regData.checkedInAt).toLocaleTimeString("vi-VN")})`
                        : "Sẵn sàng quét điểm danh tại hội trường"}
                    </span>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200/80 w-full text-[11px] text-slate-400 font-mono">
                    ID: {regData.registrationCode}
                  </div>
                </div>
              </div>

              {/* Right Column: Detailed Info & Financial Statement */}
              <div className="lg:col-span-7 space-y-6">
                {/* Registration Details Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                    Chi Tiết Hồ Sơ Đăng Ký
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block text-xs">Mã hồ sơ (Registration Code):</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {regData.registrationCode}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Phân loại đại biểu:</span>
                      <span className="font-bold text-[#115eff]">
                        {REGISTRATION_FEES[regData.participantType as keyof typeof REGISTRATION_FEES]?.label ||
                          regData.participantType}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Email liên lạc:</span>
                      <span className="font-medium text-slate-800">{regData.email}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Số điện thoại:</span>
                      <span className="font-medium text-slate-800">
                        {regData.phone || "Chưa cập nhật"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Quốc gia:</span>
                      <span className="font-medium text-slate-800">{regData.country}</span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Số Hộ chiếu / CCCD:</span>
                      <span className="font-mono font-medium text-slate-800">
                        {regData.passportNumber || "Không yêu cầu"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Chế độ ăn uống (Dietary):</span>
                      <span className="font-medium text-slate-800">
                        {regData.dietaryRequirement || "Bình thường"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-xs">Hỗ trợ Visa:</span>
                      <span className="font-medium text-slate-800">
                        {regData.needsVisaSupport ? "Có đăng ký Thư hỗ trợ Visa" : "Không yêu cầu"}
                      </span>
                    </div>
                  </div>

                  {/* Paper info if Author */}
                  {regData.paperId && (
                    <div className="mt-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                      <span className="text-xs font-bold text-blue-900 block uppercase tracking-wider mb-1">
                        Thông Tin Bài Báo Khoa Học
                      </span>
                      <div className="text-xs space-y-1">
                        <div>
                          <span className="text-slate-500 font-medium">Mã bài báo (Paper ID): </span>
                          <span className="font-mono font-bold text-blue-700">
                            {regData.paperId}
                          </span>
                        </div>
                        {regData.paperTitle && (
                          <div>
                            <span className="text-slate-500 font-medium">Tiêu đề (Paper Title): </span>
                            <span className="font-medium text-slate-800 italic">
                              "{regData.paperTitle}"
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Financial & Payment Status */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">
                      Tình Trạng Lệ Phí Tham Dự
                    </h4>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-xs text-slate-500 block">Số tiền cần thanh toán:</span>
                        <span className="text-xl font-black text-[#115eff]">
                          {regData.currency === "VND"
                            ? formatVND(regData.feeAmount)
                            : formatUSD(regData.feeAmount)}
                        </span>
                        {regData.paidAt && (
                          <span className="text-xs text-emerald-600 block mt-0.5">
                            Đã xác nhận thanh toán lúc: {new Date(regData.paidAt).toLocaleString("vi-VN")}
                          </span>
                        )}
                      </div>

                      {regData.paymentStatus === "PENDING" && (
                        <div className="text-right">
                          <a
                            href={getVietQrUrl(regData.registrationCode, regData.feeAmount)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#115eff] text-white text-xs font-bold hover:bg-[#0a4de6] transition-colors"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Mở VietQR Thanh Toán</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ════════════════════════════════════════════════════════════
                PRINTABLE DOCUMENTS (OFFICIAL RECEIPT & VISA LETTER)
                Hidden on screen when not printing, optimized via @media print
            ════════════════════════════════════════════════════════════ */}
            <div id="print-area" className="hidden print:block print:w-full print:bg-white print:text-black">
              {/* DOCUMENT 1: OFFICIAL RECEIPT */}
              {printDocument === "RECEIPT" && (
                <div className="p-8 max-w-3xl mx-auto border-2 border-slate-800 font-sans">
                  <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
                    <div>
                      <h1 className="text-xl font-bold uppercase tracking-tight">
                        IEEE SMC 2027 CONFERENCE
                      </h1>
                      <p className="text-xs">Ho Chi Minh City University of Technology and Engineering (HCM-UTE)</p>
                      <p className="text-xs">01 Vo Van Ngan Street, Linh Chieu Ward, Thu Duc City, HCMC, Vietnam</p>
                      <p className="text-xs">Tax ID / MST: 0302587900</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-lg font-black uppercase text-blue-900">OFFICIAL RECEIPT</h2>
                      <p className="text-xs font-mono">No: {regData.registrationCode}</p>
                      <p className="text-xs">Date: {new Date().toLocaleDateString("vi-VN")}</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs mb-6">
                    <p><strong>Received from:</strong> {regData.fullName}</p>
                    <p><strong>Affiliation:</strong> {regData.affiliation} ({regData.country})</p>
                    <p><strong>Email:</strong> {regData.email}</p>
                    {regData.paperId && <p><strong>Paper ID:</strong> {regData.paperId} - {regData.paperTitle}</p>}
                  </div>

                  <table className="w-full text-xs border border-slate-800 mb-6">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-800">
                        <th className="p-2 text-left border-r border-slate-800">Item Description</th>
                        <th className="p-2 text-center border-r border-slate-800">Category</th>
                        <th className="p-2 text-right">Amount ({regData.currency})</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="p-2 border-r border-slate-800">
                          Registration Fee for IEEE SMC 2027 (Oct 6–10, 2027, Ho Chi Minh City)
                        </td>
                        <td className="p-2 text-center border-r border-slate-800">{regData.participantType}</td>
                        <td className="p-2 text-right font-bold">
                          {regData.currency === "VND" ? formatVND(regData.feeAmount) : formatUSD(regData.feeAmount)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="p-2 text-right font-bold border-r border-slate-800">
                          Total Received:
                        </td>
                        <td className="p-2 text-right font-black text-sm">
                          {regData.currency === "VND" ? formatVND(regData.feeAmount) : formatUSD(regData.feeAmount)}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="flex justify-between items-end text-xs mt-12 pt-8">
                    <div>
                      <p><strong>Payment Status:</strong> {regData.paymentStatus}</p>
                      <p><strong>Payment Method:</strong> {regData.paymentMethod || "VietQR / Bank Wire"}</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">On Behalf of IEEE SMC 2027 Organizing Committee</p>
                      <p className="text-[11px] text-slate-500 mb-12">Finance & Registration Chair</p>
                      <p className="font-serif font-bold text-sm italic underline text-blue-900">HCM-UTE Finance Office</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENT 2: VISA SUPPORT LETTER */}
              {printDocument === "VISA" && (
                <div className="p-10 max-w-3xl mx-auto font-serif text-slate-900 leading-relaxed text-sm">
                  <div className="text-center border-b pb-4 mb-8">
                    <h1 className="text-xl font-bold font-sans tracking-wide">
                      2027 IEEE INTERNATIONAL CONFERENCE ON SYSTEMS, MAN, AND CYBERNETICS
                    </h1>
                    <p className="text-xs font-sans text-slate-600 mt-1">
                      Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam • October 6–10, 2027
                    </p>
                  </div>

                  <div className="flex justify-between text-xs font-sans mb-8">
                    <div>
                      <p><strong>To:</strong> Consular Section / Embassy of the S.R. of Vietnam</p>
                    </div>
                    <div className="text-right">
                      <p><strong>Date:</strong> {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>
                      <p><strong>Ref Code:</strong> {regData.registrationCode}</p>
                    </div>
                  </div>

                  <h2 className="text-center font-bold text-base uppercase mb-6 font-sans">
                    OFFICIAL VISA SUPPORT LETTER & INVITATION
                  </h2>

                  <p className="mb-4">
                    Dear Consular Officer,
                  </p>

                  <p className="mb-4">
                    On behalf of the Organizing Committee of the <strong>2027 IEEE International Conference on Systems, Man, and Cybernetics (IEEE SMC 2027)</strong>, hosted by the <strong>Ho Chi Minh City University of Technology and Engineering (HCM-UTE)</strong> and sponsored by the <strong>IEEE Systems, Man, and Cybernetics Society</strong>, we have the great pleasure of inviting:
                  </p>

                  <div className="my-4 p-4 bg-slate-50 border border-slate-200 font-sans text-xs space-y-1">
                    <p><strong>Full Name:</strong> {regData.fullName}</p>
                    <p><strong>Affiliation:</strong> {regData.affiliation}</p>
                    <p><strong>Country of Citizenship/Residence:</strong> {regData.country}</p>
                    <p><strong>Passport Number:</strong> {regData.passportNumber || "[Verified in Portal]"}</p>
                    <p><strong>Participation Category:</strong> {regData.participantType} Delegate</p>
                    {regData.paperId && <p><strong>Accepted Paper:</strong> #{regData.paperId} - "{regData.paperTitle}"</p>}
                  </div>

                  <p className="mb-4">
                    The conference will take place at the <strong>Sheraton Saigon Grand Opera Hotel</strong>, Ho Chi Minh City, Vietnam, from <strong>October 6 to October 10, 2027</strong>.
                  </p>

                  <p className="mb-4">
                    The delegate has successfully registered for the conference. We kindly request the competent Vietnamese visa-issuing authorities to grant a suitable entry visa so that the delegate can travel to Vietnam and participate in this distinguished international academic forum.
                  </p>

                  <p className="mb-8">
                    All travel, accommodation, and personal expenses during the trip will be borne by the attendee or their sending institution.
                  </p>

                  <div className="mt-12 flex justify-between items-end font-sans text-xs">
                    <div>
                      <p>Conference Secretariat: <em>ieeesmc2027@hcmute.edu.vn</em></p>
                      <p>Website: <em>https://ieee-smc2027.org</em></p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold">General Co-Chairs</p>
                      <p className="text-slate-500 mb-10">IEEE SMC 2027 Organizing Committee</p>
                      <p className="font-serif italic font-bold text-sm text-blue-900 underline">Prof. Assoc. HCM-UTE & IEEE SMC</p>
                    </div>
                  </div>
                </div>
              )}

              {/* DOCUMENT 3: BADGE PRINT */}
              {printDocument === "BADGE" && (
                <div className="p-8 max-w-sm mx-auto border-2 border-slate-900 rounded-xl text-center font-sans">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    IEEE SMC 2027 • HO CHI MINH CITY
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-4 mb-1">
                    {regData.fullName}
                  </h2>
                  <p className="text-xs text-slate-600 mb-3">{regData.affiliation}</p>
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-xs uppercase rounded mb-4">
                    {regData.participantType}
                  </div>
                  <div className="flex justify-center my-2">
                    {qrBadgeDataUrl && (
                      <img src={qrBadgeDataUrl} alt="Badge QR" className="w-40 h-40" />
                    )}
                  </div>
                  <p className="text-[10px] font-mono text-slate-500 mt-2">
                    ID: {regData.registrationCode}
                  </p>
                </div>
              )}
            </div>
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
          <div className="text-sm font-bold text-slate-500">Đang nạp hồ sơ đại biểu...</div>
        </div>
      }
    >
      <PortalContent />
    </Suspense>
  );
}
