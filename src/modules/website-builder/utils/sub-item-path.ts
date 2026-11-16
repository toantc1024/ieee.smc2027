"use client";

import React, { createContext, useContext } from "react";

export type SubItemPath = (string | number)[];

export interface BuilderBlockContextValue {
  blockId: string | null;
  isPreview: boolean;
  activeSubPath: SubItemPath | null;
  hoveredSubPath: SubItemPath | null;
}

export const BuilderBlockContext = createContext<BuilderBlockContextValue>({
  blockId: null,
  isPreview: true,
  activeSubPath: null,
  hoveredSubPath: null,
});

/**
 * Attach a stable data-builder-subpath attribute to a rendered sub-item so
 * clicking/hovering on the canvas reflects into the PropertyInspector and vice-versa.
 */
export function subItemAttr(path: SubItemPath): { "data-builder-subpath": string } {
  return { "data-builder-subpath": JSON.stringify(path) };
}

export function parseSubItemPath(raw: string | null | undefined): SubItemPath | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.length > 0 &&
      parsed.every((seg) => typeof seg === "string" || typeof seg === "number")
    ) {
      return parsed;
    }
  } catch {
    // ignore malformed paths
  }
  return null;
}

export function isSubPathEqual(
  a: SubItemPath | null | undefined,
  b: SubItemPath | null | undefined
): boolean {
  if (!a || !b || a.length !== b.length) return false;
  return a.every((seg, idx) => seg === b[idx]);
}

export function isSubPathPrefix(prefix: SubItemPath, target: SubItemPath): boolean {
  if (prefix.length > target.length) return false;
  return prefix.every((seg, idx) => seg === target[idx]);
}

/**
 * Returns the active item index for stateful blocks (carousels, tabs, accordions)
 * when an admin selects a sub-item under `fieldKey` in the Studio Inspector or Layers Tree.
 */
export function useActiveBuilderSubIndex(
  fieldKey: string,
  itemCount: number
): number | null {
  const { isPreview, activeSubPath } = useContext(BuilderBlockContext);
  if (isPreview || !activeSubPath || itemCount <= 0) return null;
  if (activeSubPath[0] === fieldKey && typeof activeSubPath[1] === "number") {
    return Math.max(0, Math.min(itemCount - 1, activeSubPath[1]));
  }
  return null;
}
