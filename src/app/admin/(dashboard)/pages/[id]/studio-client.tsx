"use client";

import React, { useEffect, useState } from "react";
import { BuilderLayout, useBuilderStore } from "@/modules/website-builder";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function StudioClient({ pageId }: { pageId: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initPage = useBuilderStore((s) => s.initPage);

  useEffect(() => {
    let mounted = true;
    async function loadPage() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/pages/${pageId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load page data");

        if (mounted && data.page) {
          initPage({
            id: data.page.id,
            title: data.page.title,
            slug: data.page.slug,
            parentId: data.page.parentId,
            version: data.page.version,
            isPublished: data.page.isPublished,
            content: data.page.content,
            blocks: data.page.blocks,
          });
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Failed to initialize visual studio");
          toast.error(err.message || "Failed to initialize visual studio");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPage();
    return () => {
      mounted = false;
    };
  }, [pageId, initPage]);

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading Page Studio"
        className="h-screen w-full flex flex-col bg-slate-50/70 overflow-hidden"
      >
        <div className="h-14 shrink-0 border-b border-slate-200/75 bg-white px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-24 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
        <div className="h-11 shrink-0 border-b border-slate-200/75 bg-white/80 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-24 rounded-md" />
            <Skeleton className="h-7 w-28 rounded-md" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-20 rounded-md" />
            <Skeleton className="h-7 w-20 rounded-md" />
          </div>
        </div>
        <div className="flex-1 min-h-0 grid grid-cols-[280px_1fr_340px]">
          <div className="border-r border-slate-200/75 bg-white p-4 space-y-3">
            <Skeleton className="h-9 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-2 pt-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
          <div className="p-8 flex flex-col items-center gap-5 overflow-hidden">
            <Skeleton className="h-56 w-full max-w-4xl rounded-2xl" />
            <Skeleton className="h-40 w-full max-w-4xl rounded-2xl" />
            <Skeleton className="h-48 w-full max-w-4xl rounded-2xl" />
          </div>
          <div className="border-l border-slate-200/75 bg-white p-4 space-y-4">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full min-h-[420px] w-full flex flex-col items-center justify-center bg-slate-50 p-6 text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Page Load Error</h3>
        <p className="text-sm text-slate-500 max-w-md">{error}</p>
        <Link href="/admin/pages">
          <Button variant="outline" size="sm">
            Back to Pages List
          </Button>
        </Link>
      </div>
    );
  }

  return <BuilderLayout />;
}
