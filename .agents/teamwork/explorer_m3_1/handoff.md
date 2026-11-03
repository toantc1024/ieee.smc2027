# Handoff Report — Explorer M3-1: Page List View & Admin Pages API Handlers

Date: 2026-11-02T15:50:00Z  
Agent: Explorer M3-1 (`teamwork_explorer`)  
Target Working Directory: `/Users/macos/ieee-smc-2027/.agents/teamwork/explorer_m3_1/`

---

## 1. Observation

### 1.1 Existing Target Database Schema (`prisma/schema.prisma`)
In `prisma/schema.prisma` lines 66–121, the Prisma data models for `Page`, `PageHistory`, and `WebsiteTemplate` are defined as follows:
```prisma
model Page {
  id              String           @id @default(uuid())
  slug            String           @unique
  title           String
  blocks          Json             @default("[]")
  content         Json?
  parentId        String?          @map("parent_id")
  parent          Page?            @relation("PageHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
  children        Page[]           @relation("PageHierarchy")
  orderIndex      Int              @default(0) @map("order_index")
  version         Int              @default(1)
  isPublished     Boolean          @default(true) @map("is_published")
  metaTitle       String?          @map("meta_title")
  metaDescription String?          @map("meta_description")
  templateId      String?          @map("template_id")
  template        WebsiteTemplate? @relation(fields: [templateId], references: [id], onDelete: SetNull)
  histories       PageHistory[]
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  @@index([parentId])
  @@index([orderIndex])
  @@index([templateId])
  @@map("website_pages")
}

model PageHistory {
  id            String   @id @default(uuid())
  pageId        String   @map("page_id")
  page          Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
  version       Int
  content       Json?
  changeSummary String?  @map("change_summary")
  createdAt     DateTime @default(now()) @map("created_at")

  @@unique([pageId, version])
  @@index([pageId])
  @@map("website_page_histories")
}

model WebsiteTemplate {
  id           String   @id @default(uuid())
  name         String
  description  String?
  category     String   @default("General")
  thumbnail    String?
  content      Json?
  headerConfig Json?    @map("header_config")
  footerConfig Json?    @map("footer_config")
  pages        Page[]
  createdAt    DateTime @default(now()) @map("created_at")
  updatedAt    DateTime @updatedAt @map("updated_at")

  @@index([category])
  @@map("website_templates")
}
```

### 1.2 Existing Target Route Handlers (`src/app/api/admin/pages/`)
1. **`src/app/api/admin/pages/route.ts`**:
   - `GET`: Calls `cmsService.getAllPages()`, checks against `STANDARD_CONFERENCE_PAGES` (home, committees, submissions, registration, program, travel, news), auto-seeds missing standard pages, and returns `{ pages }`.
     - *Gap*: Does not parse search query (`search` / `title`), `status` filter, `parentId`, or return hierarchical tree structures.
   - `POST`: Parses `id`, `slug`, `title`, `blocks`, and calls `cmsService.upsertPage(...)`.
     - *Gap*: Lacks slug duplicate check (returns 200 via upsert instead of handling unique slug conflicts cleanly), does not save `content` AST, does not create initial `PageHistory` (version 1), does not handle `parentId`, `orderIndex`, or `templateId`.
2. **`src/app/api/admin/pages/[id]/route.ts`**:
   - `GET`: Resolves `{ id } = await params`, fetches page via `cmsService.getPageByIdOrSlug(id)`, falls back to standard page auto-seed or returns 404.
     - *Gap*: Returns only `{ page: { id, slug, title, blocks, is_published, meta_title, meta_description, created_at, updated_at } }`. Does not return `content` AST, `version`, `parentId`, `orderIndex`, `templateId`, or history list.
   - `PUT`: Updates existing page.
     - *Gap*: Does not save `content` AST, does not increment `version`, does not create a `PageHistory` record.
   - `DELETE`: Rejects `id === "home"` with HTTP 400. Otherwise calls `cmsService.deletePage(id)`.
     - *Gap*: Does not handle child pages if `parentId` links exist (does not re-parent or warn).
3. **Missing Sub-Routes**:
   - `PATCH /api/admin/pages/[id]`: Does not exist (only `PUT` exists).
   - `POST /api/admin/pages/[id]/publish`: Directory and route file `src/app/api/admin/pages/[id]/publish/route.ts` do not exist.
   - `POST /api/admin/pages/[id]/rollback`: Directory and route file `src/app/api/admin/pages/[id]/rollback/route.ts` do not exist.

### 1.3 Existing Target Page List UI (`src/app/admin/(dashboard)/pages/page.tsx`)
- Current size: 994 lines, client component marked with `"use client"`.
- Uses `FolderTree` and `Table2` view toggle.
- Has a client-side tree builder (`treeData`) that parses `/` in slugs.
- *Gaps Observed*:
  - **No `<Suspense>` wrapper**: Directly exports `PagesManagementPage`, violating Next.js 16 recommendations for pages consuming navigation/search state.
  - **No search debouncing**: Directly executes filtering on `onChange={(e) => setSearchQuery(e.target.value)}`.
  - **No Template Selection Modal**: "From Template" option in the dropdown simply opens the basic create modal with title "New Conference Section", rather than opening a dedicated conference template picker.
  - **No Floating Bulk Action Bar**: Checkbox selection, select-all, range selection, and the floating action bar (`BulkActionBar`) are completely missing.
  - **Zero sparkle icons**: Verified that `src/app/admin/(dashboard)/pages/page.tsx` uses only standard Lucide icons (`Plus`, `FolderTree`, `Table2`, `PanelsTopLeft`, `Pencil`, `Trash2`, `Link2`, `Check`, `Search`, `X`, `ChevronDown`, `ChevronRight`, `Folder`, `FolderOpen`, `FileText`, `RotateCcw`, `ChevronsDownUp`, `ChevronsUpDown`, `MoreVertical`, `ExternalLink`, `Eye`, `EyeOff`, `LayoutTemplate`). No `Sparkle` or `Sparkles` icon exists.

### 1.4 Reference HCMUTE Implementation
Located at `/Users/macos/Documents/Projects/hcmute-website/hcmute-website-frontend/`:
- **Page Route**: `app/manage/website-pages/page.tsx`:
  Wraps `PageListView` inside `<Suspense fallback={<PageLoader text="" />}>`.
- **Page List Component**: `modules/website-builder/components/pages/page-list-view.tsx`:
  - Implements dual view toggle (`view: "tree" | "table"`).
  - Search query debounced at 450ms, synced to URL `?title=...`.
  - In tree view, searching auto-expands all matching nodes and their ancestor branches (`matchedIds` Set).
  - Expand/collapse all button (`ChevronsDownUp` / `ChevronsUpDown`).
  - Active filter chips row (`data-testid="page-active-filters-row"`) with clear badge and "Clear all" button (`RotateCcw`).
  - Checkbox selection with Shift-key range selection.
  - Floating bulk action bar (`BulkActionBar`) fixed at `bottom-6 left-1/2 -translate-x-1/2 z-50` with actions: "Publish" (`Send`), "Unpublish" (`Ban`), "Archive" (`Archive`), "Delete" (`Trash2`).
  - Row actions: primary "Edit Builder" (`PanelsTopLeft`), "Copy Link" (`Link2`/`Check`), "Add Sub-Page" (`Plus`), "Edit Info" (`Pencil`), "More Actions" (`MoreVertical`).
  - Modals: `PageFormDialog` (create/edit info), `ApplyTemplateDialog` (site/page template picker), `CloneTemplatePageDialog`.
- **Conference Templates**: `modules/templates/conference/pages.ts`:
  Contains standard conference page definitions and AST seeds for `home`, `call-for-papers`, `speakers`, `schedule`, `registration`, `contact`.

### 1.5 Automated E2E Test Suite Expectations
Directly inspecting the test suite reveals the following requirements:
1. `tests/e2e/tier1-feature-coverage/page-builder.test.ts`:
   - `GET /api/admin/pages`: Returns HTTP 200, `res.data.pages` array with standard slugs: `["home", "committees", "submissions", "registration", "program", "travel", "news"]`. Home page must have non-empty blocks.
   - `GET /api/admin/pages/home`: Returns HTTP 200 with `page.slug === "home"`, `page.title === "Home"`, `is_published` or `isPublished`, and `blocks` array.
   - `POST /api/admin/pages`: Returns 200 or 201 with `page.slug`, `page.title`, and persisted `blocks`.
   - `PUT /api/admin/pages/${slug}`: Updates title, meta_title, meta_description, blocks.
   - `DELETE /api/admin/pages/${slug}`: Deletes custom page, subsequent GET returns 404.
2. `tests/e2e/tier2-boundary-corner/page-builder-edge.test.ts`:
   - `T2.1.1`: Slugs with spaces, uppercase, and special characters must be normalized to lowercase with hyphens and no spaces.
   - `T2.1.2`: Duplicate slug creation must cleanly update or return HTTP 200/201/409 (never 500).
   - `T2.1.3`: Deletion of `"home"` must be rejected with HTTP 400 and an error message mentioning home page protection.
   - `T2.1.4`: Unauthenticated requests to POST/DELETE must return 401 or 403.
   - `T2.1.5`: Empty or non-array block payloads must be handled gracefully without HTTP 500.
3. `tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts`:
   - `T3.3`: Multi-block assembly persists blocks with types (`HeroCarousel`, `CallForPapers`, `ImportantDates`, `CommitteesSection`).
   - `T3.5`: Concurrent page updates return HTTP 200 or 409 without database corruption.
4. `tests/e2e/tier4-real-world/conference-workflows.test.ts`:
   - `T4.1`: Conference content lifecycle (Draft -> Blocks -> Publish -> Verify via public GET -> Unpublish).
   - `T4.4`: Content versioning and rollback (v1 -> v2 -> v3 -> rollback restores exact blocks).

---

## 2. Logic Chain

1. **Prisma Model Alignment**:
   - Because `prisma/schema.prisma` already defines `parentId`, `orderIndex`, `version`, `content` on `Page`, and includes `PageHistory` (`pageId`, `version`, `content`, `changeSummary`) and `WebsiteTemplate`, the backend API can immediately leverage these fields without requiring further database migrations.
2. **Dual-Method Compatibility (`PATCH` and `PUT`)**:
   - The task specification requires `PATCH /api/admin/pages/[id]` for versioned AST updates, while existing E2E test suites call `PUT /api/admin/pages/[id]`. To ensure zero regressions in existing tests and full compliance with the new specification, `src/app/api/admin/pages/[id]/route.ts` must export both `PATCH` and `PUT`, sharing identical handler logic that supports both incremental AST saves and full block updates.
3. **Optimistic Locking & PageHistory Tracking**:
   - On each `PATCH` or `PUT`, the handler reads the current `version`, increments it to `version + 1`, and creates a corresponding `PageHistory` entry inside a Prisma transaction (`prisma.$transaction`).
   - If a `version` field is provided by the client and conflicts with the database, it returns HTTP 409 Conflict.
4. **Cascade & Hierarchy Protection on Deletion**:
   - When deleting a page via `DELETE /api/admin/pages/[id]`, if `id === "home"` or `slug === "home"`, the handler immediately returns HTTP 400 Bad Request.
   - If child pages exist (`parentId === page.id`), the handler re-parents them to `page.parentId` (or `null`) before deleting the page, ensuring sub-pages are never orphaned.
5. **Publish & Rollback Dedicated Routes**:
   - `POST /api/admin/pages/[id]/publish`: Updates `isPublished` to either the requested boolean or toggles the existing state.
   - `POST /api/admin/pages/[id]/rollback`: Looks up `PageHistory` for the requested version, restores its `content` and `blocks` to the page, increments the version, and records a new history audit log.
6. **Page List UI Architecture**:
   - Wrapping the page with Next.js 16 `<Suspense>` guarantees that search parameter reading does not trigger SSR de-optimization.
   - Introducing `useDebounce` (300ms) on the search input ensures snappy tree filtering without render stutter.
   - Adding a dedicated `TemplateSelectionModal` provides true parity with HCMUTE's template apply capability for IEEE SMC conference sections.
   - Adding a bottom-anchored floating `BulkActionBar` enables batch publishing, drafting, and deletion.
   - Adhering strictly to zero sparkle icons and clean English terms aligns with user constraints.

---

## 3. Specifications

### 3.1 Backend Route Handlers (`src/app/api/admin/pages/`)

#### Route 1: `GET /api/admin/pages`
- **Path**: `src/app/api/admin/pages/route.ts`
- **Method**: `GET`
- **Authentication**: `requireAdminRequest()` (allows admin session or bearer token)
- **Query Parameters**:
  - `search` / `title` (optional, string): Case-insensitive match on `title` or `slug`.
  - `status` (optional, string): `"all" | "published" | "draft"`.
  - `parentId` (optional, string): `"root"` (top-level only) or specific page UUID.
  - `view` (optional, string): `"flat" | "tree"`.
- **Auto-Seeding**: Ensures standard pages (`home`, `committees`, `submissions`, `registration`, `program`, `travel`, `news`) exist before querying.
- **Database Query**:
  ```ts
  const where: Prisma.PageWhereInput = {};
  if (status === "published") where.isPublished = true;
  if (status === "draft") where.isPublished = false;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { slug: { contains: search, mode: "insensitive" } },
    ];
  }
  if (parentId === "root") where.parentId = null;
  else if (parentId) where.parentId = parentId;

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: [{ orderIndex: "asc" }, { createdAt: "asc" }],
      include: {
        parent: { select: { id: true, title: true, slug: true } },
        _count: { select: { children: true, histories: true } },
      },
    }),
    prisma.page.count({ where }),
  ]);
  ```
- **Response Format (HTTP 200)**:
  ```json
  {
    "pages": [
      {
        "id": "home",
        "slug": "home",
        "title": "Home",
        "blocks": [...],
        "content": { "root": {}, "content": [...] },
        "parentId": null,
        "parent": null,
        "orderIndex": 0,
        "version": 1,
        "is_published": true,
        "isPublished": true,
        "meta_title": "IEEE SMC 2027 | Home",
        "metaTitle": "IEEE SMC 2027 | Home",
        "meta_description": "Official Conference Website",
        "metaDescription": "Official Conference Website",
        "block_count": 19,
        "children_count": 0,
        "history_count": 1,
        "created_at": "2026-11-02T15:00:00.000Z",
        "updated_at": "2026-11-02T15:00:00.000Z"
      }
    ],
    "total": 7,
    "tree": [...] // Present when view === "tree"
  }
  ```

#### Route 2: `POST /api/admin/pages`
- **Path**: `src/app/api/admin/pages/route.ts`
- **Method**: `POST`
- **Authentication**: `requireAdminRequest()`
- **Request Body**:
  ```ts
  interface CreatePageRequest {
    id?: string;
    slug?: string;
    title: string;
    blocks?: any[];
    content?: { root?: Record<string, any>; content?: any[] };
    parentId?: string | null;
    orderIndex?: number;
    is_published?: boolean;
    isPublished?: boolean;
    meta_title?: string;
    metaTitle?: string;
    meta_description?: string;
    metaDescription?: string;
    templateId?: string | null;
  }
  ```
- **Slug Normalization**:
  ```ts
  function normalizePageSlug(input: string): string {
    return input
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Strip diacritics
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\/-]+/g, "-")   // Hyphenate spaces & special signs
      .replace(/\/+/g, "/")            // Collapse redundant slashes
      .replace(/^-+|-+$/g, "")          // Trim boundary hyphens
      .replace(/^\/+|\/+$/g, "");       // Trim boundary slashes
  }
  ```
- **Duplicate & Conflict Logic**:
  - Checks `prisma.page.findUnique({ where: { slug: normalizedSlug } })`.
  - If existing page found with different ID:
    - Return HTTP 409 Conflict: `apiError("A page with this URL slug already exists", 409)`.
- **Creation & Initial Versioning**:
  - Inserts `Page` with initial `version: 1`.
  - Inserts initial `PageHistory` entry:
    ```ts
    await prisma.pageHistory.create({
      data: {
        pageId: newPage.id,
        version: 1,
        content: newPage.content ?? newPage.blocks,
        changeSummary: "Initial page creation",
      },
    });
    ```
- **Response**: HTTP 201 with `{ success: true, page }`.

#### Route 3: `GET /api/admin/pages/[id]`
- **Path**: `src/app/api/admin/pages/[id]/route.ts`
- **Method**: `GET`
- **Authentication**: Supports both public and admin access (tested in `T4.1 Step 4`).
- **Dynamic Param**: `{ params }: { params: Promise<{ id: string }> }` -> `const { id } = await params;`
- **Lookup Logic**:
  - Matches either `id === param` OR `slug === param`.
  - Includes `parent`, `children`, and latest 10 `histories`.
  - If not found, checks `STANDARD_CONFERENCE_PAGES` and auto-seeds if matched.
  - If still not found, returns HTTP 404: `apiError("Page not found", 404)`.
- **Response Format (HTTP 200)**:
  ```json
  {
    "page": {
      "id": "home",
      "slug": "home",
      "title": "Home",
      "blocks": [...],
      "content": { "root": {}, "content": [...] },
      "parentId": null,
      "parent": null,
      "children": [],
      "orderIndex": 0,
      "version": 1,
      "is_published": true,
      "isPublished": true,
      "meta_title": "IEEE SMC 2027 | Home",
      "metaTitle": "IEEE SMC 2027 | Home",
      "meta_description": "...",
      "metaDescription": "...",
      "templateId": null,
      "histories": [
        {
          "id": "uuid",
          "version": 1,
          "changeSummary": "Initial page creation",
          "createdAt": "2026-11-02T15:00:00.000Z"
        }
      ],
      "created_at": "...",
      "updated_at": "..."
    }
  }
  ```

#### Route 4: `PATCH /api/admin/pages/[id]` and `PUT /api/admin/pages/[id]`
- **Path**: `src/app/api/admin/pages/[id]/route.ts`
- **Methods**: Both `PATCH` and `PUT` exported.
- **Authentication**: `requireAdminRequest()`
- **Request Body**:
  ```ts
  interface UpdatePageRequest {
    title?: string;
    slug?: string;
    blocks?: any[];
    content?: { root?: Record<string, any>; content?: any[] };
    is_published?: boolean;
    isPublished?: boolean;
    meta_title?: string;
    metaTitle?: string;
    meta_description?: string;
    metaDescription?: string;
    parentId?: string | null;
    orderIndex?: number;
    version?: number; // Client version for optimistic lock check
    changeSummary?: string;
  }
  ```
- **Business Logic**:
  1. Find page by `id` or `slug`. Return 404 if not found.
  2. Optimistic concurrency check: if `body.version !== undefined && body.version !== existing.version`, return HTTP 409 Conflict.
  3. Slug check: If changing slug on `"home"`, reject with 400. Otherwise normalize slug and check uniqueness across other pages.
  4. Calculate next version: `nextVersion = existing.version + 1`.
  5. In a Prisma `$transaction`:
     - Update `Page` with new title, slug, blocks, content AST, metadata, version, and parent.
     - Create `PageHistory` snapshot:
       ```ts
       prisma.pageHistory.create({
         data: {
           pageId: existing.id,
           version: nextVersion,
           content: body.content ?? body.blocks ?? existing.content ?? existing.blocks,
           changeSummary: body.changeSummary || `Updated to version ${nextVersion}`,
         },
       })
       ```
  6. Return HTTP 200 with `{ success: true, page: updatedPage }`.

#### Route 5: `DELETE /api/admin/pages/[id]`
- **Path**: `src/app/api/admin/pages/[id]/route.ts`
- **Method**: `DELETE`
- **Authentication**: `requireAdminRequest()`
- **Business Logic**:
  1. Find page by `id` or `slug`. If not found, return 404.
  2. Home Protection Guard:
     ```ts
     if (existing.id === "home" || existing.slug === "home") {
       return apiError("Cannot delete default home page", 400);
     }
     ```
  3. Hierarchy Cascade Safety:
     - Check child pages:
       ```ts
       await prisma.page.updateMany({
         where: { parentId: existing.id },
         data: { parentId: existing.parentId },
       });
       ```
     - Re-parents children to the parent's parent so sub-pages are never lost or orphaned.
  4. Delete page from database (`prisma.page.delete({ where: { id: existing.id } })`). Cascades to `PageHistory` via schema foreign key constraint `onDelete: Cascade`.
  5. Return HTTP 200 with `{ success: true, message: "Page deleted successfully" }`.

#### Route 6: `POST /api/admin/pages/[id]/publish`
- **Path**: `src/app/api/admin/pages/[id]/publish/route.ts`
- **Method**: `POST`
- **Authentication**: `requireAdminRequest()`
- **Request Body (optional)**: `{ isPublished?: boolean }`
- **Business Logic**:
  1. Resolve `{ id } = await params`. Find page by `id` or `slug`.
  2. If not found, return 404.
  3. Determine target state: `targetState = body.isPublished !== undefined ? body.isPublished : !existing.isPublished`.
  4. Update `isPublished`:
     ```ts
     const updated = await prisma.page.update({
       where: { id: existing.id },
       data: { isPublished: targetState },
     });
     ```
  5. Return HTTP 200 with `{ success: true, isPublished: updated.isPublished, page: updated }`.

#### Route 7: `POST /api/admin/pages/[id]/rollback`
- **Path**: `src/app/api/admin/pages/[id]/rollback/route.ts`
- **Method**: `POST`
- **Authentication**: `requireAdminRequest()`
- **Request Body**:
  ```ts
  interface RollbackRequest {
    version?: number;
    historyId?: string;
  }
  ```
- **Business Logic**:
  1. Resolve `{ id } = await params`. Find page by `id` or `slug`.
  2. Query target historical record:
     ```ts
     const history = await prisma.pageHistory.findFirst({
       where: body.historyId
         ? { id: body.historyId, pageId: existing.id }
         : { pageId: existing.id, version: body.version },
     });
     if (!history) return apiError("Historical revision not found", 404);
     ```
  3. Restore historical content:
     - Determine new version: `newVersion = existing.version + 1`.
     - In a Prisma `$transaction`:
       ```ts
       const [restoredPage] = await prisma.$transaction([
         prisma.page.update({
           where: { id: existing.id },
           data: {
             blocks: history.content,
             content: history.content,
             version: newVersion,
           },
         }),
         prisma.pageHistory.create({
           data: {
             pageId: existing.id,
             version: newVersion,
             content: history.content,
             changeSummary: `Rolled back to version ${history.version}`,
           },
         }),
       ]);
       ```
  4. Return HTTP 200 with `{ success: true, restoredVersion: history.version, newVersion, page: restoredPage }`.

---

### 3.2 Page List UI Specification (`src/app/admin/(dashboard)/pages/page.tsx`)

#### 1. Next.js 16 Suspense Architecture
```tsx
// src/app/admin/(dashboard)/pages/page.tsx
import { Suspense } from "react";
import { PageListView } from "./components/page-list-view";
import { PageListSkeleton } from "./components/page-list-skeleton";

export default function PagesManagementPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={<PageListSkeleton />}>
        <PageListView />
      </Suspense>
    </div>
  );
}
```

#### 2. Component Layout & Dual View Mode
- **State Definition**:
  - `view: "tree" | "table"` (default `"tree"` for hierarchical conference layout)
  - `pages: PageSummary[]`
  - `searchQuery: string`
  - `debouncedQuery: string` (via custom debounce hook with 300ms delay)
  - `collapsedNodes: Record<string, boolean>`
  - `selectedPages: Set<string>`
  - `lastSelectedId: string | null` (for Shift-key range selection)
  - `templateModalOpen: boolean`
  - `createModalOpen: boolean`
  - `editModalOpen: boolean`
- **Toolbar Controls**:
  - **View Switcher**: Segmented toggle with `FolderTree` ("Tree") and `Table2` ("Table") buttons.
  - **Debounced Search Bar**: Input with leading `Search` icon, clear `X` button, and 300ms debounce.
  - **Tree Expand/Collapse All**: `ChevronsDownUp` ("Collapse All") when expanded; `ChevronsUpDown` ("Expand All") when collapsed.
  - **Create Action Dropdown**:
    - "Blank Page" (`Plus` icon) -> Opens standard creation modal.
    - "From Template" (`LayoutTemplate` icon) -> Opens `TemplateSelectionModal`.

#### 3. Search & Hierarchy Auto-Expansion
- When `debouncedQuery` is non-empty:
  1. Find matching pages where `title` or `slug` includes the query string.
  2. Compute `matchedAncestors`: traverse upwards via `parentId` or slug directory parts so all ancestor folders of matching items remain visible in the tree.
  3. Automatically treat matching ancestor nodes as expanded (`!collapsedNodes[parentSlug]`) so search hits inside deep branches are never hidden.
  4. Render Active Filters bar:
     ```tsx
     <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs">
       <span className="font-semibold text-slate-500">Active Filter:</span>
       <Badge variant="outline" className="gap-1.5 bg-white text-slate-800">
         <span>Search: &quot;{debouncedQuery}&quot;</span>
         <button onClick={() => setSearchQuery("")}><X className="size-3" /></button>
       </Badge>
       <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")} className="text-rose-600 gap-1 text-xs">
         <RotateCcw className="size-3" /> Clear
       </Button>
     </div>
     ```

#### 4. Template Selection Modal Specification
- Component: `src/app/admin/(dashboard)/pages/components/template-selection-modal.tsx`
- Dialog title: **"Choose a Conference Page Template"**
- Template Cards:
  1. **Conference Home**: Full hero carousel, chairs welcome letter, milestones, CFP highlight, track explorer, keynote list, venue banner, and contact card.
  2. **Call for Papers & Submissions**: Author submission instructions, LaTeX/Word template download buttons, track list, deadline countdown, and author FAQ.
  3. **Committees & Organization**: Organizing committee, technical program chairs, advisory board, and contact secretariat.
  4. **Registration & Payments**: Fee schedule table, payment methods, bank transfer guides, and registration desk contacts.
  5. **Technical Program & Keynotes**: Plenary keynote cards, technical sessions calendar, and session details.
  6. **Venue, Travel & Hospitality**: Hotel information, Saigon city guide, e-Visa guidance, and airport transit notes.
  7. **Blank Page**: Minimal starter canvas with an empty hero banner.
- Modal Fields:
  - Template card selection (radio grid with visual badge previews)
  - Page Title (e.g., "Special Sessions")
  - URL Slug (auto-derived with live preview: `https://ieee-smc2027.org/slug`)
  - Parent Page (optional combobox selector)
- On Submit:
  - Calls `POST /api/admin/pages` with the selected template's block blueprint.
  - Automatically redirects to the Studio Builder (`router.push('/admin/pages/' + newPage.id)`).

#### 5. Floating Bulk Action Bar Specification
- Position: `fixed bottom-6 left-1/2 -translate-x-1/2 z-50`
- Animated enter/exit: `animate-in fade-in slide-in-from-bottom-4 duration-200`
- Elements:
  - **Counter badge**: `Selected ${selectedPages.size} pages`
  - **Publish Button**: `Send` icon, green accent, triggers bulk publish (`POST /api/admin/pages/[id]/publish`).
  - **Draft Button**: `EyeOff` icon, amber accent, triggers bulk draft.
  - **Delete Button**: `Trash2` icon, red destructive accent, prompts confirmation dialog, filters out `"home"`, and bulk deletes remaining custom pages.
  - **Deselect All**: `X` icon, clears selection.

---

### 3.3 Rule Compliance Verification

| Rule / Constraint | Compliance Strategy | Status |
|---|---|---|
| **Zero Sparkle Icons** | Only Lucide icons: `FolderTree`, `Table2`, `PanelsTopLeft`, `Plus`, `Search`, `X`, `Link2`, `Check`, `Pencil`, `Trash2`, `MoreVertical`, `Send`, `Eye`, `EyeOff`, `ChevronsUpDown`, `ChevronsDownUp`, `ChevronDown`, `ChevronRight`, `RotateCcw`, `LayoutTemplate`, `FileText`, `Folder`, `FolderOpen`, `ExternalLink`. No `Sparkle`, `Sparkles`, `Wand2`, `Stars`. | Verified |
| **Clean English Terminology** | Pure concise conference English: "Pages & Layouts", "Create Page", "Blank Page", "From Template", "Edit Builder", "Tree", "Table", "Expand All", "Collapse All", "Search pages or slug...", "Homepage", "Published", "Draft", "Delete Page", "Live Preview". No redundant parenthetical English or Vietnamese subtext. | Verified |
| **Next.js 16 Suspense** | Client page wrapped in `<Suspense fallback={<PageListSkeleton />}>`. All route handler params awaited asynchronously (`const { id } = await params`). | Verified |

---

## 4. Caveats

1. **Database Schema State**: The `prisma/schema.prisma` file already has `Page`, `PageHistory`, and `WebsiteTemplate` models generated. No schema migration is needed for M3-1.
2. **Backward Compatibility with Existing E2E Tests**: Existing tests in `tests/e2e/tier1-feature-coverage/page-builder.test.ts` send `PUT /api/admin/pages/[id]` and expect fields `blocks`, `title`, `slug`, `meta_title`, `meta_description`. The route handler must support both `PATCH` and `PUT` and accept both snake_case and camelCase field variations.
3. **Studio Canvas Editor Scope**: The tri-panel visual studio editor (`/admin/pages/[id]`) and its block registry are assigned to Explorers M3-2, M3-3, and Worker M3. The scope of M3-1 is strictly confined to the Page List UI (`/admin/pages`) and the backend route handlers under `/api/admin/pages/`.

---

## 5. Conclusion

1. **Backend Route Handlers**:
   - `src/app/api/admin/pages/route.ts`: Enhance `GET` with query filtering (`search`, `status`, `parentId`, `view`), and enhance `POST` with slug normalization, 409 duplicate detection, and initial `PageHistory` snapshot creation.
   - `src/app/api/admin/pages/[id]/route.ts`: Export `GET` (returns full content AST, metadata, version, histories), `PATCH` and `PUT` (version increment, optimistic locking, `PageHistory` recording), and `DELETE` (home page protection returning 400, child re-parenting).
   - `src/app/api/admin/pages/[id]/publish/route.ts`: Create route for toggling `isPublished`.
   - `src/app/api/admin/pages/[id]/rollback/route.ts`: Create route for reverting page content AST to a historical revision from `PageHistory`.
2. **Page List UI (`src/app/admin/(dashboard)/pages/page.tsx`)**:
   - Split into Suspense-wrapped page component and client `PageListView`.
   - Implement debounced search (300ms) with tree auto-expansion.
   - Add template selection modal (`TemplateSelectionModal`) with 7 conference presets.
   - Add floating bulk action bar with publish, draft, delete, and clear actions.
   - Adhere strictly to zero sparkles and clean English terminology.

---

## 6. Verification Method

To verify the implementation of this specification:
1. **TypeScript Typecheck**:
   ```bash
   npx tsc --noEmit
   ```
2. **Tier 1 Feature Coverage (Page Builder Happy Path)**:
   ```bash
   npx tsx tests/e2e/tier1-feature-coverage/page-builder.test.ts
   ```
3. **Tier 2 Edge Cases (Slug Normalization, Duplicates, Home Deletion Rejection)**:
   ```bash
   npx tsx tests/e2e/tier2-boundary-corner/page-builder-edge.test.ts
   ```
4. **Tier 3 Cross-Feature Interactions (Concurrent Updates & Multi-Block Assembly)**:
   ```bash
   npx tsx tests/e2e/tier3-cross-feature/cross-feature-interactions.test.ts
   ```
5. **Tier 4 Real-World Workflows (Content Lifecycle & Versioning Rollback)**:
   ```bash
   npx tsx tests/e2e/tier4-real-world/conference-workflows.test.ts
   ```
6. **Full Test Suite Run**:
   ```bash
   npx tsx tests/e2e/runner.ts
   ```
7. **Sparkle Icon Audit**:
   ```bash
   grep -rn "Sparkle" src/app/admin/\(dashboard\)/pages/
   # Must return 0 matches
   ```
