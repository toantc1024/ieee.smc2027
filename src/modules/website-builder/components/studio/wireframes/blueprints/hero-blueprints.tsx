import React from "react";

export function HeroCarouselBlueprint() {
  return (
    <g>
      {/* Background card with subtle gradient & border */}
      <rect x="2" y="2" width="96" height="61" rx="4" fill="#f0f7ff" stroke="#bfdbfe" strokeWidth="0.8" />
      {/* Top brand tag */}
      <rect x="6" y="6" width="20" height="3" rx="1.5" fill="#2563eb" />
      <rect x="80" y="6" width="14" height="3" rx="1.5" fill="#cbd5e1" />

      {/* Main hero title */}
      <rect x="18" y="17" width="64" height="5.5" rx="2" fill="#1e293b" />
      {/* Subtitle line */}
      <rect x="26" y="25" width="48" height="3" rx="1.5" fill="#64748b" />

      {/* 2 CTA Buttons */}
      <rect x="25" y="34" width="23" height="7.5" rx="3.5" fill="#2563eb" />
      <rect x="52" y="34" width="23" height="7.5" rx="3.5" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />

      {/* Slide pagination dots */}
      <circle cx="44" cy="53" r="1.5" fill="#2563eb" />
      <circle cx="50" cy="53" r="1.2" fill="#cbd5e1" />
      <circle cx="56" cy="53" r="1.2" fill="#cbd5e1" />

      {/* Left/Right carousel arrows */}
      <path d="M6 31 L8 33 L6 35" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M94 31 L92 33 L94 35" stroke="#94a3b8" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}

export function HeroBannerBlueprint() {
  return (
    <g>
      <rect x="2" y="2" width="96" height="61" rx="4" fill="#004776" />
      <rect x="6" y="6" width="88" height="53" rx="3" fill="#003559" />

      {/* Headline */}
      <rect x="16" y="18" width="68" height="5.5" rx="2" fill="#ffffff" />
      <rect x="24" y="26" width="52" height="3.5" rx="1.5" fill="#7dd3fc" />

      {/* Button */}
      <rect x="36" y="36" width="28" height="8" rx="4" fill="#38bdf8" />
      <rect x="42" y="39" width="16" height="2" rx="1" fill="#003559" />
    </g>
  );
}

export function CtaBannerBlueprint() {
  return (
    <g>
      <rect x="2" y="2" width="96" height="61" rx="4" fill="#2563eb" />
      <circle cx="90" cy="10" r="22" fill="#3b82f6" opacity="0.4" />
      <circle cx="10" cy="55" r="18" fill="#1d4ed8" opacity="0.4" />

      <rect x="18" y="16" width="64" height="5" rx="2" fill="#ffffff" />
      <rect x="25" y="24" width="50" height="3" rx="1.5" fill="#bfdbfe" />

      {/* CTA Button */}
      <rect x="35" y="35" width="30" height="8.5" rx="4.25" fill="#ffffff" />
      <rect x="42" y="38.5" width="16" height="2" rx="1" fill="#2563eb" />
    </g>
  );
}
