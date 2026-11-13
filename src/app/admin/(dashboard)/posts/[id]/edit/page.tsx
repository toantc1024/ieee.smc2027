"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PostEditorForm } from "@/components/admin/posts/PostEditorForm";

export default function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [post, setPost] = useState<{
    id: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage: string | null;
    category: string;
    status: "DRAFT" | "PUBLISHED";
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/posts/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.post) {
          setPost({
            id: data.post.id,
            title: data.post.title || "",
            slug: data.post.slug || "",
            summary: data.post.summary || "",
            content: data.post.content || "",
            coverImage: data.post.coverImage || null,
            category: data.post.category || "Announcements",
            status: data.post.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
          });
        } else {
          toast.error(data.error || "Post not found");
        }
      })
      .catch((err) => {
        toast.error(err.message || "Failed to load post data");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex flex-col overflow-hidden bg-background">
        <div className="h-14 min-h-[56px] border-b border-border/80 px-4 flex items-center justify-between bg-white dark:bg-card">
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-7 w-72 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 rounded-lg" />
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[380px] border-r border-border/80 p-4 space-y-4 bg-white dark:bg-card">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
          </div>
          <div className="flex-1 bg-slate-100/70 dark:bg-[#070b14] p-8 flex justify-center overflow-y-auto">
            <Skeleton className="w-full max-w-[850px] h-[900px] rounded-xl bg-white" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-background">
        <p className="text-base font-semibold text-slate-800 mb-2">
          Post not found
        </p>
        <p className="text-sm text-slate-500 mb-4">
          The requested article does not exist or may have been deleted.
        </p>
        <Button variant="outline" size="sm" asChild className="h-9 px-4 text-xs sm:text-sm font-semibold rounded-lg">
          <Link href="/admin/posts">
            <ArrowLeft className="size-4 mr-1.5" />
            Back to Posts
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <PostEditorForm
      initialData={post}
      isEditMode={true}
      backUrl={`/admin/posts/${id}`}
    />
  );
}
