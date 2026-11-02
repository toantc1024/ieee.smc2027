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
    content?: any;
    blocks?: any[];
  }) => void;
  selectBlock: (id: string | null) => void;
  hoverBlock: (id: string | null) => void;
  setViewport: (viewport: ViewportMode) => void;
  setZoom: (zoom: number) => void;
  toggleAutoFit: () => void;
  setViewMode: (mode: "edit" | "preview") => void;
  setSidebarTab: (tab: SidebarTab) => void;
  setInspectorTab: (tab: InspectorTab) => void;
  setStudioTab: (tab: StudioActiveView) => void;
  updatePageMeta: (meta: Partial<PageRootData>) => void;

  // Block Mutations
  addBlock: (type: string, props?: Record<string, any>) => void;
  insertBlockAt: (index: number, type: string, props?: Record<string, any>) => void;
  updateBlockProps: (id: string, props: Record<string, any>) => void;
  updateBlockStyles: (id: string, styles: Record<string, any>) => void;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  moveBlockUp: (id: string) => void;
  moveBlockDown: (id: string) => void;
  toggleBlockHidden: (id: string) => void;

  // Clipboard & History
  copyBlock: (id: string) => void;
  pasteBlock: (targetIndex?: number) => void;
  undo: () => void;
  redo: () => void;
  markClean: (savedVersion?: number) => void;
}

function cloneData(data: PageBuilderData): PageBuilderData {
  return JSON.parse(JSON.stringify(data));
}

function normalizeBlocks(content?: any, blocks?: any[]): PageBlock[] {
  if (content && Array.isArray(content.content)) {
    return content.content.map((b: any, i: number) => ({
      id: b.id || `block-${Date.now()}-${i}`,
      type: b.type,
      props: b.props || {},
      hidden: Boolean(b.hidden),
    }));
  }
  if (Array.isArray(blocks)) {
    return blocks.map((b: any, i: number) => ({
      id: b.id || `block-${Date.now()}-${i}`,
      type: b.type,
      props: b.props || {},
      hidden: Boolean(b.hidden),
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

  initPage: ({ id, title, slug, version = 1, isPublished = true, content, blocks }) => {
    const normalizedBlocks = normalizeBlocks(content, blocks);
    const rootData: PageRootData = {
      title,
      slug,
      metaTitle: content?.root?.metaTitle || `${title} | IEEE SMC 2027`,
      metaDescription: content?.root?.metaDescription || "",
    };

    set({
      pageId: id,
      pageTitle: title,
      pageSlug: slug,
      pageVersion: version,
      isPublished,
      data: {
        root: rootData,
        content: normalizedBlocks,
      },
      selectedBlockId: normalizedBlocks[0]?.id || null,
      hoveredBlockId: null,
      isDirty: false,
      undoStack: [],
      redoStack: [],
    });
  },

  selectBlock: (id) => set({ selectedBlockId: id }),
  hoverBlock: (id) => set({ hoveredBlockId: id }),
  setViewport: (viewport) => set({ viewport }),
  setZoom: (zoom) => set({ zoom, isAutoFit: false }),
  toggleAutoFit: () => set((state) => ({ isAutoFit: !state.isAutoFit })),
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
      id: `${type.toLowerCase()}-${Date.now()}`,
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
      id: `${type.toLowerCase()}-${Date.now()}`,
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

  updateBlockProps: (id, props) => {
    const { data, undoStack } = get();
    const prev = cloneData(data);
    const newContent = data.content.map((b) =>
      b.id === id ? { ...b, props: { ...b.props, ...props } } : b
    );

    set({
      data: { ...data, content: newContent },
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  updateBlockStyles: (id, styles) => {
    const { data, undoStack } = get();
    const prev = cloneData(data);
    const newContent = data.content.map((b) =>
      b.id === id
        ? {
            ...b,
            props: {
              ...b.props,
              _styles: { ...(b.props?._styles || {}), ...styles },
            },
          }
        : b
    );

    set({
      data: { ...data, content: newContent },
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  removeBlock: (id) => {
    const { data, undoStack, selectedBlockId } = get();
    const prev = cloneData(data);
    const newContent = data.content.filter((b) => b.id !== id);

    set({
      data: { ...data, content: newContent },
      selectedBlockId: selectedBlockId === id ? newContent[0]?.id || null : selectedBlockId,
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  duplicateBlock: (id) => {
    const { data, undoStack } = get();
    const prev = cloneData(data);
    const idx = data.content.findIndex((b) => b.id === id);
    if (idx === -1) return;

    const source = data.content[idx];
    const duplicated: PageBlock = {
      ...cloneData({ root: data.root, content: [source] }).content[0],
      id: `${source.type.toLowerCase()}-${Date.now()}`,
    };

    const newContent = [...data.content];
    newContent.splice(idx + 1, 0, duplicated);

    set({
      data: { ...data, content: newContent },
      selectedBlockId: duplicated.id,
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
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
    const { data, moveBlock } = get();
    const idx = data.content.findIndex((b) => b.id === id);
    if (idx > 0) moveBlock(idx, idx - 1);
  },

  moveBlockDown: (id) => {
    const { data, moveBlock } = get();
    const idx = data.content.findIndex((b) => b.id === id);
    if (idx < data.content.length - 1) moveBlock(idx, idx + 1);
  },

  toggleBlockHidden: (id) => {
    const { data, undoStack } = get();
    const prev = cloneData(data);
    const newContent = data.content.map((b) =>
      b.id === id ? { ...b, hidden: !b.hidden } : b
    );

    set({
      data: { ...data, content: newContent },
      isDirty: true,
      undoStack: [prev, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: [],
    });
  },

  copyBlock: (id) => {
    const { data } = get();
    const target = data.content.find((b) => b.id === id);
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
    const newBlock: PageBlock = {
      ...cloneData({ root: data.root, content: [blockToPaste] }).content[0],
      id: `${blockToPaste.type.toLowerCase()}-${Date.now()}`,
    };

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

  undo: () => {
    const { undoStack, data, redoStack } = get();
    if (undoStack.length === 0) return;

    const [previous, ...restUndo] = undoStack;
    const current = cloneData(data);

    set({
      data: previous,
      pageTitle: previous.root.title,
      pageSlug: previous.root.slug,
      undoStack: restUndo,
      redoStack: [current, ...redoStack].slice(0, MAX_HISTORY_DEPTH),
      isDirty: true,
    });
  },

  redo: () => {
    const { redoStack, data, undoStack } = get();
    if (redoStack.length === 0) return;

    const [next, ...restRedo] = redoStack;
    const current = cloneData(data);

    set({
      data: next,
      pageTitle: next.root.title,
      pageSlug: next.root.slug,
      undoStack: [current, ...undoStack].slice(0, MAX_HISTORY_DEPTH),
      redoStack: restRedo,
      isDirty: true,
    });
  },

  markClean: (savedVersion) => {
    set((state) => ({
      isDirty: false,
      pageVersion: savedVersion !== undefined ? savedVersion : state.pageVersion,
    }));
  },
}));
