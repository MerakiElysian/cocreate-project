"use client";

import { useEffect, useMemo, useState } from "react";
import PostGrid from "./PostGrid";
import ExploreFilters, { FilterKey } from "./ExploreFilters";
import { Post } from "./types";

const MAX_RECENT = 8;

interface ExploreContentProps {
  trendingPosts: Post[];
  newPosts: Post[];
}

function mapProjectToPost(project: any): Post {
  return {
    id: project.id,
    title: project.title,
    status:
      project.status === "ACTIVE"
        ? "Recruiting"
        : project.status === "COMPLETED"
        ? "Closed"
        : "In Progress",
    companyName: project.owner?.name ? `${project.owner.name}'s Studio` : "CoCreate Studio",
    category: project.category || "Development",
    authorName: project.owner?.name || "Anonymous",
    postedAgo: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "Just now",
    description: project.description,
    tags: project.tags || [],
    roles: (project.roles || []).map((r: any) => ({
      title: r.title,
      compType: r.contractType || "Equity",
      compValue: r.compensation || "Flexible",
      employment: r.contractType || "Full-time",
      filled: r.filledSpots || 0,
      total: r.totalSpots || 1,
      description: `Role for ${r.title}`,
      requirements: [],
    })),
    team: (project.collaborators || []).map((c: any) => ({
      initials: (c.user?.name || "U").substring(0, 2).toUpperCase(),
      name: c.user?.name || "Member",
      role: c.role || "Collaborator",
    })),
    location: project.workType || "Remote",
    employment: "Flexible",
  };
}

export default function ExploreContent({
  trendingPosts: initialTrending,
  newPosts: initialNew,
}: ExploreContentProps) {
  const [apiPosts, setApiPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchApiProjects = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/projects`, { credentials: "include" });
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.items)) {
            const mapped = json.data.items.map(mapProjectToPost);
            if (mapped.length > 0) {
              setApiPosts(mapped);
            }
          }
        }
      } catch {
        // Fallback to initial mock posts if offline/unauthenticated
      }
    };
    fetchApiProjects();
  }, []);

  const trendingPosts = useMemo(
    () => (apiPosts.length > 0 ? apiPosts : initialTrending),
    [apiPosts, initialTrending]
  );
  const newPosts = useMemo(
    () => (apiPosts.length > 0 ? [] : initialNew),
    [apiPosts, initialNew]
  );

  const allPosts = useMemo(
    () => [...trendingPosts, ...newPosts],
    [trendingPosts, newPosts]
  );
  const trendingIds = useMemo(
    () => new Set(trendingPosts.map((p) => p.id)),
    [trendingPosts]
  );
  const newIds = useMemo(() => new Set(newPosts.map((p) => p.id)), [newPosts]);

  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [recentIds, setRecentIds] = useState<string[]>([]);

  const handlePostOpen = (post: Post) => {
    setRecentIds((prev) =>
      [post.id, ...prev.filter((id) => id !== post.id)].slice(0, MAX_RECENT)
    );
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
        return allPosts.filter((p) =>
          p.roles.some((r) => r.title === activeFilter && r.total > r.filled)
        );
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
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                {emptyMessage.title}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {emptyMessage.body}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}