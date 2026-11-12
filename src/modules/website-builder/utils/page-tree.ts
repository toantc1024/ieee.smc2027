export interface FlatPageTreeItem {
  id: string;
  parentId?: string | null;
  slug: string;
  title: string;
  orderIndex: number;
}

export type PageTreeNode<T extends FlatPageTreeItem> = T & {
  children: PageTreeNode<T>[];
  depth: number;
  hasChildren: boolean;
};

/** Check whether choosing a parent would create a loop in the saved hierarchy. */
export function isValidPageParent(
  pages: Pick<FlatPageTreeItem, "id" | "parentId">[],
  pageId: string,
  parentId: string | null,
): boolean {
  if (!parentId) return true;
  const parents = new Map(pages.map((page) => [page.id, page.parentId]));
  if (!parents.has(parentId)) return false;
  const visited = new Set<string>();
  let current: string | null | undefined = parentId;
  while (current) {
    if (current === pageId || visited.has(current)) return false;
    visited.add(current);
    current = parents.get(current);
  }
  return true;
}

/** Preserve all pages, including orphans and records with invalid parent cycles. */
export function buildPageTree<T extends FlatPageTreeItem>(pages: T[]): PageTreeNode<T>[] {
  const nodes = new Map(pages.map((page) => [page.id, { ...page, children: [], depth: 0, hasChildren: false } as PageTreeNode<T>]));
  const bySlug = new Map(pages.map((page) => [page.slug, page.id]));
  const parents = new Map<string, string>();

  for (const page of pages) {
    const slugParent = page.slug.includes("/") ? bySlug.get(page.slug.split("/").slice(0, -1).join("/")) : undefined;
    const parentId = page.parentId && nodes.has(page.parentId) ? page.parentId : slugParent;
    if (parentId && parentId !== page.id) parents.set(page.id, parentId);
  }

  // Break each cycle at one node so no pages disappear or cause infinite recursion.
  for (const page of pages) {
    const visited = new Set<string>();
    let current: string | undefined = page.id;
    while (current && parents.has(current)) {
      if (visited.has(current)) {
        parents.delete(current);
        break;
      }
      visited.add(current);
      current = parents.get(current);
    }
  }

  const roots: PageTreeNode<T>[] = [];
  for (const page of pages) {
    const node = nodes.get(page.id)!;
    const parent = parents.get(page.id);
    if (parent) nodes.get(parent)!.children.push(node);
    else roots.push(node);
  }

  const visit = (items: PageTreeNode<T>[], depth: number) => {
    items.sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0) || a.title.localeCompare(b.title));
    for (const node of items) {
      node.depth = depth;
      node.hasChildren = node.children.length > 0;
      visit(node.children, depth + 1);
    }
  };
  visit(roots, 0);
  return roots;
}
