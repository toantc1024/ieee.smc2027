import React from "react";

export function StatsCountersBlueprint() {
  return (
    <g>
      {/* Title */}
      <rect x="36" y="3" width="28" height="4" rx="1.5" fill="#1e293b" />

      {/* 4 Stat Boxes */}
      {[
        { x: 2, num: "60+", val: "Năm" },
        { x: 26.5, num: "98%", val: "Việc làm" },
        { x: 51, num: "30K+", val: "Sinh viên" },
        { x: 75.5, num: "500+", val: "Đối tác" },
      ].map((stat, i) => (
        <g key={i}>
          <rect x={stat.x} y="10" width="22.5" height="28" rx="2.5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.8" />
          <text x={stat.x + 11.25} y="22" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#1d4ed8" fontFamily="sans-serif">
            {stat.num}
          </text>
          <rect x={stat.x + 3.25} y="27" width="16" height="2" rx="1" fill="#64748b" />
          <rect x={stat.x + 5.25} y="31" width="12" height="1.8" rx="0.9" fill="#94a3b8" />
        </g>
      ))}

      {/* Mini Trend Bar below */}
      <rect x="2" y="42" width="96" height="20" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="6" y="46" width="30" height="2.5" rx="1" fill="#1e293b" />
      <path d="M6 56 L24 52 L42 54 L60 48 L78 50 L92 46" stroke="#2563eb" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

export function StatsChartBlueprint() {
  return (
    <g>
      <rect x="2" y="3" width="36" height="4" rx="1.5" fill="#1e293b" />
      <rect x="2" y="10" width="96" height="52" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />

      {/* Chart Bars */}
      <line x1="8" y1="52" x2="90" y2="52" stroke="#cbd5e1" strokeWidth="0.8" />
      {[
        { x: 14, h: 22, color: "#38bdf8" },
        { x: 26, h: 32, color: "#2563eb" },
        { x: 38, h: 18, color: "#60a5fa" },
        { x: 50, h: 38, color: "#1d4ed8" },
        { x: 62, h: 26, color: "#3b82f6" },
        { x: 74, h: 34, color: "#0284c7" },
        { x: 84, h: 30, color: "#0056b3" },
      ].map((bar, i) => (
        <rect key={i} x={bar.x} y={52 - bar.h} width="6" height={bar.h} rx="1.5" fill={bar.color} />
      ))}
    </g>
  );
}

export function TimelineBlueprint() {
  return (
    <g>
      <rect x="35" y="4" width="30" height="4" rx="1.5" fill="#1e293b" />
      <rect x="2" y="11" width="96" height="50" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />

      {/* Horizontal Timeline Track */}
      <line x1="12" y1="36" x2="88" y2="36" stroke="#bfdbfe" strokeWidth="1.5" />

      {/* 4 Milestones */}
      {[
        { cx: 20, yr: "1962", h: 12 },
        { cx: 40, yr: "1995", h: 16 },
        { cx: 60, yr: "2010", h: 14 },
        { cx: 80, yr: "2026", h: 18 },
      ].map((m, i) => (
        <g key={i}>
          <circle cx={m.cx} cy="36" r="3.5" fill="#2563eb" stroke="#ffffff" strokeWidth="1" />
          <rect x={m.cx - 8} y={36 - m.h - 4} width="16" height="6.5" rx="1.5" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
          <text x={m.cx} y={36 - m.h + 1} textAnchor="middle" fontSize="3.8" fontWeight="bold" fill="#1d4ed8" fontFamily="sans-serif">
            {m.yr}
          </text>
          <rect x={m.cx - 7} y="43" width="14" height="2" rx="0.8" fill="#64748b" />
          <rect x={m.cx - 5} y="47" width="10" height="1.8" rx="0.8" fill="#94a3b8" />
        </g>
      ))}
    </g>
  );
}

export function PartnersGridBlueprint() {
  return (
    <g>
      <rect x="35" y="4" width="30" height="4" rx="1.5" fill="#1e293b" />
      <rect x="2" y="11" width="96" height="50" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />

      {/* 6 Partner Slots */}
      {[
        { x: 6, y: 16 }, { x: 36, y: 16 }, { x: 66, y: 16 },
        { x: 6, y: 36 }, { x: 36, y: 36 }, { x: 66, y: 36 },
      ].map((slot, i) => (
        <g key={i}>
          <rect x={slot.x} y={slot.y} width="24" height="16" rx="2.5" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.8" />
          <circle cx={slot.x + 8} cy={slot.y + 8} r="3" fill="#94a3b8" opacity="0.6" />
          <rect x={slot.x + 13} y={slot.y + 7} width="8" height="2" rx="1" fill="#94a3b8" />
        </g>
      ))}
    </g>
  );
}

export function CampusLifeBlueprint() {
  return (
    <g>
      {/* 3 Mosaic Blocks */}
      <rect x="2" y="2" width="56" height="61" rx="3.5" fill="#dbeafe" stroke="#93c5fd" strokeWidth="0.8" />
      <circle cx="30" cy="32" r="8" fill="#60a5fa" opacity="0.8" />

      <rect x="61" y="2" width="37" height="29" rx="3" fill="#fef3c7" stroke="#fde68a" strokeWidth="0.8" />
      <circle cx="79.5" cy="16.5" r="5" fill="#f59e0b" opacity="0.8" />

      <rect x="61" y="34" width="37" height="29" rx="3" fill="#dcfce7" stroke="#bbf7d0" strokeWidth="0.8" />
      <circle cx="79.5" cy="48.5" r="5" fill="#10b981" opacity="0.8" />
    </g>
  );
}

export function MediaSplitBlueprint() {
  return (
    <g>
      {/* Media on Left */}
      <rect x="2" y="4" width="45" height="57" rx="3.5" fill="#dbeafe" stroke="#bfdbfe" strokeWidth="0.8" />
      <circle cx="24.5" cy="32" r="7" fill="#3b82f6" opacity="0.8" />

      {/* Text on Right */}
      <rect x="52" y="8" width="44" height="5" rx="1.5" fill="#1e293b" />
      <rect x="52" y="16" width="44" height="2" rx="1" fill="#64748b" />
      <rect x="52" y="20.5" width="40" height="2" rx="1" fill="#64748b" />
      <rect x="52" y="25" width="42" height="2" rx="1" fill="#64748b" />
      <rect x="52" y="29.5" width="30" height="2" rx="1" fill="#64748b" />

      {/* Action Button */}
      <rect x="52" y="38" width="26" height="8" rx="4" fill="#2563eb" />
      <rect x="57" y="41" width="16" height="2" rx="1" fill="#ffffff" />
    </g>
  );
}

export function UtilitiesBlueprint() {
  return (
    <g>
      {/* Search pill */}
      <rect x="2" y="2" width="96" height="6.5" rx="3.25" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.8" />
      <circle cx="6" cy="5.25" r="1.5" fill="#2563eb" />
      <rect x="10" y="4.25" width="32" height="2" rx="1" fill="#cbd5e1" />

      {/* 3 Extension Cards */}
      {[
        { x: 2, bg: "#eff6ff", stroke: "#bfdbfe", icon: "#2563eb" },
        { x: 35, bg: "#f5f3ff", stroke: "#ddd6fe", icon: "#7c3aed" },
        { x: 68, bg: "#ecfdf5", stroke: "#a7f3d0", icon: "#059669" },
      ].map((card, i) => (
        <g key={i}>
          <rect x={card.x} y="12" width="30" height="50" rx="3" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
          <rect x={card.x + 3} y="15" width="24" height="18" rx="2" fill={card.bg} stroke={card.stroke} strokeWidth="0.6" />
          <circle cx={card.x + 15} cy="24" r="4.5" fill={card.icon} />
          <rect x={card.x + 4} y="37" width="22" height="3" rx="1" fill="#1e293b" />
          <rect x={card.x + 4} y="42" width="16" height="2" rx="0.8" fill="#94a3b8" />
          <rect x={card.x + 4} y="48" width="22" height="6" rx="2" fill={card.bg} stroke={card.stroke} strokeWidth="0.6" />
        </g>
      ))}
    </g>
  );
}

export function LayoutGridBlueprint() {
  return (
    <g>
      <rect x="2" y="2" width="96" height="61" rx="3.5" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
      <rect x="6" y="6" width="41" height="53" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <rect x="11" y="11" width="31" height="4" rx="1.5" fill="#2563eb" opacity="0.6" />
      <rect x="11" y="18" width="24" height="2.5" rx="1" fill="#cbd5e1" />

      <rect x="53" y="6" width="41" height="53" rx="2.5" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <rect x="58" y="11" width="31" height="4" rx="1.5" fill="#2563eb" opacity="0.6" />
      <rect x="58" y="18" width="24" height="2.5" rx="1" fill="#cbd5e1" />
    </g>
  );
}

export function LayoutContainerBlueprint() {
  return (
    <g>
      <rect x="2" y="2" width="96" height="61" rx="4" fill="#f8fafc" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
      <rect x="8" y="8" width="84" height="49" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <rect x="14" y="14" width="36" height="4" rx="1.5" fill="#2563eb" opacity="0.6" />
      <rect x="14" y="22" width="72" height="2.5" rx="1" fill="#cbd5e1" />
      <rect x="14" y="27" width="58" height="2.5" rx="1" fill="#cbd5e1" />
    </g>
  );
}

export function FallbackGenericBlueprint({ label }: { label?: string }) {
  return (
    <g>
      <rect x="2" y="2" width="96" height="61" rx="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
      <rect x="7" y="7" width="16" height="3" rx="1.5" fill="#2563eb" />
      <rect x="7" y="14" width="56" height="5" rx="1.5" fill="#1e293b" />
      <rect x="7" y="23" width="86" height="2" rx="1" fill="#94a3b8" />
      <rect x="7" y="28" width="80" height="2" rx="1" fill="#cbd5e1" />
      <rect x="7" y="33" width="64" height="2" rx="1" fill="#cbd5e1" />

      {/* Button */}
      <rect x="7" y="44" width="26" height="7.5" rx="3.75" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.8" />
      <rect x="12" y="47" width="16" height="1.8" rx="0.9" fill="#2563eb" />
    </g>
  );
}
