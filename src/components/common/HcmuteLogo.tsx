import React from "react";

interface HcmuteLogoProps {
  variant?: "square" | "horizontal" | "mark-only";
  className?: string;
  size?: number;
}

/**
 * Mock Logo inspired by HCMUTE (Ho Chi Minh City University of Technology and Education)
 * combined with IEEE SMC 2027.
 *
 * Features the signature 12-tooth engineering cogwheel (Royal Blue #115eff),
 * the inner precision drafting compass & flame/atom (engineering & education),
 * paired with HCMUTE and IEEE SMC 2027 typography.
 */
export function HcmuteLogo({
  variant = "horizontal",
  className = "",
  size = 48,
}: HcmuteLogoProps) {
  // Center Emblem SVG
  const emblem = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
      aria-label="HCMUTE & IEEE SMC 2027 Logo Emblem"
    >
      <defs>
        <linearGradient id="gearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#115eff" />
        </linearGradient>
        <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#115eff" floodOpacity="0.18" />
        </filter>
      </defs>

      {/* Outer 12-Tooth Engineering Cogwheel / Gear */}
      <g filter="url(#subtleGlow)">
        <path
          d="
            M 60 10
            L 64.5 10 L 66 18.5 L 73.5 20.5 L 80 15 L 83.5 17.5 L 81.5 26 L 88.5 29.5 L 96 26.5 L 98.5 30 L 93 37 L 98 42 L 106.5 41.5 L 107.5 45.5 L 99.5 50.5 L 102 58 L 110 60
            L 110 64.5 L 102 66.5 L 99.5 74 L 107.5 79 L 106.5 83 L 98 82.5 L 93 87.5 L 98.5 94.5 L 96 98 L 88.5 95 L 81.5 98.5 L 83.5 107 L 80 109.5 L 73.5 104 L 66 106 L 64.5 114.5
            L 60 114.5 L 58.5 106 L 51 104 L 44.5 109.5 L 41 107 L 43 98.5 L 36 95 L 28.5 98 L 26 94.5 L 31.5 87.5 L 26.5 82.5 L 18 83 L 17 79 L 25 74 L 22.5 66.5 L 14.5 64.5
            L 14.5 60 L 22.5 58 L 25 50.5 L 17 45.5 L 18 41.5 L 26.5 42 L 31.5 37 L 26 30 L 28.5 26.5 L 36 29.5 L 43 26 L 41 17.5 L 44.5 15 L 51 20.5 L 58.5 18.5 Z
          "
          fill="url(#gearGrad)"
        />
      </g>

      {/* Inner White Ring Frame */}
      <circle cx="60" cy="60" r="38" fill="#ffffff" stroke="#115eff" strokeWidth="2.5" />
      
      {/* Inner Decorative Blue Circle */}
      <circle cx="60" cy="60" r="33" fill="#f8fafc" stroke="#93c5fd" strokeWidth="1" strokeDasharray="2 2" />

      {/* Engineering Caliper / Drafting Compass (Technical Symbol of HCMUTE) */}
      <path
        d="M 60 32 L 44 76 L 49 78 L 60 48 L 71 78 L 76 76 Z"
        fill="#1e40af"
      />
      {/* Compass Pivot Joint */}
      <circle cx="60" cy="36" r="4.5" fill="#f59e0b" stroke="#1e40af" strokeWidth="1.5" />

      {/* Central Flame of Knowledge & Innovation */}
      <path
        d="M 60 46 C 56 54, 52 59, 54 66 C 55 70, 58 72, 60 72 C 62 72, 65 70, 66 66 C 68 59, 64 54, 60 46 Z"
        fill="url(#flameGrad)"
      />
      {/* Inner Core Flame */}
      <path
        d="M 60 54 C 58 58, 56 61, 57 65 C 58 67, 59 68, 60 68 C 61 68, 62 67, 63 65 C 64 61, 62 58, 60 54 Z"
        fill="#ffffff"
        opacity="0.9"
      />

      {/* Open Book / Foundation Base */}
      <path
        d="M 46 80 Q 60 76 74 80 L 74 83 Q 60 79 46 83 Z"
        fill="#115eff"
      />

      {/* Small IEEE SMC Star Emblem */}
      <circle cx="60" cy="88" r="2.5" fill="#f59e0b" />
    </svg>
  );

  if (variant === "mark-only") {
    return <div className={`inline-flex items-center ${className}`}>{emblem}</div>;
  }

  if (variant === "square") {
    return (
      <div className={`flex flex-col items-center justify-center gap-1.5 ${className}`}>
        {emblem}
        <div className="flex flex-col items-center text-center">
          <span className="text-[13px] font-bold text-blue-700 leading-none tracking-tight">
            HCM-UTE
          </span>
          <span className="text-[10px] font-semibold text-slate-800 leading-tight mt-0.5">
            IEEE SMC 2027
          </span>
        </div>
      </div>
    );
  }

  // Horizontal variant (Ideal for Navbar & Footers)
  return (
    <div className={`inline-flex items-center gap-3 select-none group ${className}`}>
      {emblem}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-blue-700 text-base sm:text-lg tracking-tight group-hover:text-blue-800 transition-colors">
            HCM-UTE
          </span>
          <span className="text-slate-300 font-light text-sm">|</span>
          <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
            IEEE SMC 2027
          </span>
        </div>
        <p className="text-[11px] text-slate-500 font-medium tracking-normal hidden sm:block">
          Ho Chi Minh City University of Technology and Engineering • Oct 6–10, 2027
        </p>
      </div>
    </div>
  );
}
