"use client";

/* TipTap node attributes are external state and must synchronize with the editing draft. */
/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import type { NodeViewProps } from "@tiptap/react";
import { Code, Eye, Maximize2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BlockWrapper } from "./block-wrapper";
import { isEditorReviewOnly, isNodeViewInsideLayoutColumn } from "./node-view-utils";
import { CodeEditorDialog } from "./code-editor-dialog";

type TabKey = "html" | "css" | "js" | "preview";

const TAB_CONFIG: { key: TabKey; label: string; color: string }[] = [
  { key: "html", label: "HTML", color: "text-orange-500" },
  { key: "css", label: "CSS", color: "text-blue-500" },
  { key: "js", label: "JS", color: "text-yellow-500" },
  { key: "preview", label: "Preview", color: "text-foreground" },
];

export function EmbedBlockView({
  node,
  updateAttributes,
  deleteNode,
  getPos,
  selected,
  editor,
}: NodeViewProps) {
  const { code, html, css, js, height, fullHeight, caption } = node.attrs as {
    code: string;
    html: string;
    css: string;
    js: string;
    height: number;
    fullHeight: boolean;
    caption: string;
  };

  const [showSettings, setShowSettings] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [autoMeasuredHeight, setAutoMeasuredHeight] = useState<number | null>(null);

  // Backward compat: if legacy `code` has content and html/css/js are empty, migrate
  const effectiveHtml = html || code || "";
  const effectiveCss = css || "";
  const effectiveJs = js || "";

  const hasContent = effectiveHtml || effectiveCss || effectiveJs;
  const [activeTab, setActiveTab] = useState<TabKey>(
    hasContent ? "preview" : "html",
  );
  const [localHtml, setLocalHtml] = useState(effectiveHtml);
  const [localCss, setLocalCss] = useState(effectiveCss);
  const [localJs, setLocalJs] = useState(effectiveJs);
  const [autoRun, setAutoRun] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync from node attrs
  useEffect(() => {
    setLocalHtml(html || code || "");
    setLocalCss(css || "");
    setLocalJs(js || "");
  }, [html, css, js, code]);

  const handleApply = useCallback(() => {
    updateAttributes({
      html: localHtml,
      css: localCss,
      js: localJs,
      code: "", // Clear legacy field
    });
    setActiveTab("preview");
  }, [localHtml, localCss, localJs, updateAttributes]);

  // Auto-apply when switching to preview with autoRun
  const handleTabChange = useCallback(
    (tab: TabKey) => {
      if (tab === "preview" && autoRun) {
        updateAttributes({
          html: localHtml,
          css: localCss,
          js: localJs,
          code: "",
        });
      }
      setActiveTab(tab);
    },
    [autoRun, localHtml, localCss, localJs, updateAttributes],
  );

  // Build sandboxed srcdoc
  const isFullHeight = fullHeight !== false;
  const srcdoc = useMemo(() => {
    const h = activeTab === "preview" ? (html || code || "") : localHtml;
    const c = activeTab === "preview" ? (css || "") : localCss;
    const j = activeTab === "preview" ? (js || "") : localJs;
    if (!h && !c && !j) return "";
    const bodyOverflow = isFullHeight ? "overflow-y:hidden !important;overflow-x:auto;" : "overflow:auto;";
    const resizeScript = isFullHeight
      ? `<script>(function(){
           function send(){
             try {
               var b = document.body;
               var d = document.documentElement;
               if (!b && !d) return;
               var hh = Math.max(
                 b ? b.scrollHeight || 0 : 0, b ? b.offsetHeight || 0 : 0,
                 d ? d.scrollHeight || 0 : 0, d ? d.offsetHeight || 0 : 0
               );
               if (b && b.children) {
                 for (var i = 0; i < b.children.length; i++) {
                   var el = b.children[i];
                   if (el && el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE' && el.getBoundingClientRect) {
                     var rect = el.getBoundingClientRect();
                     var bottom = (rect.bottom || 0) + (window.pageYOffset || (d ? d.scrollTop || 0 : 0));
                     if (bottom > hh) hh = Math.ceil(bottom);
                   }
                 }
               }
               if (hh > 0) parent.postMessage({type:'embed-resize',height:Math.ceil(hh)},'*');
             } catch (err) {}
           }
           if (typeof ResizeObserver !== 'undefined') {
             var ro = new ResizeObserver(send);
             if (document.body) ro.observe(document.body);
             if (document.documentElement) ro.observe(document.documentElement);
           }
           window.addEventListener('load', send);
           window.addEventListener('resize', send);
           if (document.fonts && document.fonts.ready) {
             document.fonts.ready.then(send);
           }
           [50, 150, 300, 600, 1200, 2500].forEach(function(t) { setTimeout(send, t); });
         })();<\/script>`
      : "";
    return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>*{margin:0;padding:0;box-sizing:border-box}html,body{font-family:system-ui,sans-serif;${bodyOverflow}}${c}</style></head><body>${h}${j ? `<script>${j}<\/script>` : ""}${resizeScript}</body></html>`;
  }, [activeTab, html, css, js, code, localHtml, localCss, localJs, isFullHeight]);

  // Listen for resize messages when in fullHeight mode
  useEffect(() => {
    if (!isFullHeight) {
      setAutoMeasuredHeight(null);
      return;
    }
    const onMsg = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (
        e.data &&
        typeof e.data === "object" &&
        e.data.type === "embed-resize" &&
        typeof e.data.height === "number" &&
        Number.isFinite(e.data.height) &&
        e.data.height > 0 &&
        e.data.height <= 50000
      ) {
        setAutoMeasuredHeight(Math.round(e.data.height));
      }
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [isFullHeight, srcdoc]);

  const isReviewOnly = isEditorReviewOnly(editor);
  const isEditable = (editor?.isEditable ?? true) && !isReviewOnly;
  const isInsideLayoutColumn = isNodeViewInsideLayoutColumn(editor, getPos);

  // In readonly mode, always show preview
  const effectiveTab = isEditable ? activeTab : "preview";

  const currentTextarea =
    isEditable && effectiveTab === "html"
      ? { value: localHtml, setter: setLocalHtml, placeholder: "Enter HTML..." }
      : isEditable && effectiveTab === "css"
        ? { value: localCss, setter: setLocalCss, placeholder: "Enter CSS..." }
        : isEditable && effectiveTab === "js"
          ? { value: localJs, setter: setLocalJs, placeholder: "Enter JavaScript..." }
          : null;

  // Tab bar as header action (only in edit mode)
  const tabBar = isEditable ? (
    <div
      className="flex items-center gap-0.5 rounded-md bg-muted p-0.5"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {TAB_CONFIG.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={cn(
            "rounded px-2 py-0.5 text-xs font-medium transition-colors",
            activeTab === tab.key
              ? `bg-background shadow-sm ${tab.color}`
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleTabChange(tab.key);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          disabled={tab.key === "preview" && !localHtml && !localCss && !localJs}
        >
          {tab.key === "preview" ? (
            <Eye className="size-3 inline mr-0.5" />
          ) : null}
          {tab.label}
        </button>
      ))}
      <div className="w-px h-3.5 bg-border mx-0.5" />
      <button
        type="button"
        className="rounded px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-background transition-colors flex items-center gap-1"
        onClick={(e) => {
          e.stopPropagation();
          setDialogOpen(true);
        }}
        title="Open code editor"
      >
        <Maximize2 className="size-3" />
        <span>Open editor</span>
      </button>
    </div>
  ) : null;

  return (
    <BlockWrapper
      selected={selected}
      icon={<Code className="size-3.5 text-emerald-500" />}
      label="Code Embed"
      editable={isEditable}
      onDelete={deleteNode}
      showSettings={showSettings}
      onToggleSettings={() => setShowSettings(!showSettings)}
      captionValue={caption || ""}
      onCaptionChange={(val) => updateAttributes({ caption: val })}
      dataType="embed-block"
      headerActions={tabBar}
      layout={node.attrs.layout}
      blockWidth={node.attrs.blockWidth}
      blockHeight={node.attrs.blockHeight}
      onLayoutChange={isInsideLayoutColumn ? undefined : (l, w) => updateAttributes({ layout: l, blockWidth: w })}
      onHeightChange={isInsideLayoutColumn ? undefined : (h) => {
        const parsedHeight = h ? parseInt(h, 10) : NaN;
        if (Number.isFinite(parsedHeight)) {
          updateAttributes({ height: parsedHeight, blockHeight: h });
        }
      }}
      settingsPanel={
        <div className="space-y-2 px-1 py-1">
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={!!fullHeight}
              onChange={(e) => updateAttributes({ fullHeight: e.target.checked })}
              className="rounded"
            />
            <span>Fit height to content (no scrolling)</span>
          </label>
          {!fullHeight && (
            <p className="text-[11px] text-muted-foreground pl-6">
              The frame uses a fixed height of {height}px and scrolls when needed.
            </p>
          )}
        </div>
      }
    >
      {/* Content */}
      <div contentEditable={false} className="select-none px-4 pt-3 pb-1">
        {currentTextarea ? (
          <div className="p-3 space-y-2">
            <textarea
              value={currentTextarea.value}
              onChange={(e) => currentTextarea.setter(e.target.value)}
              placeholder={currentTextarea.placeholder}
              className="w-full min-h-[140px] max-h-[360px] overflow-x-auto overflow-y-auto whitespace-pre rounded-lg border bg-muted/40 p-3 font-mono text-xs leading-relaxed resize-y focus:outline-none focus:ring-1 focus:ring-primary/30 focus:border-primary/50"
              spellCheck={false}
              onKeyDown={(e) => e.stopPropagation()}
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={autoRun}
                  onChange={(e) => setAutoRun(e.target.checked)}
                  className="rounded"
                />
                Auto run
              </label>
              <Button
                type="button"
                size="sm"
                onClick={handleApply}
                disabled={!localHtml.trim() && !localCss.trim() && !localJs.trim()}
                className="h-7 text-xs"
              >
                Apply and preview
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="relative overflow-hidden rounded-b-xl"
            style={{
              height: isFullHeight && autoMeasuredHeight
                ? `${autoMeasuredHeight}px`
                : `${height || 400}px`,
              minHeight: "100px",
            }}
          >
            {srcdoc ? (
              <iframe
                ref={iframeRef}
                srcDoc={srcdoc}
                sandbox="allow-scripts allow-popups allow-forms"
                scrolling={isFullHeight ? "no" : "auto"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
                title="Code Embed preview"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                No embedded content
              </div>
            )}
          </div>
        )}
      </div>

      <CodeEditorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialHtml={localHtml}
        initialCss={localCss}
        initialJs={localJs}
        initialTab={activeTab === "preview" ? "html" : activeTab}
        onSave={(code) => {
          setLocalHtml(code.html);
          setLocalCss(code.css);
          setLocalJs(code.js);
          updateAttributes({
            html: code.html,
            css: code.css,
            js: code.js,
            code: "",
          });
        }}
        title="Edit embed code"
      />
    </BlockWrapper>
  );
}
