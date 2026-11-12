import { create } from "zustand";
import type {
  PageBlock,
  PageRootData,
  PageBuilderData,
  ViewportMode,
  SidebarTab,
  InspectorTab,
  StudioActiveView,
} from "../types";
import { getBlockDefinition } from "../registry";
import { COLUMN_SLOT_KEYS, cloneBlockWithNewIds, findBlock, getColumnBlocks, getColumnSlotKey, insertAfterBlock, mapBlocks, moveBlockWithinTree, newBlockId, removeBlockFromTree, type ColumnSlotKey } from "../utils/block-tree";

const MAX_HISTORY_DEPTH = 40;
const CLIPBOARD_STORAGE_KEY = "ieee_smc_builder_clipboard";

interface BuilderState {
  pageId: string | null;
  pageTitle: string;
  pageSlug: string;
  pageVersion: number;
  isPublished: boolean;
  data: PageBuilderData;
  selectedBlockId: string | null;
  hoveredBlockId: string | null;
  viewport: ViewportMode;
  zoom: number;
  isAutoFit: boolean;
  isDirty: boolean;
  viewMode: "edit" | "preview";
  sidebarTab: SidebarTab;
  inspectorTab: InspectorTab;
  studioTab: StudioActiveView;
  undoStack: PageBuilderData[];
  redoStack: PageBuilderData[];
  clipboardBlock: PageBlock | null;

  // Actions
  initPage: (payload: {
    id: string;
    title: string;
    slug: string;
    version?: number;
    isPublished?: boolean;
    parentId?: string | null;
    content?: any;
    blocks?: any[];
  }) => void;
  selectBlock: (id: string | null) => void;
  hoverBlock: (id: string | null) => void;
  setViewport: (viewport: ViewportMode) => void;
  setZoom: (zoom: number) => void;
  setAutoFit: (isAutoFit: boolean) => void;
  toggleAutoFit: () => void;
  setPublished: (isPublished: boolean, version?: number) => void;
  setViewMode: (mode: "edit" | "preview") => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  setStudioTab: (tab: StudioActiveView) => void;
  updatePageMeta: (meta: Partial<PageRootData>) => void;

  // Block Mutations
  addBlock: (type: string, props?: Record<string, any>) => void;
  insertBlockAt: (index: number, type: string, props?: Record<string, any>) => void;
  insertBlockAfter: (id: string, type: string) => void;
  insertSavedBlock: (block: PageBlock) => void;
  applySavedLayout: (content: PageBlock[], zones?: PageBuilderData["zones"]) => void;
  insertIntoColumn: (parentId: string, slot: ColumnSlotKey, type: string) => void;
  insertIntoContainer: (parentId: string, type: string) => void;
  moveIntoContainer: (id: string, parentId: string) => void;
  moveIntoColumn: (id: string, parentId: string, slot: ColumnSlotKey) => void;
  moveToRoot: (id: string, index: number) => void;
  pasteAfterBlock: (id: string) => void;
  updateBlockProps: (id: string, props: Record<string, any>) => void;
  replaceBlock: (id: string, block: PageBlock) => void;
  updateBlockStyles: (id: string, styles: Record<string, any>) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  toggleBlockHidden: (id: string) => void;

  // Clipboard & History
  copyBlock: (id: string) => void;
  cutBlock: (id: string) => void;
  pasteBlock: (targetIndex?: number) => void;
  undo: () => void;
  redo: () => void;
  markClean: (savedVersion?: number, savedData?: PageBuilderData) => void;
}

function cloneData(data: PageBuilderData): PageBuilderData {
  return JSON.parse(JSON.stringify(data));
}

function normalizeBlocks(content?: any, blocks?: any[]): PageBlock[] {
  if (content && Array.isArray(content.content)) {
    return content.content.map((b: any, i: number) => ({
      ...b,
      id: b.id || `block-${Date.now()}-${i}`,
      type: b.type,
      props: b.props || {},
      hidden: typeof b.hidden === "boolean" ? b.hidden : Boolean(b.props?.hidden),
    }));
  }
  if (Array.isArray(blocks)) {
    return blocks.map((b: any, i: number) => ({
      ...b,
      id: b.id || `block-${Date.now()}-${i}`,
      type: b.type,
      props: b.props || {},
      hidden: typeof b.hidden === "boolean" ? b.hidden : Boolean(b.props?.hidden),
    }));
  }
  return [];
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  pageId: null,
  pageTitle: "Untitled Page",
  pageSlug: "page",
  pageVersion: 1,
  isPublished: true,
  data: {
    root: { title: "Untitled Page", slug: "page" },
    content: [],
  },
  selectedBlockId: null,
  hoveredBlockId: null,
  viewport: "desktop",
  zoom: 100,
  isAutoFit: true,
  isDirty: false,
  viewMode: "edit",
  sidebarTab: "library",
  inspectorTab: "content",
  studioTab: "content",
  undoStack: [],
  redoStack: [],
  clipboardBlock: null,

  initPage: ({ id, title, slug, version = 1, isPublished = true, parentId = null, content, blocks }) => {
    const normalizedBlocks = normalizeBlocks(content, blocks);
    const rootData: PageRootData = {
      ...(content?.root && typeof content.root === "object" ? content.root : {}),
      title,
      slug,
      parentId,
      metaTitle: content?.root?.metaTitle || `${title} | IEEE SMC 2027`,
      metaDescription: content?.root?.metaDescription || "",
    };

    let hydratedClipboard = get().clipboardBlock;
    if (!hydratedClipboard && typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(CLIPBOARD_STORAGE_KEY);
        if (stored) hydratedClipboard = JSON.parse(stored);
      } catch {
        // ignore
      }
    }

    set({
      pageId: id,
      pageTitle: title,
      pageSlug: slug,
      pageVersion: version,
      isPublished,
      data: {
        ...(content && typeof content === "object" && !Array.isArray(content) ? content : {}),
        root: rootData,
        content: normalizedBlocks,
      },
      selectedBlockId: null,
      hoveredBlockId: null,
      isDirty: false,
      undoStack: [],
      redoStack: [],
      clipboardBlock: hydratedClipboard,
    });
  },

  selectBlock: (id) => set({ selectedBlockId: id }),
  hoverBlock: (id) => set({ hoveredBlockId: id }),
  setViewport: (viewport) => set({ viewport, isAutoFit: true }),
  setZoom: (zoom) => set({ zoom, isAutoFit: false }),
  setAutoFit: (isAutoFit) => set({ isAutoFit }),
  toggleAutoFit: () => set((state) => ({ isAutoFit: !state.isAutoFit })),
  setPublished: (isPublished, version) =>
    set((state) => ({
      isPublished,
      pageVersion: version !== undefined ? version : state.pageVersion,
    })),
  setViewMode: (viewMode) => set({ viewMode }),
  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
  setInspectorTab: (inspectorTab) => set({ inspectorTab }),
  setStudioTab: (studioTab) => set({ studioTab }),

  updatePageMeta: (meta) => {
    const { data, undoStack } = get();
    const prev = cloneData(data);
    const updatedRoot = { ...data.root, ...meta };

    set({
      data: { ...data, root: updatedRoot },
      pageTitle: updatedRoot.title,
      pageSlug: updatedRoot.slug,
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  addBlock: (type, customProps) => {
    const { data, undoStack } = get();
    const prev = cloneData(data);
    const def = getBlockDefinition(type);
    const newBlock: PageBlock = {
      id: newBlockId(type),
      type,
      props: { ...(def?.defaultProps || {}), ...(customProps || {}) },
      hidden: false,
    };

    const newContent = [...data.content, newBlock];
    set({
      data: { ...data, content: newContent },
      selectedBlockId: newBlock.id,
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  insertBlockAt: (index, type, customProps) => {
    const { data, undoStack } = get();
    const prev = cloneData(data);
    const def = getBlockDefinition(type);
    const newBlock: PageBlock = {
      id: newBlockId(type),
      type,
      props: { ...(def?.defaultProps || {}), ...(customProps || {}) },
      hidden: false,
    };

    const newContent = [...data.content];
    const safeIndex = Math.max(0, Math.min(index, newContent.length));
    newContent.splice(safeIndex, 0, newBlock);

    set({
      data: { ...data, content: newContent },
      selectedBlockId: newBlock.id,
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  insertBlockAfter: (id, type) => {
    const { data, undoStack } = get();
    const def = getBlockDefinition(type);
    if (!def || !findBlock(data.content, id)) return;
    const block: PageBlock = { id: newBlockId(type), type, props: structuredClone(def.defaultProps || {}), hidden: false };
    set({ data: { ...data, content: insertAfterBlock(data.content, id, block) }, selectedBlockId: block.id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  insertSavedBlock: (block) => {
    const { data, selectedBlockId, undoStack } = get();
    const copy = structuredClone(block);
    const content = selectedBlockId && findBlock(data.content, selectedBlockId) ? insertAfterBlock(data.content, selectedBlockId, copy) : [...data.content, copy];
    set({ data: { ...data, content }, selectedBlockId: copy.id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  applySavedLayout: (content, zones) => {
    const { data, undoStack } = get();
    const { zones: _previousZones, ...rest } = data;
    void _previousZones;
    const next = { ...rest, content: structuredClone(content), ...(zones ? { zones: structuredClone(zones) } : {}) };
    set({ data: next, selectedBlockId: null, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  insertIntoColumn: (parentId, slot, type) => {
    const { data, undoStack } = get();
    const parent = findBlock(data.content, parentId);
    const def = getBlockDefinition(type);
    if (!parent || parent.type !== "ColumnsSlot" || !def || !COLUMN_SLOT_KEYS.includes(slot)) return;
    const block: PageBlock = { id: newBlockId(type), type, props: structuredClone(def.defaultProps || {}), hidden: false };
    const actual = getColumnSlotKey(parent, slot);
    const content = mapBlocks(data.content, parentId, (current) => ({ ...current, props: { ...current.props, [actual]: [...getColumnBlocks(current, slot), block] } }));
    set({ data: { ...data, content }, selectedBlockId: block.id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  insertIntoContainer: (parentId, type) => {
    const { data, undoStack } = get();
    const parent = findBlock(data.content, parentId);
    const def = getBlockDefinition(type);
    if (!parent || parent.type !== "Container" || !def) return;
    const block: PageBlock = { id: newBlockId(type), type, props: structuredClone(def.defaultProps || {}), hidden: false };
    const content = mapBlocks(data.content, parentId, (current) => ({ ...current, children: [...(current.children || []), block] }));
    set({ data: { ...data, content }, selectedBlockId: block.id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  moveIntoContainer: (id, parentId) => {
    const { data, undoStack } = get();
    const block = findBlock(data.content, id);
    const parent = findBlock(data.content, parentId);
    if (!block || !parent || parent.type !== "Container" || id === parentId || findBlock([block], parentId)) return;
    const without = removeBlockFromTree(data.content, id);
    if (!findBlock(without, parentId)) return;
    const content = mapBlocks(without, parentId, (current) => ({ ...current, children: [...(current.children || []), block] }));
    set({ data: { ...data, content }, selectedBlockId: id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  moveIntoColumn: (id, parentId, slot) => {
    const { data, undoStack } = get();
    const block = findBlock(data.content, id);
    const parent = findBlock(data.content, parentId);
    if (!block || !parent || parent.type !== "ColumnsSlot" || !COLUMN_SLOT_KEYS.includes(slot) || id === parentId || findBlock([block], parentId)) return;
    const withoutBlock = removeBlockFromTree(data.content, id);
    const target = findBlock(withoutBlock, parentId);
    if (!target) return;
    const actual = getColumnSlotKey(target, slot);
    const content = mapBlocks(withoutBlock, parentId, (current) => ({ ...current, props: { ...current.props, [actual]: [...getColumnBlocks(current, slot), block] } }));
    set({ data: { ...data, content }, selectedBlockId: id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  moveToRoot: (id, index) => {
    const { data, undoStack } = get();
    const block = findBlock(data.content, id);
    if (!block || data.content.some((item) => item.id === id)) return;
    const content = removeBlockFromTree(data.content, id);
    content.splice(Math.max(0, Math.min(index, content.length)), 0, block);
    set({ data: { ...data, content }, selectedBlockId: id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  updateBlockProps: (id, props) => {
    const { data, undoStack } = get();
    if (!findBlock(data.content, id)) return;
    const content = mapBlocks(data.content, id, (block) => ({ ...block, props: { ...block.props, ...props } }));
    set({ data: { ...data, content }, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  replaceBlock: (id, block) => {
    const { data, undoStack } = get();
    if (!findBlock(data.content, id)) return;
    const content = mapBlocks(data.content, id, () => ({ ...block, id }));
    set({ data: { ...data, content }, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  updateBlockStyles: (id, styles) => {
    const { data, undoStack } = get();
    if (!findBlock(data.content, id)) return;
    const content = mapBlocks(data.content, id, (block) => ({
      ...block,
      styles: { ...(block.styles || {}), ...styles },
      props: { ...block.props, _styles: { ...(block.props?._styles || {}), ...styles } },
    }));
    set({ data: { ...data, content }, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  removeBlock: (id) => {
    const { data, undoStack, selectedBlockId } = get();
    if (!findBlock(data.content, id)) return;
    const content = removeBlockFromTree(data.content, id);
    set({ data: { ...data, content }, selectedBlockId: findBlock(content, selectedBlockId) ? selectedBlockId : null, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  duplicateBlock: (id) => {
    const { data, undoStack } = get();
    const source = findBlock(data.content, id);
    if (!source) return;
    const block = cloneBlockWithNewIds(source);
    const content = insertAfterBlock(data.content, id, block);
    set({ data: { ...data, content }, selectedBlockId: block.id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  moveBlock: (fromIndex, toIndex) => {
    const { data, undoStack } = get();
    const prev = cloneData(data);
    const newContent = [...data.content];
    const [moved] = newContent.splice(fromIndex, 1);
    newContent.splice(toIndex, 0, moved);

    set({
      data: { ...data, content: newContent },
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  moveBlockUp: (id) => {
    const { data, undoStack } = get();
    const content = moveBlockWithinTree(data.content, id, -1);
    if (content !== data.content) set({ data: { ...data, content }, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  moveBlockDown: (id) => {
    const { data, undoStack } = get();
    const content = moveBlockWithinTree(data.content, id, 1);
    if (content !== data.content) set({ data: { ...data, content }, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  toggleBlockHidden: (id) => {
    const { data, undoStack } = get();
    const existing = findBlock(data.content, id);
    if (!existing) return;
    const hidden = typeof existing.hidden === "boolean" ? existing.hidden : Boolean(existing.props?.hidden);
    const content = mapBlocks(data.content, id, (block) => ({ ...block, hidden: !hidden }));
    set({ data: { ...data, content }, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  copyBlock: (id) => {
    const { data } = get();
    const target = findBlock(data.content, id);
    if (!target) return;

    const cloned = JSON.parse(JSON.stringify(target));
    set({ clipboardBlock: cloned });

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(cloned));
      }
    } catch {
      // ignore
    }
  },

  cutBlock: (id) => {
    if (!findBlock(get().data.content, id)) return;
    get().copyBlock(id);
    get().removeBlock(id);
  },

  pasteBlock: (targetIndex) => {
    const { data, clipboardBlock, undoStack } = get();
    let blockToPaste = clipboardBlock;

    if (!blockToPaste && typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(CLIPBOARD_STORAGE_KEY);
        if (stored) blockToPaste = JSON.parse(stored);
      } catch {
        // ignore
      }
    }

    if (!blockToPaste) return;

    const prev = cloneData(data);
    const newBlock = cloneBlockWithNewIds(blockToPaste);

    const newContent = [...data.content];
    const index =
      typeof targetIndex === "number"
        ? Math.max(0, Math.min(targetIndex, newContent.length))
        : newContent.length;

    newContent.splice(index, 0, newBlock);

    set({
      data: { ...data, content: newContent },
      selectedBlockId: newBlock.id,
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  pasteAfterBlock: (id) => {
    const { data, clipboardBlock, undoStack } = get();
    let source = clipboardBlock;
    if (!source && typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(CLIPBOARD_STORAGE_KEY);
        if (stored) source = JSON.parse(stored);
      } catch { /* Ignore inaccessible or corrupt storage. */ }
    }
    if (!source || !findBlock(data.content, id)) return;
    const block = cloneBlockWithNewIds(source);
    const content = insertAfterBlock(data.content, id, block);
    set({ data: { ...data, content }, selectedBlockId: block.id, isDirty: true, undoStack: [cloneData(data), ...undoStack].slice(0, MAX_HISTORY_DEPTH), redoStack: [] });
  },

  undo: () => {
    const { undoStack, data, redoStack, selectedBlockId } = get();
    if (undoStack.length === 0) return;

    const [previous, ...restUndo] = undoStack;
    const current = cloneData(data);

    set({
      data: previous,
      selectedBlockId: findBlock(previous.content, selectedBlockId) ? selectedBlockId : null,
      pageTitle: previous.root.title,
      pageSlug: previous.root.slug,
      undoStack: restUndo,
      redoStack: [current, ...redoStack].slice(0, MAX_HISTORY_DEPTH),
      isDirty: true,
    });
  },

  redo: () => {
    const { redoStack, data, undoStack, selectedBlockId } = get();
    if (redoStack.length === 0) return;

    const [next, ...restRedo] = redoStack;
    const current = cloneData(data);

    set({
      data: next,
      selectedBlockId: findBlock(next.content, selectedBlockId) ? selectedBlockId : null,
      pageTitle: next.root.title,
      pageSlug: next.root.slug,
      undoStack: [current, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: restRedo,
      isDirty: true,
    });
  },

  markClean: (savedVersion, savedData) => {
    set((state) => ({
      isDirty: savedData !== undefined && state.data !== savedData,
      pageVersion: savedVersion !== undefined ? savedVersion : state.pageVersion,
    }));
  },
}));
