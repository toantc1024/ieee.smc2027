import React from "react";

export interface PageBlock<P = Record<string, any>> {
  id: string;
  type: string;
  props: P;
  hidden?: boolean;
}

export interface PageRootData {
  title: string;
  slug: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PageBuilderData {
  root: PageRootData;
  content: PageBlock[];
}

export type ViewportMode = "desktop" | "tablet" | "mobile";
export type SidebarTab = "library" | "layers" | "settings";
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
  | "array";

export interface FieldOption {
  label: string;
  value: string | number;
}

export interface FieldDefinition {
  type: FieldType;
  label: string;
  description?: string;
  options?: FieldOption[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  arrayFields?: Record<string, FieldDefinition>;
}

export interface ComponentDefinition<P = any> {
  type: string;
  label: string;
  category:
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
