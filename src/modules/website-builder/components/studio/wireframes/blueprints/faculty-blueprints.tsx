import React from "react";

export function FacultyHeaderBlueprint() {
  return (
    <g>
      <rect x="2" y="2" width="96" height="61" rx="4" fill="#1d4ed8" stroke="#1e40af" strokeWidth="0.8" />
      <circle cx="86" cy="12" r="18" fill="#3b82f6" opacity="0.3" />

      {/* Graduation Cap abstract */}
      <rect x="8" y="8" width="18" height="3" rx="1.5" fill="#93c5fd" />
      <polygon points="17,14 10,18 17,22 24,18" fill="#ffffff" />
      <rect x="16" y="22" width="2" height="4" fill="#ffffff" />

      {/* Faculty Name */}
      <rect x="8" y="28" width="70" height="5.5" rx="1.5" fill="#ffffff" />
      <rect x="8" y="36" width="50" height="3" rx="1" fill="#bfdbfe" />

      {/* Quick Links Pills */}
      <rect x="8" y="47" width="20" height="6" rx="3" fill="#ffffff" opacity="0.25" />
      <rect x="31" y="47" width="24" height="6" rx="3" fill="#ffffff" opacity="0.25" />
      <rect x="58" y="47" width="22" height="6" rx="3" fill="#ffffff" opacity="0.25" />
    </g>
  );
}

export function FacultyDocumentsBlueprint() {
  return (
    <g>
      {/* Header with Title & View All */}
      <rect x="2" y="3" width="34" height="4" rx="1.5" fill="#1e293b" />
      <rect x="80" y="3" width="18" height="4" rx="1.5" fill="#2563eb" />

      {/* Search Bar */}
      <rect x="2" y="10" width="96" height="6" rx="3" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="0.7" />
      <circle cx="6" cy="13" r="1.5" fill="#94a3b8" />
      <rect x="10" y="12" width="28" height="2" rx="1" fill="#cbd5e1" />

      {/* Document Row 1 */}
      <rect x="2" y="19" width="96" height="12.5" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="5" y="21.5" width="7" height="7.5" rx="1.5" fill="#ef4444" />
      <rect x="15" y="22.5" width="56" height="3" rx="1" fill="#1e293b" />
      <rect x="15" y="27.5" width="34" height="2" rx="0.8" fill="#94a3b8" />
      <rect x="84" y="22.5" width="11" height="5.5" rx="1.5" fill="#2563eb" />

      {/* Document Row 2 */}
      <rect x="2" y="34.5" width="96" height="12.5" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="5" y="37" width="7" height="7.5" rx="1.5" fill="#3b82f6" />
      <rect x="15" y="38" width="52" height="3" rx="1" fill="#1e293b" />
      <rect x="15" y="43" width="28" height="2" rx="0.8" fill="#94a3b8" />
      <rect x="84" y="38" width="11" height="5.5" rx="1.5" fill="#2563eb" />

      {/* Document Row 3 */}
      <rect x="2" y="50" width="96" height="12.5" rx="2" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="5" y="52.5" width="7" height="7.5" rx="1.5" fill="#10b981" />
      <rect x="15" y="53.5" width="58" height="3" rx="1" fill="#1e293b" />
      <rect x="15" y="58.5" width="36" height="2" rx="0.8" fill="#94a3b8" />
      <rect x="84" y="53.5" width="11" height="5.5" rx="1.5" fill="#2563eb" />
    </g>
  );
}

export function FacultyProgramsBlueprint() {
  return (
    <g>
      {/* Title */}
      <rect x="30" y="3" width="40" height="4" rx="1.5" fill="#1e293b" />

      {/* 3 Program Cards */}
      {[
        { x: 2, bg: "#dbeafe", badge: "#2563eb" },
        { x: 35, bg: "#e0e7ff", badge: "#4f46e5" },
        { x: 68, bg: "#fae8ff", badge: "#9333ea" },
      ].map((card, i) => (
        <g key={i}>
          <rect x={card.x} y="10" width="30" height="52" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
          {/* Thumbnail */}
          <rect x={card.x + 2} y="12" width="26" height="20" rx="2" fill={card.bg} />
          {/* Major Code */}
          <rect x={card.x + 3} y="35" width="12" height="3" rx="1" fill={card.badge} />
          {/* Program Name */}
          <rect x={card.x + 3} y="40.5" width="24" height="3" rx="1" fill="#1e293b" />
          <rect x={card.x + 3} y="45" width="18" height="2" rx="0.8" fill="#64748b" />
          {/* Detail Button */}
          <rect x={card.x + 3} y="52" width="24" height="6.5" rx="2" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.6" />
          <rect x={card.x + 8} y="54.5" width="14" height="1.5" rx="0.75" fill="#2563eb" />
        </g>
      ))}
    </g>
  );
}

export function FacultyLecturersBlueprint() {
  return (
    <g>
      {/* Title */}
      <rect x="32" y="3" width="36" height="4" rx="1.5" fill="#1e293b" />

      {/* 3 Lecturer Cards */}
      {[
        { x: 2, ring: "#3b82f6", bg: "#eff6ff" },
        { x: 35, ring: "#6366f1", bg: "#eef2ff" },
        { x: 68, ring: "#10b981", bg: "#ecfdf5" },
      ].map((item, i) => (
        <g key={i}>
          <rect x={item.x} y="10" width="30" height="52" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" />
          {/* Avatar Circle */}
          <circle cx={item.x + 15} cy="23" r="8" fill={item.bg} stroke={item.ring} strokeWidth="1" />
          <circle cx={item.x + 15} cy="21" r="3.5" fill={item.ring} opacity="0.8" />
          <path d={`M${item.x + 9} 29 Q${item.x + 15} 25 ${item.x + 21} 29 Z`} fill={item.ring} opacity="0.8" />

          {/* Name & Title */}
          <rect x={item.x + 3} y="35" width="24" height="3" rx="1" fill="#1e293b" />
          <rect x={item.x + 5} y="40" width="20" height="2.5" rx="1" fill="#64748b" />
          {/* Email / contact badge */}
          <rect x={item.x + 4} y="46" width="22" height="5" rx="2.5" fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="0.6" />
          <rect x={item.x + 8} y="48" width="14" height="1.5" rx="0.75" fill="#3b82f6" />
        </g>
      ))}
    </g>
  );
}

export function FacultyScheduleBlueprint() {
  return (
    <g>
      <rect x="2" y="3" width="36" height="4" rx="1.5" fill="#1e293b" />
      <rect x="86" y="3" width="12" height="4" rx="1.5" fill="#2563eb" />

      {/* Schedule Item 1 */}
      <rect x="2" y="11" width="96" height="15" rx="2.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="5" y="14" width="14" height="9" rx="2" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
      <rect x="7" y="17.5" width="10" height="2" rx="1" fill="#2563eb" />
      <rect x="23" y="14" width="50" height="3.5" rx="1" fill="#1e293b" />
      <rect x="23" y="19" width="34" height="2" rx="0.8" fill="#64748b" />
      <rect x="86" y="16" width="9" height="5" rx="2.5" fill="#dcfce7" />

      {/* Schedule Item 2 */}
      <rect x="2" y="28" width="96" height="15" rx="2.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="5" y="31" width="14" height="9" rx="2" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
      <rect x="7" y="34.5" width="10" height="2" rx="1" fill="#2563eb" />
      <rect x="23" y="31" width="46" height="3.5" rx="1" fill="#1e293b" />
      <rect x="23" y="36" width="30" height="2" rx="0.8" fill="#64748b" />
      <rect x="86" y="33" width="9" height="5" rx="2.5" fill="#fef3c7" />

      {/* Schedule Item 3 */}
      <rect x="2" y="45" width="96" height="15" rx="2.5" fill="#ffffff" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="5" y="48" width="14" height="9" rx="2" fill="#eff6ff" stroke="#bfdbfe" strokeWidth="0.6" />
      <rect x="7" y="51.5" width="10" height="2" rx="1" fill="#2563eb" />
      <rect x="23" y="48" width="54" height="3.5" rx="1" fill="#1e293b" />
      <rect x="23" y="53" width="38" height="2" rx="0.8" fill="#64748b" />
      <rect x="86" y="50" width="9" height="5" rx="2.5" fill="#dbeafe" />
    </g>
  );
}

export function FaqAccordionBlueprint() {
  return (
    <g>
      {/* Title */}
      <rect x="36" y="3" width="28" height="4" rx="1.5" fill="#1e293b" />

      {/* Row 1 (Expanded) */}
      <rect x="2" y="10" width="96" height="19" rx="3" fill="#ffffff" stroke="#bfdbfe" strokeWidth="0.8" />
      <rect x="6" y="14" width="68" height="3.5" rx="1.5" fill="#1e293b" />
      <path d="M88 15 L90 17 L92 15" stroke="#2563eb" strokeWidth="1.2" strokeLinecap="round" />
      <rect x="6" y="20.5" width="86" height="2" rx="1" fill="#64748b" />
      <rect x="6" y="24" width="60" height="2" rx="1" fill="#64748b" />

      {/* Row 2 (Collapsed) */}
      <rect x="2" y="31.5" width="96" height="13.5" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="6" y="36.5" width="64" height="3.5" rx="1.5" fill="#334155" />
      <path d="M89 36 L91 38 L89 40" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />

      {/* Row 3 (Collapsed) */}
      <rect x="2" y="47.5" width="96" height="13.5" rx="3" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="0.8" />
      <rect x="6" y="52.5" width="58" height="3.5" rx="1.5" fill="#334155" />
      <path d="M89 52 L91 54 L89 56" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}
