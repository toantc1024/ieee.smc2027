"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertCircle,
  Lock,
  ArrowLeft,
  Mail,
  KeyRound,
  QrCode,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  Info,
} from "lucide-react";

type AuthTab = "google" | "wechat" | "email-otp" | "password";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [activeTab, setActiveTab] = useState<AuthTab>("google");
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);

  // Email OTP state
  const [otpEmail, setOtpEmail] = useState("admin@hcmute.edu.vn");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  // Password state
  const [pwdEmail, setPwdEmail] = useState("admin@hcmute.edu.vn");
  const [pwdPassword, setPwdPassword] = useState("Admin@Smc2027Secure!");
  const [showPassword, setShowPassword] = useState(false);

  const derivedError =
    errorParam === "missing_google_credentials"
      ? "Chưa cấu hình GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET. Bạn có thể dùng tab 'Email OTP' hoặc 'Mật khẩu' để vào quản trị ngay!"
      : errorParam === "wechat_access_denied"
      ? "Bạn đã hủy xác thực WeChat. Vui lòng thử lại."
      : errorParam
      ? `Lỗi đăng nhập: ${errorParam}`
      : null;

  const errorMessage = customError || derivedError;

  // 1. Google OAuth Flow
  const handleGoogleLogin = () => {
    setLoading(true);
    setCustomError(null);
    window.location.assign("/api/auth/google");
  };

  // 2. WeChat Login Flow
  const handleWeChatLogin = () => {
    setLoading(true);
    setCustomError(null);
    window.location.assign("/api/auth/wechat");
  };

  // 3. Email OTP Flow
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail) return;
    setLoading(true);
    setCustomError(null);
    setCustomSuccess(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setCustomSuccess(data.message || "Mã OTP đã được gửi đến hộp thư của bạn.");
        if (data.devCode) {
          setDevOtpHint(data.devCode);
          setOtpCode(data.devCode); // Auto-fill for developer convenience
        }
      } else {
        setCustomError(data.error || "Không thể gửi mã OTP.");
      }
    } catch {
      setCustomError("Lỗi kết nối máy chủ gửi OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpEmail || !otpCode) return;
    setLoading(true);
    setCustomError(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: otpEmail, code: otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
      } else {
        setCustomError(data.error || "Mã OTP không hợp lệ.");
      }
    } catch {
      setCustomError("Lỗi kết nối máy chủ xác thực.");
    } finally {
      setLoading(false);
    }
  };

  // 4. Password Login Flow
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdEmail || !pwdPassword) return;
    setLoading(true);
    setCustomError(null);

    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: pwdEmail, password: pwdPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin");
      } else {
        setCustomError(data.error || "Mật khẩu không chính xác.");
      }
    } catch {
      setCustomError("Lỗi kết nối hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full flex items-center justify-center p-4 sm:p-6 bg-slate-100/70 font-sans text-slate-800">
      {/* Return to Public Site */}
      <div className="absolute top-5 left-5 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-md transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ IEEE SMC 2027</span>
        </Link>
      </div>

      {/* Main Authentication Card */}
      <div className="relative z-10 w-full max-w-[460px]">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center mb-3 shadow-xs">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold tracking-wide uppercase mb-1">
              <span>Cổng Quản Trị Hệ Thống</span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              IEEE SMC 2027 CMS
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
              Chọn một trong 4 phương thức xác thực bảo mật để truy cập bảng điều khiển.
            </p>
          </div>

          {/* Clean Segmented Tab Switcher (shadcn style) */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 mb-6 text-xs font-medium">
            <button
              type="button"
              onClick={() => {
                setActiveTab("google");
                setCustomError(null);
              }}
              className={`py-2 px-1.5 rounded-md text-center transition-all cursor-pointer ${
                activeTab === "google"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("wechat");
                setCustomError(null);
              }}
              className={`py-2 px-1.5 rounded-md text-center transition-all cursor-pointer ${
                activeTab === "wechat"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              WeChat
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("email-otp");
                setCustomError(null);
              }}
              className={`py-2 px-1.5 rounded-md text-center transition-all cursor-pointer ${
                activeTab === "email-otp"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Email OTP
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("password");
                setCustomError(null);
              }}
              className={`py-2 px-1.5 rounded-md text-center transition-all cursor-pointer ${
                activeTab === "password"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Mật Khẩu
            </button>
          </div>

          {/* Feedback Notices */}
          {errorMessage && (
            <div className="mb-5 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {customSuccess && (
            <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{customSuccess}</div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 1: GOOGLE OAUTH */}
          {/* ============================================================ */}
          {activeTab === "google" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Đăng nhập tài khoản Google Ban Tổ Chức:</span>
                <p className="mt-1">
                  Hệ thống hỗ trợ cả Client ID Development và Production được cấu hình trong Google Cloud Console.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm rounded-lg border border-slate-300 hover:border-slate-400 shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? "Đang kết nối Google..." : "Đăng nhập với Google OAuth"}</span>
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: WECHAT QR CONNECT */}
          {/* ============================================================ */}
          {activeTab === "wechat" && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-lg text-xs text-emerald-900 leading-relaxed">
                <span className="font-semibold">微信扫码登录 (WeChat Web QR Connect):</span>
                <p className="mt-1">
                  Dành cho các học giả và tác giả quốc tế. Hỗ trợ quét mã WeChat Open Platform hoặc thử nghiệm nhanh chế độ Dev Simulator.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
                <QrCode className="w-16 h-16 text-emerald-600 mb-2 opacity-90" />
                <span className="text-xs text-slate-500 font-medium">
                  WeChat Open Platform QR Connect
                </span>
              </div>

              <button
                type="button"
                onClick={handleWeChatLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-[#07c160] hover:bg-[#06ad56] text-white font-semibold text-sm rounded-lg shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <QrCode className="w-4 h-4" />
                <span>{loading ? "Đang xác thực WeChat..." : "Đăng nhập với WeChat (微信登录)"}</span>
              </button>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: EMAIL OTP */}
          {/* ============================================================ */}
          {activeTab === "email-otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Địa chỉ Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="admin@hcmute.edu.vn"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Đang tạo mã OTP..." : "Nhận Mã Xác Thực (Send OTP)"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Mã gửi tới: <strong className="text-slate-900">{otpEmail}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[#115eff] hover:underline cursor-pointer"
                    >
                      Đổi email
                    </button>
                  </div>

                  {devOtpHint && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-xs flex items-center gap-2">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>
                        Mã OTP Dev Test: <strong>{devOtpHint}</strong> (Đã tự động điền)
                      </span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nhập mã OTP 6 chữ số
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      className="w-full tracking-widest text-center font-mono font-bold text-lg py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? "Đang xác nhận..." : "Xác Nhận & Đăng Nhập"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-xs text-slate-500 hover:text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Gửi lại mã mới</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: PASSWORD */}
          {/* ============================================================ */}
          {activeTab === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={pwdEmail}
                    onChange={(e) => setPwdEmail(e.target.value)}
                    placeholder="admin@hcmute.edu.vn"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={pwdPassword}
                    onChange={(e) => setPwdPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-slate-800 text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {loading ? "Đang xác thực..." : "Đăng Nhập Với Mật Khẩu"}
              </button>

              <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
                <span className="font-semibold text-slate-700">Tài khoản mặc định: </span>
                <code>admin@hcmute.edu.vn</code> / <code>Admin@Smc2027Secure!</code>
              </div>
            </form>
          )}

          {/* Footer Security Badges */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Neon DB & JWT Protection</span>
            </div>
            <span>v0.1.0-alpha</span>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-100">
          <div className="w-7 h-7 rounded-full border-2 border-slate-900 border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}
