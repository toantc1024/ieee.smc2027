"use client";

import React from "react";
import { PostEditorForm } from "@/components/admin/posts/PostEditorForm";

export default function CreatePostPage() {
  return (
    <PostEditorForm
      isEditMode={false}
      backUrl="/admin/posts"
    />
  );
}
