"use client";

import React from "react";
import Link from "next/link";
import { Flame, Eye, ExternalLink, FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostEngagementTrendingUnitDto } from "../../types";

interface UnitPostTrendingCardProps {
  trendingData: PostEngagementTrendingUnitDto | null;
  isLoading: boolean;
}

export function UnitPostTrendingCard({
  trendingData,
  isLoading,
}: UnitPostTrendingCardProps) {
  if (isLoading) {
    return <Skeleton className="h-[360px] rounded-2xl" />;
  }

  const posts = trendingData?.trendingPosts ?? [];
  const totalViews = trendingData?.totalViewCount ?? 0;

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
      <CardHeader className="pb-3 pt-4 sm:pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 shrink-0">
              <Flame className="size-4" />
            </div>
            <span>Trending Posts</span>
          </CardTitle>
          <Badge variant="outline" className="text-[11px] font-semibold bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-300 flex items-center gap-1">
            <Eye className="size-3 text-red-600" />
            <span>{totalViews.toLocaleString()} views</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-center text-muted-foreground">
            <FileText className="size-8 stroke-1 mb-2 text-muted-foreground/50" />
            <p className="text-xs">No trending posts in this period</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {posts.map((post, index) => (
              <div
                key={post.postId || index}
                className="py-3 flex items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-xl transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex items-center justify-center size-6 rounded-lg text-xs font-bold shrink-0 ${
                      index === 0
                        ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                        : index === 1
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : index === 2
                        ? "bg-blue-500/20 text-blue-600 dark:text-blue-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    #{index + 1}
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={`/admin/posts/${post.postId}`}
                      className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate block max-w-[240px] sm:max-w-[320px]"
                      title={post.postTitle}
                    >
                      {post.postTitle || "Untitled Post"}
                    </Link>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                      /{post.postSlug || "post"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-foreground flex items-center gap-1 justify-end">
                      <Eye className="size-3 text-muted-foreground" />
                      {post.viewCount?.toLocaleString() ?? 0}
                    </div>
                    <span className="text-[10px] text-muted-foreground">views</span>
                  </div>

                  <Link
                    href={`/admin/posts/${post.postId}`}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    title="View details"
                  >
                    <ExternalLink className="size-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
