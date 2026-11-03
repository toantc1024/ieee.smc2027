# Specification Mining & Feasibility Survey: Website Builder Module
**Target Project**: IEEE SMC 2027 (`/Users/macos/ieee-smc-2027`)  
**Reference Source**: HCMUTE Website Frontend (`/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend`)  
**Investigator**: Explorer Survey 1 (Website Builder Spec Miner)  
**Date**: 2026-11-02  
**Status**: Specification Complete & Ready for Integration  

---

## 1. Executive Summary

This survey report provides an exhaustive architectural and functional breakdown of the **Page Editor / Website Builder** module from the reference HCMUTE project (`modules/website-builder/` and core visual engine `modules/cms/`) and assesses its full integration into the IEEE SMC 2027 website.

The reference Website Builder is an advanced, production-grade visual CMS studio composed of:
1. **Studio Canvas & Artboard Engine**: Dynamic Figma-style auto-fitting artboard with counter-scaled floating action pills, drag-and-drop sortable blocks (`@dnd-kit`), seam dropzones with terminal beads, and live AST synchronization.
2. **Tri-Panel Studio Architecture**:
   - Left Drawer (308px): Block Palette with search, categorization, and hover scalable blueprint wireframes; Layers Tree with hierarchy, ordering, and block visibility controls; Page Settings & SEO.
   - Center Viewport: Multi-device artboard (Desktop 1240px, Tablet 768px, Mobile 390px), auto-fit scaling ratio, dot-matrix canvas background, and empty-state onboarding.
   - Right Property Inspector (295px): 3 tabs (`content`, `styles`, `json`), field renderers for text, images, rich-text Tiptap, unified color/gradient pickers, custom spacing (pixel units), and live JSON AST editing with error validation.
3. **Studio Header & Sub-Toolbar**:
   - Header: Back navigation, bilingual page title quick-jump button, segmented view switcher (`Nội dung trang`, `Thông tin`, `Lịch sử`), status indicator badge, publish/archive lifecycle actions, AI sync & translation modal (`SyncTranslateModal`), and optimistic-concurrency save button with `Ctrl+S` / `Cmd+S`.
   - Sub-Toolbar: Viewport selector (Máy tính, Máy tính bảng, Điện thoại), zoom controls (Tự động, Nhỏ 50%, Vừa 75%, Lớn 100%, Zoom In/Out), history controls (Undo, Redo, Paste from clipboard), and interactive preview dropdown ("Xem").
4. **Full Page Management Subsystem (`PageListView`)**:
   - Tree View (`FolderTree`) with hierarchical branch lines, node collapse/expand, search filtering with active badge chips, and bulk action toolbar.
   - Table View (`Table2`) with pagination, sorting, and inline lifecycle triggers.
   - Multi-action controls: Apply template dialog, clone template page dialog, page creation dialog with parent selector.
5. **Auxiliary Modules**:
   - `PageInfoView`: Real-time 0-100 SEO scoring card, social share preview for Google, Facebook, Zalo, Twitter/X, and UTE frame, parent combobox, and audit info.
   - `PageHistoryView`: Version snapshot timeline, side-by-side properties diff comparison, and visual build iframe sandbox.
   - `WebsiteTemplates` & `TemplatePages`: Full reusable template authoring suite.

In the target project (IEEE SMC 2027), an initial 2,092-line monolithic prototype currently exists in `src/app/admin/(dashboard)/pages/[id]/page.tsx`, and 21 conference section components are already present in `src/components/sections/`. However, it lacks the modular tri-panel architecture, tabs (`info`, `history`), template subsystem, counter-scaled toolbars, clipboard memory, SEO score card, and proper state persistence.

---

## 2. Features Discovered & Probed

### Detailed Feature Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | Studio Header | Back Navigation | Returns from editor to page list | Click button | Next.js router push `/admin/pages` | Safe fallback | `page-editor.tsx:831` |
| 2 | Studio Header | Title Jump | Displays bilingual page title; click switches directly to `info` tab focused on title | Click or keyboard | Tab switch to `info`, input focus | None | `page-editor.tsx:881` |
| 3 | Studio Header | View Switcher | Segmented switch between `content`, `info`, and `history` views | Click tab | Re-renders active view; maintains canvas mounted | URL param normalization | `page-editor.tsx:920` |
| 4 | Studio Header | Status Badge | Live visual pill showing "Đã xuất bản" (green), "Bản nháp" (amber), or "Đã ẩn" (slate) | Page status enum | Styled pill badge with status dot | Fallback to draft style | `page-editor.tsx:945` |
| 5 | Studio Header | Publish / Unpublish | Transitions page lifecycle state via API | User click | Updates server state, updates badge, triggers toast | Displays server error toast | `page-editor.tsx:968` |
| 6 | Studio Header | Set Homepage CTA | Promotes page to tenant root homepage (prompts confirm dialog if unpublished) | User click | Calls `setHome`, updates fullPath to `/` | Prevents unpublishing homepage | `page-editor.tsx:1048` |
| 7 | Studio Header | Sync & AI Translate | Structural diff and bilingual translation modal between source and target locales | Click button | Merges translated blocks into content AST | Conflict warning dialog | `sync-translate-modal.tsx` |
| 8 | Studio Header | Server Save | Persists current canvas AST to server with optimistic lock version | Click or `Ctrl+S` / `Cmd+S` | Increments version, updates toast, revalidates cache | Catches concurrency conflict, triggers auto-recovery | `page-editor.tsx:531` |
| 9 | Studio Header | Post Detail Preview Bar | Selects live news/article sample to preview within dynamic post-detail template | Select dropdown | Injects real post data into `PostDetailProvider` | Gracefully falls back to default seed | `page-editor.tsx:1108` |
| 10 | Sub-Toolbar | Viewport Switcher | Toggles artboard layout between Desktop (1240px), Tablet (768px), and Mobile (390px) | Click viewport button | Adjusts canvas base width & triggers resize event | Clamped within min/max bounds | `page-builder.tsx:566` |
| 11 | Sub-Toolbar | Zoom Controls | Scales canvas with Auto-Fit (Figma ratio) or fixed presets (50%, 75%, 100%, ±5%) | Click preset or zoom btn | Scales artboard via CSS transform `scale(r)` | Min 25%, max 150% clamp | `page-builder.tsx:620` |
| 12 | Sub-Toolbar | Undo / Redo | Traversable state stack (up to 40 history snapshots) | Click or `Ctrl+Z`, `Ctrl+Y` | Replaces canvas AST with previous/future snapshot | Disabled when stack empty | `page-builder.tsx:714` |
| 13 | Sub-Toolbar | Paste from Clipboard | Pastes copied/cut block from memory/localStorage after active selection | Click or `Ctrl+V` | Clones block with new unique IDs and inserts | Disabled when clipboard empty | `page-builder.tsx:737` |
| 14 | Sub-Toolbar | Preview Mode Dropdown | Toggles interactive preview or opens modal/tab | Dropdown select | Disables drag handlers, enables link/button interactions | Clean exit with `EyeOff` | `page-builder.tsx:754` |
| 15 | Left Drawer | Tab Navigation | 3 top icons: Blocks (`LayoutGrid`), Layers (`Layers`), Settings (`Info`) | Click tab icon | Switches drawer content panel | Retains state across tabs | `page-builder.tsx:872` |
| 16 | Left Drawer | Palette Search | Real-time text filter with Vietnamese diacritics normalization | Text input | Filters matching blocks across all categories | Shows "Không tìm thấy" empty state | `palette-panel.tsx:130` |
| 17 | Left Drawer | Block Palette Items | Draggable cards with category accordions and hover scalable wireframe previews | Drag pointer or click | Spawns DragOverlay or appends to canvas | Smooth drag cancellation | `draggable-palette-item.tsx` |
| 18 | Left Drawer | Layers Structure Panel | Visual tree of blocks on canvas with index numbers, labels, IDs, and hidden badges | Click or action click | Selects block on canvas; allows direct reorder/delete | Safe removal | `layers-panel.tsx` |
| 19 | Left Drawer | Global Settings Panel | Edits page title, SEO description, and theme colors (background solid/gradient, primary) | Form inputs & pickers | Updates `root` object in PageBuilderData AST | Real-time preview | `settings-panel.tsx` |
| 20 | Center Canvas | Figma Artboard | Dot-matrix background (`24px` grid) with floating card shell and drop boundary | Responsive resize | Fluid width auto-fit with 48px padding | Fallback container min 280px | `builder-canvas.tsx:162` |
| 21 | Center Canvas | Seam Dropzones | Top half (`before`) and bottom half (`after`) drop detection zones | Dnd pointer hover | Displays solid blue line with end beads & label badge | Suppressed in preview mode | `sortable-block.tsx:258` |
| 22 | Center Canvas | Floating Action Pill | Top-left pill counter-scaled to 100% sharp view regardless of canvas zoom ratio | Hover or selection | Buttons: Grip, Move Up/Down, Copy, Paste, Cut, Dup, Hide, Del | Clamped within viewport | `sortable-block.tsx:303` |
| 23 | Center Canvas | Hero In-Block Alignment | Double-click or click "Căn chỉnh" to adjust hero carousel background zoom/offset | Click or double click | Dispatches custom alignment event, toggles handle | Escape key exits mode | `sortable-block.tsx:329` |
| 24 | Center Canvas | DragOverlay Follower | Rectangular white card with royal blue border following cursor during drag | Dnd active drag | Displays active block icon & title under cursor | Snaps top-left under pointer | `page-builder.tsx:929` |
| 25 | Right Inspector | Content Tab | Renders schema-driven form fields for block props | Block prop values | Updates block `props` in builder store | Type coercion & fallback | `property-inspector.tsx:124` |
| 26 | Right Inspector | Styles Tab | Padding, margin, background color, gradient, borders, and text colors | Style pickers & inputs | Updates block `styles` and root CSS properties | CSS unit validation | `property-inspector.tsx:230` |
| 27 | Right Inspector | JSON AST Tab | Formatted raw JSON editor with live syntax checking | JSON text edit | Updates block AST on click "Áp dụng JSON" | Surfaces syntax error text | `property-inspector.tsx:239` |
| 28 | Right Inspector | Unified Color Picker | Solid hex color picker + multi-stop CSS gradient picker | Color/gradient string | Injects `#hex` or `linear-gradient(...)` string | Fallback to transparent | `unified-color-picker.tsx` |
| 29 | Auxiliary View | Page Info View | Bilingual title, slug, parent combobox, and homepage role transfer CTA | Form inputs | Updates page metadata via API | Validates required bilingual title | `page-info-view.tsx` |
| 30 | Auxiliary View | Real-Time SEO Card | 0-100 score meter calculated from title len, desc len, custom image, meta overrides | Metadata lengths | Visual progress arc + tone badge + "Sửa ngay" CTA | Dynamic score updates | `seo-score.ts` |
| 31 | Auxiliary View | Social Share Preview | Realistic previews for Google, Facebook, Zalo, Twitter/X, and UTE OG Frame | OpenGraph metadata | Displays authentic social card previews | Truncates overlong text per spec | `share-preview.tsx` |
| 32 | Auxiliary View | History View | Snapshot timeline with diff comparisons and multi-device preview sandbox | History snapshot | Shows field differences, allows one-click restore | Optimistic version check | `page-history-view.tsx` |
| 33 | Page List View | Dual View (Tree/Table) | Seamless toggle between hierarchical tree and paginated data table | View toggle button | Preserves search query and selected filter across views | Empty state fallback | `page-list-view.tsx:814` |
| 34 | Page List View | Bulk Action Bar | Floating bottom bar for batch publish, unpublish, archive, and delete operations | Multi-checkbox select | Executes batch API calls; sorts delete by hierarchy depth | Prevents deleting parent before child | `page-list-view.tsx:317` |
| 35 | Templates | Website Templates | Shared layout templates table, template designer, and template pages editor | Template CRUD | Generates reusable page blueprints | Prevents deleting default template | `modules/website-builder/components/templates` |

---

## 3. Edge Cases & Observed Behaviors

| # | Feature | Input / Condition | Observed Behavior |
|---|---|---|---|
| 1 | Server Save Concurrency | Two users edit the same page simultaneously, causing version collision (`409 Conflict`) | Client detects conflict message (`/phiên bản\|version\|đồng thời/i`), automatically re-fetches latest page entity to synchronize version, and retries save without losing user's local edits (`page-editor.tsx:553`). |
| 2 | Content Length Limit | Page JSON AST exceeds 100,000 characters | Client pre-flight validator `isContentTooLong(content)` immediately rejects save and displays warning toast: "Nội dung trang vượt quá giới hạn 100.000 ký tự cho phép" (`page-editor.tsx:478`). |
| 3 | Unsaved Changes Warning | User attempts to navigate away or close browser tab with `hasUnsaved = true` | `beforeunload` event handler intercepts window navigation and shows browser native confirmation dialog (`website-page-builder.tsx:98`). |
| 4 | Homepage Lifecycle Guard | User attempts to unpublish or delete the active homepage | Client opens alert dialog: "Không thể hủy xuất bản trang chủ. Trang chủ luôn phải ở trạng thái xuất bản... hãy chuyển vai trò trang chủ sang một trang khác" (`page-editor.tsx:1280`). Backend also enforces HTTP 403 unless user holds LEADER/ADMIN role (`page-lifecycle-actions.tsx:76`). |
| 5 | Hierarchical Bulk Deletion | User selects both parent and child pages for bulk deletion | Client calculates node tree depths and sorts deletion requests in descending order (`depthB - depthA`) so children are always deleted before their parents (`page-list-view.tsx:422`), preventing database foreign key constraint violations. |
| 6 | Keyboard Shortcuts in Text Inputs | User presses `Ctrl+C`, `Ctrl+V`, or `Backspace` while typing inside a text input or Tiptap editor | Global keyboard listener checks `e.target` against `INPUT`, `TEXTAREA`, `isContentEditable`, `.ProseMirror` and immediately returns without triggering block manipulation (`page-builder.tsx:433`). |
| 7 | Canvas Zoom Counter-Scaling | Artboard zoom is set to 50% or auto-fitted | Floating action pill and drop indicator badges apply CSS `scale(100 / effectiveZoom)` so buttons, icons, and text maintain 100% physical size and crisp readability without shrinking (`sortable-block.tsx:178`). |
| 8 | Empty Canvas State | Canvas has 0 blocks | Renders clean illustration with quick-add buttons ("Thêm Khối Tin tức theo nhóm", "Thêm Khối Hero đầu trang") and conditional "Dán khối từ clipboard (Ctrl+V)" if clipboard contains a block (`builder-canvas.tsx:212`). |
| 9 | Post Detail Template Virtual Seed | `system-post-detail` or `[slug]` page has completely empty content | Automatically injects `postDetailSeed` AST so the editor never opens to a blank canvas (`page-editor.tsx:324`). |
| 10 | Cross-Tab / Cross-Page Clipboard | User copies a block on Page A, opens Page B, and pastes | `clipboardBlock` is mirrored to `localStorage.getItem("hcmute_cms_clipboard_block")`; newly pasted block is deep-cloned with newly generated unique IDs (`builder-store.ts:83`). |

---

## 4. Complete Button Layout & UI Hierarchy

### 4.1. Page List View (`/admin/pages`)
```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [FolderTree Cây] [Table2 Bảng]   [Search Tìm trang... (X)]   [ChevronsDownUp Thu gọn]  │
│                                      [LayoutTemplate Cấu hình template]                │
│                                      [Copy Nhân bản trang mẫu]                         │
│                                      [Plus Tạo trang ▼]                                │
│                                        ├── Trang trống                                 │
│                                        └── Từ mẫu website                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ [Filter] Bộ lọc đang áp dụng (1): [Tìm kiếm: "..." (X)]   [RotateCcw Xóa tất cả]       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ TABLE / TREE ROWS:                                                                     │
│ [x] [Icon] Tiêu đề trang [Badge: Trang chủ]   /slug [Link2]   [StatusBadge]   [Date]   │
│     ACTIONS:                                                                           │
│     [PanelsTopLeft Thiết kế] [Link2 Chép link] [Plus Trang con] [Pencil Sửa] [••• ▼]  │
│                                                                  ├── Xuất bản [Send]   │
│                                                                  ├── Hủy [Archive]     │
│                                                                  ├── Trang chủ [Home]  │
│                                                                  ├── Nhân bản [Copy]   │
│                                                                  └── Xóa [Trash2]      │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ (When multiple rows selected)                                                          │
│ FLOATING BOTTOM BAR: Đã chọn 3 trang | [Send Xuất bản] [Ban Hủy] [Archive Lưu trữ] [Trash2 Xóa] │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Page Editor Studio Header (`/admin/pages/[id]`)
```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ArrowLeft] │ [Flag VN] [Tiêu đề trang Pencil] │ [Nội dung trang] [Thông tin] [Lịch sử]                 │
│                                                │ [StatusBadge] [Archive Hủy] [Languages Đồng bộ & Dịch AI]│
│                                                │ [Save Lưu trang] [Home Đặt làm trang chủ]               │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ (If editing dynamic post detail template)                                                                │
│ [FileText Nguồn dữ liệu xem trước:] [Select Bài viết ▼]  [Pencil Chỉnh sửa nội dung] [Plus Tạo mới]     │
├──────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ STUDIO SUB-TOOLBAR:                                                                                      │
│ [Monitor Máy tính] [Tablet Máy tính bảng] [Smartphone Điện thoại]                                       │
│ Thu phóng: [Tự động] [Nhỏ 50%] [Vừa 75%] [Lớn 100%] │ [ZoomOut -5%] [ZoomIn +5%]                        │
│ [Undo2] [Redo2] │ [ClipboardPaste Dán khối] │ [Eye Xem ▼]                                                │
│                                               ├── Xem trước tương tác                                    │
│                                               ├── Mở xem trước toàn trang [Monitor]                      │
│                                               ├── Mở trong thẻ mới [ExternalLink]                        │
│                                               └── Sao chép liên kết [Link2]                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.3. Main Studio 3-Column Grid
```
┌─────────────────────────┬─────────────────────────────────────────────────┬─────────────────────────┐
│ LEFT DRAWER (308px)     │ CENTER CANVAS (Fluid 1fr)                       │ RIGHT INSPECTOR (295px) │
├─────────────────────────┼─────────────────────────────────────────────────┼─────────────────────────┤
│ [LayoutGrid] [Layers] [Info] │ ARTBOARD (Desktop 1240px / Tab 768px / Mob 390px) │ [Content] [Styles] [JSON]│
│ ─────────────────────── │ ┌─────────────────────────────────────────────┐ │ ─────────────────────── │
│ [Search Tìm khối... (X)]│ │ [Grip Khối] [▲] [▼] │ [Copy] [Paste] [Cut]  │ │ Tiêu đề / Heading       │
│                         │ │ [Dup] │ [Eye Ẩn] [Trash2 Xóa]               │ │ [Text Input           ] │
│ CATEGORIES:             │ │ ─────────────────────────────────────────── │ │                         │
│ ▼ Trang chủ & Tổng quan │ │ RENDERED BLOCK CONTENT                      │ │ Mô tả phụ / Subtitle    │
│   [Card] Hero Carousel  │ │                                             │ │ [Textarea             ] │
│   [Card] Welcome Letter │ └─────────────────────────────────────────────┘ │                         │
│   [Card] About Host     │ ─────────────────────────────────────────────── │ Màu nền (Solid/Gradient)│
│ ▼ Hội nghị & Sự kiện    │ ─── [Plus Chèn sau: Welcome Letter] ─────────── │ [Unified Color Picker ] │
│   [Card] Call for Papers│ ┌─────────────────────────────────────────────┐ │                         │
│   [Card] Important Dates│ │ RENDERED NEXT BLOCK                         │ │ Khoảng cách đệm (Padding)│
│   [Card] Committees     │ └─────────────────────────────────────────────┘ │ Top [  ]   Bottom [  ]  │
│   [Card] Keynotes       │                                                 │                         │
│ ▼ Bố cục & Nội dung     │ [+ Thêm khối vào cuối trang]                    │ [Eye/EyeOff Tạm ẩn]     │
│   [Card] Container      │ [ClipboardPaste Dán khối vào cuối trang]        │ [Áp dụng JSON         ] │
│   [Card] ColumnsSlot    │                                                 │                         │
└─────────────────────────┴─────────────────────────────────────────────────┴─────────────────────────┘
```

### 4.4. Keyboard Shortcuts Reference Table

| Shortcut | Action | Scope | Description |
|---|---|---|---|
| `Ctrl+S` / `Cmd+S` | Save Page | Global Editor | Persists canvas AST to server with optimistic lock increment |
| `Ctrl+C` / `Cmd+C` | Copy Block | Canvas Block | Copies selected block AST to store and `localStorage` |
| `Ctrl+X` / `Cmd+X` | Cut Block | Canvas Block | Copies selected block to clipboard and removes from canvas |
| `Ctrl+V` / `Cmd+V` | Paste Block | Canvas / Toolbar | Clones block from clipboard with new IDs and inserts after active block |
| `Ctrl+D` / `Cmd+D` | Duplicate Block | Canvas Block | Clones block immediately below current position |
| `Delete` / `Backspace` | Delete Block | Canvas Block | Removes selected block from canvas |
| `Escape` | Deselect / Exit | Canvas Block | Clears active block selection or exits hero alignment mode |
| `Ctrl+Shift+H` / `Cmd+Shift+H` | Toggle Hide/Show | Canvas Block | Toggles `hidden` flag (dimmed in edit mode, invisible in public/preview) |
| `Ctrl+Z` / `Cmd+Z` | Undo | Studio Canvas | Reverts last canvas mutation (up to 40 history steps) |
| `Ctrl+Y` / `Cmd+Shift+Z` | Redo | Studio Canvas | Reapplies reverted canvas mutation |

---

## 5. Dependencies & Packages Comparison

| Package Name | Purpose | Reference Status | IEEE SMC 2027 Status | Action Required |
|---|---|---|---|---|
| `zustand` | Studio reactive store (AST, history, clipboard, viewport, zoom) | `^5.0.10` | **Missing** | Install `zustand@^5.0.10` |
| `@dnd-kit/core` | Drag-and-drop sensors & collision detection | `^6.3.1` | Present (`^6.3.1`) | Ready to use |
| `@dnd-kit/sortable` | Vertical list sorting strategy & item transform | `^10.0.0` | Present (`^10.0.0`) | Ready to use |
| `@dnd-kit/utilities` | CSS transform helpers (`CSS.Translate`, `CSS.Transform`) | `^3.2.2` | Present (`^3.2.2`) | Ready to use |
| `diff` & `@types/diff` | Side-by-side properties diffing in `PageHistoryView` | `^8.0.4` | **Missing** | Install `diff@^8.0.4`, `@types/diff@^8.0.0` |
| `lucide-react` | Studio UI icons (strictly avoiding sparkle icons) | `^0.563.0` | Present (`^1.41.0`) | Ready to use |
| `sonner` | Toast feedback notifications | `^2.0.7` | Present (`^2.0.8`) | Ready to use |
| `motion` / `framer-motion`| Smooth animations for overlays, dropzones, transitions | `^12.29.0` | Present (`motion: ^13.4.4`) | Ready to use |
| `@radix-ui/react-popover` | Color picker popover & filter menus | `^1.1.15` | **Missing** | Install or use Radix popover |
| `react-colorful` | Color & hex gradient picker primitives | `^5.8.0` | **Missing** | Install or vendor lightweight color picker |

---

## 6. Routing & Endpoints Specification

### 6.1. Route Mapping

| Reference Route (HCMUTE) | Target Route (IEEE SMC 2027) | Component | Purpose |
|---|---|---|---|
| `/manage/website-pages` | `/admin/pages` | `PageListView` | Main page manager (Tree & Table views, bulk operations) |
| `/manage/website-pages/[id]` | `/admin/pages/[id]` | `PageEditor` | Full-bleed studio page builder (`content`, `info`, `history`) |
| `/manage/website-templates` | `/admin/templates` | `TemplateListTable` | Shared layout templates list |
| `/manage/website-templates/[templateId]` | `/admin/templates/[templateId]` | `TemplateDetail` | Template overview & template pages tree |
| `/manage/website-templates/[templateId]/pages/[pageId]` | `/admin/templates/[templateId]/pages/[pageId]` | `TemplatePageEditor` | Template page visual editor |
| `/[lang]/[...slug]` | `/[...slug]` | Public Page Client | Public-facing dynamically rendered website page |

### 6.2. Backend API Contracts

In the reference project, backend calls are routed to an external Java service. In IEEE SMC 2027, all API endpoints are served directly by Next.js App Router API handlers connecting to PostgreSQL via Prisma:

```typescript
// 1. Pages Collection
GET    /api/admin/pages?page=0&size=20&sort=orderIndex,asc&title=...&status=...
POST   /api/admin/pages                    // Create new page { title, slug, parentId, content }

// 2. Single Page CRUD & Versioned Save
GET    /api/admin/pages/[id]               // Get bilingual detail with optimistic lock version
PUT    /api/admin/pages/[id]               // Update content { title, content, version }
DELETE /api/admin/pages/[id]               // Delete page (validates no active child pages)

// 3. Lifecycle Transitions
POST   /api/admin/pages/[id]/publish       // Transition status to PUBLISHED (1)
POST   /api/admin/pages/[id]/archive       // Transition status to DRAFT (0) or HIDDEN (3)
POST   /api/admin/pages/[id]/set-home      // Set as tenant root homepage
POST   /api/admin/pages/[id]/duplicate     // Deep copy page with all blocks

// 4. History & Version Snapshots
GET    /api/admin/pages/[id]/histories     // List all historical versions
GET    /api/admin/pages/[id]/histories/[v] // Fetch specific historical version AST
POST   /api/admin/pages/[id]/restore/[v]   // Restore page content to version [v]

// 5. Template Blueprints
GET    /api/admin/templates                // List website templates
POST   /api/admin/templates                // Create template
GET    /api/admin/templates/[id]           // Template detail
POST   /api/admin/templates/[id]/apply     // Apply template to live website pages
```

---

## 7. State Management & Data Persistence Contracts

### 7.1. Concurrency & Optimistic Locking Contract
- Every page record maintains an integer `version` (initialized at 0).
- When a save is triggered, the client transmits `{ content, version }`.
- The server checks if `existing.version === payload.version`. If equal, it updates content and increments `version = version + 1`. If mismatched, it returns HTTP 409 Conflict.
- On HTTP 409, the client auto-recovery mechanism queries the latest record, aligns `versionRef.current`, and re-attempts the save, ensuring zero lost updates.

### 7.2. Content JSON AST Schema
```typescript
interface PageBuilderData {
  root: {
    title?: string;
    description?: string;
    theme?: {
      backgroundColor?: string;
      backgroundGradient?: string;
      primaryColor?: string;
      textColor?: string;
    };
  };
  content: PageBlock[];
}

interface PageBlock {
  id: string;               // e.g. "herocarousel-m1ab2-3f8a"
  type: string;             // Block key registered in BUILDER_REGISTRY
  label?: string;           // Clean display label
  props?: Record<string, any>;
  styles?: {
    backgroundColor?: string;
    backgroundGradient?: string;
    textColor?: string;
    paddingTop?: number | string;
    paddingBottom?: number | string;
    marginTop?: number | string;
    marginBottom?: number | string;
    hideSideBorders?: boolean;
  };
  hidden?: boolean;         // When true, hidden on public view
  children?: PageBlock[];   // Nested slot blocks
}
```

### 7.3. Prisma Database Schema Upgrades
The existing `Page` model in IEEE SMC 2027 will be upgraded, and supporting models added:
```prisma
model Page {
  id              String        @id @default(uuid())
  slug            String        @unique
  title           String
  parentId        String?       @map("parent_id")
  parent          Page?         @relation("PageHierarchy", fields: [parentId], references: [id], onDelete: Restrict)
  children        Page[]        @relation("PageHierarchy")
  orderIndex      Int           @default(0) @map("order_index")
  version         Int           @default(0)
  status          Int           @default(0) // 0: DRAFT, 1: PUBLISHED, 2: SCHEDULED, 3: HIDDEN
  isHomePage      Boolean       @default(false) @map("is_home_page")
  content         Json          @default("{\"root\":{},\"content\":[]}")
  metaTitle       String?       @map("meta_title")
  metaDescription String?       @map("meta_description")
  metaKeywords    String?       @map("meta_keywords")
  ogImageUrl      String?       @map("og_image_url")
  canonicalUrl    String?       @map("canonical_url")
  createdById     String?       @map("created_by_id")
  modifiedById    String?       @map("modified_by_id")
  histories       PageHistory[]
  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  @@index([parentId])
  @@index([status])
  @@map("website_pages")
}

model PageHistory {
  id          String   @id @default(uuid())
  pageId      String   @map("page_id")
  page        Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  version     Int
  title       String
  slug        String
  content     Json
  status      Int      @default(0)
  createdById String?  @map("created_by_id")
  createdAt   DateTime @default(now()) @map("created_at")

  @@unique([pageId, version])
  @@map("website_page_histories")
}

model WebsiteTemplate {
  id          String                @id @default(uuid())
  name        String
  description String?
  thumbnail   String?
  headerData  Json?                 @map("header_data")
  footerData  Json?                 @map("footer_data")
  version     Int                   @default(0)
  pages       WebsiteTemplatePage[]
  createdAt   DateTime              @default(now()) @map("created_at")
  updatedAt   DateTime              @updatedAt @map("updated_at")

  @@map("website_templates")
}

model WebsiteTemplatePage {
  id         String          @id @default(uuid())
  templateId String          @map("template_id")
  template   WebsiteTemplate @relation(fields: [templateId], references: [id], onDelete: Cascade)
  parentId   String?         @map("parent_id")
  title      String
  slug       String
  content    Json            @default("{\"root\":{},\"content\":[]}")
  orderIndex Int             @default(0) @map("order_index")
  isHomePage Boolean         @default(false) @map("is_home_page")
  version    Int             @default(0)
  createdAt  DateTime        @default(now()) @map("created_at")
  updatedAt  DateTime        @updatedAt @map("updated_at")

  @@map("website_template_pages")
}
```

---

## 8. Sparkle Icon Compliance
Per project guidelines, sparkle icons are strictly prohibited:
- In the reference project, `Sparkles` icon was already avoided in favor of `Network` (in org chart dialog) and `Languages` (in AI translation modal).
- In IEEE SMC 2027:
  - AI Sync & Translate Modal uses `Languages` or `Cpu`.
  - Feature highlights use `Zap` or `Star`.
  - Overview cards use `LayoutGrid` or `Layers`.
  - Zero instances of `Sparkle` or `Sparkles` will be introduced.

---

## 9. Migration & Step-by-Step Integration Plan

### Phase 1: Core Foundation & Store Architecture
1. Install missing dependencies: `pnpm add zustand diff @types/diff @radix-ui/react-popover`.
2. Port `modules/cms/core/` into `src/modules/cms/core/`:
   - `types.ts`, `codecs.ts`, `spacing.ts`, `editor-bridge.ts`.
   - `registry.tsx`: Register all 21 IEEE SMC 2027 conference sections (`HeroCarousel`, `WelcomeLetter`, `NewsList`, `ConferenceVideo`, `PaperTemplates`, `ContactCards`, `CfpSubscribe`, `SubmissionCountdown`, `ConferenceHighlights`, `CallForPapers`, `TracksExplorer`, `ImportantDates`, `About`, `Committee`, `CommitteesSection`, `PaymentMethods`, `Venue`, `FAQ`, `Sponsors`, `Keynotes`).
3. Port Zustand store: `src/modules/cms/editor/builder-store.ts` with deep cloning, keyboard shortcuts, history, and cross-tab clipboard.

### Phase 2: Visual Studio Canvas & Tri-Panel Studio
1. Port Canvas components into `src/modules/cms/editor/canvas/`:
   - `builder-canvas.tsx` (Figma auto-fit scaling, dot-matrix background).
   - `sortable-block.tsx` (Seam dropzones with terminal beads, counter-scaled floating action pill).
2. Port Left Drawer into `src/modules/cms/editor/sidebar/`:
   - `palette-panel.tsx` (Search, category accordion, wireframe cards).
   - `layers-panel.tsx` (Hierarchy tree, block controls).
   - `settings-panel.tsx` (Page title, SEO description, color pickers).
3. Port Right Inspector into `src/modules/cms/editor/inspector/`:
   - `property-inspector.tsx` (Content, Styles, JSON AST tabs).
   - `fields/` (Unified color picker, pixel unit input, gradient picker).
4. Port `page-builder.tsx` integrating all studio components.

### Phase 3: Page Editor Header, Sub-Toolbar, & Auxiliary Views
1. Port `src/modules/website-builder/components/editor/website-page-canvas.tsx`.
2. Port `src/modules/website-builder/components/pages/page-editor.tsx`:
   - Studio header with title button, segmented switcher (`content`, `info`, `history`), publish/archive actions, save with `Ctrl+S`.
   - Post detail preview data source bar.
3. Port auxiliary views:
   - `page-info-view.tsx` with `SeoScoreCard` and `SharePreviewModal`.
   - `page-history-view.tsx` with diff comparison and live build sandbox.
   - `sync-translate-modal.tsx` with structural diff and bilingual merge.

### Phase 4: Page List View & Management Table
1. Port `src/modules/website-builder/components/pages/page-list-view.tsx`:
   - Dual view (Tree / Table).
   - Shared toolbar: view toggle, search input, collapse/expand all, template buttons, create page dropdown.
   - Bulk action bar (publish, unpublish, archive, delete).
   - Lifecycle actions dropdown.
2. Port dialogs: `page-form-dialog.tsx`, `page-parent-combobox.tsx`, `apply-template-dialog.tsx`, `clone-template-page-dialog.tsx`.

### Phase 5: Database Schema & API Route Handlers
1. Update `prisma/schema.prisma` with `PageHierarchy`, `PageHistory`, `WebsiteTemplate`, `WebsiteTemplatePage`.
2. Run `pnpm prisma db push` to synchronize PostgreSQL.
3. Update `src/services/cms.service.ts` to implement full CRUD, versioning, histories, and template operations.
4. Implement App Router API routes:
   - `src/app/api/admin/pages/route.ts` & `[id]/route.ts`.
   - `src/app/api/admin/pages/[id]/publish/route.ts`, `/archive/route.ts`, `/set-home/route.ts`, `/duplicate/route.ts`.
   - `src/app/api/admin/pages/[id]/histories/route.ts` & `/restore/[version]/route.ts`.
   - `src/app/api/admin/templates/route.ts` & `[templateId]/pages/route.ts`.

### Phase 6: Route Wiring & End-to-End Verification
1. Wire `/admin/pages` to `PageListView`.
2. Wire `/admin/pages/[id]` to `PageEditor`.
3. Add `/admin/templates` to `sidebar-config.ts`.
4. Verify TypeScript compilation (`pnpm run build`), ensuring zero lints or build errors.
5. Verify block manipulation, responsive scaling, drag-and-drop, save, history restore, and public rendering.
