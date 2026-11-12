import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, NodeSelection, Selection } from "@tiptap/pm/state";
import { DOMSerializer } from "@tiptap/pm/model";
import type { EditorView } from "@tiptap/pm/view";

const dragHandlePluginKey = new PluginKey("dragHandle");

/**
 * Notion-style block drag handle that appears on hover.
 * Shows a ⠿ grip icon (draggable) and a + button (triggers slash commands).
 *
 * The handle is a single absolutely-positioned DOM element managed outside
 * ProseMirror's decoration system to avoid re-render churn.
 */
export const DragHandle = Extension.create({
  name: "dragHandle",

  addProseMirrorPlugins() {
    let handleEl: HTMLDivElement | null = null;
    let currentBlockPos = -1;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;

    /**
     * Resolve the top-level draggable block at a given screen coordinate.
     */
    function resolveBlock(view: EditorView, x: number, y: number) {
      const pointProbe = view.posAtCoords({ left: x, top: y });
      if (pointProbe) {
        const $point = view.state.doc.resolve(pointProbe.pos);
        for (let depth = $point.depth; depth > 0; depth -= 1) {
          const parent = $point.node(depth - 1);
          if (parent.type.name === "layoutContainer" || parent.type.name === "layoutColumn") {
            return null;
          }
        }
      }

      const editorRect = view.dom.getBoundingClientRect();
      const topProbe = view.posAtCoords({
        left: editorRect.left + 1,
        top: y,
      });
      if (!topProbe) return null;
      const $top = view.state.doc.resolve(topProbe.pos);
      if ($top.depth === 0) return null;

      const depth = Math.min($top.depth, 1);
      const start = $top.before(depth);
      const node = view.state.doc.nodeAt(start);
      if (!node) return null;
      if (node.type.name === "layoutContainer" || node.type.name === "layoutColumn") return null;

      return {
        pos: start,
        node,
        dom: view.nodeDOM(start) as HTMLElement | null,
      };
    }

    function createHandle(view: EditorView) {
      const el = document.createElement("div");
      el.className = "block-drag-handle";
      el.contentEditable = "false";

      // Grip button (draggable)
      const grip = document.createElement("button");
      grip.type = "button";
      grip.className = "block-drag-handle__grip";
      grip.draggable = true;
      grip.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/></svg>`;
      grip.title = "Drag to move";

      // Drag start: set ProseMirror node selection so dropcursor works
      grip.addEventListener("dragstart", (e) => {
        if (currentBlockPos < 0 || !e.dataTransfer) return;
        const { state } = view;
        const node = state.doc.nodeAt(currentBlockPos);
        if (!node) return;

        // Select the node so ProseMirror handles the drag natively
        const sel = NodeSelection.create(state.doc, currentBlockPos);
        view.dispatch(state.tr.setSelection(sel));
        const slice = sel.content();
        const serialized = document.createElement("div");
        serialized.appendChild(DOMSerializer.fromSchema(state.schema).serializeFragment(slice.content));
        e.dataTransfer.clearData();
        e.dataTransfer.setData("text/html", serialized.innerHTML);
        e.dataTransfer.setData("text/plain", slice.content.textBetween(0, slice.content.size, "\n\n"));
        view.dragging = { slice, move: true };

        // Set drag image from the actual block DOM
        const blockDom = view.nodeDOM(currentBlockPos) as HTMLElement | null;
        if (blockDom) {
          e.dataTransfer.setDragImage(blockDom, 0, 0);
        }
        e.dataTransfer.effectAllowed = "move";

        // Hide handle during drag
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
      });

      grip.addEventListener("dragend", () => {
        el.style.opacity = "";
        el.style.pointerEvents = "";
        const dragging = view.dragging;
        window.setTimeout(() => { if (view.dragging === dragging) view.dragging = null; }, 50);
      });

      // Plus button (triggers slash commands)
      const plus = document.createElement("button");
      plus.type = "button";
      plus.className = "block-drag-handle__plus";
      plus.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`;
      plus.title = "Add block";

      plus.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentBlockPos < 0) return;

        const { state } = view;
        const node = state.doc.nodeAt(currentBlockPos);
        if (!node) return;

        // Insert an empty paragraph after the current block and focus it
        const endOfBlock = currentBlockPos + node.nodeSize;
        const tr = state.tr.insert(endOfBlock, state.schema.nodes.paragraph.create());
        // Set cursor into the new paragraph
        tr.setSelection(
          Selection.near(tr.doc.resolve(endOfBlock + 1)),
        );
        view.dispatch(tr);
        view.focus();

        // Trigger slash command menu by typing "/"
        requestAnimationFrame(() => {
          document.dispatchEvent(new CustomEvent("slash-command:trigger"));
          // Simulate typing "/" to trigger the suggestion plugin
          const { state: newState } = view;
          const pos = newState.selection.from;
          view.dispatch(newState.tr.insertText("/", pos, pos));
        });
      });

      el.appendChild(plus);
      el.appendChild(grip);

      // Keep handle visible when hovering on it
      el.addEventListener("mouseenter", () => {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
      });
      el.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
          el.classList.remove("visible");
        }, 150);
      });

      return el;
    }

    function positionHandle(view: EditorView, blockPos: number, blockDom: HTMLElement) {
      if (!handleEl) return;

      const editorDom = view.dom;
      const editorRect = editorDom.getBoundingClientRect();
      const blockRect = blockDom.getBoundingClientRect();

      // Position relative to the editor's offset parent
      const offsetParent = handleEl.offsetParent as HTMLElement;
      if (!offsetParent) return;
      const parentRect = offsetParent.getBoundingClientRect();

      const top = blockRect.top - parentRect.top + offsetParent.scrollTop;
      // For top-level blocks, anchor to the editor's left edge (historical
      // behavior). For nested blocks inside a layout container, anchor to
      // the block's own left edge so users can tell which child is targeted.
      const isNested = blockRect.left > editorRect.left + 4;
      const anchorLeft = isNested ? blockRect.left : editorRect.left;
      const left = anchorLeft - parentRect.left + offsetParent.scrollLeft - 2;

      handleEl.style.top = `${top}px`;
      handleEl.style.left = `${left}px`;
      handleEl.style.height = `${Math.min(blockRect.height, 48)}px`;
      handleEl.classList.add("visible");
      currentBlockPos = blockPos;
    }

    return [
      new Plugin({
        key: dragHandlePluginKey,
        view(editorView) {
          handleEl = createHandle(editorView);
          // Attach to the editor's scroll parent so it scrolls with content
          const scrollParent = editorView.dom.closest(".overflow-y-auto") || editorView.dom.parentElement;
          if (scrollParent) {
            // Ensure the parent is positioned for absolute children
            const pos = getComputedStyle(scrollParent).position;
            if (pos === "static") {
              (scrollParent as HTMLElement).style.position = "relative";
            }
            scrollParent.appendChild(handleEl);
          }

          return {
            update() {
              // If selection changed and handle was shown, update position
            },
            destroy() {
              handleEl?.remove();
              handleEl = null;
              if (hideTimeout) clearTimeout(hideTimeout);
            },
          };
        },
        props: {
          handleDOMEvents: {
            mousemove(view, event) {
              if (!view.editable) return false;
              // Don't interfere while dragging
              if (event.buttons !== 0) return false;

              if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
              }

              const block = resolveBlock(view, event.clientX, event.clientY);
              if (!block || !block.dom) {
                // Schedule hide
                hideTimeout = setTimeout(() => {
                  handleEl?.classList.remove("visible");
                  currentBlockPos = -1;
                }, 150);
                return false;
              }

              if (block.pos !== currentBlockPos) {
                positionHandle(view, block.pos, block.dom);
              }
              return false;
            },
            mouseleave() {
              hideTimeout = setTimeout(() => {
                handleEl?.classList.remove("visible");
                currentBlockPos = -1;
              }, 200);
              return false;
            },
            dragstart() {
              // Don't interfere with native drag
              return false;
            },
          },
        },
      }),
    ];
  },
});
