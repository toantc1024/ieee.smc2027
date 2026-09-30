"use client";

import React, { useState } from "react";
import {
  Send,
  Mail,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  Clock,
  ShieldAlert,
} from "lucide-react";

export default function AdminBroadcastPage() {
  const [targetGroup, setTargetGroup] = useState<string>("ALL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    sentCount?: number;
    sampleRecipients?: string[];
  } | null>(null);

  const TEMPLATES = [
    {
      title: "Nhắc nộp bài Camera-ready",
      target: "AUTHOR",
      subject: "[IEEE SMC 2027] Reminder: Camera-ready Submission Deadline Approaching",
      body: `Dear Authors,\n\nThis is a cordial reminder from the IEEE SMC 2027 Organizing Committee regarding the final camera-ready manuscript submission deadline.\n\nPlease ensure your final PDF passes IEEE PDF eXpress verification and your IEEE Electronic Copyright Form (eCF) is signed before the deadline.\n\nWarm regards,\nIEEE SMC 2027 Publication Committee\nHo Chi Minh City, Vietnam`,
    },
    {
      title: "Xác nhận đối soát & Thẻ đại biểu",
      target: "PAID",
      subject: "[IEEE SMC 2027] Registration Confirmed - Access Your Digital Conference Badge",
      body: `Dear Delegate,\n\nWe are pleased to confirm that your conference registration fee for IEEE SMC 2027 has been successfully reconciled.\n\nYou can now log in to the Delegate Portal to download your Official e-Receipt, Visa Support Letter, and Digital Badge with Scannable QR Code.\n\nVenue: Sheraton Saigon Grand Opera Hotel, Ho Chi Minh City, Vietnam.\n\nWarm regards,\nIEEE SMC 2027 Secretariat`,
    },
    {
      title: "Nhắc thanh toán lệ phí hội nghị",
      target: "PENDING",
      subject: "[IEEE SMC 2027] Payment Reminder for Pending Conference Registration",
      body: `Dear Delegate,\n\nThank you for registering for IEEE SMC 2027. We noticed that your registration invoice is currently pending payment.\n\nPlease complete your bank transfer via VietQR Napas 24/7 or international bank wire using the syntax provided in your portal to secure your conference pass and inclusion in the proceedings.\n\nWarm regards,\nIEEE SMC 2027 Finance Committee`,
    },
  ];

  const handleApplyTemplate = (tmpl: (typeof TEMPLATES)[0]) => {
    setTargetGroup(tmpl.target);
    setSubject(tmpl.subject);
    setMessage(tmpl.body);
    setResult(null);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/registration/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetGroup,
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể gửi email.");
      }

      setResult({
        success: true,
        message: data.message,
        sentCount: data.sentCount,
        sampleRecipients: data.sampleRecipients,
      });
    } catch (e: any) {
      setResult({
        success: false,
        message: e.message || "Lỗi gửi thông báo.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gửi Email Thông Báo Hàng Loạt (Email Broadcast)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Gửi email nhắc lịch nộp bài, thông báo khẩn & hướng dẫn nhận thẻ đại biểu theo từng nhóm đối tượng.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-[#115eff] border border-blue-200">
          <Mail className="w-3.5 h-3.5" />
          <span>Hệ Thống Gửi Tin IEEE SMC 2027</span>
        </div>
      </div>

      {/* ── Quick Templates ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Mẫu Email Soạn Sẵn (Quick Templates)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TEMPLATES.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyTemplate(tmpl)}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-[#115eff] hover:bg-blue-50/50 text-left transition-all cursor-pointer group"
            >
              <div className="font-bold text-xs text-slate-900 group-hover:text-[#115eff]">
                {tmpl.title}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                Nhóm: {tmpl.target}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Broadcast Form ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSendBroadcast} className="space-y-5">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nhóm Đại Biểu Mục Tiêu (Target Audience)
            </label>
            <select
              value={targetGroup}
              onChange={(e) => setTargetGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] font-semibold"
            >
              <option value="ALL">Tất cả Đại biểu đã đăng ký (All Delegates)</option>
              <option value="PAID">Chỉ Đại biểu ĐÃ THANH TOÁN (Paid Delegates)</option>
              <option value="PENDING">Chỉ Đại biểu CHỜ THANH TOÁN (Pending Payment)</option>
              <option value="AUTHOR">Chỉ Đại biểu TÁC GIẢ BÀI BÁO (Authors)</option>
              <option value="STUDENT">Chỉ Đại biểu SINH VIÊN (Students)</option>
            </select>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Tiêu Đề Email (Email Subject) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="[IEEE SMC 2027] Tiêu đề thông báo..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] font-semibold"
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nội Dung Thông Báo (Email Message Body) <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={8}
              required
              placeholder="Nhập nội dung chi tiết thông báo gửi đến đại biểu..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#115eff] font-sans leading-relaxed"
            />
          </div>

          {/* Result Alert */}
          {result && (
            <div
              className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start gap-3 ${
                result.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-red-50 border-red-200 text-red-900"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <span className="font-bold">{result.message}</span>
                {result.sampleRecipients && result.sampleRecipients.length > 0 && (
                  <div className="text-[11px] opacity-80 pt-1">
                    Danh sách đại biểu nhận mẫu: {result.sampleRecipients.join(", ")}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              * Email sẽ được ký phát chính thức từ ieeesmc2027@hcmute.edu.vn
            </span>

            <button
              type="submit"
              disabled={loading || !subject.trim() || !message.trim()}
              className="px-6 py-2.5 rounded-xl bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Đang gửi email hàng loạt..." : "Gửi Email Hàng Loạt"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
