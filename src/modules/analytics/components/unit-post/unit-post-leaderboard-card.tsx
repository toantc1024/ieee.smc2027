"use client";

import React from "react";
import { Trophy, Award, User } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { PostCollaborationLeaderboardUnitDto } from "../../types";

interface UnitPostLeaderboardCardProps {
  leaderboardData: PostCollaborationLeaderboardUnitDto | null;
  isLoading: boolean;
}

const rankBadges = [
  { icon: <Trophy className="size-4 text-amber-500" />, bg: "bg-amber-500/10 border-amber-500/30 text-amber-600" },
  { icon: <Award className="size-4 text-slate-400" />, bg: "bg-slate-500/10 border-slate-500/30 text-slate-600" },
  { icon: <Award className="size-4 text-amber-700" />, bg: "bg-amber-700/10 border-amber-700/30 text-amber-800" },
];

export function UnitPostLeaderboardCard({
  leaderboardData,
  isLoading,
}: UnitPostLeaderboardCardProps) {
  if (isLoading) {
    return <Skeleton className="h-[360px] rounded-2xl" />;
  }

  const authors = leaderboardData?.leaderboard ?? [];

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-2xs flex flex-col justify-between">
      <CardHeader className="pb-3 pt-4 sm:pt-5">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2 text-foreground">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
              <Trophy className="size-4" />
            </div>
            <span>Author Leaderboard</span>
          </CardTitle>
          <Badge variant="outline" className="text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/40 border-blue-200/60 dark:border-blue-800/40 text-blue-600 dark:text-blue-400">
            Top {authors.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex-1">
        {authors.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[240px] text-center text-muted-foreground">
            <User className="size-8 stroke-1 mb-2 text-muted-foreground/50" />
            <p className="text-xs">No author records for this timeframe</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {authors.map((author, index) => {
              const initials = author.authorName
                ? author.authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                : "AU";

              const isTop3 = index < 3;
              const rankInfo = isTop3 ? rankBadges[index] : null;

              return (
                <div
                  key={author.authorId || index}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-muted/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center size-6 font-bold text-xs">
                      {rankInfo ? (
                        <div className={`p-1 rounded-full border ${rankInfo.bg}`}>
                          {rankInfo.icon}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">{index + 1}</span>
                      )}
                    </div>

                    <Avatar className="size-9 border border-border/60">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate flex items-center gap-1.5">
                        {author.authorName || "Anonymous Author"}
                        {index === 0 && (
                          <Award className="size-3 text-amber-500 fill-amber-500 inline" />
                        )}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {author.ownedPostCount} lead · {author.collaboratedPostCount} co-authored
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-foreground">
                      {author.ownedPostCount + author.collaboratedPostCount}
                    </div>
                    <span className="text-[10px] text-muted-foreground">total posts</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
