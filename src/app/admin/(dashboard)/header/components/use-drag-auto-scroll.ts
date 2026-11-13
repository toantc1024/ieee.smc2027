"use client";

import { useEffect, useRef, type RefObject } from "react";

interface UseDragAutoScrollOptions {
  /** Edge threshold in pixels from top/bottom/left/right where scrolling activates */
  threshold?: number;
  /** Maximum scroll velocity in pixels per animation frame */
  maxSpeed?: number;
  /** Only activate when a drag is actively happening */
  active?: boolean;
}

/**
 * Smoothly auto-scrolls the referenced container when the pointer or native HTML5 dragover
 * gets close to the container's edges during a drag-and-drop operation.
 */
export function useDragAutoScroll<T extends HTMLElement = HTMLDivElement>(
  containerRef: RefObject<T | null>,
  options: UseDragAutoScrollOptions = {}
) {
  const { threshold = 80, maxSpeed = 16, active = true } = options;

  const isDraggingRef = useRef(false);
  const pointerPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const stopLoop = () => {
      isDraggingRef.current = false;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const tick = () => {
      const container = containerRef.current;
      if (!isDraggingRef.current || !container) {
        rafRef.current = null;
        return;
      }

      const rect = container.getBoundingClientRect();
      const { x, y } = pointerPosRef.current;

      let dy = 0;
      let dx = 0;

      if (y < rect.top + threshold && y >= rect.top - 40) {
        const intensity = Math.max(0, Math.min(1, (rect.top + threshold - y) / threshold));
        dy = -Math.ceil(intensity * maxSpeed);
      } else if (y > rect.bottom - threshold && y <= rect.bottom + 40) {
        const intensity = Math.max(0, Math.min(1, (y - (rect.bottom - threshold)) / threshold));
        dy = Math.ceil(intensity * maxSpeed);
      }

      if (x < rect.left + threshold && x >= rect.left - 40) {
        const intensity = Math.max(0, Math.min(1, (rect.left + threshold - x) / threshold));
        dx = -Math.ceil(intensity * maxSpeed);
      } else if (x > rect.right - threshold && x <= rect.right + 40) {
        const intensity = Math.max(0, Math.min(1, (x - (rect.right - threshold)) / threshold));
        dx = Math.ceil(intensity * maxSpeed);
      }

      if (dy !== 0) container.scrollTop += dy;
      if (dx !== 0) container.scrollLeft += dx;

      rafRef.current = requestAnimationFrame(tick);
    };

    const startLoop = () => {
      isDraggingRef.current = true;
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    const handleDragStart = (e: DragEvent) => {
      pointerPosRef.current = { x: e.clientX, y: e.clientY };
      startLoop();
    };

    const handleDragOver = (e: DragEvent) => {
      if (!isDraggingRef.current) startLoop();
      pointerPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleDragEnd = () => {
      stopLoop();
    };

    const handleDrop = () => {
      stopLoop();
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDraggingRef.current) {
        pointerPosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    window.addEventListener("dragstart", handleDragStart);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragend", handleDragEnd);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      stopLoop();
      window.removeEventListener("dragstart", handleDragStart);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragend", handleDragEnd);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, [containerRef, threshold, maxSpeed, active]);
}
