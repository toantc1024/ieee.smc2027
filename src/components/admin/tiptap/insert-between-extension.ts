import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import gsap from "gsap";

const insertBetweenPluginKey = new PluginKey("insertBetween");

/**
 * Block types considered "special" — only between these does the
 * insert-between affordance appear. Pure text blocks (paragraph, heading,
 * lists) already have natural flow via Enter so showing the pill there
 * would just be noise.
 */
const SPECIAL_BLOCKS = new Set([
  "imageBlock",
  "fileAttachmentBlock",
  "sheetBlock",
  "buttonBlock",
  "calloutBlock",
  "embedBlock",
  "mathBlock",
  "mermaidBlock",
  "chartBlock",
  "layoutContainer",
  "table",
  "codeBlock",
  "horizontalRule",
  "blockquote",
]);

/** Payload dispatched on the document when the user clicks the pill. */
export interface InsertBetweenOpenDetail {
  insertPos: number;
  editor: import("@tiptap/core").Editor;
  /** Viewport coordinates used to anchor the React menu */
  x: number;
  y: number;
}

export const INSERT_BETWEEN_OPEN_EVENT = "insert-between:open";

/**
 * Renders a thin animated divider with a centered "+" pill in the gap
 * between two top-level blocks (only between special blocks). Clicking
 * the pill dispatches a CustomEvent that the editor component listens to
 * and opens a React menu — no slash-trigger trickery.
 */
export const InsertBetween = Extension.create({
  name: "insertBetween",

  addProseMirrorPlugins() {
    const editor = this.editor;
    let handleEl: HTMLDivElement | null = null;
    let currentInsertPos = -1;
    let hideTimeout: ReturnType<typeof setTimeout> | null = null;
    let introTween: gsap.core.Timeline | null = null;

    function hideHandle() {
      introTween?.kill();
      introTween = null;
      handleEl?.classList.remove("visible");
      currentInsertPos = -1;
    }

    function animateHandleIn(el: HTMLDivElement) {
      const line = el.querySelector<HTMLElement>(".block-insert-between__line");
      const pill = el.querySelector<HTMLElement>(".block-insert-between__pill");
      if (!line || !pill) return;

      introTween?.kill();
      introTween = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .set(line, { scaleX: 0.38, opacity: 0, transformOrigin: "center" })
        .set(pill, { xPercent: -50, yPercent: -50, scale: 0.72, opacity: 0 })
        .to(line, { scaleX: 1, opacity: 1, duration: 0.28 })
        .to(
          pill,
          { scale: 1, opacity: 1, duration: 0.32, ease: "back.out(1.9)" },
          "-=0.18",
        );
    }

    function findNearestGap(view: EditorView, x: number, y: number) {
      // Skip when hovering inside layout columns — they have their own UX
      const pointProbe = view.posAtCoords({ left: x, top: y });
      if (pointProbe) {
        const $point = view.state.doc.resolve(pointProbe.pos);
        for (let depth = $point.depth; depth > 0; depth -= 1) {
          const parent = $point.node(depth - 1);
          if (
            parent.type.name === "layoutContainer" ||
            parent.type.name === "layoutColumn"
          ) {
            return null;
          }
        }
      }

      const doc = view.state.doc;
      const THRESHOLD = 24;

      type Block = {
        offset: number;
        size: number;
        typeName: string;
        rect: DOMRect;
      };
      const blocks: Block[] = [];

      doc.forEach((child, offset) => {
        const dom = view.nodeDOM(offset) as HTMLElement | null;
        if (!dom || typeof dom.getBoundingClientRect !== "function") return;
        const rect = dom.getBoundingClientRect();
        if (rect.height <= 0) return;
        blocks.push({ offset, size: child.nodeSize, typeName: child.type.name, rect });
      });

      type Gap = {
        insertPos: number;
        screenY: number;
        displayY?: number;
        left: number;
        right: number;
        hitTop?: number;
        hitBottom?: number;
      };
      const gaps: Gap[] = [];
      const editorRect = view.dom.getBoundingClientRect();

      if (blocks.length > 0) {
        const first = blocks[0];
        const last = blocks[blocks.length - 1];
        const firstHitDepth = Math.min(48, Math.max(24, first.rect.height * 0.4));
        const lastHitDepth = Math.min(48, Math.max(24, last.rect.height * 0.4));

        gaps.push({
          insertPos: 0,
          screenY: first.rect.top + firstHitDepth / 2,
          displayY: first.rect.top - 10,
          left: Math.min(editorRect.left, first.rect.left),
          right: Math.max(editorRect.right, first.rect.right),
          hitTop: first.rect.top - THRESHOLD,
          hitBottom: first.rect.top + firstHitDepth,
        });

        gaps.push({
          insertPos: last.offset + last.size,
          screenY: last.rect.bottom - lastHitDepth / 2,
          displayY: last.rect.bottom + 10,
          left: Math.min(editorRect.left, last.rect.left),
          right: Math.max(editorRect.right, last.rect.right),
          hitTop: last.rect.bottom - lastHitDepth,
          hitBottom: last.rect.bottom + THRESHOLD,
        });
      }

      for (let i = 0; i < blocks.length - 1; i += 1) {
        const a = blocks[i];
        const b = blocks[i + 1];
        if (!SPECIAL_BLOCKS.has(a.typeName) && !SPECIAL_BLOCKS.has(b.typeName)) {
          continue;
        }
        gaps.push({
          insertPos: a.offset + a.size,
          screenY: (a.rect.bottom + b.rect.top) / 2,
          left: Math.min(a.rect.left, b.rect.left),
          right: Math.max(a.rect.right, b.rect.right),
        });
      }

      let best: { gap: Gap; dist: number } | null = null;
      for (const gap of gaps) {
        const inHitBand =
          gap.hitTop != null &&
          gap.hitBottom != null &&
          y >= gap.hitTop &&
          y <= gap.hitBottom;
        const edgeDist = Math.abs(gap.screenY - y);
        const dist = inHitBand ? edgeDist * 0.01 : edgeDist;
        if (dist <= THRESHOLD && (!best || dist < best.dist)) {
          best = { gap, dist };
        }
      }
      return best?.gap ?? null;
    }

    function createHandle() {
      const el = document.createElement("div");
      el.className = "block-insert-between";
      el.contentEditable = "false";

      const line = document.createElement("div");
      line.className = "block-insert-between__line";
      el.appendChild(line);

      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = "block-insert-between__pill";
      pill.title = "Insert a block here";
      pill.innerHTML = `
        <span class="block-insert-between__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </span>
        <span class="block-insert-between__label">Add block</span>
      `;

      pill.addEventListener("mousedown", (e) => {
        e.preventDefault();
      });

      pill.addEventListener("mouseenter", () => {
        gsap.to(pill, {
          scale: 1.04,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      pill.addEventListener("mouseleave", () => {
        gsap.to(pill, {
          scale: 1,
          duration: 0.18,
          ease: "power2.out",
          overwrite: "auto",
        });
      });

      pill.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (currentInsertPos < 0) return;

        const rect = pill.getBoundingClientRect();
        const detail: InsertBetweenOpenDetail = {
          insertPos: currentInsertPos,
          editor,
          x: rect.left + rect.width / 2,
          y: rect.bottom + 6,
        };
        document.dispatchEvent(
          new CustomEvent<InsertBetweenOpenDetail>(INSERT_BETWEEN_OPEN_EVENT, {
            detail,
          }),
        );

        hideHandle();
      });

      el.appendChild(pill);

      el.addEventListener("mouseenter", () => {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
      });
      el.addEventListener("mouseleave", () => {
        hideTimeout = setTimeout(() => {
          hideHandle();
        }, 120);
      });

      return el;
    }

    function positionHandle(
      view: EditorView,
      insertPos: number,
      screenY: number,
      screenLeft: number,
      screenRight: number,
    ) {
      if (!handleEl) return;

      const offsetParent = handleEl.offsetParent as HTMLElement | null;
      if (!offsetParent) return;
      const parentRect = offsetParent.getBoundingClientRect();
      const editorRect = view.dom.getBoundingClientRect();

      const left = Math.min(editorRect.left, screenLeft) - parentRect.left + offsetParent.scrollLeft;
      const width =
        Math.max(editorRect.right, screenRight) -
        Math.min(editorRect.left, screenLeft);
      const top = screenY - parentRect.top + offsetParent.scrollTop;

      handleEl.style.top = `${top}px`;
      handleEl.style.left = `${left}px`;
      handleEl.style.width = `${width}px`;
      handleEl.classList.add("visible");
      currentInsertPos = insertPos;
      animateHandleIn(handleEl);
    }

    return [
      new Plugin({
        key: insertBetweenPluginKey,
        view(editorView) {
          handleEl = createHandle();
          const scrollParent =
            editorView.dom.closest(".overflow-y-auto") ||
            editorView.dom.parentElement;
          if (scrollParent) {
            const pos = getComputedStyle(scrollParent).position;
            if (pos === "static") {
              (scrollParent as HTMLElement).style.position = "relative";
            }
            scrollParent.appendChild(handleEl);
          }

          return {
            destroy() {
              handleEl?.remove();
              handleEl = null;
              introTween?.kill();
              introTween = null;
              if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
              }
            },
          };
        },
        props: {
          handleDOMEvents: {
            mousemove(view, event) {
              if (!view.editable) return false;
              if (event.buttons !== 0) return false;

              if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
              }

              const gap = findNearestGap(view, event.clientX, event.clientY);
              if (!gap) {
                hideTimeout = setTimeout(() => {
                  hideHandle();
                }, 120);
                return false;
              }

              if (gap.insertPos !== currentInsertPos) {
                positionHandle(
                  view,
                  gap.insertPos,
                  gap.displayY ?? gap.screenY,
                  gap.left,
                  gap.right,
                );
              }
              return false;
            },
            mouseleave() {
              hideTimeout = setTimeout(() => {
                hideHandle();
              }, 200);
              return false;
            },
          },
        },
      }),
    ];
  },
});
