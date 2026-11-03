# Worker M0 Task: Shared Foundation, Dependencies & Primitives Implementation

## Exclusive Write Ownership:
- `package.json` and `pnpm-lock.yaml`
- `prisma/schema.prisma`
- `src/components/ui/chart.tsx`
- `src/components/ui/popover.tsx`
- `src/components/ui/calendar.tsx`
- `src/components/ui/date-range-picker.tsx`
- `src/components/ui/switch.tsx`
- `src/components/ui/number-ticker.tsx`

## References:
- `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md`
- `/Users/macos/ieee-smc-2027/PROJECT.md`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_1/handoff.md`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_2/handoff.md`
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m0_3/handoff.md`

## Instructions:
1. Install packages: `pnpm add zustand@^5.0.10 recharts@2.15.4 date-fns@^4.1.0 react-day-picker@^9.14.0 @radix-ui/react-popover@^1.1.15 @radix-ui/react-switch@^1.1.1 diff@^8.0.4` and `pnpm add -D @types/diff@^8.0.0`.
2. Apply Prisma schema changes from `explorer_m0_2`'s `proposed_schema.prisma` to `prisma/schema.prisma`. Run `pnpm prisma generate` and `pnpm prisma db push`.
3. Implement the 6 UI primitives in `src/components/ui/` per `explorer_m0_3`'s `handoff.md`.
4. Run `pnpm run build` and ensure zero errors.
5. Commit and push changes: git commit -m "feat(core): implement M0 shared dependencies, prisma extensions, and UI primitives".
