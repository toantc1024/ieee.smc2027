# Worker M0-R2 Task: UI Primitives Hardening Implementation

## Exclusive Write Ownership:
- `src/components/ui/date-range-picker.tsx`
- `src/components/ui/chart.tsx`
- `src/components/ui/number-ticker.tsx`
- `tests/primitives/ui-primitives.stress.test.ts`

## References:
- `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/Users/macos/ieee-smc-2027/PROJECT.md`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/challenger_m0_1/handoff.md`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_1/handoff.md` and `proposed_date-range-picker.tsx`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_2/handoff.md` and `proposed_chart.tsx`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_3/handoff.md` and `proposed_number-ticker.tsx`

## Execution Steps:
1. Apply the hardened implementations:
   - Copy or apply `proposed_date-range-picker.tsx` to `src/components/ui/date-range-picker.tsx`.
   - Copy or apply `proposed_chart.tsx` to `src/components/ui/chart.tsx`.
   - Copy or apply `proposed_number-ticker.tsx` to `src/components/ui/number-ticker.tsx`.
2. Update `tests/primitives/ui-primitives.stress.test.ts` so that assertions reflect the hardened, crash-free behavior (e.g. testing that invalid dates return placeholder instead of throwing RangeError, null config doesn't throw TypeError, negative decimalPlaces outputs cleanly instead of throwing RangeError).
3. Run `npx tsx --test tests/primitives/ui-primitives.stress.test.ts` and ensure all 34+ tests pass.
4. Run `pnpm run test:e2e` to ensure all 10 E2E test suites pass.
5. Run `pnpm run build` and ensure zero TypeScript or build errors across all 55 routes.
6. Commit and push: `git commit -m "fix(ui): harden DateRangePicker, ChartContainer, and NumberTicker against edge-case crashes"` and git push.
7. Write `handoff.md` and notify parent orchestrator.
