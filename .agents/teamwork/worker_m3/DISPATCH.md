# DISPATCH — Worker M3: Page Editor & Website Builder Implementation

**Date**: 2026-11-02T15:52:00Z  
**Role**: `teamwork_worker` (Worker M3)  
**Assigned Subagent Working Directory**: `/Users/macos/ieee-smc-2027/.agents/teamwork/worker_m3/`  
**Parent Orchestrator**: `e417c152-55b4-4ecc-ad3e-6ec5f3ea6688`  
**Milestone**: M3 (Page Editor & Website Builder)  

---

## MANDATORY INTEGRITY WARNING
> DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

---

## 1. Objective
Implement the full production-ready Page Editor / Website Builder system for IEEE SMC 2027 website with complete feature parity to the reference HCMUTE frontend (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/`), satisfying all E2E test contracts (`tests/e2e/tier1-feature-coverage/page-builder.test.ts` and `tests/e2e/tier2-boundary-corner/page-builder-edge.test.ts`).

---

## 2. Input Specification & References (Must Read)
You MUST read and adhere to the blueprints produced by the three M3 Explorers:
1. `/Users/macos/ieee-smc-2027/.agents/teamwork/ORIGINAL_REQUEST.md` — Authoritative user requirements.
2. `/Users/macos/ieee-smc-2027/PROJECT.md` — Project architecture, feature inventory, code layout.
3. `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_1/handoff.md` — Pages API Handlers & Page List UI Blueprint.
4. `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_2/handoff.md` — Visual Studio Engine, Zustand Store, Canvas Auto-Fitting & Auxiliary Modals Blueprint.
5. `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_3/handoff.md` — 21 Conference Section Registry, Public Dynamic Page Renderer & Seam Dropzones Blueprint.

---

## 3. Work Scope & Deliverables

### Part A: Pages API Route Handlers (`src/app/api/admin/pages/`)
1. **`src/app/api/admin/pages/route.ts`**:
   - `GET /api/admin/pages`:
     - Query parameters: `search` or `title` (case-insensitive substring filter), `status` ("all" | "published" | "draft"), `parentId` ("root" or specific ID), `view` ("flat" | "tree").
     - Returns `{ pages, total, tree? }` matching E2E expectations.
     - Auto-seeds standard pages (`home`, `committees`, `submissions`, `registration`, `program`, `travel`, `news`) if none exist in the database.
   - `POST /api/admin/pages`:
     - Accepts `{ id?, title, slug?, content?, blocks?, parentId?, orderIndex?, isPublished?, is_published?, metaTitle?, metaDescription? }`.
     - Slug normalization: lowercased, diacritics stripped, non-alphanumeric converted to hyphens, trimmed hyphens.
     - Detects slug collision -> returns HTTP 409 Conflict.
     - Persists page and transactionally inserts initial `PageHistory` record (`version: 1`).
     - Returns HTTP 201 with created page object.
2. **`src/app/api/admin/pages/[id]/route.ts`**:
   - `GET /api/admin/pages/[id]`:
     - Look up by either `id` OR `slug`.
     - Returns complete page data including `content` AST, `blocks`, version, parent/child relationships, and `histories`. Returns 404 if not found.
   - `PATCH /api/admin/pages/[id]` & `PUT /api/admin/pages/[id]`:
     - Support both PATCH and PUT for E2E backward compatibility.
     - Optimistic locking: if client passes `version`, verify it matches `page.version`; if conflict -> HTTP 409 Conflict.
     - In Prisma transaction: increment `version: page.version + 1`, update fields, and insert `PageHistory` snapshot with `changeSummary`.
     - Catch Prisma unique constraint violations (P2002) and write conflicts (P2034) -> HTTP 409.
     - Return HTTP 200 with updated page.
   - `DELETE /api/admin/pages/[id]`:
     - Protect `"home"` page: return HTTP 400 Bad Request with error message.
     - Cascade re-parent child pages to `existing.parentId` before deletion to prevent orphaned routes.
     - Delete `PageHistory` and `Page` in transaction. Return HTTP 200.
3. **`src/app/api/admin/pages/[id]/publish/route.ts`**:
   - `POST`: Toggle or explicitly set `isPublished` (`{ isPublished: boolean }`). Returns updated page.
4. **`src/app/api/admin/pages/[id]/rollback/route.ts`**:
   - `POST`: Accepts `{ version?: number, historyId?: string }`.
   - Restores `content` and `blocks` from selected `PageHistory` snapshot, increments page version, and logs audit entry. Returns restored page.

### Part B: Page List UI (`src/app/admin/(dashboard)/pages/`)
1. **`src/app/admin/(dashboard)/pages/page.tsx`**:
   - Next.js 16 App Router page wrapped in `<Suspense fallback={<PageListSkeleton />}>`.
2. **`src/app/admin/(dashboard)/pages/components/page-list-view.tsx`**:
   - View toggle: `FolderTree` (hierarchical tree with depth guides and expand/collapse) vs `Table2` (tabular data with sortable columns).
   - Search bar: 300ms debounced search, auto-expanding tree nodes to reveal matches.
   - Status filters: "All", "Published", "Draft".
   - Expand/Collapse All toggle (`ChevronsDownUp` / `ChevronsUpDown`).
   - Create Page button opening `TemplateSelectionModal`.
3. **`src/app/admin/(dashboard)/pages/components/template-selection-modal.tsx`**:
   - 7 conference presets: Home, Call for Papers, Committees, Registration, Program, Venue & Travel, Blank Page.
   - Selecting a preset auto-derives title/slug and redirects to `/admin/pages/[id]`.
4. **`src/app/admin/(dashboard)/pages/components/bulk-action-bar.tsx`**:
   - Floating pill bar at `bottom-6 left-1/2 -translate-x-1/2` when rows are selected (bulk publish, draft, delete, deselect).

### Part C: Visual Studio Engine (`src/modules/website-builder/`)
1. **Core Types (`src/modules/website-builder/types/index.ts`)**:
   - Define `PageBlock<P>`, `PageRootData`, `PageBuilderData`, `FieldDefinition`, `ComponentDefinition`.
2. **Zustand Store (`src/modules/website-builder/store/builder-store.ts`)**:
   - State: `pageId`, `pageTitle`, `pageSlug`, `data: PageBuilderData` (`{ root, content }`), `selectedBlockId`, `hoveredBlockId`, `viewport` ("desktop" | "tablet" | "mobile"), `zoom` (number), `isAutoFit` (boolean), `isDirty` (boolean), `undoStack`, `redoStack` (max depth 40).
   - Actions: `initPage`, `addBlock`, `insertBlockAt`, `updateBlockProps`, `updateBlockStyles`, `removeBlock`, `moveBlock`, `duplicateBlock`, `selectBlock`, `hoverBlock`, `setViewport`, `setZoom`, `toggleAutoFit`, `undo`, `redo`, `copyBlock`, `pasteBlock` (with cross-tab clipboard support).
3. **Tri-Panel Shell Geometry (`src/modules/website-builder/components/studio/builder-layout.tsx`)**:
   - CSS Grid `grid-cols-[308px_1fr_295px]`, collapsing right panel when no block selected, full fluid canvas in preview.
   - Left Drawer (308px): Tabs for `BlockLibrary` (`LayoutGrid`), `LayersTree` (`Layers`), and `PageSettings` (`Info`).
   - Center Canvas: Infinite dot-matrix background, auto-fitting wrapper.
   - Right Inspector (295px): `PropertyInspector` with Content, Styles, JSON tabs.
4. **Canvas Auto-Fitting & Counter-Scaling (`src/modules/website-builder/components/canvas/builder-canvas.tsx`)**:
   - Canonical artboard widths: Desktop (1240px), Tablet (768px), Mobile (390px).
   - Outer wrapper physically sized to `visualWidth`/`visualHeight` (`overflow-hidden`), inner artboard transformed with `scale(activeScale)`.
   - Seam dropzones: `drop-before-${blockId}` and `drop-after-${blockId}` with royal blue indicator line, terminal beads, and center counter-scaled badge (`counterScale = 100 / effectiveZoom`).
   - Canvas end dropzone: `drop-after-end`.
5. **Sortable Block (`src/modules/website-builder/components/canvas/sortable-block.tsx`)**:
   - Wrap rendered component with selection border, hover outline, floating action pill (counter-scaled) for duplicate, delete, move up/down, inspect.
6. **Toolbars (`src/modules/website-builder/components/toolbar/`)**:
   - `builder-header.tsx`: Back link, editable title, slug badge, save status badge, preview toggle, Cmd+S save button.
   - `sub-toolbar.tsx`: Viewport toggle, zoom presets (Auto/Fit, 50%, 75%, 100%, 125%), undo/redo, paste, preview dropdown, SyncTranslate modal trigger.
7. **Auxiliary Modals (`src/modules/website-builder/components/modals/`)**:
   - `page-info-view.tsx`: SEO score gauge (0-100) and live Google/Twitter/OG social cards.
   - `page-history-view.tsx`: Version diff list and one-click rollback.
   - `sync-translate-modal.tsx`: Multilingual sync triggered by `Languages` icon (ZERO sparkles).
8. **Admin Studio Route (`src/app/admin/(dashboard)/pages/[id]/page.tsx`)**:
   - Client component wrapped in Suspense loading studio for the specified page ID.

### Part D: 21 Conference Section Registry (`src/modules/website-builder/registry/`)
1. **`src/modules/website-builder/registry/conference-blocks.tsx` & `index.ts`**:
   - Register all 21 canonical block types:
     1. `HeroCarousel` (Hero banner with slides, autoplay, CTA buttons)
     2. `CallForPapers` (Official CFP, deadline, PDF link)
     3. `KeynoteSpeakersSection` (Plenary speakers grid)
     4. `CommitteesSection` (Organizing & steering committee carousel)
     5. `ConferenceTracksSection` (Systems, Cybernetics, Human-AI tracks)
     6. `ImportantDatesSection` (Milestones table, deadlines)
     7. `RegistrationFeesSection` (Author/Member/Student fee tiers)
     8. `VenueLocationSection` (Sheraton Saigon Hotel, address, map)
     9. `ScheduleTimelineSection` (5-day conference timeline)
     10. `SponsorshipSection` (IEEE SMC, HCM-UTE, partners)
     11. `WorkshopTutorialSection` (Workshops & tutorial proposals)
     12. `PaperSubmissionGuidelinesSection` (LaTeX/Word templates, limits)
     13. `AwardsSection` (Paper awards, student awards)
     14. `TravelAccommodationSection` (Hotel booking, airport transit)
     15. `ContactSupportSection` (Secretariat contacts)
     16. `FaqAccordionSection` (Author & attendee FAQs)
     17. `PastConferencesSection` (SMC 2026, 2025, 2024 archive)
     18. `MediaGallerySection` (YouTube video embed & gallery)
     19. `VisaInformationSection` (90-day Vietnam e-Visa guide)
     20. `HeaderSection` (Conference portal navigation header)
     21. `FooterSection` (Official copyright footer & links)
   - Include `BLOCK_ALIASES` mapping legacy/shorthand names (`Keynotes`, `TracksExplorer`, `ImportantDates`, `PaymentMethods`, `Venue`, `Sponsors`, `PaperTemplates`, `ContactCards`, `FAQ`, `ConferenceVideo`, `Committee`).
   - Define field definitions for property inspector editing on each block.

### Part E: Public Dynamic Page Renderer (`src/app/(public)/[slug]/page.tsx`)
1. **Server Route Component**:
   - Fetch page from Prisma by slug or ID.
   - Return 404 (`notFound()`) if page does not exist or is unpublished (unless `?preview=true` is requested).
   - Generate SEO metadata via `generateMetadata()`.
   - Mount `PublicPageRenderer` wrapped with `BlockErrorBoundary` per block.
   - Display draft banner when viewing unpublished preview.

---

## 4. Strict Constraints & User Rules
1. **ZERO Sparkle Icons**: Do NOT use Lucide `Sparkles`, `Sparkle`, `✨`, or any sparkle SVGs anywhere. Use clean standard icons (`Sliders`, `FileText`, `Mic`, `Users`, `Layers`, `Calendar`, `CreditCard`, `MapPin`, `Clock`, `Building2`, `BookOpen`, `FileCode`, `Award`, `Compass`, `Mail`, `HelpCircle`, `History`, `Video`, `Plane`, `Layout`, `PanelBottom`, `Languages`, `Save`, `Undo`, `Redo`, `Eye`, `Settings`, etc.).
2. **Clean English Labels**: Do not make too much text or bilingual English in parentheses `()`.
3. **Atomic Commits & Pushes**: For each atomic change or big change, make a commit and push to `origin main` using `git commit` and `git push`.
4. **Next.js 16 Rules**: Any client component using `useSearchParams()` MUST be wrapped in a `<Suspense>` boundary. Route params in Next.js 16 are Promises (`params: Promise<{ slug: string }>`).

---

## 5. Verification Requirements
Before delivering your handoff, you MUST execute and pass:
1. `pnpm exec tsc --noEmit` — 0 errors.
2. `pnpm run build` — 0 errors (all routes compile successfully).
3. `npx tsx --env-file=.env --test tests/security/auth-adversarial.stress.ts` — 22/22 pass.
4. `npx tsx --env-file=.env --test tests/security/analytics-adversarial.stress.ts` — 23/23 pass.
5. `pnpm run test:e2e` — 10/10 test suites pass (including `page-builder.test.ts` and `page-builder-edge.test.ts`).

## 2026-11-02T15:52:50Z
Received dispatch from e417c152-55b4-4ecc-ad3e-6ec5f3ea6688:
Worker M3 assignment for M3 Page Editor & Website Builder implementation.
Requirements, endpoints, UI components, Visual Studio Engine, 21 conference section registry, public dynamic page renderer, verification commands.

