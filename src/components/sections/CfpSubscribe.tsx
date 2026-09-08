"use client";

import React, { useState } from "react";
import { Bell, CheckCircle2, ArrowRight } from "lucide-react";

export function CfpSubscribe() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <section className="w-full bg-gradient-to-r from-blue-700 via-[#115eff] to-blue-900 text-white relative overflow-hidden border-b border-white/20">
      {/* High-Tech Corner Grid (Top-Right) & Dot (Bottom-Left) Accents */}
      <div className="corner-grid-dark-tr opacity-30" />
      <div className="corner-dot-dark-bl opacity-35" />

      <div className="w-full max-w-[1380px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
        <div className="w-full border-x border-white/20 px-4 sm:px-6 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 border border-white/20 text-sm font-semibold text-blue-200 rounded-full mb-3">
                <Bell className="w-4 h-4 text-blue-200" />
                <span>Stay Informed • IEEE SMC 2027 Alerts</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                Receive CFP Updates & Deadline Alerts
              </h3>
            <p className="mt-2 text-sm sm:text-base text-blue-100 font-normal max-w-xl leading-relaxed">
              Subscribe for official alerts on submission deadlines, keynote announcements, and registration milestones.
            </p>
          </div>

          <div className="lg:col-span-5">
            {submitted ? (
              <div className="p-6 bg-white/10 backdrop-blur-xs border border-white/25 rounded-md flex items-center gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-300 shrink-0" />
                <div className="text-sm text-blue-100">
                  <span className="font-bold text-white block text-base">Subscription Confirmed!</span>
                  You will receive IEEE SMC 2027 milestone alerts at <em>{email}</em>.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="grow px-4 py-3.5 bg-white/15 backdrop-blur-xs border border-white/25 text-white text-sm sm:text-base rounded-[0.26rem] focus:outline-none focus:border-white focus:bg-white/20 placeholder:text-blue-200 min-h-[52px]"
                />
                <button
                  type="submit"
                  className="min-h-[52px] px-8 py-3.5 bg-white hover:bg-blue-50 text-[#115eff] font-bold text-base rounded-[0.26rem] transition-all shadow-md hover:shadow-lg shrink-0 flex items-center justify-center gap-2.5"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4 text-[#115eff]" />
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  </section>
);
}
