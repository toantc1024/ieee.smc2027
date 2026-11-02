"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  User as UserIcon,
  Building2,
  UserPlus,
} from "lucide-react";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

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
    subtitle: "Human-AI Symbiosis & Systems",
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
    <svg className={className || "size-4"} viewBox="0 0 24 24">
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

type PrimaryTab = "signin" | "signup";
type SignInMethod = "password" | "otp";
type ConferenceRole = "SUBMITTER" | "SPEAKER" | "ATTENDEE";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [primaryTab, setPrimaryTab] = useState<PrimaryTab>("signin");
  const [signInMethod, setSignInMethod] = useState<SignInMethod>("password");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const [customError, setCustomError] = useState<string | null>(null);
  const [customSuccess, setCustomSuccess] = useState<string | null>(null);

  // Common fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Sign up specific fields
  const [name, setName] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [conferenceRole, setConferenceRole] = useState<ConferenceRole>("SUBMITTER");

  // OTP specific state
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const derivedError =
    errorParam === "missing_google_credentials"
      ? "Google Client Secret is not configured yet. Please sign in with Email."
      : errorParam
      ? `Authentication message: ${errorParam}`
      : null;

  const errorMessage = customError || derivedError;

  const clearMessages = () => {
    setCustomError(null);
    setCustomSuccess(null);
  };

  /* ── Google OAuth 2.0 Sign In ── */
  const handleGoogleLogin = () => {
    if (googleLoading || loading) return;
    setGoogleLoading(true);
    clearMessages();
    window.location.assign("/api/auth/google");
  };

  /* ── Password Login (Auto-creates account if not existing) ── */
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || loading) return;
    setLoading(true);
    clearMessages();

    try {
      const res = await fetch("/api/auth/login-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.redirectTo || "/portal");
      } else {
        setCustomError(data.error || "Incorrect email or password.");
      }
    } catch {
      setCustomError("Unable to reach authentication server.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Explicit Account Creation (Sign Up) ── */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name || loading) return;
    setLoading(true);
    clearMessages();

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          conferenceRole,
          affiliation,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCustomSuccess("Account created successfully. Redirecting...");
        setTimeout(() => {
          router.push(data.redirectTo || "/portal");
        }, 800);
      } else {
        setCustomError(data.error || "Failed to create account.");
      }
    } catch {
      setCustomError("Unable to reach registration server.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Send OTP Code ── */
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);
    clearMessages();

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
          data.message || "A 6-digit verification code has been dispatched to your email."
        );
      } else {
        setCustomError(data.error || "Failed to dispatch verification code.");
      }
    } catch {
      setCustomError("Unable to reach authentication server.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Verify OTP Code ── */
  const verifyOtpCode = async (codeToVerify: string) => {
    if (!email || codeToVerify.length !== 6 || loading) return;
    setLoading(true);
    clearMessages();

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeToVerify }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(data.redirectTo || "/portal");
      } else {
        setCustomError(data.error || "Invalid verification code.");
      }
    } catch {
      setCustomError("Unable to reach verification server.");
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = SLIDES[slideIdx];

  return (
    <div
      data-no-page-borders="true"
      className="admin-page-root no-page-borders min-h-screen lg:h-dvh w-full flex flex-col lg:flex-row bg-[#F8FAFC] text-slate-900 font-sans antialiased p-3 sm:p-4 lg:p-4 gap-3 sm:gap-4 lg:overflow-hidden overflow-y-auto box-border select-none"
    >
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT CARD: Poster Slideshow Card
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[calc(58%-0.5rem)] xl:w-[calc(60%-0.5rem)] flex flex-col h-[320px] sm:h-[380px] lg:h-full min-h-0 min-w-0 shrink-0">
        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-md lg:shadow-[0_16px_48px_-12px_rgba(17,94,255,0.20)] border border-[#115eff]/20 flex flex-col justify-between select-none">
          <div className="absolute inset-0 bg-[#115eff] overflow-hidden">
            <AnimatePresence initial={false}>
              <motion.img
                key={slideIdx}
                src={currentSlide.image}
                alt={currentSlide.title}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />
            </AnimatePresence>

            <div className="absolute inset-x-0 top-0 h-28 sm:h-36 bg-gradient-to-b from-black/45 via-black/15 to-transparent pointer-events-none z-10" />
            <div className="absolute inset-x-0 bottom-0 h-44 sm:h-64 bg-gradient-to-t from-black/75 via-black/35 to-transparent pointer-events-none z-10" />

            <GridPattern
              width={28}
              height={28}
              strokeDasharray="4 2"
              className="absolute -bottom-8 -left-8 size-80 opacity-20 text-white pointer-events-none z-10 hidden sm:block"
            />
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
                <span className="text-white font-extrabold text-sm sm:text-base tracking-tight leading-none drop-shadow-md">
                  IEEE SMC 2027
                </span>
                <span className="text-blue-100 text-[11px] font-medium tracking-wide mt-0.5 drop-shadow-sm">
                  Ho Chi Minh City, Vietnam
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Typography */}
          <div className="relative z-20 px-4 sm:px-6 pb-6 sm:pb-8 flex flex-col items-center text-center w-full max-w-full mt-auto overflow-visible">
            <AnimatePresence mode="wait">
              <motion.p
                key={slideIdx + "-sub"}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="text-white text-xs sm:text-sm lg:text-base font-medium tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-1 max-w-full whitespace-nowrap text-center select-none"
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
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -14, scale: 1.03 }}
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
          RIGHT CARD: Authentication & Account Creation
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[calc(42%-0.5rem)] xl:w-[calc(40%-0.5rem)] flex flex-col h-auto lg:h-full min-h-0 min-w-0 shrink-0 relative z-20 pb-4 lg:pb-0">
        <div className="relative z-10 flex flex-col justify-center items-center flex-1 min-h-0 rounded-2xl border border-slate-200/90 bg-white shadow-md lg:shadow-[0_16px_50px_rgba(17,94,255,0.08)] p-6 sm:p-8 lg:p-7 xl:p-9 overflow-y-auto">
          <GridPattern
            width={32}
            height={32}
            strokeDasharray="0"
            className="absolute inset-0 size-full stroke-[#115eff]/10 fill-none opacity-40 [mask-image:radial-gradient(450px_circle_at_center,white,transparent)] pointer-events-none"
          />

          <div className="relative z-20 w-full max-w-[390px] mx-auto my-auto flex flex-col justify-center space-y-4">
            {/* Header: Clean, without Admin Console badge */}
            <div className="text-center space-y-1">
              <h1 className="text-xl sm:text-2xl font-black text-[#004776] tracking-tight">
                IEEE SMC 2027
              </h1>
              <p className="text-xs text-slate-500">
                Conference portal & delegate management platform
              </p>
            </div>

            {/* Primary Tab Toggle: Sign In vs Create Account */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPrimaryTab("signin");
                  clearMessages();
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  primaryTab === "signin"
                    ? "bg-white text-[#115eff] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrimaryTab("signup");
                  clearMessages();
                }}
                className={`py-2 rounded-lg transition-all cursor-pointer ${
                  primaryTab === "signup"
                    ? "bg-white text-[#115eff] shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error & Success Feedback */}
            {errorMessage && (
              <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs leading-relaxed">
                <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
                <div>{errorMessage}</div>
              </div>
            )}

            {customSuccess && (
              <div className="flex items-start gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs leading-relaxed">
                <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                <div>{customSuccess}</div>
              </div>
            )}

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full h-10 flex items-center justify-center gap-2.5 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <GoogleLogo className="size-4 shrink-0" />
              <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-0.5">
              <div className="flex-grow border-t border-slate-200" />
              <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                or continue with email
              </span>
              <div className="flex-grow border-t border-slate-200" />
            </div>

            {/* ═════════════════════════════════════════════════════════════
                TAB 1: SIGN IN (Password or Email Code)
               ═════════════════════════════════════════════════════════════ */}
            {primaryTab === "signin" && (
              <div className="space-y-3.5">
                {/* Secondary Pill: Password vs Email Code */}
                <div className="flex items-center justify-center gap-4 text-xs border-b border-slate-100 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod("password");
                      clearMessages();
                    }}
                    className={`pb-1 font-medium transition-colors cursor-pointer border-b-2 ${
                      signInMethod === "password"
                        ? "border-[#115eff] text-[#115eff] font-bold"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Password
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignInMethod("otp");
                      clearMessages();
                    }}
                    className={`pb-1 font-medium transition-colors cursor-pointer border-b-2 ${
                      signInMethod === "otp"
                        ? "border-[#115eff] text-[#115eff] font-bold"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    Email Code
                  </button>
                </div>

                {/* Sub-mode 1: Password */}
                {signInMethod === "password" && (
                  <form onSubmit={handlePasswordLogin} className="space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="signin-email" className="text-xs font-bold text-slate-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="signin-email"
                          type="email"
                          required
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@example.com"
                          className="pl-9 h-10 text-xs sm:text-sm bg-white"
                        />
                        <Mail className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="signin-password" className="text-xs font-bold text-slate-700">
                          Password
                        </Label>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-[11px] font-semibold text-[#115eff] hover:underline cursor-pointer flex items-center gap-1"
                        >
                          {showPassword ? (
                            <>
                              <EyeOff className="size-3" />
                              <span>Hide</span>
                            </>
                          ) : (
                            <>
                              <Eye className="size-3" />
                              <span>Show</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          required
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pl-9 h-10 text-xs sm:text-sm bg-white"
                        />
                        <KeyRound className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-tight">
                      First time here? An account will be automatically set up if you do not have one yet.
                    </p>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-10 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs"
                    >
                      {loading ? "Signing in..." : "Sign In"}
                      <ArrowRight className="size-4 ml-1" />
                    </Button>
                  </form>
                )}

                {/* Sub-mode 2: Email Code (OTP) */}
                {signInMethod === "otp" && (
                  <div className="space-y-3">
                    {!otpSent ? (
                      <form onSubmit={handleSendOtp} className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="otp-email" className="text-xs font-bold text-slate-700">
                            Email Address
                          </Label>
                          <div className="relative">
                            <Input
                              id="otp-email"
                              type="email"
                              required
                              autoComplete="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="your.email@example.com"
                              className="pl-9 h-10 text-xs sm:text-sm bg-white"
                            />
                            <Mail className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          disabled={loading}
                          className="w-full h-10 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs"
                        >
                          {loading ? "Sending code..." : "Send Verification Code"}
                          <ArrowRight className="size-4 ml-1" />
                        </Button>
                      </form>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs text-slate-600">
                          <span>
                            Sent to: <strong className="text-slate-900">{email}</strong>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setOtpSent(false);
                              clearMessages();
                            }}
                            className="text-[#115eff] hover:underline cursor-pointer font-bold"
                          >
                            Change
                          </button>
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor="otp-code" className="text-xs font-bold text-slate-700">
                            6-Digit Verification Code
                          </Label>
                          <Input
                            id="otp-code"
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
                            className="h-11 tracking-widest text-center font-bold text-lg bg-white"
                          />
                        </div>

                        <Button
                          type="button"
                          onClick={() => verifyOtpCode(otpCode)}
                          disabled={loading || otpCode.length !== 6}
                          className="w-full h-10 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs"
                        >
                          {loading ? "Verifying..." : "Verify & Sign In"}
                        </Button>

                        <div className="text-center pt-0.5">
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="text-xs text-slate-500 hover:text-[#115eff] font-medium cursor-pointer"
                          >
                            Resend code
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ═════════════════════════════════════════════════════════════
                TAB 2: CREATE ACCOUNT (Sign Up with Role Selection)
               ═════════════════════════════════════════════════════════════ */}
            {primaryTab === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="signup-name" className="text-xs font-bold text-slate-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyen Van A"
                      className="pl-9 h-10 text-xs sm:text-sm bg-white"
                    />
                    <UserIcon className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="signup-email" className="text-xs font-bold text-slate-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="pl-9 h-10 text-xs sm:text-sm bg-white"
                    />
                    <Mail className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="signup-password" className="text-xs font-bold text-slate-700">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-[11px] font-semibold text-[#115eff] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      {showPassword ? (
                        <>
                          <EyeOff className="size-3" />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="size-3" />
                          <span>Show</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-9 h-10 text-xs sm:text-sm bg-white"
                    />
                    <KeyRound className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                {/* Conference Participation Role */}
                <div className="space-y-1.5 pt-0.5">
                  <Label className="text-xs font-bold text-slate-700">
                    I am joining as:
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setConferenceRole("SUBMITTER")}
                      className={`py-2 px-2 rounded-lg text-[11px] font-semibold text-center border transition-all cursor-pointer ${
                        conferenceRole === "SUBMITTER"
                          ? "border-[#115eff] bg-blue-50/80 text-[#115eff] ring-1 ring-[#115eff]"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      Submitter
                    </button>
                    <button
                      type="button"
                      onClick={() => setConferenceRole("SPEAKER")}
                      className={`py-2 px-2 rounded-lg text-[11px] font-semibold text-center border transition-all cursor-pointer ${
                        conferenceRole === "SPEAKER"
                          ? "border-[#115eff] bg-blue-50/80 text-[#115eff] ring-1 ring-[#115eff]"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      Speaker
                    </button>
                    <button
                      type="button"
                      onClick={() => setConferenceRole("ATTENDEE")}
                      className={`py-2 px-2 rounded-lg text-[11px] font-semibold text-center border transition-all cursor-pointer ${
                        conferenceRole === "ATTENDEE"
                          ? "border-[#115eff] bg-blue-50/80 text-[#115eff] ring-1 ring-[#115eff]"
                          : "border-slate-200 text-slate-600 hover:border-slate-300 bg-white"
                      }`}
                    >
                      Attendee
                    </button>
                  </div>
                </div>

                {/* Affiliation */}
                <div className="space-y-1">
                  <Label htmlFor="signup-affiliation" className="text-xs font-bold text-slate-700">
                    Affiliation or University
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-affiliation"
                      type="text"
                      value={affiliation}
                      onChange={(e) => setAffiliation(e.target.value)}
                      placeholder="e.g. HCMUTE, IEEE Member, University"
                      className="pl-9 h-10 text-xs sm:text-sm bg-white"
                    />
                    <Building2 className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 bg-[#115eff] hover:bg-[#0a4de6] text-white font-semibold text-xs sm:text-sm rounded-lg shadow-xs mt-2"
                >
                  <UserPlus className="size-4 mr-1.5" />
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            )}

            {/* Quick Switch Footer */}
            <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
              {primaryTab === "signin" ? (
                <span>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setPrimaryTab("signup");
                      clearMessages();
                    }}
                    className="font-bold text-[#115eff] hover:underline cursor-pointer"
                  >
                    Create account
                  </button>
                </span>
              ) : (
                <span>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setPrimaryTab("signin");
                      clearMessages();
                    }}
                    className="font-bold text-[#115eff] hover:underline cursor-pointer"
                  >
                    Sign in
                  </button>
                </span>
              )}
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
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
            <div className="flex flex-col items-center gap-2">
              <Skeleton className="size-12 rounded-xl" />
              <Skeleton className="h-6 w-44 rounded-md" />
              <Skeleton className="h-4 w-60 rounded-md" />
            </div>
            <div className="space-y-4 pt-2">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
          </div>
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}
