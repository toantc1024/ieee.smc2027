"use client";

/* TipTap node attributes are external state and must synchronize with the editing draft. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useCallback, useEffect, useRef } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { Sigma } from "lucide-react";
import katex from "katex";

import { isEditorReviewOnly, isNodeViewInsideLayoutColumn } from "./node-view-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BlockWrapper } from "./block-wrapper";
import {
  SECURE_KATEX_BLOCK_OPTIONS,
  sanitizeKaTeXContainer,
} from "./katex-config";

// ── Quick-insert LaTeX snippets ──────────────────────────────────────
const LATEX_SNIPPETS = [
  { label: "∑", latex: "\\sum_{i=1}^{n} ", tip: "Sum" },
  { label: "∫", latex: "\\int_{a}^{b} ", tip: "Integral" },
  { label: "√", latex: "\\sqrt{}", tip: "Square root" },
  { label: "a/b", latex: "\\frac{a}{b}", tip: "Fraction" },
  { label: "x²", latex: "x^{2}", tip: "Power" },
  { label: "xₙ", latex: "x_{n}", tip: "Subscript" },
  { label: "lim", latex: "\\lim_{x \\to \\infty} ", tip: "Limit" },
  { label: "∞", latex: "\\infty", tip: "Infinity" },
  { label: "α", latex: "\\alpha", tip: "Alpha" },
  { label: "β", latex: "\\beta", tip: "Beta" },
  { label: "π", latex: "\\pi", tip: "Pi" },
  { label: "θ", latex: "\\theta", tip: "Theta" },
  { label: "≠", latex: "\\neq", tip: "Other" },
  { label: "≤", latex: "\\leq", tip: "Less than or equal" },
  { label: "≥", latex: "\\geq", tip: "Greater than or equal" },
  { label: "±", latex: "\\pm", tip: "Plus or minus" },
  { label: "×", latex: "\\times", tip: "Multiply" },
  { label: "÷", latex: "\\div", tip: "Divide" },
  { label: "∂", latex: "\\partial", tip: "Partial derivative" },
  { label: "∇", latex: "\\nabla", tip: "Nabla" },
  { label: "[a b]", latex: "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}", tip: "Matrix" },
  { label: "vec", latex: "\\vec{v}", tip: "Vector" },
  { label: "dot", latex: "\\dot{x}", tip: "Derivative" },
  { label: "{", latex: "\\left( \\right)", tip: "Auto-sized parentheses" },
];

export function MathBlockView({
  node,
  updateAttributes,
  deleteNode,
  getPos,
  selected,
  editor,
}: NodeViewProps) {
  const { formula, caption } = node.attrs as {
    formula: string;
    caption: string;
  };
  const [isDialogOpen, setIsDialogOpen] = useState(!formula);
  const [showSettings, setShowSettings] = useState(false);
  const [localFormula, setLocalFormula] = useState(formula || "");
  const [error, setError] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const dialogPreviewRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isInsideLayoutColumn = isNodeViewInsideLayoutColumn(editor, getPos);

  // Sync from node attrs
  useEffect(() => {
    setLocalFormula(formula || "");
  }, [formula]);

  // Render KaTeX in the block preview (non-editing)
  useEffect(() => {
    if (!previewRef.current || isDialogOpen) return;
    if (!formula) {
      previewRef.current.innerHTML = "";
      return;
    }
    try {
      katex.render(formula, previewRef.current, SECURE_KATEX_BLOCK_OPTIONS);
      sanitizeKaTeXContainer(previewRef.current);
    } catch {
      // handled in dialog
    }
  }, [formula, isDialogOpen]);

  // Render KaTeX in dialog preview
  useEffect(() => {
    if (!dialogPreviewRef.current || !isDialogOpen) return;
    if (!localFormula) {
      dialogPreviewRef.current.innerHTML = "";
      setError(null);
      return;
    }
    try {
      katex.render(localFormula, dialogPreviewRef.current, SECURE_KATEX_BLOCK_OPTIONS);
      sanitizeKaTeXContainer(dialogPreviewRef.current);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid LaTeX");
    }
  }, [localFormula, isDialogOpen]);

  const handleApply = useCallback(() => {
    updateAttributes({ formula: localFormula });
    setIsDialogOpen(false);
  }, [localFormula, updateAttributes]);

  const handleOpenDialog = useCallback(() => {
    setLocalFormula(formula || "");
    setIsDialogOpen(true);
  }, [formula]);

  // Insert snippet at cursor position
  const insertSnippet = useCallback((latex: string) => {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const before = localFormula.slice(0, start);
    const after = localFormula.slice(end);
    const newFormula = before + latex + after;
    setLocalFormula(newFormula);
    // Move cursor after inserted text
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + latex.length;
      ta.setSelectionRange(pos, pos);
    });
  }, [localFormula]);

  const isReviewOnly = isEditorReviewOnly(editor);
  const isEditable = (editor?.isEditable ?? true) && !isReviewOnly;

  return (
    <BlockWrapper
      selected={selected}
      icon={<Sigma className="size-3.5 text-purple-500" />}
      label="Math equation"
      editable={isEditable}
      onDelete={deleteNode}
      showSettings={showSettings}
      onToggleSettings={() => setShowSettings(!showSettings)}
      captionValue={caption || ""}
      onCaptionChange={(val) => updateAttributes({ caption: val })}
      dataType="math-block"
      layout={node.attrs.layout}
      blockWidth={node.attrs.blockWidth}
      onLayoutChange={isInsideLayoutColumn ? undefined : (layout, blockWidth) => updateAttributes({ layout, blockWidth })}
      settingsPanel={
        isEditable ? (
          <div className="space-y-3">
            {/* Inline LaTeX editor in settings panel */}
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                LaTeX
              </label>
              <textarea
                ref={textareaRef}
                value={localFormula}
                onChange={(e) => {
                  setLocalFormula(e.target.value);
                  updateAttributes({ formula: e.target.value });
                }}
                placeholder="\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}"
                className="w-full min-h-[80px] rounded-md border bg-muted/40 p-2 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/30"
                spellCheck={false}
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            {/* Quick snippets */}
            <div className="flex flex-wrap gap-1">
              {LATEX_SNIPPETS.slice(0, 12).map((s) => (
                <button
                  key={s.latex}
                  type="button"
                  title={s.tip}
                  className="inline-flex items-center justify-center h-6 min-w-[24px] px-1 rounded border text-xs font-mono bg-muted/50 hover:bg-accent transition-colors"
                  onClick={() => insertSnippet(s.latex)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            {/* Open full dialog for advanced editing */}
            <button
              type="button"
              className="w-full h-7 rounded-md border text-xs font-medium hover:bg-accent transition-colors text-muted-foreground"
              onClick={handleOpenDialog}
            >
              Open advanced editor
            </button>
          </div>
        ) : undefined
      }
    >
      {/* Block preview content */}
      <div contentEditable={false} className="select-none">
        <div
          className="p-4 cursor-pointer hover:bg-muted/20 transition-colors rounded-b-xl"
          onClick={isEditable ? handleOpenDialog : undefined}
        >
          {formula ? (
            <div
              ref={previewRef}
              className="flex items-center justify-center overflow-x-auto"
            />
          ) : (
            <p className="text-sm text-muted-foreground text-center italic">
              Click to add an equation
            </p>
          )}
        </div>
      </div>

      {/* LaTeX Editor Dialog */}
      {isEditable && (
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) {
            // Discard changes when closing without apply
            setLocalFormula(formula || "");
          }
          setIsDialogOpen(open);
        }}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto" onPointerDownOutside={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base">
                <Sigma className="size-4 text-purple-500" />
                LaTeX editor
              </DialogTitle>
            </DialogHeader>

            {/* Quick format buttons */}
            <div className="flex flex-wrap gap-1 pt-1">
              {LATEX_SNIPPETS.map((s) => (
                <button
                  key={s.latex}
                  type="button"
                  title={s.tip}
                  className="inline-flex items-center justify-center h-7 min-w-[28px] px-1.5 rounded border text-xs font-mono bg-muted/50 hover:bg-accent transition-colors"
                  onClick={() => insertSnippet(s.latex)}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Textarea */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                LaTeX
              </label>
              <textarea
                ref={textareaRef}
                value={localFormula}
                onChange={(e) => setLocalFormula(e.target.value)}
                placeholder="\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}"
                className="w-full min-h-[100px] rounded-lg border bg-muted/40 p-3 font-mono text-sm leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
                spellCheck={false}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleApply();
                  }
                  e.stopPropagation();
                }}
              />
            </div>

            {/* Preview */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Preview
              </label>
              <div
                ref={dialogPreviewRef}
                className="min-h-[60px] rounded-lg border bg-background p-3 flex items-center justify-center overflow-x-auto"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLocalFormula(formula || "");
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                disabled={!localFormula.trim()}
              >
                Apply (Ctrl+Enter)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </BlockWrapper>
  );
}
