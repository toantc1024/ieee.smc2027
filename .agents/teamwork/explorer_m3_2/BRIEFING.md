# BRIEFING — 2026-11-02T15:51:00Z

## Mission
Investigate reference HCMUTE website builder studio engine and specify the visual builder studio engine for IEEE SMC 2027 (tri-panel layout, Zustand store, auto-fit canvas, top/sub-toolbars, auxiliary tabs/modals, compliance).

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: explorer, investigator, architect
- Working directory: /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_2/
- Original parent: e417c152-55b4-4ecc-ad3e-6ec5f3ea6688
- Milestone: M3-2

## 🔒 Key Constraints
- Read-only investigation — do NOT modify target source code directly
- Strict compliance: 0 sparkle icons, clean English terminology, Next.js 16 Suspense boundary
- Self-contained handoff report in 5-component structure

## Current Parent
- Conversation ID: e417c152-55b4-4ecc-ad3e-6ec5f3ea6688
- Updated: not yet

## Investigation State
- **Explored paths**:
  - Reference: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/editor/` (`builder-store.ts`, `page-builder.tsx`, `canvas/builder-canvas.tsx`, `canvas/sortable-block.tsx`, `inspector/property-inspector.tsx`, `toolbar/builder-header.tsx`, `dialogs/sync-translate-modal.tsx`)
  - Reference: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/` (`components/pages/page-editor.tsx`, `components/pages/page-info-view.tsx`, `components/history/page-history-view.tsx`)
  - Target: `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/pages/[id]/page.tsx`, `/Users/macos/ieee-smc-2027/src/components/sections/`, `/Users/macos/ieee-smc-2027/prisma/schema.prisma`, `/Users/macos/ieee-smc-2027/tests/e2e/`
- **Key findings**:
  1. Tri-panel layout: CSS Grid `grid-cols-[308px_1fr_295px]`, collapsing to `grid-cols-[308px_1fr]` when no block selected, and `grid-cols-1` in preview mode.
  2. Canvas auto-fit: Figma-ratio scaling with 48px breathing room (`Math.max(280, containerWidth - 48) / baseWidth`), Desktop 1240px, Tablet 768px, Mobile 390px.
  3. Counter-scaled floating toolbar: `counterScale = 100 / effectiveZoom` so floating action pills and seam dropzone badges stay 1:1 sharp without shrinking.
  4. Zustand store `useBuilderStore`: AST content, selection, history stack (undo/redo up to 40), clipboard with cross-tab navigator.clipboard, viewport, zoom, dirty state.
  5. Top bar & sub-toolbar: Viewport switcher, zoom presets (Fit, 50%, 75%, 100%, 125%), undo/redo, paste, preview dropdown, save.
  6. Auxiliary tabs & modals: Info tab (SEO score 0-100, social preview card), History tab (properties & AST diff, rollback), SyncTranslateModal (Languages icon).
  7. Strict compliance: 0 sparkle icons, English UI copy, Next.js 16 Suspense boundary.
- **Unexplored areas**: None for M3-2.

## Key Decisions Made
- Fully documented the 6 core components for the M3 visual builder studio engine specification.
- Architecture mapped to target `src/modules/website-builder/` and `src/app/admin/(dashboard)/pages/[id]/page.tsx`.

## Artifact Index
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_2/DISPATCH.md` — Dispatch prompt and specifications
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_2/BRIEFING.md` — Situational awareness
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_2/progress.md` — Liveness heartbeat
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_2/handoff.md` — Final handoff report
