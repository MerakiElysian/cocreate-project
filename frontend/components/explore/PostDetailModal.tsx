"use client";

import { useEffect } from "react";
import { X, MapPin, Clock, Bookmark, Users } from "lucide-react";
import { Post } from "./types";
import { getCoverGradient, getMemberColor } from "./PostStyle";

const statusStyles: Record<Post["status"], string> = {
  Recruiting: "bg-blue-500/90 text-white",
  "In Progress": "bg-purple-500/90 text-white",
  Closed: "bg-gray-600/90 text-white",
  Hiring: "bg-green-500/90 text-white",
};

interface PostDetailModalProps {
  post: Post | null;
  /** Same grid position the card was opened from, so the banner reuses the
   * exact cover gradient / avatar colors the card already showed. */
  gridIndex: number;
  onClose: () => void;
}

function RoleRow({ role }: { role: Post["roles"][number] }) {
  const openSpots = role.total - role.filled;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50 px-3.5 py-3 dark:border-gray-800 dark:bg-gray-800/50">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{role.title}</p>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
          {role.employment} · {role.compType} · {role.compValue}
        </p>
      </div>
      <div className="flex flex-shrink-0 items-center gap-2">
        <span className="flex items-center gap-1">
          {Array.from({ length: role.total }).map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full ${
                i < role.filled ? "bg-gray-400 dark:bg-gray-500" : "bg-blue-600 dark:bg-blue-500"
              }`}
            />
          ))}
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            openSpots > 0
              ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
              : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {openSpots > 0 ? `${openSpots} open` : "Filled"}
        </span>
      </div>
    </div>
  );
}

export default function PostDetailModal({ post, gridIndex, onClose }: PostDetailModalProps) {
  // Escape closes; body scroll is locked while a post is open so the page
  // behind the blurred backdrop can't scroll underneath it.
  useEffect(() => {
    if (!post) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [post, onClose]);

  if (!post) return null;

  const coverGradient = getCoverGradient(gridIndex);

  return (
    <div
      className="fixed inset-x-0 top-0 bottom-0 z-[100] flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-md modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${post.title} details`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-panel flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
      >
        {/* banner */}
        <div className={`relative flex-shrink-0 bg-gradient-to-br ${coverGradient} px-5 pb-5 pt-5 sm:px-7 sm:pt-6`}>
          <div className="flex items-start justify-between">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${statusStyles[post.status]}`}
            >
              {post.status}
            </span>
            <div className="flex items-center gap-2">
              <button
                aria-label="Bookmark"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <Bookmark className="h-4 w-4" />
              </button>
              <button
                aria-label="Close"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <h2 className="mt-6 text-xl font-bold leading-snug text-white sm:text-2xl">{post.title}</h2>
          <p className="mt-1 text-sm text-white/75">
            {post.authorName} · {post.postedAgo}
          </p>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {/* location / employment */}
          <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {post.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.employment}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {post.team.length + (post.extraMembers ?? 0)} on the team
            </span>
          </div>

          {/* description */}
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{post.description}</p>

          {/* tags */}
          {post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* roles */}
          {post.roles.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2.5 text-sm font-semibold text-gray-900 dark:text-white">
                Open roles ({post.roles.length})
              </h3>
              <div className="flex flex-col gap-2">
                {post.roles.map((role) => (
                  <RoleRow key={role.title} role={role} />
                ))}
              </div>
            </div>
          )}

          {/* team */}
          <div className="mt-6">
            <h3 className="mb-2.5 text-sm font-semibold text-gray-900 dark:text-white">Team</h3>
            <div className="flex flex-wrap gap-2">
              {post.team.map((member, i) => (
                <span
                  key={i}
                  className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br ${getMemberColor(
                    gridIndex,
                    i
                  )} text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900`}
                >
                  {member.initials}
                </span>
              ))}
              {!!post.extraMembers && (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 ring-2 ring-white dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-900">
                  +{post.extraMembers}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* footer actions */}
        <div className="flex flex-shrink-0 items-center gap-2 border-t border-gray-100 px-5 py-4 sm:px-7 dark:border-gray-800">
          <button
            onClick={onClose}
            className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Close
          </button>
          <button className="flex-1 rounded-full bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700">
            Apply →
          </button>
        </div>
      </div>

      <style jsx>{`
        .modal-backdrop {
          animation: backdrop-fade 0.18s ease-out;
        }
        .modal-panel {
          animation: panel-in 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes backdrop-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes panel-in {
          from {
            opacity: 0;
            transform: translateY(10px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .modal-backdrop,
          .modal-panel {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}