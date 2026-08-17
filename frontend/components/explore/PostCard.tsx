import { Bookmark, MapPin, Clock } from "lucide-react";
import { Post } from "./types";
import { getAspectRatio, getCoverGradient, getMemberColor } from "./PostStyle";

const statusStyles: Record<Post["status"], string> = {
  Recruiting: "bg-blue-500/90 text-white",
  "In Progress": "bg-purple-500/90 text-white",
  Closed: "bg-gray-600/90 text-white",
  Hiring: "bg-green-500/90 text-white",
};

interface PostCardProps {
  post: Post;
  height: number;
  /** Position of this card within the grid. Drives its cover gradient,
   * member avatar colors, and (indirectly) its aspect ratio — see
   * postStyle.ts — so styling stays out of the content data entirely. */
  gridIndex: number;
  /** Mobile list mode: card fills the row's width and derives its height
   * from an aspect ratio <= 1 (portrait/square) instead of a fixed height
   * deriving width like the desktop masonry does. */
  fullWidth?: boolean;
}

const MAX_TAGS = 2;
const MAX_ROLES = 2;

function RoleDots({ filled, total }: { filled: number; total: number }) {
  return (
    <span className="flex flex-shrink-0 items-center gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-[2px] ${i < filled ? "bg-white" : "bg-white/25"}`}
        />
      ))}
      <span className="ml-1 text-[9px] font-semibold text-white/80">
        {filled}/{total}
      </span>
    </span>
  );
}

export default function PostCard({ post, height, gridIndex, fullWidth = false }: PostCardProps) {
  const visibleTags = post.tags.slice(0, MAX_TAGS);
  const extraTags = post.tags.length - visibleTags.length;

  const visibleRoles = post.roles.slice(0, MAX_ROLES);
  const extraRoles = post.roles.length - visibleRoles.length;

  const coverGradient = getCoverGradient(gridIndex);

  // Desktop: ratio >= 1 (square-to-wide), height fixed, width derived.
  // Mobile: ratio <= 1 (square-to-tall), width fixed (100%), height derived
  // via the CSS `aspect-ratio` property so there's no JS width math needed.
  const aspectRatio = getAspectRatio(post, fullWidth ? "mobile" : "desktop");
  const width = fullWidth ? undefined : Math.round(height * aspectRatio);

  return (
    <div
      style={
        fullWidth
          ? { aspectRatio }
          : { height, width, minWidth: width, maxWidth: width }
      }
      className={`group relative flex-shrink-0 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl dark:ring-white/10 bg-gradient-to-br ${coverGradient} ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {/* bookmark */}
      <button
        aria-label="Bookmark"
        className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25 sm:right-3 sm:top-3 sm:h-8 sm:w-8"
      >
        <Bookmark className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </button>

      {/* status badge */}
      <span
        className={`absolute left-2.5 top-2.5 z-10 rounded-full px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm sm:left-3 sm:top-3 sm:px-3 sm:text-xs ${statusStyles[post.status]}`}
      >
        {post.status}
      </span>

      {/* caption overlay — sizes to its content and grows up from the
         bottom, so it's never taller or shorter than what it holds. The
         gradient never fades past black/70 so card-colored background
         can't show through behind the title on content-heavy cards. This
         overlay is intentionally theme-independent: cards are colored
         cover tiles with white text either way, so light/dark mode only
         changes the chrome around them (navbar, page bg, dock). */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col justify-end gap-2 bg-gradient-to-t from-black/95 via-black/85 to-black/70 p-3.5 sm:p-4">
        {/* title + meta */}
        <div>
          <h3 className="truncate text-[15px] font-bold leading-snug text-white sm:text-base">
            {post.title}
          </h3>
          <p className="mt-0.5 truncate text-[11px] text-white/60 sm:text-xs">
            {post.authorName} · {post.postedAgo}
          </p>
        </div>

        {/* description */}
        <p className="line-clamp-2 text-[11px] leading-snug text-white/75 sm:text-xs">
          {post.description}
        </p>

        {/* tags */}
        {(visibleTags.length > 0 || extraTags > 0) && (
          <div className="flex flex-wrap items-center gap-1">
            {visibleTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/80 sm:text-[10px]"
              >
                {tag}
              </span>
            ))}
            {extraTags > 0 && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-medium text-white/60 sm:text-[10px]">
                +{extraTags}
              </span>
            )}
          </div>
        )}

        {/* open roles */}
        {visibleRoles.length > 0 && (
          <div className="rounded-lg bg-white/[0.06] px-2.5 py-2">
            <div className="flex flex-col gap-1.5">
              {visibleRoles.map((role) => (
                <div key={role.title} className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-[11px] font-medium text-white sm:text-xs">
                    {role.title}
                  </span>
                  <RoleDots filled={role.filled} total={role.total} />
                </div>
              ))}
            </div>
            {extraRoles > 0 && (
              <p className="mt-1 text-[10px] text-white/50">+{extraRoles} more roles</p>
            )}
          </div>
        )}

        {/* avatars + location/employment */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex -space-x-1.5">
            {post.team.map((member, i) => (
              <span
                key={i}
                className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${getMemberColor(
                  gridIndex,
                  i
                )} text-[8px] font-bold text-white ring-1 ring-black/40 sm:h-6 sm:w-6 sm:text-[9px]`}
              >
                {member.initials}
              </span>
            ))}
            {!!post.extraMembers && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[8px] font-semibold text-white/80 ring-1 ring-black/40 sm:h-6 sm:w-6 sm:text-[9px]">
                +{post.extraMembers}
              </span>
            )}
          </div>

          <div className="flex min-w-0 items-center gap-2 text-[10px] text-white/60 sm:text-[11px]">
            <span className="flex items-center gap-0.5 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{post.location}</span>
            </span>
            <span className="flex flex-shrink-0 items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {post.employment}
            </span>
          </div>
        </div>

        {/* actions */}
        <div className="flex items-center gap-1.5">
          <button className="flex-1 rounded-full border border-white/25 bg-white/5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/15 sm:text-xs">
            Details
          </button>
          <button className="flex-1 rounded-full bg-white py-1.5 text-[11px] font-semibold text-gray-900 transition-colors hover:bg-gray-100 sm:text-xs">
            Apply →
          </button>
        </div>
      </div>
    </div>
  );
}