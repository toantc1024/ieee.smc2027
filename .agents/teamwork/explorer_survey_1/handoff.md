# Handoff Report: Website Builder Specification Mining

**Task**: Explorer Survey 1 (Website Builder Spec Miner)  
**Assigned Agent**: `explorer_survey_1`  
**Recipient**: Parent Orchestrator (`e417c152-55b4-4ecc-ad3e-6ec5f3ea6688`)  
**Date**: 2026-11-02  
**Handoff Type**: Hard (Task Complete)  

---

## 1. Observation

1. **Reference Module Architecture**:
   - The reference Website Builder module is located at `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/` and relies directly on the underlying visual page builder engine in `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/`.
   - In `modules/website-builder/components/editor/website-page-builder.tsx:11`, `WebsitePageBuilder` imports `PageBuilder` from `@/modules/cms/editor/page-builder`.
   - In `modules/cms/editor/page-builder.tsx:855-926`, the studio layout is structured as a CSS grid:
     `grid-cols-[308px_1fr_295px]` (when a block is selected) or `grid-cols-[308px_1fr]` (when no block is selected), and collapses to `grid-cols-1` during preview mode.
   - In `modules/cms/editor/canvas/builder-canvas.tsx:133-146`, canvas scaling dynamically calculates `baseWidth` (Mobile: 390px, Tablet: 768px, Desktop: 1240px) and calculates an auto-fit ratio `autoFitRatio = Math.min(1, (containerWidth - 48) / baseWidth)` to guarantee 48px breathing room without blur.
   - In `modules/cms/editor/canvas/sortable-block.tsx:178`, floating toolbars and seam badges apply `counterScale = 100 / effectiveZoom` so buttons remain 100% crisp regardless of artboard scale.

2. **UI Hierarchy & Button Controls**:
   - `page-editor.tsx:830-1065`: Studio top bar contains Back button, Title button (with VN/GB flag and click jump to info tab), SegmentedSwitch (`Nội dung trang`, `Thông tin`, `Lịch sử`), status pill badge, lifecycle actions (`Xuất bản` / `Hủy xuất bản`), `SyncTranslateModal` trigger (`Đồng bộ & Dịch AI`), and versioned save button with `Ctrl+S` / `Cmd+S`.
   - `page-builder.tsx:564-851`: Studio sub-toolbar includes viewport switcher (`Máy tính`, `Máy tính bảng`, `Điện thoại`), zoom presets (`Tự động`, `Nhỏ 50%`, `Vừa 75%`, `Lớn 100%`, `ZoomIn`, `ZoomOut`), history undo/redo (`Undo2`, `Redo2`), paste block (`ClipboardPaste`), and preview mode dropdown (`Eye`/`EyeOff`).
   - `page-list-view.tsx:814-888`: Dual view (`FolderTree` / `Table2`), search input with debounce, expand/collapse all toggle, "Cấu hình template" (`LayoutTemplate`), "Nhân bản trang mẫu" (`Copy`), "Tạo trang" (`Plus` dropdown), and floating bulk action bar (`Send`, `Ban`, `Archive`, `Trash2`).

3. **Target Project IEEE SMC 2027**:
   - In `/Users/macos/ieee-smc-2027/package.json`, `@dnd-kit/core` (`^6.3.1`), `@dnd-kit/sortable` (`^10.0.0`), `@dnd-kit/utilities` (`^3.2.2`), `lucide-react` (`^1.41.0`), `sonner` (`^2.0.8`), and `motion` (`^13.4.4`) are installed.
   - `zustand`, `diff`, `@types/diff`, and `@radix-ui/react-popover` are currently **missing** from `package.json`.
   - In `/Users/macos/ieee-smc-2027/src/components/sections/`, 21 conference block components are already implemented: `About.tsx`, `CallForPapers.tsx`, `CfpSubscribe.tsx`, `Committee.tsx`, `CommitteesSection.tsx`, `ConferenceHighlights.tsx`, `ConferenceVideo.tsx`, `ContactCards.tsx`, `FAQ.tsx`, `Hero.tsx`, `HeroCarousel.tsx`, `ImportantDates.tsx`, `Keynotes.tsx`, `NewsList.tsx`, `PaperTemplates.tsx`, `PaymentMethods.tsx`, `Sponsors.tsx`, `SubmissionCountdown.tsx`, `TracksExplorer.tsx`, `Venue.tsx`, `WelcomeLetter.tsx`.
   - In `/Users/macos/ieee-smc-2027/src/app/admin/(dashboard)/pages/[id]/page.tsx`, a 2,092-line monolithic prototype currently exists, but it lacks the tri-panel studio architecture, auxiliary tabs (`info`, `history`), template system, and robust concurrency control.
   - In `/Users/macos/ieee-smc-2027/prisma/schema.prisma`, `Page` only has `id`, `slug`, `title`, `blocks`, `isPublished`, `metaTitle`, `metaDescription`, `createdAt`, `updatedAt`. It lacks `parentId`, `orderIndex`, `version`, `content`, `PageHistory`, and `WebsiteTemplate` models.

4. **User Rules & Constraints**:
   - "Never use sparkle icon": Checked all reference CMS and website-builder code. The reference explicitly notes `// NOTE: per user rule NEVER use Sparkles! We will use Network or Workflow instead!`. The translation modal uses `Languages`. The new builder will strictly adhere to this constraint.
   - Next.js 16 conventions: `params` is a Promise (`params: Promise<{ id: string }>`) unwrapped via `use(params)` or `await params`.

---

## 2. Logic Chain

1. **Source Independence**: The reference website builder is not coupled to Puck library runtime; it has been completely rebuilt as a custom lightweight visual studio engine (`PageBuilder` in `modules/cms/editor/page-builder.tsx`) backed by Zustand and `@dnd-kit`.
2. **Component Synergy**: IEEE SMC 2027 already possesses all 21 specialized conference sections (`CallForPapers`, `CommitteesSection`, `HeroCarousel`, etc.) in `src/components/sections/`. Registering these components inside the modular builder registry (`BUILDER_REGISTRY`) will instantly give IEEE SMC 2027 full visual editing capabilities for all conference content.
3. **Architecture Upgrade**: Rather than maintaining a 2,092-line single-file editor in `src/app/admin/(dashboard)/pages/[id]/page.tsx`, adopting the reference structure (`modules/website-builder/` and `modules/cms/`) cleanly separates the store (`builder-store.ts`), artboard canvas (`builder-canvas.tsx`), block action bars (`sortable-block.tsx`), drawers, and property inspector.
4. **Data Persistence**: Because IEEE SMC 2027 uses PostgreSQL via Prisma, upgrading the `Page` model with `parentId`, `orderIndex`, `version`, and `content`, and introducing `PageHistory` and `WebsiteTemplate` will allow the backend API route handlers (`/api/admin/pages/...`) to achieve full functional parity with the reference Java microservice.

---

## 3. Caveats

1. **Database Migration**: Updating `prisma/schema.prisma` will require running `pnpm prisma db push` or `prisma migrate`. Ensure Postgres database container is running before applying schema changes.
2. **Third-Party Dependencies**: Installing `zustand@^5.0.10`, `diff@^8.0.4`, `@types/diff@^8.0.0`, and `@radix-ui/react-popover` is a required prerequisite before compiling the ported builder code.
3. **Public Page Rendering**: Once pages are saved as `{ root, content: PageBlock[] }` in `Page.content`, the public route `src/app/page.tsx` and dynamic route `src/app/[...slug]/page.tsx` must render them using `PageRenderer` or `BlockRenderer`.

---

## 4. Conclusion

The Page Editor / Website Builder module from the reference HCMUTE project has been thoroughly investigated, reverse-engineered, and mapped. A complete specification, inventory of 50+ features, full UI button hierarchy, dependency matrix, and 6-phase migration plan have been compiled in `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_survey_1/survey_report.md`.

Porting the module into IEEE SMC 2027 is fully feasible and directly compatible with Next.js 16, React 19, and the existing 21 conference section components.

---

## 5. Verification Method

To verify the findings and assess readiness:
1. **Inspect Survey Report**:
   `view_file /Users/macos/ieee-smc-2027/.agents/teamwork/explorer_survey_1/survey_report.md`
2. **Verify Reference Source Code**:
   `view_file /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/editor/page-builder.tsx`
   `view_file /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/components/pages/page-editor.tsx`
   `view_file /Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/components/pages/page-list-view.tsx`
3. **Verify Target Existing Sections**:
   `list_dir /Users/macos/ieee-smc-2027/src/components/sections`
4. **Check Build Integrity**:
   Run `pnpm run build` in `/Users/macos/ieee-smc-2027` to confirm the baseline project builds cleanly.
