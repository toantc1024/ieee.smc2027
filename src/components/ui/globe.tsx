"use client";

import React, { useEffect, useRef } from "react";
import createGlobe, { type COBEOptions, type Marker, type Arc } from "cobe";
import { cn } from "@/lib/utils";

// Ho Chi Minh City coordinates: [10.7769, 106.7009]
export const HCMC_COORDINATES: [number, number] = [10.7769, 106.7009];

export const MAGICUI_ORANGE_MARKERS: Marker[] = [
  // Primary Venue Beacon: Ho Chi Minh City, Vietnam
  { location: HCMC_COORDINATES, size: 0.12, id: "hcmc-venue" },
  // Global Conference Hubs
  { location: [47.6101, -122.2015], size: 0.07 },
  // Global Conference Hubs
  { location: [14.5995, 120.9842], size: 0.04 },
  { location: [19.076, 72.8777], size: 0.06 },
  { location: [23.8103, 90.4125], size: 0.05 },
  { location: [30.0444, 31.2357], size: 0.06 },
  { location: [39.9042, 116.4074], size: 0.07 },
  { location: [-23.5505, -46.6333], size: 0.07 },
  { location: [19.4326, -99.1332], size: 0.07 },
  { location: [40.7128, -74.006], size: 0.08 },
  { location: [34.6937, 135.5022], size: 0.05 },
  { location: [41.0082, 28.9784], size: 0.06 },
  { location: [51.5074, -0.1278], size: 0.07 },
  { location: [47.4979, 19.0402], size: 0.06 },
];

export const MAGICUI_GLOBE_CONFIG: Partial<COBEOptions> = {
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255], // MagicUI Light Orange
  glowColor: [1, 0.88, 0.75], // Warm Light Orange Ambient Glow
  markers: MAGICUI_ORANGE_MARKERS,
  arcs: [], // No arcs as requested
};

export interface GlobeProps {
  className?: string;
  config?: Partial<COBEOptions>;
}

export function Globe({ className, config = MAGICUI_GLOBE_CONFIG }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);

  // Smooth lerp rotation offset for touch/mouse drag without heavy external libraries
  const rotationOffset = useRef(0);
  const targetRotationOffset = useRef(0);

  useEffect(() => {
    let globe: ReturnType<typeof createGlobe> | null = null;
    let animId: number;
    let phi = 0;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = canvas.offsetWidth || 400;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
        if (globe) {
          globe.update({
            width: width * 2,
            height: width * 2,
          });
        }
      }
    };

    window.addEventListener("resize", onResize);

    const mergedOptions: COBEOptions = {
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.3,
      dark: 0,
      diffuse: 0.4,
      mapSamples: 16000,
      mapBrightness: 1.2,
      baseColor: [1, 1, 1],
      markerColor: [251 / 255, 100 / 255, 21 / 255],
      glowColor: [1, 0.88, 0.75],
      markers: MAGICUI_ORANGE_MARKERS,
      arcs: [],
      devicePixelRatio: 2,
      ...config,
    };

    globe = createGlobe(canvas, mergedOptions);

    const render = () => {
      // Smooth lerp interpolation for silky rotation response
      rotationOffset.current +=
        (targetRotationOffset.current - rotationOffset.current) * 0.08;

      if (pointerInteracting.current === null) {
        phi += 0.0035;
      }

      if (globe) {
        globe.update({
          phi: phi + rotationOffset.current,
        });
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    // Fade in smoothly once initialized
    setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    }, 60);

    return () => {
      cancelAnimationFrame(animId);
      if (globe) globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config]);

  const updatePointerInteraction = (clientX: number | null) => {
    pointerInteracting.current = clientX;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = clientX !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      targetRotationOffset.current += delta / 500;
      pointerInteracting.current = clientX;
    }
  };

  return (
    <div
      className={cn(
        "relative mx-auto aspect-square w-full flex items-center justify-center select-none overflow-hidden",
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-0 transition-opacity duration-700 ease-out cursor-grab contain-[layout_paint_size]"
        onPointerDown={(e) => {
          updatePointerInteraction(e.clientX);
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchStart={(e) => {
          if (e.touches[0]) updatePointerInteraction(e.touches[0].clientX);
        }}
        onTouchEnd={() => updatePointerInteraction(null)}
        onTouchMove={(e) => {
          if (e.touches[0]) updateMovement(e.touches[0].clientX);
        }}
      />
    </div>
  );
}

export default Globe;
