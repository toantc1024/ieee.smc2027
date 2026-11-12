import type { PageBlock } from "../types";

export const COLUMN_SLOT_KEYS = ["slot1Blocks", "slot2Blocks", "slot3Blocks", "slot4Blocks"] as const;
export type ColumnSlotKey = typeof COLUMN_SLOT_KEYS[number];

/** HCMUTE pages may contain the older slotNItems name as well as slotNBlocks. */
export function getColumnSlotKey(block: PageBlock, key: ColumnSlotKey): string {
  const olderKey = key.replace("Blocks", "Items");
  return Array.isArray(block.props?.[key]) || !Array.isArray(block.props?.[olderKey]) ? key : olderKey;
}

export function getColumnBlocks(block: PageBlock, key: ColumnSlotKey): PageBlock[] {
  const value = block.props?.[getColumnSlotKey(block, key)];
  return Array.isArray(value) ? value : [];
}

export function findBlock(blocks: PageBlock[], id: string | null): PageBlock | undefined {
  if (!id) return undefined;
  for (const block of blocks) {
    if (block.id === id) return block;
    for (const key of COLUMN_SLOT_KEYS) {
      const found = findBlock(getColumnBlocks(block, key), id);
      if (found) return found;
    }
    if (Array.isArray(block.children)) {
      const found = findBlock(block.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

export function mapBlocks(blocks: PageBlock[], id: string, update: (block: PageBlock) => PageBlock): PageBlock[] {
  return blocks.map((block) => {
    if (block.id === id) return update(block);
    let next = block;
    for (const key of COLUMN_SLOT_KEYS) {
      const actual = getColumnSlotKey(block, key);
      const children = block.props?.[actual];
      if (Array.isArray(children) && findBlock(children, id)) {
        next = { ...next, props: { ...next.props, [actual]: mapBlocks(children, id, update) } };
      }
    }
    if (Array.isArray(block.children) && findBlock(block.children, id)) next = { ...next, children: mapBlocks(block.children, id, update) };
    return next;
  });
}

export function removeBlockFromTree(blocks: PageBlock[], id: string): PageBlock[] {
  return blocks.filter((block) => block.id !== id).map((block) => {
    let next = block;
    for (const key of COLUMN_SLOT_KEYS) {
      const actual = getColumnSlotKey(block, key);
      const children = block.props?.[actual];
      if (Array.isArray(children) && findBlock(children, id)) next = { ...next, props: { ...next.props, [actual]: removeBlockFromTree(children, id) } };
    }
    if (Array.isArray(block.children) && findBlock(block.children, id)) next = { ...next, children: removeBlockFromTree(block.children, id) };
    return next;
  });
}

export function insertAfterBlock(blocks: PageBlock[], id: string, value: PageBlock): PageBlock[] {
  const index = blocks.findIndex((block) => block.id === id);
  if (index >= 0) return [...blocks.slice(0, index + 1), value, ...blocks.slice(index + 1)];
  return blocks.map((block) => {
    let next = block;
    for (const key of COLUMN_SLOT_KEYS) {
      const actual = getColumnSlotKey(block, key);
      const children = block.props?.[actual];
      if (Array.isArray(children) && findBlock(children, id)) next = { ...next, props: { ...next.props, [actual]: insertAfterBlock(children, id, value) } };
    }
    if (Array.isArray(block.children) && findBlock(block.children, id)) next = { ...next, children: insertAfterBlock(block.children, id, value) };
    return next;
  });
}

/** Move within the current sibling list without changing the block's parent. */
export function moveBlockWithinTree(blocks: PageBlock[], id: string, direction: -1 | 1): PageBlock[] {
  const index = blocks.findIndex((block) => block.id === id);
  if (index >= 0) {
    const destination = index + direction;
    if (destination < 0 || destination >= blocks.length) return blocks;
    const next = [...blocks];
    [next[index], next[destination]] = [next[destination], next[index]];
    return next;
  }
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    for (const key of COLUMN_SLOT_KEYS) {
      const actual = getColumnSlotKey(block, key);
      const children = block.props?.[actual];
      if (Array.isArray(children) && findBlock(children, id)) {
        const moved = moveBlockWithinTree(children, id, direction);
        if (moved === children) return blocks;
        const next = [...blocks];
        next[i] = { ...block, props: { ...block.props, [actual]: moved } };
        return next;
      }
    }
    if (Array.isArray(block.children) && findBlock(block.children, id)) {
      const moved = moveBlockWithinTree(block.children, id, direction);
      if (moved === block.children) return blocks;
      const next = [...blocks];
      next[i] = { ...block, children: moved };
      return next;
    }
  }
  return blocks;
}

export function newBlockId(type: string): string {
  return `${type.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${crypto.randomUUID()}`;
}

/** Duplicating a column layout must not reuse any descendant IDs. */
export function cloneBlockWithNewIds(block: PageBlock): PageBlock {
  const clone = structuredClone(block);
  const assign = (item: PageBlock) => {
    const oldId = item.id;
    item.id = newBlockId(item.type);
    if (item.props?.id === oldId) item.props.id = item.id;
    for (const key of COLUMN_SLOT_KEYS) getColumnBlocks(item, key).forEach(assign);
    item.children?.forEach(assign);
  };
  assign(clone);
  return clone;
}
