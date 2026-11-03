# HANDOFF REPORT — Explorer M3-2
**Tri-Panel Studio Architecture, Zustand State Store, Figma-Ratio Canvas Auto-Fitting & Auxiliary Modals**
**Date**: 2026-11-02T15:55:00Z  
**Role**: Teamwork Explorer (M3-2)  
**Target Module**: `src/modules/website-builder/` and `src/app/admin/(dashboard)/pages/[id]/`

---

## 1. Observations

### 1.1 Reference Codebase Artifacts Inspected
Direct inspection of reference HCMUTE website builder and CMS studio engine:

1. **Top-Level Page Editor & Tab Routing**:
   - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/components/pages/page-editor.tsx` (1526 lines)
   - Route: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/app/manage/website-pages/[id]/page.tsx`
   - Observed: Implements a 3-view tabbed studio navigation:
     - `content`: Visual builder canvas (`WebsitePuckCanvas` / `PageBuilder`)
     - `info`: Page metadata, SEO score card (0-100), social OG preview (`PageInfoView`)
     - `history`: Version diffing, rollback, and revision restore (`PageHistoryView`)
     - Auxiliary Modal: `SyncTranslateModal` triggered by `Languages` icon in top action bar (lines 23, 75, 140-147).

2. **Tri-Panel Studio Shell Layout**:
   - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/editor/page-builder.tsx` (lines 855-865)
   - Observed CSS Grid Definition:
     ```tsx
     <div
       className={`flex-1 min-h-0 relative overflow-hidden bg-slate-50 grid ${
         viewMode === "preview"
           ? "grid-cols-1"
           : selectedBlockId
           ? "grid-cols-[308px_1fr_295px]"
           : "grid-cols-[308px_1fr]"
       }`}
     >
     ```
   - Exact Panel Dimensions:
     - **Left Drawer**: Fixed `308px` (`w-[308px]`, `shrink-0`) containing top segmented tab bar (`LayoutGrid` for Block Library, `Layers` for Page Layers, `Info` for Page Settings).
     - **Center Canvas**: Fluid `1fr` bounded strictly between left drawer and right inspector, hosting the infinite dot-matrix artboard workspace.
     - **Right Inspector**: Fixed `295px` (`w-[295px]`, `border-l border-slate-200`) containing `PropertyInspector` with 3 tabs: `Content`, `Styles`, `JSON`.

3. **Zustand State Store (`useBuilderStore`)**:
   - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/editor/builder-store.ts` (1011 lines)
   - Observed: Zustand store with:
     - `data: PageBuilderData` (`{ root: PageRootData, content: PageBlock[] }`)
     - `selectedBlockId: string | null`, `hoveredBlockId: string | null`, `advancedEditBlockId: string | null`
     - `history: PageBuilderData[]`, `future: PageBuilderData[]` (max depth 40)
     - `viewport: ViewportMode` ("desktop" | "tablet" | "mobile"), `device: DeviceMode`
     - `zoom: number`, `effectiveZoom: number`, `isAutoFit: boolean`
     - `isDirty: boolean`, `viewMode: "edit" | "preview"`, `sidebarTab: SidebarTab`
     - `clipboardBlock: PageBlock | null` with `localStorage` backup (`CLIPBOARD_STORAGE_KEY`) and `navigator.clipboard` integration for cross-window cut/copy/paste (lines 720-936)
     - Mutations: `addBlock`, `removeBlock`, `duplicateBlock`, `moveBlock`, `reorderBlocks`, `moveBlockToPosition`, `updateBlockProps`, `updateBlockStyles`, `updateBlock`, `toggleBlockHidden`, `undo`, `redo`.

4. **Canvas Auto-Fitting & Figma-Ratio Artboard**:
   - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/editor/canvas/builder-canvas.tsx` (lines 126-155, 163-205)
   - Observed Canonical Device Widths:
     - Desktop: `1240px` (or fluid min 768px - max 1240px in 1:1 auto-fit mode)
     - Tablet: `768px`
     - Mobile: `390px`
   - Observed Auto-Fit Calculation:
     ```ts
     const baseWidth = isMobile ? 390 : isTablet ? 768 : 1240;
     const availableWidth = Math.max(280, containerWidth - 48); // 48px breathing room (24px left, 24px right)
     const autoFitRatio = Math.min(1, availableWidth / baseWidth);
     const activeScale = isAutoFit ? autoFitRatio : zoom / 100;
     const visualWidth = Math.round(baseWidth * activeScale);
     const visualHeight = frameHeight > 0 ? Math.round(frameHeight * activeScale) : undefined;
     ```
   - Physical DOM Shell vs Artboard Frame:
     - Outer container has physical scaled dimensions: `width: visualWidth`, `height: visualHeight`.
     - Inner artboard has canonical dimensions: `width: baseWidth`, `transform: scale(activeScale)`, `transformOrigin: "0 0"`.
     - Result: Scrollbars, centering, and document flow match exact visual boundaries without clipping or phantom overflow.

5. **Counter-Scaled Floating Action Pills & Seam Dropzones**:
   - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/editor/canvas/sortable-block.tsx` (lines 177-179, 260-310)
   - Observed Counter-Scale Formula:
     ```ts
     const counterScale = effectiveZoom && effectiveZoom > 0 && effectiveZoom < 100 ? 100 / effectiveZoom : 1;
     ```
   - Applied to:
     - Top floating action pill: `style={{ transform: counterScale !== 1 ? `scale(${counterScale})` : undefined, transformOrigin: "top left" }}`
     - Seam drop indicator center badge: `style={{ transform: counterScale !== 1 ? `scale(${counterScale})` : undefined }}`
     - Hidden status pill: `style={{ transform: counterScale !== 1 ? `scale(${counterScale})` : undefined, transformOrigin: "bottom right" }}`
   - Result: Even at 50% or 60% canvas zoom, toolbar buttons, drag grips, and drop text maintain 100% crisp physical readability.
   - Seam Dropzones:
     - Top half: `useDroppable({ id: 'drop-before-${blockId}' })`
     - Bottom half: `useDroppable({ id: 'drop-after-${blockId}' })`
     - Royal blue indicator line with terminal beads and centered "+ Insert before: [Block Name]" badge.
     - Bottom canvas dropzone: `BottomCanvasDropzone` (`id: "drop-after-end"`).

6. **Top Bar & Sub-Toolbar Controls**:
   - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/editor/page-builder.tsx` (lines 563-852) and `toolbar/builder-header.tsx`
   - Observed Controls:
     - Viewport switcher (Desktop, Tablet, Mobile) with active pill highlighting
     - Zoom presets: Auto-Fit ("Fit" / "Tự động"), Small (50%), Medium (75%), Large (100%), Extra (125%), ZoomIn (+5%), ZoomOut (-5%)
     - History controls: Undo (`Undo2`, Ctrl+Z), Redo (`Redo2`, Ctrl+Y)
     - Clipboard: Paste block button (`ClipboardPaste`, Ctrl+V)
     - Preview dropdown: "Live Preview", "Open Full-Screen Preview", "Open in New Tab", "Copy Link"
     - Save button: `Save` icon, dirty indicator (`Unsaved Changes` / `Saved`), Cmd+S / Ctrl+S listener
     - Publish / Unpublish lifecycle action toggle.

7. **Auxiliary Modals & Tabs**:
   - **PageInfoView**:
     - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/components/pages/page-info-view.tsx`
     - Features: Real-time SEO analysis (`computeSeo` score 0-100), Title guidance (30-65 chars), Description guidance (70-160 chars), Cover image check, Social preview modal (`SharePreviewModal` simulating Facebook OG / Twitter Card), parent hierarchy combobox, slug editor, publish/unpublish toggle, homepage promotion.
   - **PageHistoryView**:
     - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/website-builder/components/history/page-history-view.tsx`
     - Features: Revisions timeline list from database, properties side-by-side diff (title, description, cover image, slug), AST content diff (blocks count delta, added/removed blocks, raw AST JSON comparison), version rollback/restore with confirmation dialog.
   - **SyncTranslateModal**:
     - Location: `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/modules/cms/editor/dialogs/sync-translate-modal.tsx`
     - Triggered by: `Languages` icon in toolbar (strictly ZERO sparkle icon)
     - Features: One-direction translation flow (source -> target), block diff scan, missing translations vs full overwrite sync, progress status and bar.

8. **Target IEEE SMC 2027 Codebase State**:
   - `prisma/schema.prisma` lines 66-105: `Page` model contains `id`, `slug`, `title`, `blocks` (Json), `content` (Json AST), `parentId`, `orderIndex`, `version`, `isPublished`, `metaTitle`, `metaDescription`, `templateId`, `histories`. `PageHistory` model contains `id`, `pageId`, `version`, `content`, `changeSummary`, `createdAt`.
   - `src/components/sections/`: All 21 official IEEE SMC 2027 conference sections exist (`HeroCarousel`, `WelcomeLetter`, `NewsList`, `ConferenceVideo`, `PaperTemplates`, `ContactCards`, `CfpSubscribe`, `SubmissionCountdown`, `ConferenceHighlights`, `CallForPapers`, `TracksExplorer`, `ImportantDates`, `About`, `Committee`, `CommitteesSection`, `PaymentMethods`, `Venue`, `FAQ`, `Sponsors`, `Keynotes`, `Hero`).
   - `src/app/admin/(dashboard)/pages/[id]/page.tsx`: Currently hosts an early monolithic prototype (2092 lines) that should be refactored into modular components under `src/modules/website-builder/`.
   - `package.json`: `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `zustand` (v5.0.16), `diff` (v8.0.4), `lucide-react`, `sonner`, `@radix-ui/react-*` are already installed and available.

---

## 2. Logic Chain

1. **Tri-Panel Shell Geometry**:
   - The reference CMS editor uses an immutable 3-column CSS Grid: `grid-cols-[308px_1fr_295px]`.
   - When no block is selected, the right column unmounts and the grid becomes `grid-cols-[308px_1fr]`.
   - When the user enters "Live Preview" mode, both side panels unmount and the grid becomes `grid-cols-1`.
   - This exact layout satisfies Task Item 1: 308px left block drawer, fluid center canvas, and 295px right property inspector.

2. **State Store Architecture**:
   - State must be centralized in a dedicated Zustand store (`useBuilderStore`) rather than inlined in `page.tsx` state hooks.
   - The store maintains the page AST `{ root, content }`, selection ID, undo/redo history stacks (capped at 40), active viewport mode, zoom level, dirty flag, and saving status.
   - Storing a serialized copy in `history` on every mutating action enables deterministic undo/redo via `undo()` and `redo()`.
   - A dedicated clipboard slice backed by `localStorage` and `navigator.clipboard` enables cut, copy, and paste both within the canvas and cross-tab.

3. **Figma Auto-Fitting Canvas Mechanics**:
   - A desktop web page is typically designed at 1240px wide. On laptop screens (e.g. 1366px or 1440px wide), subtracting the 308px left panel and 295px right panel leaves ~750px to ~840px for the center canvas.
   - Rendering a 1240px artboard without scaling causes severe horizontal scroll clipping.
   - Applying `transform: scale(activeScale)` with `transformOrigin: "0 0"` scales the artboard down smoothly.
   - To prevent floating toolbars, grip handles, and drop indicators from becoming tiny and illegible, `counterScale = 100 / effectiveZoom` is applied to all action overlays, ensuring they remain 100% crisp at standard touch/click sizes.
   - Seam dropzones on top and bottom halves of each block detect pointer collision and render royal blue insertion lines with circular terminal beads.

4. **Toolbar & Keyboard Controls**:
   - Providing both a top navigation bar (page title, slug, back link, save button) and a studio sub-toolbar (viewport switcher, zoom presets, undo/redo, paste, preview, translate) delivers full editing ergonomics.
   - Global keyboard shortcuts (Ctrl+S for save, Ctrl+Z/Ctrl+Y for undo/redo, Ctrl+C/Ctrl+V/Ctrl+X/Ctrl+D for clipboard, Delete for remove, Escape for deselect) dramatically increase productivity.

5. **Auxiliary Modals & Parity**:
   - The editor is organized into 3 views (`content`, `info`, `history`) accessible via top tabs.
   - `info` provides conference SEO scoring (0-100) and live social card preview (Facebook OG, Twitter/X Card).
   - `history` provides version diffing and one-click disaster recovery rollback backed by PostgreSQL `PageHistory`.
   - `SyncTranslateModal` triggered by the `Languages` icon allows one-direction translation and structural synchronization between language locales without sparkle icons.

6. **Compliance Requirements**:
   - Zero sparkle icons: Replace any AI/magic icons with `Languages`, `Zap`, `Sliders`, `LayoutGrid`, or `Layers`.
   - Clean English copy: Pure English labels across all buttons, inspector fields, and tooltips (no Vietnamese or bracketed sub-text).
   - Next.js 16 Suspense boundary: Any component reading `useSearchParams()` or dynamic params must be wrapped in `<Suspense fallback={<PageBuilderSkeleton />}>`. Route params must resolve the Promise via React 19 `use(params)`.

---

## 3. Caveats

1. **Monolithic Page Refactoring**: The existing `src/app/admin/(dashboard)/pages/[id]/page.tsx` is currently a single large file (2092 lines). The implementation worker should refactor this into modular components under `src/modules/website-builder/` and keep `page.tsx` clean and under ~150 lines.
2. **PostgreSQL AST Column**: The Prisma `Page` model contains both `blocks` (Json array) and `content` (Json object `{ root, content }`). The backend API route handlers and builder store must synchronize both columns upon save to ensure full compatibility with both old and new consumers.
3. **AI Translation Mocking**: If external AI translation APIs are not configured in the test environment, `SyncTranslateModal` should gracefully copy source strings to target locale and mark them as synchronized with Sonner toast feedback.

---

## 4. Conclusion & Technical Specification

### 4.1 Target Code Layout (`src/modules/website-builder/`)
```
src/modules/website-builder/
├── index.ts
├── types.ts                              # PageBlock, PageRootData, PageBuilderData, ViewportMode
├── store/
│   └── builder-store.ts                  # useBuilderStore Zustand state store
├── components/
│   ├── editor/
│   │   ├── page-builder.tsx              # Tri-panel studio shell (308px / 1fr / 295px)
│   │   ├── website-page-canvas.tsx       # Headless canvas wrapper with dirty state & saving
│   │   └── page-builder-skeleton.tsx     # Suspense loading skeleton
│   ├── canvas/
│   │   ├── builder-canvas.tsx            # Figma auto-fit artboard, dot matrix background
│   │   ├── sortable-block.tsx            # Bounding box, Figma handles, counter-scaled action pills
│   │   └── add-block-divider.tsx         # Inline seam dropzone insertion divider
│   ├── sidebar/
│   │   ├── palette-panel.tsx             # Block library (21 conference sections) with search
│   │   ├── layers-panel.tsx              # Page block tree with drag reorder & hide toggle
│   │   └── settings-panel.tsx            # Page title, slug, and global theme settings
│   ├── inspector/
│   │   ├── property-inspector.tsx        # 295px inspector with Content, Styles, JSON tabs
│   │   └── fields/                       # UnifiedColorPicker, PixelUnitInput, FieldRenderer
│   ├── toolbar/
│   │   ├── builder-header.tsx            # Top header with page title, slug, status badge, save
│   │   ├── studio-subtoolbar.tsx         # Viewport switcher, zoom presets, undo/redo, paste, preview
│   │   └── json-code-dialog.tsx          # Raw AST modal dialog
│   └── modals/
│       ├── page-info-view.tsx            # SEO score card 0-100 & social share preview card
│       ├── page-history-view.tsx         # Version timeline, property/AST diffing, rollback
│       ├── sync-translate-modal.tsx      # Languages icon, one-direction sync & translate
│       └── page-preview-modal.tsx        # Full-screen multi-device modal preview
```

---

### 4.2 Tri-Panel Layout Specification

```tsx
// Grid container in page-builder.tsx
<div
  className={cn(
    "flex-1 min-h-0 relative overflow-hidden bg-slate-50 grid transition-all duration-150",
    viewMode === "preview"
      ? "grid-cols-1"
      : selectedBlockId
      ? "grid-cols-[308px_1fr_295px]"
      : "grid-cols-[308px_1fr]"
  )}
>
  {/* Panel 1: Left Block Drawer (308px) */}
  {viewMode !== "preview" && (
    <aside className="w-[308px] h-full shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden z-20 select-none">
      <nav aria-label="Block Drawer Navigation" className="p-2 border-b border-slate-200 bg-slate-50/80 shrink-0">
        <div className="flex items-center bg-slate-200/70 p-1 rounded-xl gap-1">
          <button
            onClick={() => setSidebarTab("blocks")}
            className={cn("flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all", sidebarTab === "blocks" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900")}
            title="Block Library"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarTab("layers")}
            className={cn("flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all", sidebarTab === "layers" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900")}
            title="Page Layers"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSidebarTab("settings")}
            className={cn("flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all", sidebarTab === "settings" ? "bg-white text-blue-600 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900")}
            title="Page Settings"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </nav>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {sidebarTab === "blocks" && <PalettePanel />}
        {sidebarTab === "layers" && <LayersPanel />}
        {sidebarTab === "settings" && <SettingsPanel />}
      </div>
    </aside>
  )}

  {/* Panel 2: Fluid Center Canvas (1fr) */}
  <main className="w-full h-full min-w-0 relative overflow-hidden flex flex-col bg-white">
    <BuilderCanvas />
  </main>

  {/* Panel 3: Right Property Inspector (295px) */}
  {viewMode !== "preview" && Boolean(selectedBlockId) && (
    <aside className="w-[295px] h-full shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-hidden z-10 select-none">
      <PropertyInspector />
    </aside>
  )}
</div>
```

---

### 4.3 State Store Specification (`useBuilderStore`)

```ts
import { create } from "zustand";

export interface PageBlock {
  id: string;
  type: string;
  label?: string;
  props?: Record<string, any>;
  styles?: Record<string, any>;
  hidden?: boolean;
  children?: PageBlock[];
}

export interface PageRootData {
  title?: string;
  description?: string;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
}

export interface PageBuilderData {
  root: PageRootData;
  content: PageBlock[];
}

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type SidebarTab = "blocks" | "layers" | "settings";

export interface BuilderState {
  data: PageBuilderData;
  history: PageBuilderData[];
  future: PageBuilderData[];
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  viewport: ViewportMode;
  zoom: number;
  effectiveZoom: number;
  isAutoFit: boolean;
  viewMode: "edit" | "preview";
  sidebarTab: SidebarTab;
  isDirty: boolean;
  saving: boolean;
  hasUnsaved: boolean;
  conflict: boolean;
  clipboardBlock: PageBlock | null;

  // Actions
  setData: (data: PageBuilderData, trackHistory?: boolean) => void;
  setSelectedBlockId: (id: string | null) => void;
  setHoveredBlockId: (id: string | null) => void;
  setViewport: (viewport: ViewportMode) => void;
  setZoom: (zoom: number) => void;
  setEffectiveZoom: (zoom: number) => void;
  setIsAutoFit: (autoFit: boolean) => void;
  setViewMode: (viewMode: "edit" | "preview") => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setIsDirty: (isDirty: boolean) => void;
  setSavingState: (patch: { saving?: boolean; hasUnsaved?: boolean; conflict?: boolean }) => void;

  // Mutations
  addBlock: (type: string, targetIndex?: number, props?: Record<string, any>, styles?: Record<string, any>) => PageBlock;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (id: string, direction: "up" | "down") => void;
  reorderBlocks: (fromIndex: number, toIndex: number) => void;
  moveBlockToPosition: (sourceId: string, targetId: string, position: "before" | "after" | "end") => void;
  updateBlockProps: (id: string, newProps: Record<string, any>) => void;
  updateBlockStyles: (id: string, newStyles: Record<string, any>) => void;
  updateBlock: (id: string, patch: Partial<PageBlock>) => void;
  toggleBlockHidden: (id: string) => void;
  updateRoot: (patch: Partial<PageRootData>) => void;

  // Clipboard & System Integration
  copyBlock: (id: string) => Promise<boolean>;
  cutBlock: (id: string) => Promise<boolean>;
  pasteBlock: (targetId?: string | null, position?: "after" | "before" | "end") => Promise<PageBlock | null>;

  // History
  undo: () => void;
  redo: () => void;
}
```

---

### 4.4 Canvas Auto-Fitting & Counter-Scaling Specification

```ts
// Canonical Viewport Base Widths
const CANONICAL_WIDTHS = {
  desktop: 1240,
  tablet: 768,
  mobile: 390,
} as const;

// Auto-Fit Calculation Hook
export function useCanvasAutoFit(containerRef: React.RefObject<HTMLDivElement | null>, viewport: ViewportMode, zoom: number, isAutoFit: boolean) {
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) setContainerWidth(entry.contentRect.width);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  const baseWidth = CANONICAL_WIDTHS[viewport];
  const availableWidth = Math.max(280, containerWidth - 48); // 48px horizontal breathing margin
  const autoFitRatio = containerWidth > 0 ? Math.min(1, availableWidth / baseWidth) : 1;
  const activeScale = isAutoFit ? autoFitRatio : zoom / 100;
  const effectiveZoom = Math.max(20, Math.round(activeScale * 100));
  const counterScale = effectiveZoom < 100 ? 100 / effectiveZoom : 1;

  const visualWidth = Math.round(baseWidth * activeScale);

  return { baseWidth, activeScale, effectiveZoom, counterScale, visualWidth };
}
```

**Artboard Frame Stacking**:
```tsx
{/* Scaled Wrapper Shell: Occupies true physical DOM footprint */}
<div style={{ width: `${visualWidth}px`, height: visualHeight ? `${visualHeight}px` : undefined }} className="relative shrink-0">
  {/* Sized Visual Artboard Frame: Fixed baseWidth scaled via transform */}
  <div
    style={{
      width: `${baseWidth}px`,
      minWidth: `${baseWidth}px`,
      maxWidth: `${baseWidth}px`,
      transform: activeScale === 1 ? undefined : `scale(${activeScale})`,
      transformOrigin: "0 0",
      position: activeScale === 1 ? "relative" : "absolute",
      top: 0,
      left: 0,
    }}
    className="flex flex-col min-h-[850px] rounded-xl border border-slate-300/90 dark:border-zinc-800 bg-white shadow-xl ring-1 ring-slate-900/5 overflow-visible"
  >
    {/* Block content */}
  </div>
</div>
```

**Counter-Scaled Action Pill**:
```tsx
<div
  style={{
    transform: counterScale !== 1 ? `scale(${counterScale})` : undefined,
    transformOrigin: "top left",
  }}
  className="absolute top-1.5 left-1.5 z-50 flex items-center gap-1.5 h-9 bg-blue-600 text-white rounded-lg px-3 py-1.5 shadow-lg border border-blue-400 font-sans whitespace-nowrap"
>
  <div {...attributes} {...listeners} className="flex items-center gap-2 cursor-grab active:cursor-grabbing">
    <GripVertical className="w-3.5 h-3.5 text-blue-100" />
    <span className="text-xs font-bold">{block.label || block.type}</span>
  </div>
  <div className="h-4 w-px bg-blue-400/70 mx-0.5" />
  <button onClick={() => moveBlock(block.id, "up")} disabled={index === 0} title="Move Up"><ChevronUp className="w-3.5 h-3.5" /></button>
  <button onClick={() => moveBlock(block.id, "down")} disabled={index === totalBlocks - 1} title="Move Down"><ChevronDown className="w-3.5 h-3.5" /></button>
  <button onClick={() => copyBlock(block.id)} title="Copy Block (Ctrl+C)"><Copy className="w-3.5 h-3.5" /></button>
  <button onClick={() => duplicateBlock(block.id)} title="Duplicate Block (Ctrl+D)"><CopyPlus className="w-3.5 h-3.5" /></button>
  <button onClick={() => toggleBlockHidden(block.id)} title={isHidden ? "Show on Public Site" : "Hide from Public Site"}>
    {isHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-300" /> : <Eye className="w-3.5 h-3.5" />}
  </button>
  <button onClick={() => removeBlock(block.id)} title="Delete Block"><Trash2 className="w-3.5 h-3.5" /></button>
</div>
```

---

### 4.5 Auxiliary Modals & Tabs Specification

1. **Info Tab (`PageInfoView`)**:
   - **SEO Score Engine**:
     - Calculates 0-100 score based on 4 criteria: Title length (30-65 chars: 30 pts), Meta description length (70-160 chars: 35 pts), Cover Image presence (20 pts), Keyword in title & description (15 pts).
     - Color-coded indicator: `< 50` Red, `50-79` Amber, `>= 80` Emerald.
   - **Social Share Preview**:
     - Real-time Facebook OG Card & Twitter/X Preview displaying `metaTitle || title`, `metaDescription || description`, and cover image.
   - **Publication & Hierarchy**:
     - Parent page combobox for multi-level navigation.
     - URL slug input with automatic lowercase/dash normalization.
     - Publish / Unpublish toggle button with instant status badge update.

2. **History Tab (`PageHistoryView`)**:
   - Fetches historical revisions from `/api/admin/pages/[id]/history` (backed by Prisma `PageHistory`).
   - Side-by-side or unified diff comparison:
     - Properties diff: title, description, cover image, slug changes with red/green diff badges.
     - AST content diff: block count delta, added/removed blocks, and raw JSON AST comparison using `diff` package.
   - Rollback / Restore action: one-click version restore with confirmation dialog, bumping version and creating a recovery history snapshot.

3. **SyncTranslateModal**:
   - Triggered by `Languages` icon in the top action bar.
   - Strictly ZERO sparkle icon (compliance rule).
   - One-direction sync workflow: Source Locale -> Target Locale.
   - Block scan item listing diff status ("New Block", "Missing Translation", "Synchronized").
   - Execution options: "Translate missing only" vs "Full overwrite sync".

---

## 5. Verification Method

### 5.1 Automated Test Execution
Run the opaque-box test runner covering page builder endpoints:
```bash
# Run Tier 1 feature coverage
pnpm run test:e2e tests/e2e/tier1-feature-coverage/page-builder.test.ts

# Run Tier 2 boundary cases (slug normalization, duplicate slug, home protection)
pnpm run test:e2e tests/e2e/tier2-boundary-corner/page-builder-edge.test.ts

# Run Tier 3 cross-feature interactions
pnpm run test:e2e tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts

# Run Tier 4 conference workflows (draft -> publish -> rollback)
pnpm run test:e2e tests/e2e/tier4-real-world/conference-workflows.test.ts
```

### 5.2 Build & Lint Verification
Verify zero TypeScript and Next.js 16 build regressions:
```bash
pnpm run build
```

### 5.3 Manual Layout & Dimension Inspection
Verify that in the browser at `/admin/pages/[id]`:
1. Left drawer measures exactly `308px` width.
2. Right property inspector measures exactly `295px` width with `Content`, `Styles`, `JSON` tabs.
3. Center canvas adapts fluidly and scales artboards (1240px Desktop, 768px Tablet, 390px Mobile) with `isAutoFit`.
4. Floating action pills stay 100% physically sized (`counterScale = 100 / effectiveZoom`) when zooming to 50% or 75%.
5. Zero sparkle icons exist in any icon set, button, or modal.
