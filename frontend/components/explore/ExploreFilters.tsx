"use client";

import { LayoutGrid, TrendingUp, Sparkles, History } from "lucide-react";
import { Post } from "./types";

export type FilterKey = "all" | "trending" | "new" | "recent" | (string & {});

interface ExploreFiltersProps {
  /** Full, unfiltered post set — used only to compute the "most in-demand
   * roles" chips, so they stay accurate regardless of what's selected. */
  posts: Post[];
  activeFilter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
  hasRecent: boolean;
}

const MAX_ROLE_CHIPS = 5;

/** Ranks role titles by how many open postings ask for them, so "most
 * searched" reflects real demand in the data rather than a hardcoded
 * guess — add a role anywhere in mock-data and the chip list adapts. */
function getTopOpenRoles(posts: Post[], limit: number): { title: string; count: number }[] {
  const counts = new Map<string, number>();
  posts.forEach((post) => {
    post.roles.forEach((role) => {
      if (role.total - role.filled <= 0) return;
      counts.set(role.title, (counts.get(role.title) ?? 0) + 1);
    });
  });
  return Array.from(counts.entries())
    .map(([title, count]) => ({ title, count }))
    .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title))
    .slice(0, limit);
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800/70 dark:text-gray-300 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

export default function ExploreFilters({ posts, activeFilter, onFilterChange, hasRecent }: ExploreFiltersProps) {
  const topRoles = getTopOpenRoles(posts, MAX_ROLE_CHIPS);

  return (
    <div className="border-b border-gray-100 bg-white/70 px-4 py-2.5 backdrop-blur transition-colors sm:px-6 lg:px-12 dark:border-gray-800 dark:bg-gray-950/70">
      <div
        className="mx-auto flex max-w-screen-2xl items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <Chip active={activeFilter === "all"} onClick={() => onFilterChange("all")}>
          <LayoutGrid className="h-3.5 w-3.5" />
          All
        </Chip>
        <Chip active={activeFilter === "trending"} onClick={() => onFilterChange("trending")}>
          <TrendingUp className="h-3.5 w-3.5" />
          Trending
        </Chip>
        <Chip active={activeFilter === "new"} onClick={() => onFilterChange("new")}>
          <Sparkles className="h-3.5 w-3.5" />
          New
        </Chip>
        {hasRecent && (
          <Chip active={activeFilter === "recent"} onClick={() => onFilterChange("recent")}>
            <History className="h-3.5 w-3.5" />
            Recent
          </Chip>
        )}

        {topRoles.length > 0 && (
          <>
            <span
              aria-hidden
              className="mx-1 h-4 w-px flex-shrink-0 bg-gray-200 dark:bg-gray-800"
            />
            {topRoles.map(({ title, count }) => (
              <Chip key={title} active={activeFilter === title} onClick={() => onFilterChange(title)}>
                {title}
                <span
                  className={`text-[10px] font-normal ${
                    activeFilter === title ? "text-white/70" : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {count}
                </span>
              </Chip>
            ))}
          </>
        )}
      </div>
    </div>
  );
}