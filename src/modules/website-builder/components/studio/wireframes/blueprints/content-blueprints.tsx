import React from "react";

export function LeadershipBlueprint() {
  return (
    <g>
      {/* Background card with rounded corners - exactly 96x61, no overflow! */}
      <rect x="2" y="2" width="96" height="61" rx="4" fill="#004776" stroke="#0284c7" strokeWidth="0.8" />

      {/* Leader photo frame on the right side */}
      <rect x="65" y="8" width="27" height="38" rx="3" fill="#ffffff" opacity="0.2" stroke="#ffffff" strokeWidth="0.8" />
      {/* Portrait head & body abstract */}
      <circle cx="78.5" cy="21" r="5" fill="#bae6fd" />
      <path d="M70 38 Q78.5 28 87 38 Z" fill="#bae6fd" opacity="0.8" />

      {/* Left side: Tag, Title, Subtitle, Bio lines */}
      <rect x="7" y="8" width="24" height="3.5" rx="1.75" fill="#38bdf8" />
      <rect x="7" y="15" width="50" height="4.5" rx="1.5" fill="#ffffff" />
      <rect x="7" y="22" width="38" height="3" rx="1.5" fill="#bae6fd" />

      <rect x="7" y="28" width="52" height="2" rx="1" fill="#7dd3fc" opacity="0.75" />
      <rect x="7" y="32" width="46" height="2" rx="1" fill="#7dd3fc" opacity="0.75" />
      <rect x="7" y="36" width="40" height="2" rx="1" fill="#7dd3fc" opacity="0.75" />

      {/* Bottom action pill "Chi tiết" */}
      <rect x="7" y="47" width="28" height="6.5" rx="3.25" fill="#ffffff" />
      <rect x="12" y="49.5" width="18" height="2" rx="1" fill="#004776" />
    </g>
  );
}

export function AboutOverviewBlueprint() {
  return (
    <g>
      {/* Left Media Block */}
      <rect x="2" y="4" width="42" height="57" rx="3.5" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.8" />
      <polygon points="20,28 20,38 29,33" fill="#2563eb" />

      {/* Right Content */}
      <rect x="48" y="6" width="26" height="3" rx="1.5" fill="#2563eb" />
      <rect x="48" y="12" width="46" height="4.5" rx="1.5" fill="#1e293b" />
      <rect x="48" y="19" width="40" height="2.5" rx="1" fill="#64748b" />

      {/* 4 Stat Metric Pills */}
      <rect x="48" y="26" width="22" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
      <rect x="52" y="29" width="14" height="3.5" rx="1" fill="#2563eb" />
      <rect x="52" y="34" width="10" height="2" rx="0.8" fill="#94a3b8" />

      <rect x="73" y="26" width="23" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
      <rect x="77" y="29" width="15" height="3.5" rx="1" fill="#2563eb" />
      <rect x="77" y="34" width="11" height="2" rx="0.8" fill="#94a3b8" />

      <rect x="48" y="43" width="22" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
      <rect x="52" y="46" width="14" height="3.5" rx="1" fill="#2563eb" />
      <rect x="52" y="51" width="10" height="2" rx="0.8" fill="#94a3b8" />

      <rect x="73" y="43" width="23" height="14" rx="2" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.6" />
      <rect x="77" y="46" width="15" height="3.5" rx="1" fill="#2563eb" />
      <rect x="77" y="51" width="11" height="2" rx="0.8" fill="#94a3b8" />
    </g>
  );
}

export function NewsBentoBlueprint() {
  return (
    <g>
      {/* Header bar */}
      <rect x="2" y="3" width="30" height="4" rx="1.5" fill="#1e293b" />
      <rect x="80" y="3" width="16" height="3.5" rx="1.5" fill="#2563eb" />

      {/* Featured Card (Left) */}
      <rect x="2" y="10" width="52" height="52" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <rect x="4" y="12" width="48" height="28" rx="2" fill="#dbeafe" />
      <rect x="6" y="43" width="16" height="3" rx="1.5" fill="#2563eb" />
      <rect x="6" y="48" width="44" height="3" rx="1" fill="#1e293b" />
      <rect x="6" y="53" width="32" height="2.5" rx="1" fill="#94a3b8" />

      {/* Stacked Card 1 (Right) */}
      <rect x="57" y="10" width="41" height="24" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <rect x="59" y="12" width="15" height="20" rx="1.5" fill="#bfdbfe" />
      <rect x="76" y="14" width="19" height="3" rx="1" fill="#1e293b" />
      <rect x="76" y="19" width="14" height="2.5" rx="1" fill="#64748b" />
      <rect x="76" y="24" width="10" height="2" rx="1" fill="#94a3b8" />

      {/* Stacked Card 2 (Right) */}
      <rect x="57" y="38" width="41" height="24" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <rect x="59" y="40" width="15" height="20" rx="1.5" fill="#bfdbfe" />
      <rect x="76" y="42" width="19" height="3" rx="1" fill="#1e293b" />
      <rect x="76" y="47" width="14" height="2.5" rx="1" fill="#64748b" />
      <rect x="76" y="52" width="10" height="2" rx="1" fill="#94a3b8" />
    </g>
  );
}

export function NewsArchiveBlueprint() {
  return (
    <g>
      {/* Top Filter Dock */}
      <rect x="2" y="2" width="46" height="6.5" rx="3.25" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="6" cy="5.25" r="1.5" fill="#94a3b8" />
      <rect x="9" y="4.25" width="24" height="2" rx="1" fill="#cbd5e1" />

      {/* Category Badges */}
      <rect x="52" y="2" width="18" height="6.5" rx="3.25" fill="#2563eb" />
      <rect x="72" y="2" width="24" height="6.5" rx="3.25" fill="#e2e8f0" />

      {/* Blue Category Banner */}
      <rect x="2" y="12" width="96" height="15" rx="2.5" fill="#2563eb" />
      <rect x="6" y="16" width="38" height="4" rx="1.5" fill="#ffffff" />
      <rect x="6" y="22" width="24" height="2" rx="1" fill="#93c5fd" />
      <circle cx="86" cy="19.5" r="2" fill="#93c5fd" opacity="0.6" />
      <circle cx="91" cy="19.5" r="2" fill="#93c5fd" opacity="0.6" />

      {/* 4 Cards Grid */}
      {[0, 1, 2, 3].map((i) => {
        const x = 2 + i * 24.5;
        return (
          <g key={i}>
            <rect x={x} y="30" width="22.5" height="32" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.6" />
            <rect x={x + 1.5} y="31.5" width="19.5" height="14" rx="1.5" fill="#dbeafe" />
            <rect x={x + 1.5} y="48" width="18" height="2.5" rx="0.8" fill="#1e293b" />
            <rect x={x + 1.5} y="52" width="12" height="2" rx="0.8" fill="#94a3b8" />
          </g>
        );
      })}
    </g>
  );
}

export function PostDetailBlueprint() {
  return (
    <g>
      {/* Category Pill + Breadcrumb */}
      <rect x="4" y="3" width="18" height="3.5" rx="1.75" fill="#2563eb" />
      <rect x="25" y="4" width="40" height="2" rx="1" fill="#94a3b8" />

      {/* Large Featured Article Image */}
      <rect x="4" y="9" width="92" height="26" rx="3" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="0.8" />
      <circle cx="50" cy="22" r="5" fill="#93c5fd" />

      {/* Article Title */}
      <rect x="4" y="38" width="76" height="5" rx="1.5" fill="#1e293b" />
      <rect x="4" y="45" width="52" height="4" rx="1.5" fill="#1e293b" />

      {/* Content lines */}
      <rect x="4" y="52" width="92" height="2" rx="1" fill="#cbd5e1" />
      <rect x="4" y="56" width="86" height="2" rx="1" fill="#cbd5e1" />
      <rect x="4" y="60" width="68" height="2" rx="1" fill="#cbd5e1" />
    </g>
  );
}

export function PostActionsBlueprint() {
  return (
    <g>
      <rect x="2" y="4" width="96" height="57" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="8" y="10" width="40" height="4" rx="1.5" fill="#1e293b" />

      {/* 3 Action Buttons / Cards */}
      <rect x="8" y="20" width="25" height="32" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="20.5" cy="30" r="4" fill="#dbeafe" />
      <rect x="12" y="40" width="17" height="2.5" rx="1" fill="#2563eb" />

      <rect x="37.5" y="20" width="25" height="32" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="50" cy="30" r="4" fill="#e0e7ff" />
      <rect x="41.5" y="40" width="17" height="2.5" rx="1" fill="#4f46e5" />

      <rect x="67" y="20" width="25" height="32" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="79.5" cy="30" r="4" fill="#fef3c7" />
      <rect x="71" y="40" width="17" height="2.5" rx="1" fill="#d97706" />
    </g>
  );
}

export function NewsletterBlueprint() {
  return (
    <g>
      <rect x="2" y="4" width="96" height="57" rx="4" fill="#0056b3" stroke="#004085" strokeWidth="0.8" />
      <circle cx="86" cy="14" r="16" fill="#3b82f6" opacity="0.3" />

      {/* Envelope Icon abstract */}
      <rect x="42" y="10" width="16" height="11" rx="2" fill="#ffffff" />
      <path d="M42 12 L50 17 L58 12" stroke="#0056b3" strokeWidth="1" fill="none" />

      {/* Headline & Subhead */}
      <rect x="22" y="26" width="56" height="4.5" rx="1.5" fill="#ffffff" />
      <rect x="28" y="33" width="44" height="2.5" rx="1" fill="#bfdbfe" />

      {/* Email Input Bar */}
      <rect x="18" y="40" width="64" height="11" rx="5.5" fill="#ffffff" opacity="0.25" stroke="#ffffff" strokeWidth="0.8" />
      <rect x="24" y="44.5" width="28" height="2" rx="1" fill="#ffffff" />
      <rect x="58" y="42" width="22" height="7" rx="3.5" fill="#ffffff" />
      <rect x="63" y="44.5" width="12" height="2" rx="1" fill="#0056b3" />
    </g>
  );
}

export function RichTextBlueprint() {
  return (
    <g>
      <rect x="2" y="2" width="96" height="61" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="8" y="8" width="48" height="5" rx="1.5" fill="#1e293b" />
      <rect x="8" y="17" width="84" height="2" rx="1" fill="#64748b" />
      <rect x="8" y="22" width="80" height="2" rx="1" fill="#64748b" />
      <rect x="8" y="27" width="84" height="2" rx="1" fill="#64748b" />
      <rect x="8" y="32" width="60" height="2" rx="1" fill="#64748b" />

      <rect x="8" y="39" width="36" height="4" rx="1.5" fill="#1e293b" />
      <rect x="8" y="46" width="84" height="2" rx="1" fill="#94a3b8" />
      <rect x="8" y="51" width="82" height="2" rx="1" fill="#94a3b8" />
      <rect x="8" y="56" width="70" height="2" rx="1" fill="#94a3b8" />
    </g>
  );
}
