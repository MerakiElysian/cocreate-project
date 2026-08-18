"use client";

import { useMemo, useState } from "react";
import PostGrid from "./PostGrid";
import ExploreFilters, { FilterKey } from "./ExploreFilters";
import { Post } from "./types";

const MAX_RECENT = 8;

interface ExploreContentProps {
  trendingPosts: Post[];
  newPosts: Post[];
}

export default function ExploreContent({ trendingPosts, newPosts }: ExploreContentProps) {
  const allPosts = useMemo(() => [...trendingPosts, ...newPosts], [trendingPosts, newPosts]);
  const trendingIds = useMemo(() => new Set(trendingPosts.map((p) => p.id)), [trendingPosts]);
  const newIds = useMemo(() => new Set(newPosts.map((p) => p.id)), [newPosts]);

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  // Most-recently-opened post ids, newest first — populated purely from
  // what the person actually clicks into, not a canned list.
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const handlePostOpen = (post: Post) => {
    setRecentIds((prev) => [post.id, ...prev.filter((id) => id !== post.id)].slice(0, MAX_RECENT));
  };

  const filteredPosts = useMemo(() => {
    switch (activeFilter) {
      case "all":
        return allPosts;
      case "trending":
        return allPosts.filter((p) => trendingIds.has(p.id));
      case "new":
        return allPosts.filter((p) => newIds.has(p.id));
      case "recent": {
        const byId = new Map(allPosts.map((p) => [p.id, p]));
        return recentIds.map((id) => byId.get(id)).filter((p): p is Post => !!p);
      }
      default:
        // Anything else is a role-title chip — show projects still
        // actively hiring for that exact role.
        return allPosts.filter((p) => p.roles.some((r) => r.title === activeFilter && r.total > r.filled));
    }
  }, [activeFilter, allPosts, trendingIds, newIds, recentIds]);

  const emptyMessage =
    activeFilter === "recent"
      ? { title: "Nothing viewed yet", body: "Open a project and it'll show up here." }
      : { title: "No projects match this filter", body: "Try a different filter or check back soon." };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ExploreFilters
        posts={allPosts}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        hasRecent={recentIds.length > 0}
      />
      <div className="min-h-0 flex-1 overflow-hidden">
        {filteredPosts.length > 0 ? (
          <PostGrid posts={filteredPosts} onPostOpen={handlePostOpen} />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{emptyMessage.title}</p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{emptyMessage.body}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}