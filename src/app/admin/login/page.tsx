"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Mail,
  KeyRound,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

/* ── Poster Slideshow: Ho Chi Minh City Landmarks & HCMUTE ── */
const SLIDES = [
  {
    image: "/login/posters/hcmc-skyline.jpg",
    title: "Dynamic Saigon",
    subtitle: "A vibrant metropolis welcoming global pioneers in AI and systems engineering.",
  },
  {
    image: "/login/posters/1-sang-tao.jpg",
    title: "Human-Centric Intelligence",
    subtitle: "Pioneering the frontiers of cybernetics, autonomous robotics, and interactive systems.",
  },
  {
    image: "/login/posters/hcmc-nguyen-hue.jpg",
    title: "Global Collaboration",
    subtitle: "Uniting leading researchers, industry visionaries, and IEEE delegates worldwide.",
  },
  {
    image: "/login/posters/2-hien-dai.jpg",
    title: "Sustainable Cybernetics",
    subtitle: "Fostering impactful technological breakthroughs for a connected and resilient world.",
  },
  {
    image: "/login/posters/hcmc-ben-thanh.jpg",
    title: "Cultural Heritage",
    subtitle: "Discover Vietnam's hospitality, timeless culture, and thriving technology landscape.",
  },
] as const;

/* ── Official Google 4-Color SVG Logo ── */
function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg className={className || "w-4 h-4"} viewBox="0 0 24 24">
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
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
      ? "Google OAuth is not configured on this server. Please use email sign in."
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
          data.message || "A 6-digit verification code has been dispatched."
        );
        if (data.devCode) {
          setDevOtpHint(data.devCode);
          setOtpCode(data.devCode);
        }
        if (data.devEmailLink) {
          setDevEmailLink(data.devEmailLink);
        }
      } else {
        setCustomError(data.error || "Failed to dispatch verification code.");
      }
    } catch {
      setCustomError("Unable to reach authentication server.");
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
      setCustomError("Unable to reach verification server.");
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
      setCustomError("Unable to reach authentication server.");
    } finally {
      setLoading(false);
    }
  };

  const currentSlide = SLIDES[slideIdx];

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-50 font-sans antialiased text-slate-900">
      {/* ═══════════════════════════════════════════════════════════════════
          LEFT COLUMN: Conference Visual Showcase
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full lg:w-[54%] xl:w-[58%] min-h-[380px] lg:min-h-screen overflow-hidden bg-[#002b54] flex flex-col justify-between p-6 sm:p-10 lg:p-12 text-white">
        {/* Smooth Crossfade Image Slideshow */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence initial={false}>
            <motion.img
              key={slideIdx}
              src={currentSlide.image}
              alt={currentSlide.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </AnimatePresence>

          {/* High-Contrast Gradient Backdrop for Flawless Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#001f3f] via-[#00386b]/75 to-[#005496]/45" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001f3f]/80 to-transparent" />
        </div>

        {/* Top Header Branding */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/login/rectangle-logo-white.png"
              alt="HCMUTE Logo"
              className="h-9 sm:h-11 w-auto object-contain drop-shadow-md"
            />
            <div className="hidden sm:flex flex-col border-l border-white/20 pl-3">
              <span className="font-extrabold text-base tracking-tight text-white">
                IEEE SMC 2027
              </span>
              <span className="text-[11px] text-blue-200 font-medium">
                Ho Chi Minh City, Vietnam
              </span>
            </div>
          </div>

          <Badge className="bg-white/15 hover:bg-white/25 text-white border-white/20 backdrop-blur-md text-[11px] font-medium">
            October 2027
          </Badge>
        </div>

        {/* Bottom Hero Text and Slide Navigation */}
        <div className="relative z-10 mt-auto pt-12 space-y-5">
          <div className="space-y-2 max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-widest text-blue-300">
              IEEE Systems, Man, and Cybernetics Society
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {currentSlide.title}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal max-w-lg">
              {currentSlide.subtitle}
            </p>
          </div>

          {/* Interactive Slide Indicators */}
          <div className="flex items-center gap-2 pt-2">
            {SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSlideIdx(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  slideIdx === idx ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          RIGHT COLUMN: Standard Admin Authentication
         ═══════════════════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-[46%] xl:w-[42%] flex flex-col justify-center items-center p-6 sm:p-10 lg:p-14 bg-white min-h-[520px]">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="space-y-1.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-50 text-[#005496] border border-blue-100 text-xs font-semibold mb-2">
              <Shield className="size-3.5" />
              <span>Admin Console</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Manage conference operations, registrations, and content.
            </p>
          </div>

          {/* Feedback Banners */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-xs leading-relaxed">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-rose-600" />
              <div>{errorMessage}</div>
            </div>
          )}

          {customSuccess && (
            <div className="flex items-start gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs leading-relaxed">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
              <div>{customSuccess}</div>
            </div>
          )}

          {/* Google OAuth Quick Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full h-11 flex items-center justify-center gap-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm rounded-lg border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <GoogleLogo className="size-4 shrink-0" />
            <span>{loading ? "Connecting to Google..." : "Continue with Google"}</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200" />
            <span className="flex-shrink mx-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              or continue with email
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>

          {/* Auth Mode Toggle Pill */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setEmailMode("otp");
                setCustomError(null);
                setCustomSuccess(null);
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                emailMode === "otp"
                  ? "bg-white text-[#005496] shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Email Code
            </button>
            <button
              type="button"
              onClick={() => {
                setEmailMode("password");
                setCustomError(null);
                setCustomSuccess(null);
              }}
              className={`py-1.5 rounded-md transition-all cursor-pointer ${
                emailMode === "password"
                  ? "bg-white text-[#005496] shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Password
            </button>
          </div>

          {/* ── Mode 1: Email Code (OTP) ── */}
          {emailMode === "otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="login-email" className="text-xs font-bold text-slate-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Input
                        id="login-email"
                        type="email"
                        required
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="admin@hcmute.edu.vn"
                        className="pl-9 h-10 text-xs sm:text-sm bg-white"
                      />
                      <Mail className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-10 bg-[#005496] hover:bg-[#004776] text-white font-semibold text-xs sm:text-sm rounded-lg"
                  >
                    {loading ? "Sending Code..." : "Continue with Email Code"}
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>
                      Code sent to: <strong className="text-slate-900">{email}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setCustomError(null);
                        setCustomSuccess(null);
                      }}
                      className="text-[#005496] hover:underline cursor-pointer font-bold"
                    >
                      Change
                    </button>
                  </div>

                  {/* Dev Code Hint Box */}
                  {(devOtpHint || devEmailLink) && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-[#005496] text-xs space-y-2">
                      {devOtpHint && (
                        <div className="flex items-center justify-between">
                          <span>Developer Verification Code:</span>
                          <span className="font-mono font-bold tracking-widest text-sm bg-white px-2 py-0.5 rounded border border-blue-200">
                            {devOtpHint}
                          </span>
                        </div>
                      )}
                      {devEmailLink && (
                        <div>
                          <a
                            href={devEmailLink}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#005496] text-white font-bold text-[11px] hover:bg-[#004776]"
                          >
                            <span>Open Sign-In Link</span>
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-1.5">
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
                      className="h-11 tracking-widest text-center font-mono font-bold text-lg bg-white"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || otpCode.length !== 6}
                    className="w-full h-10 bg-[#005496] hover:bg-[#004776] text-white font-semibold text-xs sm:text-sm rounded-lg"
                  >
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </Button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-xs text-slate-500 hover:text-[#005496] font-medium cursor-pointer"
                    >
                      Did not receive code? Resend
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ── Mode 2: Password Authentication ── */}
          {emailMode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="pwd-email" className="text-xs font-bold text-slate-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="pwd-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hcmute.edu.vn"
                    className="pl-9 h-10 text-xs sm:text-sm bg-white"
                  />
                  <Mail className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pwd-password" className="text-xs font-bold text-slate-700">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] font-semibold text-[#005496] hover:underline cursor-pointer flex items-center gap-1"
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
                    id="pwd-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={pwdPassword}
                    onChange={(e) => setPwdPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-9 h-10 text-xs sm:text-sm bg-white"
                  />
                  <KeyRound className="absolute left-3 top-3 size-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-[#005496] hover:bg-[#004776] text-white font-semibold text-xs sm:text-sm rounded-lg"
              >
                {loading ? "Signing In..." : "Sign In with Password"}
              </Button>
            </form>
          )}

          {/* Footer Portal Links */}
          <div className="pt-2 text-center text-xs text-slate-500">
            <span>Need attendee registration? </span>
            <a
              href="/#register"
              className="font-semibold text-[#005496] hover:underline"
            >
              Register here
            </a>
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
          <div className="size-7 rounded-full border-2 border-[#005496] border-t-transparent animate-spin" />
        </div>
      }
    >
      <AdminLoginForm />
    </React.Suspense>
  );
}
