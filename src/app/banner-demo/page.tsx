"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Eye,
  EyeOff,
  Layers,
  Info,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_CAROUSEL_SLIDES } from "@/components/sections/HeroCarousel";

type AspectRatioMode = "2.4:1" | "16:9" | "3:1" | "screen-fit";
type ViewportSize = "desktop" | "laptop" | "tablet" | "mobile";

export default function BannerDemoPage() {
  const [ratioMode, setRatioMode] = useState<AspectRatioMode>("2.4:1");
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showOverlayText, setShowOverlayText] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"interactive" | "technical-spec">("interactive");

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      if (entry) {
        setDimensions({
          width: Math.round(entry.contentRect.width),
          height: Math.round(entry.contentRect.height),
        });
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [ratioMode, viewport]);

  const activeSlide = DEFAULT_CAROUSEL_SLIDES[currentSlideIndex];
  const renderedRatio =
    dimensions.height > 0 ? (dimensions.width / dimensions.height).toFixed(2) : "0";

  // Dynamic aspect ratio CSS
  const getAspectRatioStyle = (): React.CSSProperties => {
    if (viewport === "mobile") {
      return { aspectRatio: "3 / 4" };
    }
    switch (ratioMode) {
      case "2.4:1":
        return { aspectRatio: "2.4 / 1" };
      case "16:9":
        return { aspectRatio: "16 / 9" };
      case "3:1":
        return { aspectRatio: "3 / 1" };
      case "screen-fit":
        return { height: "calc(100vh - 230px)", minHeight: "440px" };
      default:
        return { aspectRatio: "2.4 / 1" };
    }
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[393px]";
      case "tablet":
        return "max-w-[768px]";
      case "laptop":
        return "max-w-[1280px]";
      case "desktop":
      default:
        return "w-full";
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans">
      {/* ── Thanh điều hướng trên cùng (Tiếng Việt) ── */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-blue-400 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>← Về trang chủ Hội nghị</span>
            </Link>
            <span className="text-slate-700">|</span>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-sm font-extrabold tracking-tight text-white">
                Bản vẽ Kỹ thuật &amp; Demo Trực quan Kích thước Banner
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                BẢN THỬ NGHIỆM LOCAL (Không push)
              </span>
            </div>
          </div>

          {/* Tab chuyển đổi chế độ & Link Blueprint */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/blueprint"
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all flex items-center gap-1.5 shadow"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>📐 Trang Blueprint (Mobile &amp; Desktop)</span>
            </Link>
            <button
              onClick={() => setActiveTab("interactive")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                activeTab === "interactive"
                  ? "bg-[#115eff] text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              )}
            >
              Demo Trực quan
            </button>
            <button
              onClick={() => setActiveTab("technical-spec")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "technical-spec"
                  ? "bg-[#115eff] text-white shadow-sm"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              )}
            >
              <span>Sơ đồ Kích thước</span>
            </button>
          </div>
        </div>
      </header>

      {activeTab === "interactive" ? (
        <>
          {/* ── Thanh công cụ tùy chỉnh (Inspector Toolbar) ── */}
          <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-2.5">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Chọn Tỉ lệ khung hình */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">Tỉ lệ Banner:</span>
                <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => setRatioMode("2.4:1")}
                    className={cn(
                      "px-3 py-1 rounded-md font-bold transition-all cursor-pointer",
                      ratioMode === "2.4:1"
                        ? "bg-[#115eff] text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    2.4 : 1 (Chuẩn 2400×1000)
                  </button>
                  <button
                    onClick={() => setRatioMode("16:9")}
                    className={cn(
                      "px-3 py-1 rounded-md font-bold transition-all cursor-pointer",
                      ratioMode === "16:9"
                        ? "bg-[#115eff] text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    16 : 9 (Cao 2400×1350)
                  </button>
                  <button
                    onClick={() => setRatioMode("3:1")}
                    className={cn(
                      "px-3 py-1 rounded-md font-bold transition-all cursor-pointer",
                      ratioMode === "3:1"
                        ? "bg-[#115eff] text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    3 : 1 (Dải hẹp 2400×800)
                  </button>
                  <button
                    onClick={() => setRatioMode("screen-fit")}
                    className={cn(
                      "px-3 py-1 rounded-md font-bold transition-all cursor-pointer",
                      ratioMode === "screen-fit"
                        ? "bg-[#115eff] text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                  >
                    Toàn màn hình
                  </button>
                </div>
              </div>

              {/* Giả lập thiết bị */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-bold">Màn hình:</span>
                <div className="inline-flex rounded-lg bg-slate-900 p-1 border border-slate-800">
                  <button
                    onClick={() => setViewport("desktop")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      viewport === "desktop"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                    title="Màn hình Desktop rộng 100%"
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Desktop</span>
                  </button>
                  <button
                    onClick={() => setViewport("laptop")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      viewport === "laptop"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                    title="Laptop phổ thông 1280px"
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Laptop (1280px)</span>
                  </button>
                  <button
                    onClick={() => setViewport("tablet")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      viewport === "tablet"
                        ? "bg-slate-800 text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                    title="Máy tính bảng 768px"
                  >
                    <Tablet className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tablet (768px)</span>
                  </button>
                  <button
                    onClick={() => setViewport("mobile")}
                    className={cn(
                      "px-2.5 py-1 rounded-md font-semibold flex items-center gap-1.5 transition-all cursor-pointer",
                      viewport === "mobile"
                        ? "bg-[#115eff] text-white shadow-sm"
                        : "text-slate-400 hover:text-white"
                    )}
                    title="Điện thoại 393px (Tỉ lệ dọc 3:4)"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mobile (3:4)</span>
                  </button>
                </div>
              </div>

              {/* Nút bật tắt Blueprint & Chữ phủ */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSafeArea(!showSafeArea)}
                  className={cn(
                    "px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer font-bold",
                    showSafeArea
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                  )}
                >
                  {showSafeArea ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showSafeArea ? "Ẩn lưới Blueprint" : "Hiện lưới Blueprint"}</span>
                </button>

                <button
                  onClick={() => setShowOverlayText(!showOverlayText)}
                  className={cn(
                    "px-3 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer font-bold",
                    showOverlayText
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/40 shadow-sm"
                      : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
                  )}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>{showOverlayText ? "Ẩn chữ phủ" : "Hiện chữ phủ"}</span>
                </button>

                {/* Chọn Slide */}
                <div className="flex items-center gap-1 pl-2 border-l border-slate-800">
                  <span className="text-slate-400 font-bold">Slide:</span>
                  {DEFAULT_CAROUSEL_SLIDES.map((s, idx) => (
                    <button
                      key={s.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={cn(
                        "w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center justify-center",
                        currentSlideIndex === idx
                          ? "bg-[#115eff] text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                      )}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bảng hiển thị thông số thời gian thực (HUD Bar) ── */}
          <div className="bg-slate-950/80 border-b border-slate-800/80 px-4 sm:px-6 py-2 text-xs">
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-slate-300">
              <div className="flex items-center gap-4 sm:gap-6">
                <div>
                  <span className="text-slate-400 font-medium">Kích thước thực tế: </span>
                  <span className="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                    {dimensions.width} px × {dimensions.height} px
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Tỉ lệ thực tế: </span>
                  <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    {renderedRatio} : 1
                  </span>
                </div>
                <div className="hidden sm:block">
                  <span className="text-slate-400 font-medium">Ảnh nguồn: </span>
                  <span className="font-mono text-blue-300">
                    {viewport === "mobile" ? "896 × 1200 px (3:4)" : "2400 × 1000 px (2.4:1)"}
                  </span>
                </div>
              </div>

              <div>
                {renderedRatio === "2.40" || (viewport === "mobile" && (renderedRatio === "0.75" || renderedRatio === "0.74")) ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-bold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Khớp 100% tỉ lệ gốc (Không bị cắt xén một pixel nào)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Đang co giãn theo tỉ lệ khung: {ratioMode}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ── Khung Canvas Banner Preview (Được thiết kế KHÔNG CHỒNG CHÉO CHỮ) ── */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start overflow-y-auto">
            <div
              className={cn(
                "transition-all duration-300 w-full flex flex-col items-center shadow-2xl rounded-2xl overflow-hidden border border-slate-700 bg-black relative",
                getViewportWidthClass()
              )}
            >
              {/* Giả lập thanh địa chỉ trình duyệt khi chọn Laptop/Tablet/Mobile */}
              {viewport !== "desktop" && (
                <div className="w-full bg-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-700 select-none">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                  </div>
                  <span className="font-mono text-slate-300">
                    Mô phỏng {viewport === "mobile" ? "Điện thoại (393px)" : viewport === "tablet" ? "Tablet (768px)" : "Laptop (1280px)"}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dimensions.width}px
                  </span>
                </div>
              )}

              {/* Khung chứa ảnh banner */}
              <div
                ref={containerRef}
                style={getAspectRatioStyle()}
                className="w-full relative overflow-hidden bg-slate-950 transition-all duration-300"
              >
                {/* Ảnh slide banner */}
                <Image
                  src={viewport === "mobile" ? (activeSlide.mobileImage || activeSlide.image) : activeSlide.image}
                  alt={activeSlide.title}
                  fill
                  className="object-cover object-center"
                  priority
                  quality={90}
                />

                {/* Chữ phủ (Text Overlay) tuỳ chọn */}
                {showOverlayText && (
                  <div className="absolute inset-0 z-10 flex items-center p-6 sm:p-10 lg:p-14 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none">
                    <div className="max-w-2xl space-y-3">
                      {activeSlide.badge && (
                        <span className="inline-block px-3 py-1 rounded-full bg-[#115eff] text-white text-xs font-bold uppercase tracking-wider">
                          {activeSlide.badge}
                        </span>
                      )}
                      <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                        {activeSlide.title}
                      </h2>
                      {activeSlide.subtitle && (
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                          {activeSlide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    LƯỚI BLUEPRINT VÙNG AN TOÀN — THIẾT KẾ MỚI CHỐNG CHỒNG CHÉO CHỮ
                   ════════════════════════════════════════════════════════════ */}
                {showSafeArea && (
                  <div className="absolute inset-0 pointer-events-none z-30 select-none">
                    {viewport !== "mobile" ? (
                      /* ── Blueprint Desktop (2400 × 1000) ── */
                      <div className="relative w-full h-full flex flex-col">
                        {/* 1. Lề Trên: 140px (14%) */}
                        <div className="w-full h-[14%] bg-amber-500/15 border-b border-dashed border-amber-400/80 flex items-center justify-between px-3 sm:px-6">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/90 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/50 shadow-xs">
                            ▲ LỀ TRÊN: 140px
                          </span>
                          <span className="hidden sm:inline-block text-[10px] font-mono text-amber-200/80">
                            Vùng đệm an toàn
                          </span>
                        </div>

                        {/* 2. Khung Giữa: Vùng An Toàn (1880 × 720 px) */}
                        <div className="w-full flex-1 relative flex">
                          {/* Lề trái: 260px (10.8%) */}
                          <div className="w-[10.8%] h-full bg-amber-500/15 border-r border-dashed border-amber-400/80 flex items-center justify-center">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-950/90 text-[9px] font-mono font-bold text-amber-300 border border-amber-500/50 -rotate-90 whitespace-nowrap shadow-xs">
                              260px
                            </span>
                          </div>

                          {/* KHUNG VÙNG AN TOÀN TRỌNG TÂM */}
                          <div className="flex-1 h-full border-2 border-emerald-400 bg-emerald-500/5 relative p-2 sm:p-3 shadow-[inset_0_0_20px_rgba(16,185,129,0.15)] flex flex-col justify-start">
                            {/* Duy nhất 1 badge góc trên - Không có badge footer gây đè chữ */}
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-300 text-[10px] sm:text-[11px] font-mono font-extrabold border border-emerald-400/80 shadow-md self-start">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>VÙNG AN TOÀN: 1880 × 720 px</span>
                            </div>

                            {/* Hai đường gióng dọc căn lề trang web */}
                            <div className="absolute inset-0 flex justify-between pointer-events-none opacity-40 px-[2%]">
                              <div className="h-full w-px bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
                              <div className="h-full w-px bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
                            </div>
                          </div>

                          {/* Lề phải: 260px (10.8%) */}
                          <div className="w-[10.8%] h-full bg-amber-500/15 border-l border-dashed border-amber-400/80 flex items-center justify-center">
                            <span className="inline-block px-1.5 py-0.5 rounded bg-amber-950/90 text-[9px] font-mono font-bold text-amber-300 border border-amber-500/50 rotate-90 whitespace-nowrap shadow-xs">
                              260px
                            </span>
                          </div>
                        </div>

                        {/* 3. Lề Dưới: 140px (14%) */}
                        <div className="w-full h-[14%] bg-amber-500/15 border-t border-dashed border-amber-400/80 flex items-center justify-between px-3 sm:px-6">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/90 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/50 shadow-xs">
                            ▼ LỀ DƯỚI: 140px
                          </span>
                          <span className="hidden sm:inline-block text-[10px] font-mono text-amber-200/80">
                            Tránh che cụm nút chuyển slide
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* ── Blueprint Mobile (896 × 1200, Tỉ lệ 3:4) ── */
                      <div className="relative w-full h-full flex flex-col justify-between">
                        {/* Lề trên Mobile: 70px */}
                        <div className="w-full h-[8%] bg-amber-500/20 border-b border-dashed border-amber-400/80 flex items-center justify-center px-2">
                          <span className="px-2 py-0.5 rounded bg-amber-950/90 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40">
                            ▲ LỀ TRÊN: 70px
                          </span>
                        </div>

                        {/* Khung an toàn Mobile: 800 × 1050 px */}
                        <div className="w-full flex-1 border-2 border-emerald-400 bg-emerald-500/5 p-2 flex flex-col justify-start">
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/95 text-[10px] font-mono font-extrabold text-emerald-300 border border-emerald-400 shadow-sm self-start">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>VÙNG AN TOÀN: 800 × 1050 px</span>
                          </div>
                        </div>

                        {/* Lề dưới Mobile: 80px */}
                        <div className="w-full h-[10%] bg-amber-500/20 border-t border-dashed border-amber-400/80 flex items-center justify-center px-2">
                          <span className="px-2 py-0.5 rounded bg-amber-950/90 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40">
                            ▼ LỀ DƯỚI: 80px
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Bảng Phân Tích & Giải Thích Chi Tiết ── */}
            <section className="w-full max-w-5xl mt-10 space-y-6">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2.5 text-[#115eff]">
                  <Info className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Giải đáp câu hỏi: &ldquo;Kích thước Banner này có thực sự ổn không?&rdquo;
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300 leading-relaxed">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tại sao 2.4 : 1 (2400 × 1000 px) là Tối Ưu Nhất</span>
                    </div>
                    <p>
                      <strong>Tỉ lệ điện ảnh Widescreen:</strong> Chiếm khoảng <strong>50%–60% chiều cao màn hình</strong> trên các dòng laptop phổ biến (cao 600px trên màn hình 1440px).
                    </p>
                    <p>
                      <strong>Không đẩy nội dung bên dưới trôi mất:</strong> Người vào website sẽ thấy ngay phần mở đầu của Thư ngỏ (Welcome Letter), Deadline và Nút nộp bài (CFP) mà không cần cuộn chuột.
                    </p>
                    <p>
                      <strong>Khớp 1:1 không cắt xén:</strong> Ảnh 2400×1000 px có tỉ lệ chính xác $2400 / 1000 = 2.4$. Khung chứa có <code>aspect-ratio: 2.4 / 1</code> nên ảnh không bao giờ bị cắt 1 pixel nào.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5">
                    <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                      <Sparkles className="w-4 h-4" />
                      <span>Nguyên nhân trước đây từng bị cắt lề và cách đã sửa</span>
                    </div>
                    <p>
                      Trước đó trong file <code>globals.css</code>, class <code>.hero-carousel-height</code> có dòng <code>min-height: 520px;</code>.
                    </p>
                    <p>
                      Khi xem trên màn hình có chiều ngang nhỏ hơn 1250px (như iPad, laptop 13-inch), chiều cao bị cưỡng bức lên 520px thay vì 426px, làm sai lệch tỉ lệ và khiến <code>object-cover</code> phóng to cắt mất lề 2 bên của ảnh!
                    </p>
                    <p>
                      <strong>Chúng tôi đã gỡ bỏ hoàn toàn min-height:</strong> Hiện tại khung banner co giãn mượt mà theo đúng chuẩn $2.4 : 1$, chữ không bao giờ bị cắt.
                    </p>
                  </div>
                </div>

                {/* Bảng so sánh các kích thước */}
                <div className="pt-2 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-bold">
                        <th className="py-2.5 pr-4">Định dạng Banner</th>
                        <th className="py-2.5 px-4">Kích thước file</th>
                        <th className="py-2.5 px-4">Chiều cao trên Laptop (1440px)</th>
                        <th className="py-2.5 px-4">Ưu điểm</th>
                        <th className="py-2.5 pl-4">Nhược điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      <tr className="bg-emerald-950/20 font-medium">
                        <td className="py-3 pr-4 text-emerald-400 font-bold">
                          2.4 : 1 (Chuẩn khuyến nghị) ⭐
                        </td>
                        <td className="py-3 px-4 font-mono">2400 × 1000 px</td>
                        <td className="py-3 px-4 font-mono">600 px</td>
                        <td className="py-3 px-4 text-emerald-300">
                          Vừa vặn hoàn hảo, người dùng thấy ngay nội dung bên dưới, chuẩn HCMUTE.
                        </td>
                        <td className="py-3 pl-4 text-slate-400">
                          Cần file ảnh trải rộng theo chiều ngang.
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 text-white font-bold">16 : 9 (Dạng Video)</td>
                        <td className="py-3 px-4 font-mono">2400 × 1350 px</td>
                        <td className="py-3 px-4 font-mono">810 px</td>
                        <td className="py-3 px-4">
                          Nhiều không gian theo chiều dọc, hợp với trailer video.
                        </td>
                        <td className="py-3 pl-4 text-amber-400">
                          Quá cao, đẩy Thư ngỏ &amp; CFP rớt xuống dưới đáy màn hình.
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 text-white font-bold">3 : 1 (Dải ruy băng hẹp)</td>
                        <td className="py-3 px-4 font-mono">2400 × 800 px</td>
                        <td className="py-3 px-4 font-mono">480 px</td>
                        <td className="py-3 px-4">
                          Rất gọn, phần nội dung trang trồi lên sớm.
                        </td>
                        <td className="py-3 pl-4 text-amber-400">
                          Khá chật chội, khó bố trí logo hội nghị và artwork 3D.
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 pr-4 text-white font-bold">Mobile 3 : 4 (Dọc)</td>
                        <td className="py-3 px-4 font-mono">896 × 1200 px</td>
                        <td className="py-3 px-4 font-mono">524 px (trên điện thoại 393px)</td>
                        <td className="py-3 px-4 text-emerald-300">
                          Khớp với cách cầm điện thoại dọc, chữ to rõ ràng.
                        </td>
                        <td className="py-3 pl-4 text-slate-400">
                          Cần xuất thêm 1 file ảnh dọc riêng cho điện thoại.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800 text-xs">
                  <span className="text-slate-400">
                    Trang thử nghiệm đang chạy tại: <code className="text-blue-400 bg-blue-950/40 px-2 py-1 rounded">http://localhost:3001/banner-demo</code>
                  </span>
                  <Link
                    href="/"
                    className="px-4 py-2 bg-[#115eff] hover:bg-[#0a4de6] text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Xem trên Trang chủ thật</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </>
      ) : (
        /* ── Tab Sơ Đồ Kích Thước Bản Vẽ Kỹ Thuật (Tiếng Việt) ── */
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start overflow-y-auto max-w-6xl mx-auto w-full space-y-6">
          <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Bản Vẽ Kỹ Thuật: Quy Chuẩn Vùng An Toàn Banner Hội Nghị 2027
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Quy chuẩn thiết kế ảnh Hero Carousel chuẩn Safe-Area Contract 2.4 : 1 và 3 : 4
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
                PHIÊN BẢN 2.0 (TIẾNG VIỆT)
              </span>
            </div>

            {/* Banner dẫn tới trang Blueprint chuyên dụng */}
            <div className="bg-cyan-950/60 border border-cyan-500/50 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <div>
                  <span className="font-bold text-white">Bạn đang tìm Bản Vẽ Kỹ Thuật Độc Lập?</span>
                  <span className="text-cyan-200 ml-1.5">Xem bản vẽ thước đo CAD chi tiết cho cả Desktop &amp; Mobile</span>
                </div>
              </div>
              <Link
                href="/blueprint"
                className="px-3.5 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-lg transition-colors inline-flex items-center gap-1.5 shadow"
              >
                <span>Mở Trang Blueprint (/blueprint)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Sơ đồ trực quan Vector Canvas */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
              <div className="text-xs font-bold text-cyan-400 mb-3 flex items-center gap-2">
                <span>1. BẢN VẼ BANNER DESKTOP — KÍCH THƯỚC: 2400 × 1000 PX (TỈ LỆ 2.4 : 1)</span>
              </div>

              {/* Sơ đồ mô phỏng tỉ lệ 2.4 : 1 */}
              <div className="w-full aspect-[2.4/1] bg-slate-950 border-2 border-cyan-500 rounded-lg relative flex flex-col justify-between overflow-hidden shadow-inner">
                {/* Lề trên 140px */}
                <div className="w-full h-[14%] bg-amber-500/20 border-b border-dashed border-amber-400 flex items-center justify-between px-4 text-[11px] font-mono text-amber-300 font-bold">
                  <span>▲ LỀ BIÊN TRÊN = 140 px (Vùng đệm an toàn, không đặt chữ)</span>
                  <span>140 px</span>
                </div>

                {/* Vùng an toàn 1880 x 720 px */}
                <div className="w-full flex-1 flex">
                  {/* Lề trái 260px */}
                  <div className="w-[10.8%] h-full bg-amber-500/20 border-r border-dashed border-amber-400 flex items-center justify-center text-[10px] font-mono font-bold text-amber-300 text-center p-1">
                    <span className="-rotate-90">LỀ TRÁI 260px</span>
                  </div>

                  {/* KHUNG VÙNG AN TOÀN TRỌNG TÂM */}
                  <div className="flex-1 h-full border-2 border-emerald-400 bg-emerald-500/10 p-3 sm:p-5 flex flex-col justify-between relative">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="bg-emerald-950/90 border border-emerald-400 px-3 py-1 rounded text-xs font-mono font-black text-emerald-300">
                        VÙNG AN TOÀN TRỌNG TÂM: 1880 × 720 px
                      </div>
                      <div className="text-[11px] font-mono text-emerald-200">
                        Đảm bảo 100% hiển thị rõ trên mọi màn hình
                      </div>
                    </div>

                    {/* Phân vùng bên trong */}
                    <div className="grid grid-cols-12 gap-3 my-2 flex-1">
                      {/* Cột trái: Chữ và Logo */}
                      <div className="col-span-7 border border-blue-400/60 bg-blue-950/40 rounded p-2.5 flex flex-col justify-between">
                        <div className="text-[11px] font-bold text-blue-300">
                          KHU VỰC TIÊU ĐỀ &amp; LOGO (1200 × 460 px)
                        </div>
                        <div className="text-[10px] text-slate-300 space-y-0.5">
                          <div>• Cụm Logo: HCM-UTE • IEEE SMC 2027</div>
                          <div>• Tiêu đề lớn: IEEE SMC 2027 • Human-AI Symbiosis</div>
                          <div>• 3 Trụ cột nghiên cứu: Systems • Cybernetics • Human-Machine</div>
                          <div>• Thời gian &amp; Địa điểm: 06–10/10/2027 • TP. Hồ Chí Minh</div>
                        </div>
                        <div className="text-[9px] font-mono text-blue-400">
                          Khoảng cách an toàn tới các mép: &gt; 30px
                        </div>
                      </div>

                      {/* Cột phải: Artwork 3D */}
                      <div className="col-span-5 border border-cyan-400/60 bg-cyan-950/40 rounded p-2.5 flex flex-col justify-between">
                        <div className="text-[11px] font-bold text-cyan-300">
                          KHU VỰC ARTWORK 3D (1000 × 720 px)
                        </div>
                        <div className="text-[10px] text-slate-300 space-y-0.5">
                          <div>• Toàn cảnh Landmark &amp; TP.HCM hoàng hôn</div>
                          <div>• Quả cầu điều khiển học &amp; mạng nơ-ron</div>
                          <div>• Bàn tay người &amp; bàn tay robot 3D</div>
                        </div>
                        <div className="text-[9px] font-mono text-cyan-400">
                          Artwork trải dài mượt mà sang mép phải
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300/80">
                      <span>Rộng: 1880 px</span>
                      <span>Cao: 720 px</span>
                    </div>
                  </div>

                  {/* Lề phải 260px */}
                  <div className="w-[10.8%] h-full bg-amber-500/20 border-l border-dashed border-amber-400 flex items-center justify-center text-[10px] font-mono font-bold text-amber-300 text-center p-1">
                    <span className="rotate-90">LỀ PHẢI 260px</span>
                  </div>
                </div>

                {/* Lề dưới 140px */}
                <div className="w-full h-[14%] bg-amber-500/20 border-t border-dashed border-amber-400 flex items-center justify-between px-4 text-[11px] font-mono text-amber-300 font-bold">
                  <span>▼ LỀ BIÊN DƯỚI = 140 px (Khu vực đệm tránh che cụm nút điều khiển)</span>
                  <span>140 px</span>
                </div>
              </div>
            </div>

            {/* Quy tắc tóm tắt cho designer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="font-bold text-emerald-400">1. Kích thước xuất file chuẩn</div>
                <p className="text-slate-300">
                  Xuất file ảnh <strong>Desktop: đúng 2400 × 1000 px</strong> (JPG chất lượng 85–90%).
                </p>
                <p className="text-slate-400 text-[11px]">
                  Xuất file ảnh <strong>Mobile: đúng 896 × 1200 px</strong> (Tỉ lệ 3:4).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="font-bold text-cyan-400">2. Đệm lề trên và dưới</div>
                <p className="text-slate-300">
                  Chừa trống tối thiểu <strong>140px ở trên và dưới</strong>, không đặt chữ hay logo vào vùng này để tránh bị che bởi header và nút bấm.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                <div className="font-bold text-blue-400">3. Vùng an toàn 1880 × 720 px</div>
                <p className="text-slate-300">
                  Tất cả thông điệp chính (tên hội nghị, địa điểm, ngày tháng, CFP) bắt buộc phải nằm gọn trong vùng an toàn màu xanh.
                </p>
              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
