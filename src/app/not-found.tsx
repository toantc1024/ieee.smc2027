"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, Users, Mail, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-slate-50 via-blue-50/25 to-slate-100 font-sans p-4 sm:p-6 relative overflow-hidden select-none">
      {/* Ambient background glow matching HCMUTE Royal Blue */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#115eff]/10 rounded-full blur-[140px]" />
        <div className="corner-grid-tr opacity-40 pointer-events-none" />
        <div className="corner-dot-bl opacity-30 pointer-events-none" />
      </div>

      <div className="max-w-lg w-full text-center space-y-6 bg-white/90 backdrop-blur-2xl p-8 sm:p-12 rounded-3xl border border-slate-200/90 shadow-2xl shadow-blue-950/5 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Floating 3D 404 Visual Stage */}
        <div className="relative flex flex-col items-center justify-center pt-2">
          {/* Decorative Sparkles */}
          <div className="absolute -top-1 -right-2 text-amber-400 select-none pointer-events-none text-sm animate-pulse">
            ✦
          </div>
          <div className="absolute top-1/2 -left-4 text-[#115eff] text-xs select-none pointer-events-none animate-bounce">
            ◆
          </div>

          {/* 3D 404 Mascot Icon with gentle floating animation */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 select-none z-10 transition-transform duration-700 hover:scale-105">
            <Image
              src="/assets/3d-icons/404__3d-icon.png"
              alt="404 - Page Not Found"
              fill
              priority
              sizes="(max-width: 640px) 208px, 240px"
              className="object-contain drop-shadow-2xl"
            />
          </div>

          {/* Dynamic Ground Shadow */}
          <div className="mt-2 w-36 h-4 rounded-[100%] bg-slate-900/15 blur-md pointer-events-none" />
        </div>

        {/* 404 Heading & Description */}
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[#115eff] text-xs font-extrabold uppercase tracking-wider">
            <span>Error 404 • Not Found</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#004776] tracking-tight">
            Page Not Found
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            The link you followed may be broken, renamed, or is temporarily unavailable on the IEEE SMC 2027 official conference portal.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            href="/committees"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 bg-white hover:bg-slate-50 text-[#004776] border border-slate-200 hover:border-blue-300 font-bold text-xs sm:text-sm rounded-xl shadow-2xs transition-all active:scale-95"
          >
            <Users className="w-4 h-4 text-[#115eff]" />
            <span>Committees</span>
          </Link>
        </div>

        {/* Quick Help Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-1 hover:text-[#115eff] font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>

          <a
            href="mailto:ieeesmc2027@hcmute.edu.vn"
            className="inline-flex items-center gap-1 hover:text-[#115eff] transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-slate-400" />
            <span>Contact Support Desk</span>
          </a>
        </div>
      </div>
    </div>
  );
}
