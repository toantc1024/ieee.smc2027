# Explorer M0-R2-2 Task: ChartContainer & ChartTooltipContent Hardening
Remediation from Challenger M0-1:
- File: `src/components/ui/chart.tsx`
- Problem 1: `ChartStyle` crashes with `TypeError` when `config` is null/undefined or has entries with undefined `c.theme`/`c.color`.
- Problem 2: `ChartTooltipContent` silently bypasses custom formatters when Recharts payload series only has `dataKey` without `name`.
- Required Fix: Check `if (!config || typeof config !== "object") return null;` and `c?.theme || c?.color`. In tooltip, check `(item.name || item.dataKey)`.
- Write fix strategy to `handoff.md`.
