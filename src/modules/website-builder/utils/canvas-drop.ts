type CanvasDrop = { kind: "insert"; index: number } | { kind: "move"; from: number; to: number };

/** Resolve a palette or section drop against the same before/after seams. */
export function resolveCanvasDrop(blockIds: string[], activeId: string, overId: string, isPalette: boolean): CanvasDrop | null {
  const before = overId.startsWith("drop-before-");
  const after = overId.startsWith("drop-after-") && overId !== "drop-after-end";
  const targetId = before ? overId.slice("drop-before-".length) : after ? overId.slice("drop-after-".length) : overId;
  const targetIndex = overId === "drop-after-end" ? blockIds.length : blockIds.indexOf(targetId);
  if (targetIndex < 0) return null;
  const destination = targetIndex + (after ? 1 : 0);
  if (isPalette) return { kind: "insert", index: destination };
  const from = blockIds.indexOf(activeId);
  if (from < 0) return null;
  let to = from < destination ? destination - 1 : destination;
  if (!before && !after && overId !== "drop-after-end") to = targetIndex;
  return to === from ? null : { kind: "move", from, to };
}
