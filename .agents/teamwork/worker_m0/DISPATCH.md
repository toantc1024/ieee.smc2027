## 2026-11-02T08:31:33Z
You are assigned as Worker M0 (Foundation, Dependencies & Primitives Implementation).
Working directory: /Users/macos/ieee-smc-2027/.agents/teamwork/worker_m0/

MANDATORY FIRST STEPS:
1. Read /Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md before doing anything else.
2. Read /Users/macos/ieee-smc-2027/PROJECT.md.
3. Read the three Explorer handoff reports:
   - /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_1/handoff.md
   - /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_2/handoff.md
   - /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_3/handoff.md
4. Read your task file: /Users/macos/ieee-smc-2027/.agents/teamwork/worker_m0/task.md.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

USER CONSTRAINTS:
- For frontend: Never use sparkle icon.
- Do not make too much text or english as sub in () bracelet, no need.
- For each atom change or big change make a commit and push.
- Adhere to AGENTS.md Next.js rules in /Users/macos/ieee-smc-2027/AGENTS.md.

EXCLUSIVE WRITE OWNERSHIP:
- package.json, pnpm-lock.yaml
- prisma/schema.prisma
- src/components/ui/chart.tsx
- src/components/ui/popover.tsx
- src/components/ui/calendar.tsx
- src/components/ui/date-range-picker.tsx
- src/components/ui/switch.tsx
- src/components/ui/number-ticker.tsx

EXECUTION STEPS:
1. Install dependencies using pnpm:
   `pnpm add zustand@^5.0.10 recharts@2.15.4 date-fns@^4.1.0 react-day-picker@^9.14.0 @radix-ui/react-popover@^1.1.15 @radix-ui/react-switch@^1.1.1 diff@^8.0.4`
   `pnpm add -D @types/diff@^8.0.0`
2. Update `prisma/schema.prisma` using `explorer_m0_2`'s `proposed_schema.prisma` (adding User model status, lastLoginAt, lastLoginIp, lastLoginDevice, sessionVersion; Page model parentId, orderIndex, version, content, PageHistory, WebsiteTemplate).
   Run `pnpm prisma generate` and `pnpm prisma db push`.
3. Create the 6 shared UI components in `src/components/ui/` per `explorer_m0_3`'s exact code specifications in `handoff.md`:
   - `src/components/ui/chart.tsx`
   - `src/components/ui/popover.tsx`
   - `src/components/ui/calendar.tsx`
   - `src/components/ui/date-range-picker.tsx`
   - `src/components/ui/switch.tsx`
   - `src/components/ui/number-ticker.tsx`
4. Run `pnpm run build` and ensure zero TypeScript or build errors.
5. Commit and push git changes with a clean commit message.
6. Write your comprehensive handoff report to `/Users/macos/ieee-smc-2027/.agents/teamwork/worker_m0/handoff.md` and notify parent orchestrator.
