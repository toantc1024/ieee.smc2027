"use client";

import React, { useEffect, useState } from "react";
import { BuilderLayout, useBuilderStore } from "@/modules/website-builder";
import { toast } from "sonner";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
        const res = await fetch(`/api/admin/pages/${pageId}`);
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
      <div className="h-full min-h-[420px] w-full flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-semibold text-slate-500">
          Loading Page Studio...
        </p>
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
