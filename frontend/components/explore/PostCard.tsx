import { Bookmark, MapPin, Clock } from "lucide-react";
import { Post } from "./types";

const statusStyles: Record<Post["status"], string> = {
  Recruiting: "bg-blue-500/90 text-white",
  "In Progress": "bg-purple-500/90 text-white",
  Closed: "bg-gray-600/90 text-white",
  Hiring: "bg-green-500/90 text-white",
};

interface PostCardProps {
  post: Post;
  height: number;
  /** Mobile list mode: card fills the row's width instead of deriving width
   * from aspectRatio. Height still comes from the same fixed `height` prop. */
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

export default function PostCard({ post, height, fullWidth = false }: PostCardProps) {
  const visibleTags = post.tags.slice(0, MAX_TAGS);
  const extraTags = post.tags.length - visibleTags.length;

  const visibleRoles = post.roles.slice(0, MAX_ROLES);
  const extraRoles = post.roles.length - visibleRoles.length;

  // Width is derived once, in pixels, from the SAME height PostGrid used to
  // pack this row — no CSS aspect-ratio, no responsive height classes, so
  // what we compute here is exactly what renders. In fullWidth mode (mobile
  // list) we skip this entirely and let the card fill its row.
  const width = Math.round(height * post.aspectRatio);

  return (
    <div
      style={fullWidth ? { height } : { height, width, minWidth: width, maxWidth: width }}
      className={`group relative flex-shrink-0 overflow-hidden rounded-2xl shadow-lg transition-transform duration-200 hover:-translate-y-1 hover:shadow-xl bg-gradient-to-br ${post.coverGradient} ${
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

      {/* caption overlay — same gradient-cover tile, just more content inside.
         No fixed `top` offset: the overlay sizes itself to its content and
         grows up from the bottom, so it's never taller or shorter than what
         it actually holds. The gradient also never fades past black/70 —
         letting it go fully transparent at the top was what let card-colored
         background show through right behind the title on cards with a bit
         more content, making the text hard to read. */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-full flex-col justify-end bg-gradient-to-t from-black/95 via-black/85 to-black/70 p-3.5 sm:p-4">
        <h3 className="truncate text-[15px] font-bold text-white sm:text-base">{post.title}</h3>
        <p className="mt-0.5 truncate text-[11px] text-white/60 sm:text-xs">
          {post.authorName} · {post.postedAgo}
        </p>

        <p className="mt-1.5 line-clamp-1 text-[11px] leading-snug text-white/75 sm:text-xs">
          {post.description}
        </p>

        {/* tags */}
        <div className="mt-2 flex flex-wrap items-center gap-1">
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

        {/* open roles */}
        {visibleRoles.length > 0 && (
          <div className="mt-2 rounded-lg bg-white/[0.06] px-2.5 py-2">
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
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex -space-x-1.5">
            {post.team.map((member, i) => (
              <span
                key={i}
                className={`flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br ${member.color} text-[8px] font-bold text-white ring-1 ring-black/40 sm:h-6 sm:w-6 sm:text-[9px]`}
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
        <div className="mt-2.5 flex items-center gap-1.5">
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