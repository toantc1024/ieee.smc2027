## 2026-11-02T09:05:58Z
You are assigned as Worker M0-R2 (UI Primitives Hardening Implementation).
Working directory: /Users/macos/ieee-smc-2027/.agents/teamwork/worker_m0_r2/

MANDATORY FIRST STEPS:
1. Read /Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md before doing anything else.
2. Read /Users/macos/ieee-smc-2027/PROJECT.md.
3. Read the three Explorer handoff reports and proposed files:
   - /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_1/handoff.md (and proposed_date-range-picker.tsx)
   - /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_2/handoff.md (and proposed_chart.tsx)
   - /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_3/handoff.md (and proposed_number-ticker.tsx)
4. Read your task file: /Users/macos/ieee-smc-2027/.agents/teamwork/worker_m0_r2/task.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER CONSTRAINTS:
- For frontend: Never use sparkle icon.
- Do not make too much text or english as sub in () bracelet, no need.
- For each atom change or big change make a commit and push.
- Adhere to AGENTS.md Next.js rules in /Users/macos/ieee-smc-2027/AGENTS.md.

EXCLUSIVE WRITE OWNERSHIP:
- src/components/ui/date-range-picker.tsx
- src/components/ui/chart.tsx
- src/components/ui/number-ticker.tsx
- tests/primitives/ui-primitives.stress.test.ts

EXECUTION STEPS:
1. Replace `src/components/ui/date-range-picker.tsx` with `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_1/proposed_date-range-picker.tsx`.
2. Replace `src/components/ui/chart.tsx` with `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_2/proposed_chart.tsx`.
3. Replace `src/components/ui/number-ticker.tsx` with `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_r2_3/proposed_number-ticker.tsx`.
4. Update `tests/primitives/ui-primitives.stress.test.ts` to assert the hardened crash-free behavior (e.g. invalid dates safely returning placeholder or fallback, null config not throwing, negative decimals clamped safely).
5. Run `npx tsx --test tests/primitives/ui-primitives.stress.test.ts` to verify all tests pass.
6. Run `pnpm run test:e2e` to verify all 10 E2E test suites pass.
7. Run `pnpm run build` to verify clean build with 0 errors across 55 static routes.
8. Commit and push: `git commit -m "fix(ui): harden DateRangePicker, ChartContainer, and NumberTicker against edge-case crashes"` and git push.
9. Write `handoff.md` and notify parent orchestrator.
