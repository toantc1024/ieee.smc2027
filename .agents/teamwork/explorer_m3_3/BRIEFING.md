# BRIEFING — 2026-11-02T15:45:00Z

## Mission
Investigate and design the Block Registry containing all 21 IEEE SMC 2027 conference sections, public dynamic page renderer, and canvas seam dropzones.

## 🔒 My Identity
- Archetype: teamwork_explorer
- Roles: teamwork_explorer
- Working directory: /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_3
- Original parent: e417c152-55b4-4ecc-ad3e-6ec5f3ea6688
- Milestone: M3

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Zero sparkle icons (strict user constraint)
- Clean English copy without superfluous subtitle text in parentheses
- Next.js 16 App Router compliance (dynamic params Promise, force-dynamic)
- Full compatibility with existing Prisma schema (`Page`, `blocks`, `content`) and seeded pages

## Current Parent
- Conversation ID: e417c152-55b4-4ecc-ad3e-6ec5f3ea6688
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `src/components/sections/*` (HeroCarousel, CallForPapers, CommitteesSection, ImportantDates, Keynotes, TracksExplorer, Venue, Sponsors, PaymentMethods, PaperTemplates, FAQ, ContactCards, etc.)
  - `src/components/layout/*` (Header, Footer, SectionContainer)
  - `src/app/page.tsx`, `src/app/api/admin/pages/*`, `src/services/cms.service.ts`
  - `tests/e2e/tier1-feature-coverage/page-builder.test.ts`, `tier2-boundary-corner/page-builder-edge.test.ts`
  - Reference HCMUTE website builder: `modules/cms/core/registry.tsx`, `modules/cms/renderer/*`, `modules/cms/editor/canvas/sortable-block.tsx`, `modules/cms/editor/canvas/builder-canvas.tsx`, `app/(public)/[lang]/[...slug]/*`
- **Key findings**:
  - Identified all 21 conference section specifications, their default props, icon mappings (zero sparkles), and property inspector schemas.
  - Designed fallback alias mappings so existing seeded shorthand names (`Keynotes`, `TracksExplorer`, `ImportantDates`, `Venue`, etc.) map seamlessly to canonical 21 registry definitions.
  - Examined seam dropzones and dnd mechanics: top/bottom 50% split with `useDroppable`, z-index 9999 active line with circular terminal beads, counter-scaled badge (`100 / zoom`), and pointer collision detection.
  - Architected public dynamic page renderer (`src/app/(public)/[slug]/page.tsx`): handles published/draft filtering, SEO metadata generation, AST vs blocks normalization, and unknown block error boundary fallback.
- **Unexplored areas**: None remaining for M3-3 scope.

## Key Decisions Made
- Canonicalize all 21 conference section names while maintaining 100% backward-compatible alias resolution for legacy seeded names.
- Public dynamic renderer should use React Server Component for Prisma fetching and SEO metadata, passing clean AST to Client Renderer with BlockErrorBoundary.

## Artifact Index
- `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_3/handoff.md` — Comprehensive 5-component technical handoff specification
