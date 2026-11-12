import { Extension } from "@tiptap/core";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { Plugin, PluginKey } from "@tiptap/pm/state";

const tableWidthConstraintKey = new PluginKey("tableWidthConstraint");
const TABLE_INLINE_PADDING = 8;

function getTableAvailableWidth(dom: HTMLElement) {
  const parent = dom.parentElement;
  if (!parent) return 0;
  const parentRect = parent.getBoundingClientRect();
  return Math.max(0, parentRect.width - TABLE_INLINE_PADDING);
}

function collectColumnWidths(tableNode: ProseMirrorNode) {
  const firstRow = tableNode.firstChild;
  if (!firstRow) return null;

  const widths: number[] = [];
  let hasFixedWidths = false;

  for (let i = 0; i < firstRow.childCount; i += 1) {
    const cell = firstRow.child(i);
    const colspan = Number(cell.attrs.colspan || 1);
    const colwidth = Array.isArray(cell.attrs.colwidth) ? cell.attrs.colwidth : [];

    for (let j = 0; j < colspan; j += 1) {
      const width = Number(colwidth[j] || 0);
      widths.push(width);
      if (width > 0) hasFixedWidths = true;
    }
  }

  return hasFixedWidths ? widths : null;
}

export const TableWidthConstraint = Extension.create({
  name: "tableWidthConstraint",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: tableWidthConstraintKey,
        view(view) {
          let frameId: number | null = null;

          const normalize = () => {
            frameId = null;
            if (view.isDestroyed) return;

            const { doc, schema } = view.state;
            let tr = view.state.tr;
            let changed = false;

            doc.descendants((node, pos) => {
              if (node.type.name !== "table") return true;

              const dom = view.nodeDOM(pos) as HTMLElement | null;
              if (!dom || !(dom instanceof HTMLElement)) return false;

              const availableWidth = getTableAvailableWidth(dom);
              if (availableWidth <= 0) return false;

              const widths = collectColumnWidths(node);
              if (!widths || widths.length === 0) return false;

              const totalWidth = widths.reduce((sum, width) => sum + width, 0);
              if (totalWidth <= availableWidth) return false;

              const minWidth = 32;
              const scale = availableWidth / totalWidth;
              const normalized = widths.map((width) =>
                Math.max(minWidth, Math.floor(width * scale)),
              );
              const normalizedTotal = normalized.reduce((sum, width) => sum + width, 0);
              if (normalizedTotal > availableWidth) {
                const overBy = normalizedTotal - availableWidth;
                normalized[normalized.length - 1] = Math.max(
                  minWidth,
                  normalized[normalized.length - 1] - overBy,
                );
              }

              const firstRow = node.firstChild;
              if (!firstRow) return false;

              let cellPos = pos + 2;
              let columnIndex = 0;
              for (let i = 0; i < firstRow.childCount; i += 1) {
                const cell = firstRow.child(i);
                const colspan = Number(cell.attrs.colspan || 1);
                const nextColwidth = normalized.slice(
                  columnIndex,
                  columnIndex + colspan,
                );
                const currentColwidth = Array.isArray(cell.attrs.colwidth)
                  ? cell.attrs.colwidth
                  : null;

                if (
                  JSON.stringify(currentColwidth) !== JSON.stringify(nextColwidth)
                ) {
                  tr = tr.setNodeMarkup(cellPos, schema.nodes[cell.type.name], {
                    ...cell.attrs,
                    colwidth: nextColwidth,
                  });
                  changed = true;
                }

                cellPos += cell.nodeSize;
                columnIndex += colspan;
              }

              return false;
            });

            if (changed) {
              view.dispatch(tr);
            }
          };

          const scheduleNormalize = () => {
            if (frameId != null) return;
            frameId = requestAnimationFrame(normalize);
          };

          scheduleNormalize();

          return {
            update() {
              scheduleNormalize();
            },
            destroy() {
              if (frameId != null) {
                cancelAnimationFrame(frameId);
                frameId = null;
              }
            },
          };
        },
      }),
    ];
  },
});
