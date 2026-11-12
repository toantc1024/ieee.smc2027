import { useBuilderStore } from "../store/builder-store";

/** Handle page-builder shortcuts only when the user is not editing a field. */
export function handleBuilderShortcut(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null;
  const closest = typeof target?.closest === "function" ? target.closest.bind(target) : null;
  if (target?.isContentEditable || closest?.("input, textarea, select, [contenteditable]:not([contenteditable='false']), .ProseMirror, .monaco-editor, [role='dialog'], [role='alertdialog']")) return;
  const state = useBuilderStore.getState();
  if (state.viewMode === "preview" || state.studioTab !== "content" || event.defaultPrevented || event.isComposing || event.altKey) return;

  const modifier = event.metaKey || event.ctrlKey;
  const key = event.key.toLowerCase();
  const id = state.selectedBlockId;
  if (modifier && key === "z" && !event.shiftKey) { event.preventDefault(); state.undo(); return; }
  if (modifier && ((key === "z" && event.shiftKey) || (key === "y" && !event.shiftKey))) { event.preventDefault(); state.redo(); return; }
  if (modifier && key === "v" && !event.shiftKey) {
    if (id) state.pasteAfterBlock(id);
    else state.pasteBlock();
    event.preventDefault();
    return;
  }
  if (!id) return;
  if (modifier && !event.shiftKey && key === "c") { event.preventDefault(); state.copyBlock(id); }
  else if (modifier && !event.shiftKey && key === "x") { event.preventDefault(); state.cutBlock(id); }
  else if (modifier && !event.shiftKey && key === "d") { event.preventDefault(); state.duplicateBlock(id); }
  else if (modifier && event.shiftKey && key === "h") { event.preventDefault(); state.toggleBlockHidden(id); }
  else if (!modifier && !event.shiftKey && (key === "delete" || key === "backspace")) { event.preventDefault(); state.removeBlock(id); }
  else if (!modifier && key === "escape") { event.preventDefault(); state.selectBlock(null); }
}
