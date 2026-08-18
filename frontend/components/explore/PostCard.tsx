"use client";

import { useState } from "react";
import { Bookmark, MapPin, Users, Briefcase, ArrowUpRight } from "lucide-react";
import { Post } from "./types";
import { getAspectRatio, getCoverGradient, getMemberColor, getInitials } from "./PostStyle";

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
  /** Opens the full detail view for this post (see PostDetailModal). */
  onOpen?: () => void;
}

const MAX_TAGS = 2;

export default function PostCard({
  post,
  height,
  gridIndex,
  fullWidth = false,
  onOpen,
}: PostCardProps) {
  // Local, ephemeral demo state — a real build would lift this to a
  // saved-posts store keyed by post.id.
  const [saved, setSaved] = useState(false);

  const visibleTags = post.tags.slice(0, MAX_TAGS);
  const extraTags = post.tags.length - visibleTags.length;

  const teamSize = post.team.length + (post.extraMembers ?? 0);
  const openRoles = post.roles.reduce((sum, role) => sum + Math.max(role.total - role.filled, 0), 0);

  const coverGradient = getCoverGradient(gridIndex);
  const logoInitials = getInitials(post.companyName);

  // Desktop: ratio >= 1 (square-to-wide), height fixed, width derived.
  // Mobile: ratio <= 1 (square-to-tall), width fixed (100%), height derived
  // via the CSS `aspect-ratio` property so there's no JS width math needed.
  const aspectRatio = getAspectRatio(post, fullWidth ? "mobile" : "desktop");
  const width = fullWidth ? undefined : Math.round(height * aspectRatio);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View details for ${post.title}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen?.();
        }
      }}
      style={
        fullWidth
          ? { aspectRatio }
          : { height, width, minWidth: width, maxWidth: width }
      }
      className={`group relative flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:ring-white/10 bg-gradient-to-br ${coverGradient} ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {/* top row — logo (left) + category tag (right). Both translucent
         chips that sit directly on the cover gradient, matching each
         other's weight so neither reads as more "clickable" than the other. */}
      <div className="absolute inset-x-2.5 top-2.5 z-10 flex items-start justify-between gap-2 sm:inset-x-3 sm:top-3">
        <span
          aria-hidden
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 text-[11px] font-bold text-white ring-1 ring-white/25 backdrop-blur-sm sm:h-9 sm:w-9 sm:text-xs"
        >
          {logoInitials}
        </span>
        <span className="max-w-[55%] truncate rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm sm:text-[11px]">
          {post.category}
        </span>
      </div>

      {/* caption overlay — sizes to its content and grows up from the
         bottom, so it's never taller or shorter than what it holds. The
         gradient never fades past black/95 so card-colored background
         can't show through behind the title on content-heavy cards. This
         overlay is intentionally theme-independent: cards are colored
         cover tiles with white text either way, so light/dark mode only
         changes the chrome around them (navbar, page bg, dock). */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col justify-end gap-2 bg-gradient-to-t from-black/95 via-black/85 to-black/70 p-3.5 sm:p-4">
        {/* title + a quiet "open" affordance that only animates in on
           hover/focus — this is the whole card's click hint now that the
           old Details button is gone. */}
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-[15px] font-bold leading-snug text-white sm:text-base">
              {post.title}
            </h3>
            <span
              aria-hidden
              className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white/0 text-white/0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:bg-white/15 group-hover:text-white group-focus-visible:bg-white/15 group-focus-visible:text-white"
            >
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] font-medium text-white/70 sm:text-xs">
            by {post.companyName}
          </p>
          <p className="truncate text-[10px] text-white/45 sm:text-[11px]">
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

        {/* team + open roles + location — project-level facts only.
           Per-role pay/schedule detail now lives exclusively inside each
           role's own expanded card in the detail view. */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-white/60 sm:text-[11px]">
          <span className="flex items-center gap-2">
            <span className="flex -space-x-1.5">
              {post.team.slice(0, 3).map((member, i) => (
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
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 flex-shrink-0" />
              {teamSize}
            </span>
          </span>
          {openRoles > 0 && (
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3 flex-shrink-0" />
              {openRoles} open
            </span>
          )}
          <span className="flex min-w-0 items-center gap-1 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{post.location}</span>
          </span>
        </div>

        {/* actions — Save (fills solid when active) and a short, iconed
           Apply that opens the detail view, where role selection happens. */}
        <div className="flex items-center justify-between gap-2">
          <button
            aria-label={saved ? "Remove from saved" : "Save post"}
            aria-pressed={saved}
            onClick={(e) => {
              e.stopPropagation();
              setSaved((s) => !s);
            }}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors sm:px-3.5 sm:text-xs ${
              saved
                ? "bg-white text-gray-900"
                : "bg-white/10 text-white ring-1 ring-white/25 hover:bg-white/20"
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-gray-900" : ""}`} />
            {saved ? "Saved" : "Save"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.();
            }}
            className="group/apply flex items-center gap-1 rounded-full bg-white px-4 py-1.5 text-[11px] font-bold text-gray-900 shadow-md transition-all hover:bg-gray-100 hover:shadow-lg sm:text-xs"
          >
            Apply
            <ArrowUpRight className="h-3 w-3 transition-transform duration-200 group-hover/apply:translate-x-0.5 group-hover/apply:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
}