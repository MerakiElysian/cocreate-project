import { Bookmark, MapPin } from "lucide-react";
import { Post } from "./types";

const statusStyles: Record<Post["status"], string> = {
  Recruiting: "bg-blue-500/90 text-white",
  "In Progress": "bg-purple-500/90 text-white",
  Closed: "bg-gray-600/90 text-white",
};

export default function PostCard({ post, height }: { post: Post; height: number }) {
  const openRoles = post.roles.reduce((sum, r) => sum + Math.max(r.total - r.filled, 0), 0);

  // Width is derived once, in pixels, from the SAME height PostGrid used to
  // pack this row — no CSS aspect-ratio, no responsive height classes, so
  // what we compute here is exactly what renders. That's what keeps a card
  // from ever growing taller than its row and forcing vertical scroll.
  const width = Math.round(height * post.aspectRatio);

  return (
    <div
      style={{ height, width, minWidth: width, maxWidth: width }}
      className={`group relative flex-shrink-0 overflow-hidden rounded-2xl shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${post.coverGradient}`}
    >
      {/* bookmark */}
      <button
        aria-label="Bookmark"
        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
      >
        <Bookmark className="h-4 w-4" />
      </button>

      {/* status badge */}
      <span
        className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${statusStyles[post.status]}`}
      >
        {post.status}
      </span>

      {/* caption overlay */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-16">
        <h3 className="mb-1 truncate text-base font-bold text-white">{post.title}</h3>
        <p className="mb-3 truncate text-xs text-white/70">
          {post.authorName} · {post.postedAgo}
        </p>

        <div className="flex items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-1 truncate text-xs text-white/80">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{post.location}</span>
          </span>
          <button className="flex-shrink-0 whitespace-nowrap rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 transition-colors hover:bg-gray-100">
            {openRoles > 0 ? `${openRoles} roles →` : "View →"}
          </button>
        </div>
      </div>
    </div>
  );
}