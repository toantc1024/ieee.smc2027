"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Monitor,
  Smartphone,
  Download,
  Copy,
  Check,
  Maximize2,
  ShieldCheck,
  ArrowLeft,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ViewTab = "all" | "desktop" | "mobile";

export default function BlueprintPage() {
  const [viewTab, setViewTab] = useState<ViewTab>("all");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#071329] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* ── 1. HEADER BẢN VẼ BLUEPRINT ── */}
      <header className="sticky top-0 z-50 bg-[#040c1a]/95 backdrop-blur-md border-b border-cyan-500/20 px-4 sm:px-8 py-3 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-cyan-400 hover:text-white transition-colors flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-800/60 px-3 py-1.5 rounded-lg"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white flex items-center gap-2">
                <span>2 BẢN VẼ KỸ THUẬT (DESKTOP &amp; MOBILE BLUEPRINT)</span>
              </h1>
            </div>
          </div>

          {/* Chuyển chế độ xem */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg bg-[#0a1b38] p-1 border border-cyan-900/50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewTab("all")}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all cursor-pointer",
                  viewTab === "all"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow"
                    : "text-slate-300 hover:text-white"
                )}
              >
                Cả 2 Bản Vẽ
              </button>
              <button
                type="button"
                onClick={() => setViewTab("desktop")}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                  viewTab === "desktop"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow"
                    : "text-slate-300 hover:text-white"
                )}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Chỉ Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewTab("mobile")}
                className={cn(
                  "px-3 py-1.5 rounded-md transition-all cursor-pointer flex items-center gap-1.5",
                  viewTab === "mobile"
                    ? "bg-cyan-500 text-slate-950 font-bold shadow"
                    : "text-slate-300 hover:text-white"
                )}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Chỉ Mobile</span>
              </button>
            </div>

            <Link
              href="/banner-demo"
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow flex items-center gap-1.5"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Demo Co Giãn</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. BẢNG THÔNG SỐ RÚT GỌN (CHỈ METRICS, KHÔNG CHỮ THỪA) ── */}
      <section className="bg-[#051024] border-b border-cyan-900/40 px-4 sm:px-8 py-5">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>QUY CHUẨN THÔNG SỐ 2 TẤM ẢNH (EXACT METRICS ONLY)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Hai tấm ảnh template chuẩn pixel độc lập — Dùng để gửi trực tiếp cho Designer hoặc đưa vào Figma / Photoshop.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Chuẩn 1:1 Pixel Template
              </span>
            </div>
          </div>

          {/* Cards thông số Desktop & Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Desktop */}
            <div className="bg-[#091a38] border border-cyan-500/40 rounded-xl p-4 sm:p-5 relative shadow-lg">
              <div className="flex items-center justify-between border-b border-cyan-800/50 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">ẢNH 1: BANNER DESKTOP</h3>
                    <span className="text-[11px] font-mono text-cyan-400">Tỉ lệ 2.4 : 1</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        "Canvas: 2400x1000px (2.4:1) | Safe Area: 1880x720px (X: 260..2140, Y: 140..860) | Top/Bottom Bleed: 140px | Side Bleed: 260px",
                        "desktop"
                      )
                    }
                    className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 text-[11px] font-mono border border-cyan-700/60 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedKey === "desktop" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "desktop" ? "Đã chép" : "Chép số"}</span>
                  </button>
                  <a
                    href="/carousel/safe-area/desktop-blueprint.png"
                    download="desktop-blueprint.png"
                    className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải ảnh</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="bg-[#051126] p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Kích thước Canvas:</span>
                  <span className="font-bold text-white text-sm">2400 × 1000 px</span>
                </div>
                <div className="bg-[#051126] p-2 rounded-lg border border-emerald-900/50">
                  <span className="text-emerald-400 block text-[11px]">Vùng An Toàn:</span>
                  <span className="font-bold text-emerald-300 text-sm">1880 × 720 px</span>
                </div>
                <div className="bg-[#051126] p-2 rounded-lg border border-amber-900/40">
                  <span className="text-amber-400 block text-[11px]">Lề trên &amp; dưới:</span>
                  <span className="font-bold text-amber-200">140 px mỗi mép</span>
                </div>
                <div className="bg-[#051126] p-2 rounded-lg border border-amber-900/40">
                  <span className="text-amber-400 block text-[11px]">Lề 2 bên:</span>
                  <span className="font-bold text-amber-200">260 px mỗi bên</span>
                </div>
              </div>
            </div>

            {/* Card 2: Mobile */}
            <div className="bg-[#091a38] border border-emerald-500/40 rounded-xl p-4 sm:p-5 relative shadow-lg">
              <div className="flex items-center justify-between border-b border-emerald-800/50 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">ẢNH 2: BANNER MOBILE</h3>
                    <span className="text-[11px] font-mono text-emerald-400">Tỉ lệ 3 : 4</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        "Canvas: 896x1200px (3:4) | Safe Area: 800x1050px (X: 48..848, Y: 70..1120) | Top Bleed: 70px | Bottom Bleed: 80px | Side Bleed: 48px",
                        "mobile"
                      )
                    }
                    className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 text-[11px] font-mono border border-emerald-700/60 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedKey === "mobile" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "mobile" ? "Đã chép" : "Chép số"}</span>
                  </button>
                  <a
                    href="/carousel/safe-area/mobile-blueprint.png"
                    download="mobile-blueprint.png"
                    className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow"
                  >
                    <Download className="w-3 h-3" />
                    <span>Tải ảnh</span>
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="bg-[#051126] p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Kích thước Canvas:</span>
                  <span className="font-bold text-white text-sm">896 × 1200 px</span>
                </div>
                <div className="bg-[#051126] p-2 rounded-lg border border-emerald-900/50">
                  <span className="text-emerald-400 block text-[11px]">Vùng An Toàn:</span>
                  <span className="font-bold text-emerald-300 text-sm">800 × 1050 px</span>
                </div>
                <div className="bg-[#051126] p-2 rounded-lg border border-amber-900/40">
                  <span className="text-amber-400 block text-[11px]">Lề trên / dưới:</span>
                  <span className="font-bold text-amber-200">70px trên / 80px dưới</span>
                </div>
                <div className="bg-[#051126] p-2 rounded-lg border border-amber-900/40">
                  <span className="text-amber-400 block text-[11px]">Lề 2 bên:</span>
                  <span className="font-bold text-amber-200">48 px mỗi bên</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. KHU VỰC HIỂN THỊ 2 TẤM ẢNH THẬT ── */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-8 space-y-12">
        {/* ========================================================
            TẤM ẢNH 1: DESKTOP BLUEPRINT (2400 × 1000 px)
           ======================================================== */}
        {(viewTab === "all" || viewTab === "desktop") && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-800/40 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-cyan-400" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  TẤM ẢNH 1: DESKTOP BLUEPRINT — 2400 × 1000 PX (TỈ LỆ 2.4 : 1)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/carousel/safe-area/desktop-blueprint.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold transition-all border border-cyan-900/60 inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở ảnh gốc</span>
                </a>
                <a
                  href="/carousel/safe-area/desktop-blueprint.png"
                  download="desktop-blueprint.png"
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all shadow inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh PNG (2400×1000)</span>
                </a>
              </div>
            </div>

            {/* Khung xem ảnh Desktop */}
            <div className="bg-[#050f21] border border-cyan-500/30 rounded-2xl p-2 sm:p-4 shadow-2xl relative overflow-hidden">
              <div className="relative w-full aspect-[2.4/1] rounded-xl overflow-hidden border border-slate-800 bg-[#071329]">
                <Image
                  src="/carousel/safe-area/desktop-blueprint.png"
                  alt="Desktop Blueprint 2400x1000"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 px-2">
                <span>File: <code>public/carousel/safe-area/desktop-blueprint.png</code></span>
                <span className="text-cyan-400 font-bold">Kích thước chuẩn: 2400 × 1000 px | Vùng an toàn: 1880 × 720 px</span>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================
            TẤM ẢNH 2: MOBILE BLUEPRINT (896 × 1200 px)
           ======================================================== */}
        {(viewTab === "all" || viewTab === "mobile") && (
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/40 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <h2 className="text-base sm:text-lg font-black text-white">
                  TẤM ẢNH 2: MOBILE BLUEPRINT — 896 × 1200 PX (TỈ LỆ 3 : 4)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/carousel/safe-area/mobile-blueprint.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold transition-all border border-emerald-900/60 inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mở ảnh gốc</span>
                </a>
                <a
                  href="/carousel/safe-area/mobile-blueprint.png"
                  download="mobile-blueprint.png"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải ảnh PNG (896×1200)</span>
                </a>
              </div>
            </div>

            {/* Khung xem ảnh Mobile */}
            <div className="bg-[#050f21] border border-emerald-500/30 rounded-2xl p-2 sm:p-4 shadow-2xl relative overflow-hidden flex flex-col items-center">
              <div className="relative w-full max-w-[560px] aspect-[3/4] rounded-xl overflow-hidden border border-slate-800 bg-[#071329]">
                <Image
                  src="/carousel/safe-area/mobile-blueprint.png"
                  alt="Mobile Blueprint 896x1200"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div className="mt-3 w-full max-w-[560px] flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 px-2">
                <span>File: <code>public/carousel/safe-area/mobile-blueprint.png</code></span>
                <span className="text-emerald-400 font-bold">Kích thước chuẩn: 896 × 1200 px | Vùng an toàn: 800 × 1050 px</span>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
