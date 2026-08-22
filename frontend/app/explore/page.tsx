"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExploreNavbar from "@/components/explore/ExploreNavbar";
import ExploreContent from "@/components/explore/ExploreContent";
import BottomDock from "@/components/explore/BottomDock";
import CreatePostModal from "@/components/explore/CreatePostModal";
import { ThemeProvider } from "@/components/explore/ThemeProvider";
import { trendingPosts as defaultTrending, newPosts as defaultNew } from "@/components/explore/mock-data";
import { Post, TeamMember } from "@/components/explore/types";
import { Loader2 } from "lucide-react";

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
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [trendingPosts, setTrendingPosts] = useState<Post[]>(defaultTrending);
  const [newPosts, setNewPosts] = useState<Post[]>(defaultNew);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      setIsAuthenticated(false);
      router.replace("/login");
      return;
    }
    setIsAuthenticated(true);

    async function fetchBackendProjects() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/projects/explore?limit=30`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json().catch(() => ({}));

        if (res.ok && json.success && Array.isArray(json.data?.items)) {
          const backendPosts: Post[] = json.data.items.map(mapBackendProjectToPost);
          if (backendPosts.length > 0) {
            setNewPosts((prev) => {
              const existingIds = new Set(backendPosts.map((p) => p.id));
              const filteredPrev = prev.filter((p) => !existingIds.has(p.id));
              return [...backendPosts, ...filteredPrev];
            });
          }
        }
      } catch {
        // Fall back gracefully to mock data
      }
    }

    fetchBackendProjects();
  }, [router]);

  const handlePostCreated = (post: Post) => {
    setNewPosts((prev) => [post, ...prev]);
  };

  if (isAuthenticated === null || isAuthenticated === false) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 transition-colors dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <ExploreNavbar />

        <main className="min-h-0 flex-1 overflow-hidden">
          <ExploreContent trendingPosts={trendingPosts} newPosts={newPosts} />
        </main>

        <BottomDock onAddPostClick={() => setIsCreateModalOpen(true)} />

        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={handlePostCreated}
        />
      </div>
    </ThemeProvider>
  );
}