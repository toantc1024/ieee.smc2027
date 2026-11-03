# Sub-Orchestrator M0 Task: Shared Foundation & Dependencies

Scope: Milestone M0 in `/Users/macos/ieee-smc-2027/PROJECT.md`.
Deliverables:
1. Install required packages in `/Users/macos/ieee-smc-2027/package.json`:
   - `zustand@^5.0.10`
   - `recharts@2.15.4`
   - `date-fns@^4.1.0`
   - `react-day-picker@^9.14.0`
   - `@radix-ui/react-popover@^1.1.15`
   - `@radix-ui/react-switch@^1.1.1`
   - `diff@^8.0.4`
   - `@types/diff@^8.0.0`
2. Update `/Users/macos/ieee-smc-2027/prisma/schema.prisma`:
   - Extend `User` model with `status` (String, default: "ACTIVE"), `lastLoginAt` (DateTime?), `lastLoginIp` (String?), `lastLoginDevice` (String?), `sessionVersion` (Int, default: 1).
   - Extend `Page` model with `parentId` (String?), `orderIndex` (Int, default: 0), `version` (Int, default: 1), `content` (Json?).
   - Add `PageHistory` and `WebsiteTemplate` models.
   - Run `pnpm prisma generate` and `pnpm prisma db push` (or migrate).
3. Create shared UI primitives in `src/components/ui/`:
   - `src/components/ui/chart.tsx` (Recharts responsive chart container & tooltip)
   - `src/components/ui/popover.tsx` (Radix Popover primitive)
   - `src/components/ui/calendar.tsx` (react-day-picker calendar component)
   - `src/components/ui/date-range-picker.tsx` (Preset + custom range picker)
   - `src/components/ui/switch.tsx` (Radix switch primitive)
   - `src/components/ui/number-ticker.tsx` (Motion spring number counter)
4. Verify baseline build:
   - Worker runs `pnpm run build` to confirm zero TypeScript or build errors.
   - Commit changes per rule: "For each atom change or big change make a commit and push".
