import type { PageBlock, PageBuilderData } from "../types";
import { COLUMN_SLOT_KEYS, newBlockId } from "./block-tree";

export const REUSABLE_TEMPLATE_CATEGORY = "__builder_reusable_v1";
export const MAX_REUSABLE_BYTES = 2 * 1024 * 1024;

export type ReusableContent =
  | { version: 1; kind: "block"; block: PageBlock }
  | { version: 1; kind: "page"; content: PageBlock[]; zones?: PageBuilderData["zones"] };

function validBlock(value: unknown): value is PageBlock {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const block = value as Partial<PageBlock>;
  return typeof block.id === "string" && block.id.length > 0 && block.id.length <= 256 && typeof block.type === "string" && block.type.length > 0 && block.type.length <= 128 && Boolean(block.props) && typeof block.props === "object" && !Array.isArray(block.props);
}

export function isReusableContent(value: unknown): value is ReusableContent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Record<string, unknown>;
  if (item.version !== 1) return false;
  if (item.kind === "block") return validBlock(item.block);
  if (item.kind !== "page" || !Array.isArray(item.content) || item.content.length > 1000 || !item.content.every(validBlock)) return false;
  if (item.zones === undefined) return true;
  return Boolean(item.zones && typeof item.zones === "object" && !Array.isArray(item.zones) && Object.values(item.zones).every((zone) => Array.isArray(zone) && zone.length <= 1000 && zone.every(validBlock)));
}

export function isValidReusableName(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= 100;
}

/** Give every inserted block a fresh ID, and keep page zone keys pointing at their new owners. */
export function cloneReusableContent(content: ReusableContent): ReusableContent {
  const ids = new Map<string, string>();
  const copyBlock = (value: PageBlock): PageBlock => {
    const block = structuredClone(value);
    const assign = (item: PageBlock) => {
      const previous = item.id;
      item.id = newBlockId(item.type);
      ids.set(previous, item.id);
      if (item.props?.id === previous) item.props.id = item.id;
      for (const key of COLUMN_SLOT_KEYS) {
        for (const actual of [key, key.replace("Blocks", "Items")]) {
          const children = item.props?.[actual];
          if (Array.isArray(children)) children.filter(validBlock).forEach(assign);
        }
      }
      item.children?.filter(validBlock).forEach(assign);
    };
    assign(block);
    return block;
  };
  if (content.kind === "block") return { version: 1, kind: "block", block: copyBlock(content.block) };
  const blocks = content.content.map(copyBlock);
  const zones = content.zones ? Object.fromEntries(Object.entries(content.zones).map(([key, zone]) => [key, zone.map(copyBlock)])) : undefined;
  const remappedZones = zones ? Object.fromEntries(Object.entries(zones).map(([key, blocksInZone]) => {
    const separator = key.indexOf(":");
    const owner = separator < 0 ? key : key.slice(0, separator);
    return [`${ids.get(owner) || owner}${separator < 0 ? "" : key.slice(separator)}`, blocksInZone];
  })) : undefined;
  return { version: 1, kind: "page", content: blocks, ...(remappedZones ? { zones: remappedZones } : {}) };
}
