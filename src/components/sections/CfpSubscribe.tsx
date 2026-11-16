"use client";

import React, { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export interface CfpSubscribeProps {
  title?: string;
  subtitle?: string;
  buttonLabel?: string;
  successMessage?: string;
}

export function CfpSubscribe({
  title = "Receive CFP Updates & Deadline Alerts",
  subtitle = "Subscribe for official alerts on submission deadlines, keynote announcements, and registration milestones.",
  buttonLabel = "Subscribe",
  successMessage = "You will receive IEEE SMC 2027 milestone alerts at",
}: CfpSubscribeProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, source: "cfp_banner" }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(json?.error || "Unable to complete subscription.");
        return;
      }
      setSubmitted(true);
    } catch {
      setErrorMsg("Network error. Please try again shortly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full bg-gradient-to-r from-blue-700 via-[#115eff] to-blue-900 text-white relative overflow-hidden">
      {/* High-Tech Corner Grid (Top-Right) & Dot (Bottom-Left) Accents */}
      <div className="corner-grid-dark-tr opacity-30" />
      <div className="corner-dot-dark-bl opacity-35" />

      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="w-full border-x border-white/20 px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {title}
              </h3>
            <p className="mt-2 text-sm sm:text-base text-blue-100 font-normal max-w-xl leading-relaxed">
              {subtitle}
            </p>
          </div>

          <div className="lg:col-span-5">
            {submitted ? (
              <div className="p-6 bg-white/10 backdrop-blur-xs border border-white/25 rounded-sm flex items-center gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                <div className="text-sm text-blue-100">
                  <span className="font-bold text-white block text-base">Subscription Confirmed!</span>
                  {successMessage} <em>{email}</em>.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    disabled={submitting}
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className="grow px-4 py-3.5 bg-white/15 backdrop-blur-xs border border-white/25 text-white text-sm sm:text-base rounded-sm focus:outline-none focus:border-white focus:bg-white/20 placeholder:text-blue-200 min-h-[52px] disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="min-h-[52px] px-8 py-3.5 bg-white hover:bg-blue-50 text-[#115eff] font-bold text-base rounded-sm transition-all shadow-md hover:shadow-lg shrink-0 flex items-center justify-center gap-2.5 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#115eff]" />
                    ) : null}
                    <span>{submitting ? "Subscribing..." : buttonLabel}</span>
                    {!submitting && <ArrowRight className="w-4 h-4 text-[#115eff]" />}
                  </button>
                </div>
                {errorMsg && (
                  <p className="flex items-center gap-1.5 text-xs text-rose-100 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </p>
                )}
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  </section>
);
}
