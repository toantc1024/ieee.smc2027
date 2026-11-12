import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ChartBlockView } from "./chart-block-view";
import { blockLayoutAttributes, renderBlockLayoutAttrs } from "./block-layout";
import { publicChart } from "./public-chart";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    chartBlock: {
      setChartBlock: (attrs?: {
        chartType?: string;
        title?: string;
        description?: string;
        data?: string;
        config?: string;
        height?: number;
      }) => ReturnType;
    };
  }
}

const DEFAULT_DATA = JSON.stringify([
  { name: "T1", value: 4000, value2: 2400 },
  { name: "T2", value: 3000, value2: 1398 },
  { name: "T3", value: 2000, value2: 9800 },
  { name: "T4", value: 2780, value2: 3908 },
  { name: "T5", value: 1890, value2: 4800 },
  { name: "T6", value: 2390, value2: 3800 },
]);

const DEFAULT_CONFIG = JSON.stringify({
  colors: ["#4285f4", "#34a853", "#fbbc04", "#ea4335", "#8b5cf6"],
});

function decodeB64(b64: string): string {
  try {
    if (typeof atob === "function") {
      return decodeURIComponent(escape(atob(b64)));
    }
    return Buffer.from(b64, "base64").toString("utf-8");
  } catch {
    return "";
  }
}

export const ChartBlock = Node.create({
  name: "chartBlock",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      chartType: {
        default: "bar",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-chart-type") || "bar",
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-chart-type": attributes.chartType as string,
        }),
      },
      title: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-title") || "",
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.title) return {};
          return { "data-title": attributes.title as string };
        },
      },
      description: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-description") || "",
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.description) return {};
          return { "data-description": attributes.description as string };
        },
      },
      data: {
        default: DEFAULT_DATA,
        parseHTML: (element: HTMLElement) => {
          const b64 = element.getAttribute("data-data-b64");
          if (b64) return decodeB64(b64);
          return element.getAttribute("data-data") || DEFAULT_DATA;
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-data": attributes.data as string,
        }),
      },
      config: {
        default: DEFAULT_CONFIG,
        parseHTML: (element: HTMLElement) => {
          const b64 = element.getAttribute("data-config-b64");
          if (b64) return decodeB64(b64);
          return element.getAttribute("data-config") || DEFAULT_CONFIG;
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-config": attributes.config as string,
        }),
      },
      height: {
        default: 300,
        parseHTML: (element: HTMLElement) => {
          const h = element.getAttribute("data-height");
          return h ? parseInt(h, 10) : 300;
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-height": attributes.height,
        }),
      },
      caption: {
        default: "",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-caption") || "",
        renderHTML: (attributes: Record<string, unknown>) => {
          if (!attributes.caption) return {};
          return { "data-caption": attributes.caption as string };
        },
      },
      ...blockLayoutAttributes,
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chart-block"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { layout, blockWidth, ...rest } = HTMLAttributes;
    const layoutAttrs = renderBlockLayoutAttrs({ layout, blockWidth });
    return [
      "div",
      mergeAttributes(rest, { "data-type": "chart-block" }, layoutAttrs),
      ...(node.attrs.title ? [["h3", {}, String(node.attrs.title)] as [string, Record<string, string>, string]] : []),
      ...(node.attrs.description ? [["p", {}, String(node.attrs.description)] as [string, Record<string, string>, string]] : []),
      publicChart(node.attrs.data, node.attrs.chartType, node.attrs.config),
      ...(node.attrs.caption ? [["p", { style: "text-align:center;font-size:.875rem;color:#64748b" }, String(node.attrs.caption)] as [string, Record<string, string>, string]] : []),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ChartBlockView, {
      stopEvent: ({ event }) => {
        const target = event.target as HTMLElement;
        if (
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target.closest("button")
        ) {
          return true;
        }
        return false;
      },
    });
  },

  addCommands() {
    return {
      setChartBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              chartType: attrs?.chartType ?? "bar",
              title: attrs?.title ?? "",
              description: attrs?.description ?? "",
              data: attrs?.data ?? DEFAULT_DATA,
              config: attrs?.config ?? DEFAULT_CONFIG,
              height: attrs?.height ?? 300,
            },
          });
        },
    };
  },

});
