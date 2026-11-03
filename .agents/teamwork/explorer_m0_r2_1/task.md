# Explorer M0-R2-1 Task: DateRangePicker Invalid Date Hardening
Remediation from Challenger M0-1:
- File: `src/components/ui/date-range-picker.tsx`
- Problem: `RangeError: Invalid time value` when `value.from` or `value.to` is an invalid Date object (`new Date("invalid")` or `new Date(NaN)`).
- Required Fix: In `displayLabel` and `fullRangeTitle`, verify `isValid(value.from)` and `isValid(value.to)`.
- Write fix strategy to `handoff.md`.
