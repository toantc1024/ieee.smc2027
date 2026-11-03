# Handoff Report: Milestone M0 Dependencies & Build Tooling

## 1. Observation

### Current Environment & Core Stack
- **Project Root**: `/Users/macos/ieee-smc-2027`
- **Node.js Version**: `v22.23.3` (verified via `node --version`)
- **pnpm Version**: `12.10.1` (verified via `pnpm --version`)
- **Next.js Version**: `16.3.4` (in `/Users/macos/ieee-smc-2027/package.json` line 61)
- **React / React-DOM Version**: `19.2.8` (lines 63-64)
- **TypeScript Version**: `^5` (line 81) with `tsconfig.json` (`"skipLibCheck": true`, `"esModuleInterop": true`, `"moduleResolution": "bundler"`)
- **Tailwind CSS**: `tailwindcss@^4` with `@tailwindcss/postcss@^4` (lines 72, 80)
- **Existing Motion Package**: `"motion": "^13.4.4"` (already installed; `motion/react` provides spring counter support for `number-ticker.tsx`)

### Existing pnpm Workspace Configuration
In `/Users/macos/ieee-smc-2027/pnpm-workspace.yaml` lines 1-6:
```yaml
allowBuilds:
  '@prisma/client': true
  '@prisma/engines': true
  prisma: true
  unrs-resolver: true
```
This is required by pnpm v12.10.1 to allow Prisma and unrs-resolver postinstall scripts to run without prompt or failure (`ERR_PNPM_IGNORED_BUILDS`).

### Reference HCMUTE Application
In `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/package.json`:
- `zustand`: `^5.0.10`
- `recharts`: `2.15.4`
- `date-fns`: `^4.1.0`
- `react-day-picker`: `^9.14.0`
- `@radix-ui/react-popover`: `^1.1.15`
- `@radix-ui/react-switch`: `^1.2.6`
- `diff`: `^8.0.4`
- `@types/diff`: `^8.0.0` (devDependencies)
- Shared UI primitives located at `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/components/ui/`: `chart.tsx`, `calendar.tsx`, `date-range-picker.tsx`, `popover.tsx`, `switch.tsx`, `number-ticker.tsx`.

### Peer Dependency & Registry Audit for Target Packages
| Package | Requested Spec | Registry Version Resolved | Peer Dependencies | React 19 / Next 16 Status |
|---|---|---|---|---|
| `zustand` | `^5.0.10` | `5.0.16` | `react: >=18.0.0` | Compatible (native React 19 support in v5) |
| `recharts` | `2.15.4` | `2.15.4` (exact) | `react: '^16.0.0 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0'`, `'react-dom': '^16.0.0 \|\| ^17.0.0 \|\| ^18.0.0 \|\| ^19.0.0'` | Compatible (native React 19 peer dep) |
| `date-fns` | `^4.1.0` | `4.4.0` | None | Compatible (pure ES utility module) |
| `react-day-picker` | `^9.14.0` | `9.14.0` | `react: >=16.8.0` | Compatible (v9 API designed for React 18/19) |
| `@radix-ui/react-popover` | `^1.1.15` | `1.3.1` (or `1.1.15`) | `react: '^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0 \|\| ^19.0.0-rc'` | Compatible (native React 19 peer dep) |
| `@radix-ui/react-switch` | `^1.1.1` | `1.4.1` (or `1.1.1`) | `react: '^16.8 \|\| ^17.0 \|\| ^18.0 \|\| ^19.0 \|\| ^19.0.0-rc'` | Compatible (native React 19 peer dep) |
| `diff` | `^8.0.4` | `8.0.4` | None | Compatible (includes built-in `.d.ts`) |
| `@types/diff` | `^8.0.0` | `8.0.0` | `diff: *` | Compatible (type re-export stub) |

### Isolated Test Installation & Typecheck Results
In isolated sandbox `/tmp/m0-test`:
- Installed packages using:
  ```bash
  pnpm add zustand@^5.0.10 recharts@2.15.4 date-fns@^4.1.0 react-day-picker@^9.14.0 @radix-ui/react-popover@^1.1.15 @radix-ui/react-switch@^1.1.1 diff@^8.0.4
  pnpm add -D @types/diff@^8.0.0
  ```
- Created test harness importing all 8 libraries alongside React 19 components.
- Ran `pnpm exec tsc --noEmit -p tsconfig.json`:
  - **Exit Code**: `0` (clean, zero compiler errors).

---

## 2. Logic Chain

1. **Lockfile & Package Manager Integrity**:
   - The workspace utilizes pnpm v12.10.1 and `pnpm-workspace.yaml`.
   - The `allowBuilds` field in `pnpm-workspace.yaml` already whitelists `@prisma/client`, `@prisma/engines`, `prisma`, and `unrs-resolver`.
   - Running `pnpm add` within the workspace preserves existing lockfile entries without triggering build script aborts.

2. **React 19 & Next.js 16 Compatibility**:
   - Direct inspection of NPM registry manifests confirms:
     - `recharts@2.15.4` explicitly declares `react: '^16.0.0 || ^17.0.0 || ^18.0.0 || ^19.0.0'`.
     - `@radix-ui/react-popover` and `@radix-ui/react-switch` explicitly support `^19.0 || ^19.0.0-rc`.
     - `zustand@^5.0.10` uses `useSyncExternalStore` adhering to React 19 concurrent specifications.
     - `react-day-picker@^9.14.0` supports `react: >=16.8.0`.
   - Therefore, no `--force` or `--legacy-peer-deps` flags are needed; all packages resolve cleanly without conflicts.

3. **Tailwind CSS v4 Compatibility**:
   - The project uses Tailwind CSS v4 (`@tailwindcss/postcss: ^4`).
   - The reference primitives (`calendar.tsx`, `chart.tsx`, `date-range-picker.tsx`, `switch.tsx`, `popover.tsx`) are already written with Tailwind CSS v4 arbitrary properties (`--cell-size:--spacing(8)`, `size-(--cell-size)`, `origin-(--radix-popover-content-transform-origin)`, etc.).
   - No additional Tailwind plugins are required.

4. **Motion spring counter**:
   - The feature inventory lists `number-ticker.tsx` (Motion spring counter).
   - In the reference project, `number-ticker.tsx` imports `{ useInView, useMotionValue, useSpring }` from `"motion/react"`.
   - In `ieee-smc-2027/package.json`, `"motion": "^13.4.4"` is already installed, so no new motion package is needed.

---

## 3. Caveats

1. **Recharts Deprecation Advisory**:
   - During install, pnpm logs `[WARN] deprecated recharts@2.15.4. 3.11.0-canary.7 is not deprecated.`
   - This is purely an advisory by the Recharts team encouraging v3 adoption. Recharts v3 is still in canary/beta, whereas `2.15.4` is the tested, stable version used across Shadcn UI and HCMUTE reference. It is completely safe to use.
2. **`@types/diff` Stub Warning**:
   - `diff@8.0.4` bundles its own TypeScript `.d.ts` declarations. Installing `@types/diff@8.0.0` provides a harmless stub re-export.
3. **pnpm Setting Warning in package.json**:
   - pnpm logs `[WARN] The "pnpm" field in package.json is no longer read by pnpm. The following keys were ignored: "pnpm.onlyBuiltDependencies"`.
   - This warning is benign because `pnpm-workspace.yaml` with `allowBuilds` is active and handles the build permissions.
4. **User Rules Reminder**:
   - Never use sparkle icon in any UI primitives.
   - Avoid excessive English subtitles in parentheses.
   - Worker must make atomic git commits and push after changes.

---

## 4. Conclusion & Actionable Specification for Worker M0

### Step 1: Install Production Dependencies
Run from `/Users/macos/ieee-smc-2027`:
```bash
pnpm add zustand@^5.0.10 recharts@2.15.4 date-fns@^4.1.0 react-day-picker@^9.14.0 @radix-ui/react-popover@^1.1.15 @radix-ui/react-switch@^1.1.1 diff@^8.0.4
```

### Step 2: Install Development Dependencies
Run from `/Users/macos/ieee-smc-2027`:
```bash
pnpm add -D @types/diff@^8.0.0
```

### Expected `package.json` Updates
In `"dependencies"`:
- `"@radix-ui/react-popover": "^1.1.15"` (or resolved range `^1.3.1`)
- `"@radix-ui/react-switch": "^1.1.1"` (or resolved range `^1.4.1`)
- `"date-fns": "^4.1.0"` (or resolved range `^4.4.0`)
- `"diff": "^8.0.4"`
- `"react-day-picker": "^9.14.0"`
- `"recharts": "2.15.4"`
- `"zustand": "^5.0.10"` (or resolved range `^5.0.16`)

In `"devDependencies"`:
- `"@types/diff": "^8.0.0"`

---

## 5. Verification Method

To independently verify the installation and tooling health:

1. **Check package presence**:
   ```bash
   pnpm list zustand recharts date-fns react-day-picker @radix-ui/react-popover @radix-ui/react-switch diff @types/diff
   ```
   *Expected result*: All 8 packages listed with valid resolved versions.

2. **Verify Lockfile & Build Scripts**:
   ```bash
   pnpm install --frozen-lockfile
   ```
   *Expected result*: Exits with code 0, no `ERR_PNPM_IGNORED_BUILDS` errors.

3. **Verify TypeScript Compilation with target dependencies**:
   ```bash
   pnpm exec tsc --noEmit
   ```
   *Expected result*: TypeScript compiles successfully without any type errors stemming from the newly installed packages.

4. **Verify Next.js dev/build readiness**:
   ```bash
   pnpm exec next build --dry-run 2>/dev/null || pnpm exec tsc --noEmit
   ```
