"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Lock,
  ArrowLeft,
  KeyRound,
} from "lucide-react";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);

  const derivedError =
    errorParam === "missing_google_credentials"
      ? "Chưa cấu hình GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET trong .env. Bạn có thể dùng tính năng 'Đăng nhập nhanh Test Dev' bên dưới để vào hệ thống quản trị ngay!"
      : errorParam
      ? `Lỗi xác thực Google: ${errorParam}`
      : null;

  const errorMessage = customError || derivedError;

  const handleGoogleLogin = () => {
    setLoading(true);
    window.location.assign("/api/auth/google");
  };

  const handleDevLogin = async () => {
    setDevLoading(true);
    try {
      const res = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "admin@hcmute.edu.vn",
          name: "Ban Quản Trị IEEE SMC 2027",
        }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        setCustomError("Không thể đăng nhập phiên dev. Vui lòng thử lại.");
      }
    } catch {
      setCustomError("Lỗi kết nối cơ sở dữ liệu Neon.");
    } finally {
      setDevLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative w-full flex items-center justify-center p-4 sm:p-6 bg-slate-50 overflow-hidden font-sans">
      {/* MagicUI High-Tech Grid Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 pointer-events-none" />

      {/* Ambient Radial Gradient Lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#115eff]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Corner Back to Site Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200 rounded-md backdrop-blur-xs transition-all shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Về trang chủ IEEE SMC 2027</span>
        </Link>
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="relative z-10 w-full max-w-[440px]">
        {/* MagicUI Border Glow container */}
        <div className="relative rounded-2xl p-[1px] bg-gradient-to-b from-blue-400/40 via-slate-200 to-transparent shadow-xl">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-7 sm:p-9 border border-white">
            
            {/* Logo & Header Header */}
            <div className="flex flex-col items-center text-center mb-7">
              <div className="relative mb-3.5">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-tr from-[#115eff] to-blue-500 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full border border-slate-200 shadow-2xs">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-50 text-[#115eff] border border-blue-200/80 text-xs font-bold tracking-wide uppercase mb-1.5">
                <Sparkles className="w-3 h-3" />
                <span>Hệ Thống Quản Trị Nội Dung</span>
              </div>

              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                IEEE SMC 2027 CMS
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xs leading-relaxed">
                Đăng nhập để quản lý Header, cấu trúc kéo thả (Drag & Drop) và nội dung các trang.
              </p>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-6 p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Primary Action: Google OAuth Button */}
            <div className="space-y-3.5">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || devLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm rounded-lg border border-slate-300 hover:border-slate-400 shadow-xs hover:shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {/* Official Google 4-Color SVG Icon */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                <span>{loading ? "Đang chuyển hướng Google..." : "Đăng nhập với Google OAuth"}</span>
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  hoặc
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Instant Dev / Admin Test Login */}
              <button
                type="button"
                onClick={handleDevLogin}
                disabled={loading || devLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <KeyRound className="w-4 h-4 text-blue-400" />
                <span>
                  {devLoading ? "Đang vào hệ thống..." : "Đăng nhập nhanh Test Dev (Không cần Google key)"}
                </span>
              </button>
            </div>

            {/* Security Notice Footer */}
            <div className="mt-7 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Bảo mật Neon PostgreSQL & JWT Session</span>
            </div>
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-8 h-8 rounded-full border-2 border-[#115eff] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}
