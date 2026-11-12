import React from "react";

export interface PageBlock<P = Record<string, any>> {
  id: string;
  type: string;
  props: P;
  hidden?: boolean;
  styles?: Record<string, unknown>;
  children?: PageBlock[];
}

export interface PageRootData {
  title: string;
  slug: string;
  parentId?: string | null;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PageBuilderData {
  root: PageRootData;
  content: PageBlock[];
  zones?: Record<string, PageBlock[]>;
}

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type SidebarTab = "library" | "layers" | "templates" | "settings";
export type InspectorTab = "content" | "styles" | "json";
export type StudioActiveView = "content" | "info" | "history";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "color"
  | "image"
  | "file"
  | "richtext"
  | "object"
  | "array";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldDefinition {
  type: FieldType;
  label: string;
  description?: string;
  placeholder?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  arrayFields?: Record<string, FieldDefinition>;
  itemFields?: Record<string, FieldDefinition>;
  defaultItem?: any;
  fields?: Record<string, FieldDefinition>;
  group?: "Content" | "Media" | "Links" | "Layout";
  itemLabel?: string;
  itemLabelKey?: string;
  accept?: string;
}

export interface ComponentDefinition<P = any> {
  type: string;
  label: string;
  category:
    | "basic"
    | "hero"
    | "conference"
    | "academic"
    | "organization"
    | "registration"
    | "venue"
    | "program"
    | "partners"
    | "hospitality"
    | "contact"
    | "support"
    | "history"
    | "media"
    | "layout";
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  fields: Record<string, FieldDefinition>;
  defaultProps: P;
  render: React.ComponentType<P>;
}
