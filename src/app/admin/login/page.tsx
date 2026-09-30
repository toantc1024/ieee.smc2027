"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { GridPattern } from "@/components/ui/grid-pattern";

/* ── Poster Slideshow: Ho Chi Minh City Landmarks & HCMUTE ── */
const SLIDES = [
  {
    image: "/login/posters/hcmc-skyline.jpg",
    title: "HO CHI MINH CITY",
    subtitle: "A dynamic, innovative, and hospitable metropolis welcoming the world",
  },
  {
    image: "/login/posters/1-sang-tao.jpg",
    title: "INNOVATION",
    subtitle: "Human-Centric Intelligence: Shaping the Digital & Autonomous Future",
  },
  {
    image: "/login/posters/hcmc-nguyen-hue.jpg",
    title: "GLOBAL GATHERING",
    subtitle: "Welcoming leading scholars, engineers, and researchers to IEEE SMC 2027",
  },
  {
    image: "/login/posters/2-hien-dai.jpg",
    title: "CYBERNETICS & SYSTEMS",
    subtitle: "The flagship international conference on Systems Science and Cybernetics",
  },
  {
    image: "/login/posters/hcmc-ben-thanh.jpg",
    title: "HERITAGE & CULTURE",
    subtitle: "Discover the rich cultural tapestry and vibrant heritage of Vietnam",
  },
] as const;

/* ── Official WeChat SVG Logo ── */
function WeChatLogo({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.538 1.98c-.045.163.125.303.268.22l2.333-1.353a.62.62 0 0 1 .533-.047c.92.31 1.91.478 2.94.478.22 0 .44-.008.658-.024a5.36 5.36 0 0 1-.16-1.306c0-3.57 3.393-6.467 7.58-6.467.432 0 .852.032 1.26.094C17.307 5.253 13.344 2.188 8.691 2.188zm-2.61 4.14a1.144 1.144 0 1 1 0 2.288 1.144 1.144 0 0 1 0-2.288zm5.222 0a1.144 1.144 0 1 1 0 2.288 1.144 1.144 0 0 1 0-2.288zm4.723 4.184c-3.663 0-6.634 2.474-6.634 5.526 0 3.05 2.97 5.525 6.634 5.525.792 0 1.554-.117 2.26-.33a.47.47 0 0 1 .41.036l1.796 1.042c.11.063.24-.044.205-.17l-.414-1.523a.454.454 0 0 1 .164-.512c1.41-1.036 2.308-2.568 2.308-4.268 0-3.052-2.97-5.526-6.634-5.526zm-2.073 3.158a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76zm4.146 0a.88.88 0 1 1 0 1.76.88.88 0 0 1 0-1.76z" />
    </svg>
  );
}

/* ── Official Google 4-Color SVG Logo ── */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className || "w-5 h-5"} viewBox="0 0 24 24">
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
  );
}

type EmailAuthMode = "otp" | "password";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  // Slideshow cycle (every 4.5s)
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Explicitly remove fixed two-side borders on login page
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.classList.remove("page-border-x");
      document.body.classList.add("no-page-borders");
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.classList.remove("no-page-borders");
        document.body.classList.add("page-border-x");
      }
    };
  }, []);

  const currentSlide = SLIDES[slideIdx];

  // Auth Modes & State
  const [emailMode, setEmailMode] = useState<EmailAuthMode>("otp");
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
      ? "Chưa cấu hình Google Client Secret. Bạn có thể sử dụng Email OTP hoặc Mật khẩu bên dưới để truy cập ngay!"
      : errorParam === "wechat_access_denied"
      ? "Bạn đã hủy xác thực WeChat. Vui lòng thử lại."
      : errorParam
      ? `Lỗi xác thực: ${errorParam}`
      : null;

  const errorMessage = customError || derivedError;

  // Google Login
  const handleGoogleLogin = () => {
    setLoading(true);
    setCustomError(null);
    window.location.assign("/api/auth/google");
  };

  // WeChat Login
  const handleWeChatLogin = () => {
    setLoading(true);
    setCustomError(null);
    window.location.assign("/api/auth/wechat");
  };

  // Email OTP Send
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
        setCustomSuccess(data.message || "Mã OTP đã được gửi đến email.");
        if (data.devCode) {
          setDevOtpHint(data.devCode);
          setOtpCode(data.devCode);
        }
      } else {
        setCustomError(data.error || "Không thể tạo mã OTP.");
      }
    } catch {
      setCustomError("Lỗi kết nối máy chủ gửi OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Email OTP Verify
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
        setCustomError(data.error || "Mã OTP không chính xác.");
      }
    } catch {
      setCustomError("Lỗi kết nối máy chủ xác thực.");
    } finally {
      setLoading(false);
    }
  };

  // Password Login
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
    <div
      data-no-page-borders="true"
      className="admin-page-root no-page-borders min-h-screen lg:h-dvh w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans antialiased p-0 sm:p-4 lg:p-4 gap-0 sm:gap-4 lg:overflow-hidden overflow-y-auto box-border select-none"
    >
      
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT COLUMN (60% on Desktop): Ho Chi Minh City & HCMUTE Hero Card
          Rounded value: rounded-b-[20px] sm:rounded-b-[26px] lg:rounded-3xl
          Theme: Vibrant Primary Blue (#115eff)
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[calc(58%-0.5rem)] xl:w-[calc(60%-0.5rem)] flex flex-col h-[320px] sm:h-[370px] lg:h-full min-h-0 min-w-0 shrink-0">
        <div className="relative w-full h-full rounded-b-[20px] sm:rounded-b-[26px] lg:rounded-3xl overflow-hidden shadow-md lg:shadow-[0_16px_48px_-12px_rgba(17,94,255,0.20)] border-b lg:border border-[#115eff]/20 flex flex-col justify-between select-none">
          
          {/* Background Slideshow with Smooth Crossfade */}
          <div className="absolute inset-0 bg-[#115eff] overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.img
                key={slideIdx}
                src={currentSlide.image}
                alt={currentSlide.title}
                initial={{ opacity: 0, scale: 1.06 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </AnimatePresence>

            {/* Vibrant Primary Blue Overlays (#115eff) */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a4de6]/30 via-transparent to-[#115eff]/20 mix-blend-multiply pointer-events-none" />

            {/* Grid Pattern Accent in Bottom Left of 60 Card */}
            <GridPattern
              width={28}
              height={28}
              strokeDasharray="4 2"
              className="absolute -bottom-8 -left-8 w-88 h-88 opacity-30 text-white pointer-events-none z-10 hidden sm:block"
            />

            {/* Top Fresh Gradient */}
            <div className="absolute inset-x-0 top-0 h-28 sm:h-44 bg-gradient-to-b from-[#115eff]/80 via-[#0a4de6]/30 to-transparent pointer-events-none z-10" />

            {/* Bottom Primary Blue Shadow Gradient */}
            <div className="absolute inset-x-0 bottom-0 h-36 sm:h-52 lg:h-60 bg-gradient-to-t from-[#0a4de6]/95 via-[#115eff]/70 via-45% to-transparent pointer-events-none z-10" />
          </div>

          {/* Top Brand Bar: Logo + Home Link (Text Only, No Icons) */}
          <div className="relative z-20 p-4 sm:p-6 lg:p-7 flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <img
                src="/login/rectangle-logo-white.png"
                alt="HCMUTE Logo"
                className="h-8 sm:h-11 w-auto object-contain drop-shadow-xl"
              />
              <div className="hidden sm:flex flex-col border-l border-white/30 pl-3">
                <span className="text-white font-extrabold text-sm sm:text-base tracking-tight leading-none">
                  IEEE SMC 2027
                </span>
                <span className="text-blue-100 text-[11px] font-medium tracking-wide mt-0.5">
                  Ho Chi Minh City, Vietnam
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Typography: Subtitle + Signature Downward Gradient Mask Title */}
          <div className="relative z-20 px-4 sm:px-6 pb-9 sm:pb-10 lg:pb-3 flex flex-col items-center text-center w-full max-w-full mt-auto overflow-visible">
            <AnimatePresence mode="wait">
              <motion.p
                key={slideIdx + "-sub"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-white text-xs sm:text-sm lg:text-base font-normal tracking-wide drop-shadow-md mb-1.5 max-w-full whitespace-nowrap text-center select-none"
              >
                {currentSlide.subtitle}
              </motion.p>
            </AnimatePresence>

            {/* Signature Keycloak Downward Gradient Mask */}
            <div
              className="relative w-full max-w-full flex justify-center items-center py-1 overflow-visible"
              style={{
                maskImage:
                  "linear-gradient(to bottom, #000 0%, #000 25%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0.03) 90%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 0%, #000 25%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0.03) 90%, transparent 100%)",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={slideIdx}
                  initial={{ opacity: 0, y: 16, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 1.04 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                  className="w-full max-w-full flex justify-center items-center select-none overflow-visible px-2"
                >
                  <span
                    className="font-extrabold uppercase text-white select-none leading-[1.1] pt-1 pb-2 whitespace-nowrap text-[32px] sm:text-[42px] lg:text-[clamp(2.2rem,5.8vw,84px)]"
                    style={{
                      letterSpacing: "0.02em",
                      filter: "drop-shadow(0 4px 24px rgba(0, 71, 118, 0.85))",
                    }}
                  >
                    {currentSlide.title}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT COLUMN (40% on Desktop): Auth Card & Promotional Banner
          Rounded value: EXACT SAME rounded-[22px] lg:rounded-3xl (matching left 60)
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[calc(42%-0.5rem)] xl:w-[calc(40%-0.5rem)] flex flex-col h-auto lg:h-full min-h-0 min-w-0 shrink-0 gap-4 sm:gap-4 lg:gap-2.5 xl:gap-4 relative px-4 sm:px-6 lg:px-0 -mt-8 sm:-mt-10 lg:mt-0 z-20 pb-8 lg:pb-0">
        
        {/* ── TOP SECTION: Main Auth Card (Matching rounded-[22px] lg:rounded-3xl) ── */}
        <div className="relative z-10 flex flex-col justify-center items-center flex-1 min-h-0 rounded-[22px] lg:rounded-3xl border border-slate-200/90 bg-white shadow-md lg:shadow-[0_16px_50px_rgba(17,94,255,0.08)] p-5 sm:p-7 lg:p-6 xl:p-8 overflow-y-auto">
          
          {/* Background Grid Pattern with Radial Mask */}
          <GridPattern
            width={32}
            height={32}
            strokeDasharray="0"
            className="absolute inset-0 w-full h-full stroke-[#115eff]/10 fill-none opacity-40 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)] pointer-events-none"
          />

          {/* Centered Auth Content */}
          <div className="relative z-20 w-full max-w-[400px] mx-auto my-auto flex flex-col justify-center">
            
            {/* Header (No decorative icons) */}
            <div className="mb-5 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                IEEE SMC 2027 CMS
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Đăng nhập quản trị nội dung hội nghị và các phân hệ website.
              </p>
            </div>

            {/* Error / Success Notifications (Text only, no icons) */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs text-center leading-relaxed">
                {errorMessage}
              </div>
            )}

            {customSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs text-center leading-relaxed">
                {customSuccess}
              </div>
            )}

            {/* ── Social Login: Full-Width Google & WeChat Buttons ── */}
            <div className="space-y-2.5 w-full">
              {/* Google OAuth (Full-Width Button) */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 hover:border-slate-400 shadow-xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <GoogleLogo className="w-4 h-4 shrink-0" />
                <span>{loading ? "Đang kết nối Google..." : "Đăng nhập với Google OAuth"}</span>
              </button>

              {/* WeChat Open Platform (Full-Width Button in WeChat Green) */}
              <button
                type="button"
                onClick={handleWeChatLogin}
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2.5 px-4 bg-[#07c160] hover:bg-[#06ad56] active:bg-[#059b4c] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <WeChatLogo className="w-4.5 h-4.5 shrink-0" />
                <span>{loading ? "Đang xác thực WeChat..." : "Đăng nhập với WeChat (微信登录)"}</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                hoặc xác thực qua email
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Segmented Mode Switcher (Primary Blue #115eff) */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 mb-3.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => {
                  setEmailMode("otp");
                  setCustomError(null);
                }}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  emailMode === "otp"
                    ? "bg-[#115eff] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mã OTP Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailMode("password");
                  setCustomError(null);
                }}
                className={`py-2 px-2 rounded-lg text-center transition-all cursor-pointer ${
                  emailMode === "password"
                    ? "bg-[#115eff] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Mật Khẩu
              </button>
            </div>

            {/* ── Option 1: Email OTP (Clean inputs, no icons) ── */}
            {emailMode === "otp" && (
              <div className="space-y-3">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        required
                        value={otpEmail}
                        onChange={(e) => setOtpEmail(e.target.value)}
                        placeholder="admin@hcmute.edu.vn"
                        className="w-full px-3.5 h-11 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#115eff] focus:bg-white text-slate-900 font-medium transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-[#115eff] hover:bg-[#0a4de6] active:bg-[#083eb8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Đang gửi mã..." : "Nhận Mã Xác Thực (Send OTP)"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Mã gửi tới: <strong className="text-slate-900">{otpEmail}</strong></span>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-[#115eff] hover:underline cursor-pointer font-bold"
                      >
                        Đổi email
                      </button>
                    </div>

                    {devOtpHint && (
                      <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-[#115eff] text-xs text-center font-bold">
                        Mã Dev Test: {devOtpHint} (Đã tự động điền)
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                        Nhập mã xác thực 6 chữ số
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-full tracking-widest text-center font-mono font-black text-lg h-11 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#115eff] focus:bg-white text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpCode.length !== 6}
                      className="w-full h-11 bg-[#115eff] hover:bg-[#0a4de6] active:bg-[#083eb8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Đang xác thực..." : "Xác Nhận & Đăng Nhập"}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-xs text-slate-500 hover:text-[#115eff] cursor-pointer font-medium"
                      >
                        Gửi lại mã OTP mới
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ── Option 2: Email Password (Clean inputs, text toggle) ── */}
            {emailMode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ Email
                  </label>
                  <input
                    type="email"
                    required
                    value={pwdEmail}
                    onChange={(e) => setPwdEmail(e.target.value)}
                    placeholder="admin@hcmute.edu.vn"
                    className="w-full px-3.5 h-11 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#115eff] focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Mật khẩu
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-bold text-[#115eff] hover:underline cursor-pointer"
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={pwdPassword}
                    onChange={(e) => setPwdPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 h-11 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#115eff] focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#115eff] hover:bg-[#0a4de6] active:bg-[#083eb8] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Đang xác thực..." : "Đăng Nhập Với Mật Khẩu"}
                </button>
              </form>
            )}

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
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-7 h-7 rounded-full border-2 border-[#115eff] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}
