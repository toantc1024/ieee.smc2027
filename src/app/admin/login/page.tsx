"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { GridPattern } from "@/components/ui/grid-pattern";

/* ── Poster Slideshow: Ho Chi Minh City Landmarks & HCMUTE ── */
const SLIDES = [
  {
    image: "/login/posters/hcmc-skyline.jpg",
    title: "SAI GON",
    subtitle: "Dynamic Metropolis & Warm Hospitality",
  },
  {
    image: "/login/posters/1-sang-tao.jpg",
    title: "INNOVATE",
    subtitle: "Human-Centric Intelligence & Systems",
  },
  {
    image: "/login/posters/hcmc-nguyen-hue.jpg",
    title: "CONVERGE",
    subtitle: "Uniting Global Pioneers at IEEE SMC 2027",
  },
  {
    image: "/login/posters/2-hien-dai.jpg",
    title: "SYNERGY",
    subtitle: "Autonomous & Sustainable Future",
  },
  {
    image: "/login/posters/hcmc-ben-thanh.jpg",
    title: "HERITAGE",
    subtitle: "Rich Traditions & Welcoming Spirit",
  },
] as const;

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

  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

  const [emailMode, setEmailMode] = useState<EmailAuthMode>("otp");
  const [loading, setLoading] = useState(false);
  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);

  const [email, setEmail] = useState("admin@hcmute.edu.vn");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [devEmailLink, setDevEmailLink] = useState<string | null>(null);

  const [pwdPassword, setPwdPassword] = useState("Admin@Smc2027Secure!");
  const [showPassword, setShowPassword] = useState(false);

  const derivedError =
    errorParam === "missing_google_credentials"
      ? "Google Client Secret is not configured yet. Please sign in with Email above."
      : errorParam
      ? `Authentication error: ${errorParam}`
      : null;

  const errorMessage = customError || derivedError;

  const handleGoogleLogin = () => {
    setLoading(true);
    setCustomError(null);
    window.location.assign("/api/auth/google");
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setCustomError(null);
    setCustomSuccess(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setCustomSuccess(
          data.message || "Sign-in link and verification code sent to your email."
        );
        if (data.devCode) {
          setDevOtpHint(data.devCode);
          setOtpCode(data.devCode);
        }
        if (data.devEmailLink) {
          setDevEmailLink(data.devEmailLink);
        }
      } else {
        setCustomError(data.error || "Failed to send sign-in link.");
      }
    } catch {
      setCustomError("Unable to connect to authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpCode = async (codeToVerify: string) => {
    if (!email || codeToVerify.length !== 6 || loading) return;
    setLoading(true);
    setCustomError(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeToVerify }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.redirectTo || "/admin");
      } else {
        setCustomError(data.error || "Invalid verification code.");
      }
    } catch {
      setCustomError("Unable to connect to verification server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyOtpCode(otpCode);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !pwdPassword) return;
    setLoading(true);
    setCustomError(null);

    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pwdPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.redirectTo || "/admin");
      } else {
        setCustomError(data.error || "Incorrect email or password.");
      }
    } catch {
      setCustomError("Unable to connect to authentication server.");
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
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[calc(58%-0.5rem)] xl:w-[calc(60%-0.5rem)] flex flex-col h-[320px] sm:h-[370px] lg:h-full min-h-0 min-w-0 shrink-0">
        <div className="relative w-full h-full rounded-lg overflow-hidden shadow-md lg:shadow-[0_16px_48px_-12px_rgba(17,94,255,0.20)] border-b lg:border border-[#115eff]/20 flex flex-col justify-between select-none">
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

            <div className="absolute inset-0 bg-gradient-to-tr from-[#0a4de6]/30 via-transparent to-[#115eff]/20 mix-blend-multiply pointer-events-none" />

            <GridPattern
              width={28}
              height={28}
              strokeDasharray="4 2"
              className="absolute -bottom-8 -left-8 w-88 h-88 opacity-30 text-white pointer-events-none z-10 hidden sm:block"
            />

            <div
              className="absolute inset-0 opacity-[0.20] mix-blend-overlay pointer-events-none z-15"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundRepeat: "repeat",
              }}
            />

            <div className="absolute inset-x-0 top-0 h-28 sm:h-44 bg-gradient-to-b from-[#115eff]/80 via-[#0a4de6]/30 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-44 sm:h-60 lg:h-72 bg-gradient-to-t from-[#05225c] via-[#0a4de6]/90 via-35% via-[#115eff]/55 via-65% to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-28 sm:h-40 bg-gradient-to-tr from-[#115eff]/30 via-white/10 to-transparent mix-blend-overlay pointer-events-none z-12" />
          </div>

          {/* Top Brand Bar */}
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

          {/* Bottom Typography */}
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

            <div
              className="relative w-full max-w-full flex justify-center items-center py-1 overflow-visible"
              style={{
                maskImage:
                  "linear-gradient(to bottom, #000 0%, #000 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.2) 85%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, #000 0%, #000 35%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0.2) 85%, transparent 100%)",
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
                    className="font-black uppercase select-none leading-[1.05] pt-1 pb-2 whitespace-nowrap text-[36px] sm:text-[50px] lg:text-[clamp(2.5rem,6.2vw,96px)] tracking-[-0.03em] font-sans"
                    style={{
                      background:
                        "linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 22%, #CBD5E1 48%, #94A3B8 72%, #E2E8F0 88%, rgba(255,255,255,0.75) 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      filter:
                        "drop-shadow(0 4px 20px rgba(0, 34, 68, 0.85)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4))",
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
          RIGHT COLUMN (40% on Desktop): Auth Card
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[calc(42%-0.5rem)] xl:w-[calc(40%-0.5rem)] flex flex-col h-auto lg:h-full min-h-0 min-w-0 shrink-0 relative px-4 sm:px-6 lg:px-0 -mt-8 sm:-mt-10 lg:mt-0 z-20 pb-8 lg:pb-0">
        <div className="relative z-10 flex flex-col justify-center items-center flex-1 min-h-0 rounded-lg border border-slate-200/90 bg-white shadow-md lg:shadow-[0_16px_50px_rgba(17,94,255,0.08)] p-5 sm:p-7 lg:p-6 xl:p-8 overflow-y-auto">
          <GridPattern
            width={32}
            height={32}
            strokeDasharray="0"
            className="absolute inset-0 w-full h-full stroke-[#115eff]/10 fill-none opacity-40 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)] pointer-events-none"
          />

          <div className="relative z-20 w-full max-w-[400px] mx-auto my-auto flex flex-col justify-center">
            <div className="mb-5 text-center">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                IEEE SMC 2027 CMS
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to manage conference content, registrations, and system modules.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs text-center leading-relaxed">
                {errorMessage}
              </div>
            )}

            {customSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs text-center leading-relaxed">
                {customSuccess}
              </div>
            )}

            {/* ── Step 1 & 2: Progressive Email-First OTP Flow ── */}
            {emailMode === "otp" && (
              <div className="space-y-3">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@hcmute.edu.vn"
                        className="w-full px-3.5 h-11 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white text-slate-900 font-medium transition-colors"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full h-11 bg-[#115eff] hover:bg-[#0a4de6] active:bg-[#083eb8] text-white font-bold text-xs sm:text-sm rounded-md shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Sending code..." : "Continue with Email"}
                    </button>

                    <div className="text-center pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEmailMode("password");
                          setCustomError(null);
                          setCustomSuccess(null);
                        }}
                        className="text-xs text-slate-500 hover:text-[#115eff] cursor-pointer font-semibold transition-colors"
                      >
                        Use password instead
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>
                        Sent to: <strong className="text-slate-900">{email}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setCustomError(null);
                          setCustomSuccess(null);
                        }}
                        className="text-[#115eff] hover:underline cursor-pointer font-bold"
                      >
                        Change email
                      </button>
                    </div>

                    {(devOtpHint || devEmailLink) && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[#115eff] text-xs text-center space-y-2">
                        {devOtpHint && (
                          <div className="font-bold">
                            Dev Verification Code: {devOtpHint}
                          </div>
                        )}
                        {devEmailLink && (
                          <div>
                            <a
                              href={devEmailLink}
                              className="inline-flex items-center justify-center px-3 py-1.5 rounded-md bg-[#115eff] text-white font-bold text-xs hover:bg-[#0a4de6] transition-colors"
                            >
                              Click Email Sign-In Link
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 text-center">
                        Enter 6-digit verification code
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        required
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "").slice(0, 6);
                          setOtpCode(digits);
                          if (digits.length === 6) {
                            void verifyOtpCode(digits);
                          }
                        }}
                        placeholder="123456"
                        className="w-full tracking-widest text-center font-mono font-black text-lg h-11 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white text-slate-900"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otpCode.length !== 6}
                      className="w-full h-11 bg-[#115eff] hover:bg-[#0a4de6] active:bg-[#083eb8] text-white font-bold text-xs sm:text-sm rounded-md shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                    >
                      {loading ? "Verifying..." : "Verify & Sign In"}
                    </button>

                    <div className="flex items-center justify-between pt-0.5 text-xs">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="text-slate-500 hover:text-[#115eff] cursor-pointer font-medium transition-colors"
                      >
                        Resend code
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEmailMode("password");
                          setCustomError(null);
                          setCustomSuccess(null);
                        }}
                        className="text-slate-500 hover:text-[#115eff] cursor-pointer font-semibold transition-colors"
                      >
                        Use password instead
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* ── Fallback: Email & Password ── */}
            {emailMode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hcmute.edu.vn"
                    className="w-full px-3.5 h-11 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-bold text-[#115eff] hover:underline cursor-pointer"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={pwdPassword}
                    onChange={(e) => setPwdPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 h-11 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:border-[#115eff] focus:bg-white text-slate-900 font-medium transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#115eff] hover:bg-[#0a4de6] active:bg-[#083eb8] text-white font-bold text-xs sm:text-sm rounded-md shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? "Signing in..." : "Sign In with Password"}
                </button>

                <div className="text-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailMode("otp");
                      setCustomError(null);
                    }}
                    className="text-xs text-slate-500 hover:text-[#115eff] cursor-pointer font-semibold transition-colors"
                  >
                    Use verification code instead
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-slate-200"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* ── Social Login: Borderless Theme-Synced Google OAuth Button ── */}
            <div className="space-y-2.5 w-full">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-3 px-4 bg-slate-100 hover:bg-slate-200/80 text-slate-900 font-bold text-xs sm:text-sm rounded-md border-0 transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                <GoogleLogo className="w-4 h-4 shrink-0" />
                <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
              </button>
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
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="w-7 h-7 rounded-full border-2 border-[#115eff] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}
