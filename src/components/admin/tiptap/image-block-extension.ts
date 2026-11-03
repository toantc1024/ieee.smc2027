import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ImageBlockView } from "./image-block-view";
import {
  type BlockAlignment,
  type BlockLayoutMode,
  normalizeAlignment,
  normalizeLayoutMode,
} from "./block-layout";

export interface ImageBlockAttrs {
  src: string;
  alt?: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
  alignment?: BlockAlignment;
  layoutMode?: BlockLayoutMode;
  objectFit?: "cover" | "contain";
  rounded?: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imageBlock: {
      insertImageBlock: (attrs?: Partial<ImageBlockAttrs>) => ReturnType;
    };
  }
}

export const ImageBlockExtension = Node.create({
  name: "imageBlock",
  group: "block",
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
      credit: { default: "" },
      width: { default: 100 },
      height: { default: 0 },
      alignment: { default: "center" },
      layoutMode: { default: "inline" },
      objectFit: { default: "cover" },
      rounded: { default: true },
    };
  },

  parseHTML() {
    return [
      {
        tag: "figure[data-image-block]",
        getAttrs: (el) => {
          const dom = el as HTMLElement;
          const img = dom.querySelector("img");
          return {
            src: dom.getAttribute("data-src") || img?.getAttribute("src") || "",
            alt: dom.getAttribute("data-alt") || img?.getAttribute("alt") || "",
            caption: dom.getAttribute("data-caption") || "",
            credit: dom.getAttribute("data-credit") || "",
            width: Number(dom.getAttribute("data-width") || 100),
            height: Number(dom.getAttribute("data-height") || 0),
            alignment: normalizeAlignment(dom.getAttribute("data-align")),
            layoutMode: normalizeLayoutMode(dom.getAttribute("data-layout")),
            objectFit:
              (dom.getAttribute("data-fit") as "cover" | "contain") || "cover",
            rounded: dom.getAttribute("data-rounded") !== "false",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const src = HTMLAttributes.src || "";
    const alt = HTMLAttributes.alt || "";
    const caption = HTMLAttributes.caption || "";
    const credit = HTMLAttributes.credit || "";
    const width = Number(HTMLAttributes.width) || 100;
    const height = Number(HTMLAttributes.height) || 0;
    const alignment = normalizeAlignment(HTMLAttributes.alignment);
    const layoutMode = normalizeLayoutMode(HTMLAttributes.layoutMode);
    const objectFit = HTMLAttributes.objectFit || "cover";
    const rounded = HTMLAttributes.rounded !== false;

    const styleParts = [`width:${width}%`, "max-width:100%"];
    if (layoutMode === "wrap-left") {
      styleParts.push("float:left", "margin:0 1.25rem 0.75rem 0");
    } else if (layoutMode === "wrap-right") {
      styleParts.push("float:right", "margin:0 0 0.75rem 1.25rem");
    } else if (alignment === "center") {
      styleParts.push("margin:1rem auto");
    } else if (alignment === "right") {
      styleParts.push("margin:1rem 0 1rem auto");
    } else {
      styleParts.push("margin:1rem auto 1rem 0");
    }

    const imgStyle = [
      "width:100%",
      height > 0 ? `height:${height}px` : "height:auto",
      `object-fit:${objectFit}`,
      rounded ? "border-radius:0.75rem" : "",
      "display:block",
    ]
      .filter(Boolean)
      .join(";");

    const children: any[] = [["img", { src, alt, style: imgStyle }]];

    if (caption || credit) {
      children.push([
        "figcaption",
        {
          style:
            "font-size:0.8125rem;color:#64748b;margin-top:0.5rem;text-align:center;",
        },
        caption ? `${caption}${credit ? ` (${credit})` : ""}` : credit,
      ]);
    }

    return [
      "figure",
      mergeAttributes({
        "data-image-block": "true",
        "data-src": src,
        "data-alt": alt,
        "data-caption": caption,
        "data-credit": credit,
        "data-width": String(width),
        "data-height": String(height),
        "data-align": alignment,
        "data-layout": layoutMode,
        "data-fit": objectFit,
        "data-rounded": String(rounded),
        style: styleParts.join(";"),
      }),
      ...children,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockView);
  },

  addCommands() {
    return {
      insertImageBlock:
        (attrs = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: attrs.src || "",
              alt: attrs.alt || "",
              caption: attrs.caption || "",
              credit: attrs.credit || "",
              width: attrs.width ?? 100,
              height: attrs.height ?? 0,
              alignment: attrs.alignment || "center",
              layoutMode: attrs.layoutMode || "inline",
              objectFit: attrs.objectFit || "cover",
              rounded: attrs.rounded ?? true,
            },
          });
        },
    };
  },
});
