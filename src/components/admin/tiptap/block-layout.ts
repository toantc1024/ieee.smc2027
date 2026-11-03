export type BlockLayoutMode =
  | "inline"
  | "wrap-left"
  | "wrap-right"
  | "breakout"
  | "full";

export type BlockAlignment = "left" | "center" | "right";

export function normalizeLayoutMode(value?: string | null): BlockLayoutMode {
  if (
    value === "inline" ||
    value === "wrap-left" ||
    value === "wrap-right" ||
    value === "breakout" ||
    value === "full"
  ) {
    return value;
  }
  return "inline";
}

export function normalizeAlignment(value?: string | null): BlockAlignment {
  if (value === "left" || value === "center" || value === "right") {
    return value;
  }
  return "center";
}
