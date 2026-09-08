"use client";

import React from "react";

/**
 * ActiveWaveBackground:
 * Renders active, animated 1px white transparent wave lines (opacity 80%)
 * in the background for cybernetic signal telemetry / Human-AI symbiosis aesthetics.
 */
export function ActiveWaveBackground() {
  return (
    <div
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* Wave Layer 1: Primary Flowing Wave (1px white line, 80% opacity) */}
      <svg
        className="absolute w-[200%] h-full top-0 left-0 animate-wave-slow opacity-80"
        viewBox="0 0 2880 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 0,280 C 360,180 720,380 1080,280 C 1440,180 1800,380 2160,280 C 2520,180 2880,380 3240,280"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Wave Layer 2: Harmonic Wave (1px white line, 70% opacity, inverse phase) */}
      <svg
        className="absolute w-[200%] h-full top-0 left-0 animate-wave-reverse opacity-70"
        viewBox="0 0 2880 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 0,330 C 400,450 800,210 1200,330 C 1600,450 2000,210 2400,330 C 2800,450 3200,210 3600,330"
          stroke="rgba(255, 255, 255, 0.7)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Wave Layer 3: Telemetry Pulse Wave (1px white line, dashed, 65% opacity) */}
      <svg
        className="absolute w-[200%] h-full top-0 left-0 animate-wave-fast opacity-65"
        viewBox="0 0 2880 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 0,230 C 320,150 640,310 960,230 C 1280,150 1600,310 1920,230 C 2240,150 2560,310 2880,230"
          stroke="rgba(255, 255, 255, 0.65)"
          strokeWidth="1"
          strokeDasharray="4 6"
          fill="none"
        />
      </svg>

      {/* Wave Layer 4: Deep Resonance Line Wave (1px white line, 80% opacity) */}
      <svg
        className="absolute w-[200%] h-full top-0 left-0 animate-wave-deep opacity-80"
        viewBox="0 0 2880 600"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M 0,380 C 480,280 960,480 1440,380 C 1920,280 2400,480 2880,380 C 3360,280 3840,480 4320,380"
          stroke="rgba(255, 255, 255, 0.8)"
          strokeWidth="1"
          fill="none"
        />
      </svg>

      {/* Soft lateral edge vignette so waves gently dissolve at container borders */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(17,94,255,0.4) 0%, transparent 12%, transparent 88%, rgba(17,94,255,0.4) 100%)",
        }}
      />
    </div>
  );
}
