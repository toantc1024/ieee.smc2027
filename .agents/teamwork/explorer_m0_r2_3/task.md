# Explorer M0-R2-3 Task: NumberTicker Negative Decimals Clamping
Remediation from Challenger M0-1:
- File: `src/components/ui/number-ticker.tsx`
- Problem: `RangeError: minimumFractionDigits value is out of range` when `decimalPlaces` is negative.
- Required Fix: Clamp `decimalPlaces` with `Math.max(0, Math.min(20, Math.floor(decimalPlaces || 0)))`.
- Write fix strategy to `handoff.md`.
