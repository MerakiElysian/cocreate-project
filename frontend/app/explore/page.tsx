"use client";

import { useEffect, useState } from "react";
import ExploreNavbar from "@/components/explore/ExploreNavbar";
import ExploreContent from "@/components/explore/ExploreContent";
import BottomDock from "@/components/explore/BottomDock";
import { ThemeProvider } from "@/components/explore/ThemeProvider";
import { Post, TeamMember } from "@/components/explore/types";
import { Loader2, AlertCircle } from "lucide-react";

function formatTimeAgo(dateString: string | Date): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w ago`;
}

function getInitials(name: string): string {
  return (
    name
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  );
}

function mapBackendProjectToPost(project: any): Post {
  const statusMap: Record<string, "Recruiting" | "In Progress" | "Closed" | "Hiring"> = {
    RECRUITING: "Recruiting",
    HIRING: "Hiring",
    IN_PROGRESS: "In Progress",
    CLOSED: "Closed",
    ACTIVE: "Recruiting",
    ARCHIVED: "Closed",
    COMPLETED: "Closed",
  };

  const team: TeamMember[] = [];
  if (project.owner) {
    team.push({
      initials: getInitials(project.owner.name),
      name: project.owner.name,
      role: "Project Lead",
    });
  }

  if (Array.isArray(project.collaborators)) {
    project.collaborators.forEach((c: any) => {
      if (c.user && c.user.id !== project.ownerId) {
        team.push({
          initials: getInitials(c.user.name),
          name: c.user.name,
          role: c.title || c.role || "Member",
        });
      }
    });
  }

  return {
    id: project.id,
    title: project.title,
    status: statusMap[project.status] || "Recruiting",
    companyName: project.companyName || project.owner?.name || "CoCreate",
    category: project.category || "General",
    authorName: project.owner?.name || "Creator",
    postedAgo: project.createdAt ? formatTimeAgo(project.createdAt) : "Just now",
    description: project.description,
    tags: project.tags || [],
    coverImageUrl: project.coverImageUrl || undefined,
    roles: (project.roles || []).map((r: any) => ({
      id: r.id,
      title: r.title,
      compType: r.compType || r.compensation || "Equity",
      compValue: r.compValue || "Negotiable",
      employment: r.employment || r.contractType || "Full-time",
      filled: r.filledSpots ?? 0,
      total: r.totalSpots ?? 1,
      description: r.description || "Exciting opportunity to join and build together.",
      requirements: r.requirements || [],
    })),
    team: team.length > 0 ? team : [{ initials: "CC", name: "Creator", role: "Owner" }],
    extraMembers: project.extraMembers || 0,
    location: project.location || "Remote",
    employment: project.employment || "Full-time",
  };
}

export default function ExplorePage() {
  const [trendingPosts, setTrendingPosts] = useState<Post[]>([]);
  const [newPosts, setNewPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBackendProjects() {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        const res = await fetch(`${apiUrl}/api/projects/explore?limit=30`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error(`Failed to load explore projects: ${res.statusText}`);
        }

        const json = await res.json();
        if (json.success && Array.isArray(json.data?.items)) {
          const backendPosts: Post[] = json.data.items.map(mapBackendProjectToPost);
          setNewPosts(backendPosts);
          setTrendingPosts(backendPosts.filter((p) => p.status === "Recruiting" || p.status === "Hiring"));
        } else {
          setNewPosts([]);
          setTrendingPosts([]);
        }
      } catch (err: any) {
        setError(err.message || "Unable to load explore posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchBackendProjects();
  }, []);

  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 transition-colors dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <ExploreNavbar />

        <main className="min-h-0 flex-1 overflow-hidden">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Loading projects...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex h-full w-full items-center justify-center p-6 text-center">
              <div className="flex max-w-md flex-col items-center gap-3 rounded-2xl bg-white p-6 shadow-md dark:bg-gray-900">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <ExploreContent trendingPosts={trendingPosts} newPosts={newPosts} />
          )}
        </main>

        <BottomDock />
      </div>
    </ThemeProvider>
  );
}