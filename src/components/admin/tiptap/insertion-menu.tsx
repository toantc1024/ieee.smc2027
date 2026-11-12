"use client";

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Editor, Range } from "@tiptap/core";
import { Selection } from "@tiptap/pm/state";
import { INSERT_BETWEEN_OPEN_EVENT, type InsertBetweenOpenDetail } from "./insert-between-extension";

type Item = { title: string; description: string; category: string; run: (editor: Editor, range: Range) => void };
const items: Item[] = [
  { title: "Paragraph", description: "Plain text", category: "Text", run: (e, r) => { e.chain().focus().deleteRange(r).setParagraph().run(); } },
  ...([1, 2, 3] as const).map((level): Item => ({ title: `Heading ${level}`, description: "Section heading", category: "Text", run: (e, r) => { e.chain().focus().deleteRange(r).setHeading({ level }).run(); } })),
  { title: "Bullet list", description: "Unordered list", category: "Text", run: (e, r) => { e.chain().focus().deleteRange(r).toggleBulletList().run(); } },
  { title: "Numbered list", description: "Ordered list", category: "Text", run: (e, r) => { e.chain().focus().deleteRange(r).toggleOrderedList().run(); } },
  { title: "Quote", description: "Block quotation", category: "Text", run: (e, r) => { e.chain().focus().deleteRange(r).setBlockquote().run(); } },
  { title: "Code block", description: "Display source code", category: "Text", run: (e, r) => { e.chain().focus().deleteRange(r).setCodeBlock().run(); } },
  { title: "Divider", description: "Horizontal rule", category: "Text", run: (e, r) => { e.chain().focus().deleteRange(r).setHorizontalRule().run(); } },
  { title: "Image", description: "Image with upload, caption and layout", category: "Media", run: (e, r) => { e.chain().focus().deleteRange(r).insertImageBlock().run(); } },
  { title: "File", description: "Document or PDF attachment", category: "Media", run: (e, r) => { e.chain().focus().deleteRange(r).insertFileAttachmentBlock().run(); } },
  { title: "Table", description: "Editable table", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).insertTable({ rows: 3, cols: 3, withHeaderRow: false }).run(); } },
  { title: "Sheet", description: "Data sheet and CSV import", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).insertSheetBlock().run(); } },
  { title: "Callout", description: "Notice or warning", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).insertCalloutBlock().run(); } },
  { title: "Button", description: "Link styled as a button", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).setButtonBlock().run(); } },
  { title: "Equation", description: "Display LaTeX formula", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).setMathBlock().run(); } },
  { title: "Inline equation", description: "LaTeX formula within a paragraph", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).setMathInline().run(); } },
  { title: "Diagram", description: "Mermaid diagram", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).setMermaidBlock().run(); } },
  { title: "Chart", description: "Visualize data", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).setChartBlock().run(); } },
  { title: "Embed", description: "HTML, CSS and JavaScript", category: "Blocks", run: (e, r) => { e.chain().focus().deleteRange(r).setEmbedBlock().run(); } },
  ...([2, 3, 4] as const).map((cols): Item => ({ title: `${cols} columns`, description: "Arrange content side by side", category: "Layout", run: (e, r) => { e.chain().focus().deleteRange(r).setLayoutContainer({ cols }).run(); } })),
];

export function filterInsertionItems(query: string): Item[] {
  const term = query.trim().toLowerCase();
  return items.filter((item) => `${item.title} ${item.description} ${item.category}`.toLowerCase().includes(term));
}

/** Use the same commands for slash insertion and the gap controls. */
export function runInsertionItem(editor: Editor, title: string, range: Range): boolean {
  const item = items.find((candidate) => candidate.title === title);
  if (!item) return false;
  item.run(editor, range);
  return true;
}

type Menu = { mode: "slash" | "between"; x: number; y: number; range: Range; query: string };
export function InsertionMenu({ editor }: { editor: Editor }) {
  const [menu, setMenu] = useState<Menu | null>(null);
  const [active, setActive] = useState(0);
  const menuRef = useRef<Menu | null>(null);
  const activeRef = useRef(0);
  const dismissedRef = useRef("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => { menuRef.current = menu; activeRef.current = active; }, [menu, active]);

  const choose = useCallback((item: Item, current: Menu) => {
    setMenu(null);
    let range = current.range;
    if (current.mode === "between") {
      const view = editor.view;
      const pos = Math.max(0, Math.min(range.from, view.state.doc.content.size));
      const paragraph = view.state.schema.nodes.paragraph.create();
      const transaction = view.state.tr.insert(pos, paragraph);
      transaction.setSelection(Selection.near(transaction.doc.resolve(pos + 1)));
      view.dispatch(transaction.scrollIntoView());
      range = { from: view.state.selection.from, to: view.state.selection.from };
    }
    dismissedRef.current = `${range.from}:${range.to}`;
    item.run(editor, range);
  }, [editor]);

  useEffect(() => {
    const update = () => {
      if (menuRef.current?.mode === "between") return;
      const { selection } = editor.state;
      if (!selection.empty || selection.$from.parent.type.name !== "paragraph") { setMenu(null); return; }
      const { $from } = selection;
      const before = $from.parent.textBetween(0, $from.parentOffset, "\n", "\ufffc");
      const match = /^\/([^/\n]*)$/.exec(before);
      if (!match) { dismissedRef.current = ""; setMenu(null); return; }
      const range = { from: $from.start(), to: $from.pos };
      if (dismissedRef.current === `${range.from}:${range.to}`) return;
      const rect = editor.view.coordsAtPos(range.to);
      setMenu({ mode: "slash", x: rect.left, y: rect.bottom + 6, range, query: match[1] });
      setActive(0);
    };
    const keydown = (event: KeyboardEvent) => {
      const current = menuRef.current;
      if (!current || current.mode !== "slash") return;
      const filtered = filterInsertionItems(current.query);
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dismissedRef.current = `${current.range.from}:${current.range.to}`; setMenu(null); }
      else if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); event.stopPropagation(); setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)); }
      else if (event.key === "Enter" && filtered[activeRef.current]) { event.preventDefault(); event.stopPropagation(); choose(filtered[activeRef.current], current); }
    };
    const onBetween = (event: Event) => {
      const detail = (event as CustomEvent<InsertBetweenOpenDetail>).detail;
      if (detail?.editor !== editor) return;
      setActive(0);
      setMenu({ mode: "between", x: detail.x, y: detail.y, range: { from: detail.insertPos, to: detail.insertPos }, query: "" });
      requestAnimationFrame(() => inputRef.current?.focus());
    };
    const onOutside = (event: MouseEvent) => { if (menuRef.current && !popoverRef.current?.contains(event.target as Node) && !editor.view.dom.contains(event.target as Node)) setMenu(null); };
    editor.on("transaction", update);
    editor.view.dom.addEventListener("keydown", keydown, true);
    document.addEventListener(INSERT_BETWEEN_OPEN_EVENT, onBetween);
    document.addEventListener("mousedown", onOutside);
    return () => { editor.off("transaction", update); editor.view.dom.removeEventListener("keydown", keydown, true); document.removeEventListener(INSERT_BETWEEN_OPEN_EVENT, onBetween); document.removeEventListener("mousedown", onOutside); };
  }, [editor, choose]);

  if (!menu || typeof document === "undefined") return null;
  const filtered = filterInsertionItems(menu.query);
  const left = Math.max(8, Math.min(menu.x - (menu.mode === "between" ? 150 : 0), window.innerWidth - 308));
  const top = Math.max(8, Math.min(menu.y, window.innerHeight - 360));
  return createPortal(<div ref={popoverRef} role="menu" aria-label="Insert block" className="fixed z-[100] flex max-h-[350px] w-[300px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" style={{ top, left }}>
    {menu.mode === "between" && <input ref={inputRef} value={menu.query} onChange={(event) => { setMenu({ ...menu, query: event.target.value }); setActive(0); }} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); setMenu(null); } else if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1)); } else if (event.key === "Enter" && filtered[active]) { event.preventDefault(); choose(filtered[active], menu); } }} placeholder="Search blocks…" aria-label="Search blocks" className="m-2 h-9 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500" />}
    <div className="overflow-y-auto p-1">{filtered.length === 0 ? <p className="p-4 text-center text-xs text-slate-500">No matching blocks</p> : filtered.map((item, index) => <button type="button" role="menuitem" key={item.title} onMouseDown={(event) => { if (menu.mode === "slash") event.preventDefault(); }} onMouseEnter={() => setActive(index)} onClick={() => choose(item, menu)} className={`block w-full rounded-lg px-3 py-2 text-left ${index === active ? "bg-blue-50" : "hover:bg-slate-50"}`}><span className="block text-xs font-semibold text-slate-800">{item.title}</span><span className="block text-[11px] text-slate-500">{item.description}</span></button>)}</div>
  </div>, document.body);
}
