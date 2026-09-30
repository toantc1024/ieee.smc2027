"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  Check,
  User,
  Clock,
  Sparkles,
  Camera,
  RotateCcw,
} from "lucide-react";

export default function AdminCheckInPage() {
  const [inputCode, setInputCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "SUCCESS" | "ALREADY" | "ERROR";
    message: string;
    delegate?: any;
  } | null>(null);

  const [recentCheckIns, setRecentCheckIns] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Keep focus on input for fast barcode / QR scanner reader guns
    inputRef.current?.focus();
  }, []);

  const handleProcessCheckIn = async (codeToSubmit: string) => {
    const trimmed = codeToSubmit.trim();
    if (!trimmed) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/registration/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setFeedback({
          type: "ERROR",
          message: data.error || "Mã đại biểu không hợp lệ hoặc chưa đăng ký.",
        });
        return;
      }

      setFeedback({
        type: data.alreadyCheckedIn ? "ALREADY" : "SUCCESS",
        message: data.message,
        delegate: data.registration,
      });

      // Add to recent list
      setRecentCheckIns((prev) => [data.registration, ...prev.filter((d) => d.id !== data.registration.id)].slice(0, 10));
      setInputCode("");
    } catch (e: any) {
      setFeedback({
        type: "ERROR",
        message: e.message || "Lỗi kết nối máy chủ điểm danh.",
      });
    } finally {
      setLoading(false);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleProcessCheckIn(inputCode);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Quét Mã QR & Điểm Danh Hội Trường
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Hỗ trợ máy quét mã vạch Barcode/QR Gun, Camera hoặc nhập mã tham dự SMC27-XXXXXX.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Hệ thống Check-in Sẵn sàng</span>
        </div>
      </div>

      {/* ── Scanner Card ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#115eff] flex items-center justify-center">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Quét Mã Thẻ Đại Biểu (Badge QR Code)
            </h3>
            <p className="text-xs text-slate-500">
              Đặt con trỏ vào ô nhập bên dưới và quét mã QR trên thẻ đại biểu.
            </p>
          </div>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Chờ quét mã hoặc nhập mã thủ công..."
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full pl-5 pr-28 py-4 text-base font-mono font-bold bg-slate-50 border-2 border-slate-200 rounded-2xl focus:outline-none focus:border-[#115eff] focus:bg-white transition-all"
            autoFocus
          />
          <button
            type="button"
            onClick={() => handleProcessCheckIn(inputCode)}
            disabled={loading || !inputCode.trim()}
            className="absolute right-2.5 top-2.5 bottom-2.5 px-5 rounded-xl bg-[#115eff] hover:bg-[#0a4de6] text-white text-xs font-bold cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? "Đang xử lý..." : "Xác Nhận"}
          </button>
        </div>

        {/* Feedback Display */}
        {feedback && (
          <div
            className={`p-6 rounded-2xl border transition-all animate-in fade-in zoom-in-95 ${
              feedback.type === "SUCCESS"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : feedback.type === "ALREADY"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-red-50 border-red-200 text-red-900"
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  feedback.type === "SUCCESS"
                    ? "bg-emerald-500 text-white"
                    : feedback.type === "ALREADY"
                    ? "bg-amber-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {feedback.type === "SUCCESS" ? (
                  <Check className="w-6 h-6 stroke-[3]" />
                ) : (
                  <AlertCircle className="w-6 h-6 stroke-[3]" />
                )}
              </div>

              <div className="space-y-1 grow">
                <h4 className="text-base font-black">
                  {feedback.type === "SUCCESS"
                    ? "ĐIỂM DANH THÀNH CÔNG!"
                    : feedback.type === "ALREADY"
                    ? "ĐẠI BIỂU ĐÃ ĐIỂM DANH TRƯỚC ĐÓ"
                    : "LỖI ĐIỂM DANH"}
                </h4>
                <p className="text-xs sm:text-sm font-medium">{feedback.message}</p>

                {feedback.delegate && (
                  <div className="mt-4 pt-3 border-t border-current/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="opacity-70 block">Họ và tên:</span>
                      <strong className="text-sm">{feedback.delegate.fullName}</strong>
                    </div>
                    <div>
                      <span className="opacity-70 block">Mã hồ sơ:</span>
                      <strong className="font-mono">{feedback.delegate.registrationCode}</strong>
                    </div>
                    <div>
                      <span className="opacity-70 block">Đơn vị:</span>
                      <strong>{feedback.delegate.affiliation}</strong>
                    </div>
                    <div>
                      <span className="opacity-70 block">Phân loại & Lệ phí:</span>
                      <strong>
                        {feedback.delegate.participantType} ({feedback.delegate.paymentStatus})
                      </strong>
                    </div>
                    {feedback.delegate.paperId && (
                      <div className="sm:col-span-2">
                        <span className="opacity-70 block">Mã bài báo khoa học:</span>
                        <strong>Paper #{feedback.delegate.paperId}</strong>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Recent Check-ins List ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Đại Biểu Vừa Điểm Danh Gần Nhất
          </h3>
          <span className="text-xs text-slate-400">
            {recentCheckIns.length} lượt vừa ghi nhận
          </span>
        </div>

        {recentCheckIns.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">
            Chưa có lượt điểm danh nào trong phiên hiện tại.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentCheckIns.map((item) => (
              <div
                key={item.id}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#115eff] flex items-center justify-center font-bold">
                    {item.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{item.fullName}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.affiliation} • {item.participantType}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-mono text-emerald-600 font-bold block">
                    {item.registrationCode}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.checkedInAt ? new Date(item.checkedInAt).toLocaleTimeString("vi-VN") : "Vừa xong"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
