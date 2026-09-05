"use client";

import { useEffect, useState } from "react";
import { X, MapPin, Tag, Bookmark, Users, ChevronDown, Check } from "lucide-react";
import { Post, Role } from "./types";
import { getCoverGradient, getMemberColor, getInitials } from "./PostStyle";

interface PostDetailModalProps {
  post: Post | null;
  /** Same grid position the card was opened from, so the banner reuses the
   * exact cover gradient / avatar colors the card already showed. */
  gridIndex: number;
  onClose: () => void;
}

function RoleAccordionRow({
  role,
  isOpen,
  isSelected,
  onToggle,
  onSelect,
}: {
  role: Role;
  isOpen: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
}) {
  const openSpots = role.total - role.filled;
  const isFilled = openSpots <= 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border transition-colors ${
        isSelected
          ? "border-blue-500 bg-blue-50/60 dark:border-blue-500/70 dark:bg-blue-500/[0.07]"
          : "border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50"
      }`}
    >
      {/* header — click anywhere to expand/collapse this role's detail */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          {isSelected && (
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{role.title}</p>
            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
              {role.employment} · {role.compType} · {role.compValue}
            </p>
          </div>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              isFilled
                ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
            }`}
          >
            {isFilled ? "Filled" : `${openSpots} open`}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 dark:text-gray-500 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {/* expanded detail — role-specific description, requirements, and the
         one place the person actually commits to a role. Pay/schedule for
         this role live only here, never on the card. */}
      <div
        className={`grid transition-all duration-200 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-gray-100 px-3.5 pb-3.5 pt-3 dark:border-gray-800">
            <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">{role.description}</p>

            {role.requirements.length > 0 && (
              <ul className="mt-3 flex flex-col gap-1.5">
                {role.requirements.map((req) => (
                  <li key={req} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-gray-400 dark:bg-gray-600" />
                    {req}
                  </li>
                ))}
              </ul>
            )}

            <button
              type="button"
              onClick={onSelect}
              disabled={isFilled}
              className={`mt-3.5 w-full rounded-lg py-2 text-xs font-semibold transition-colors ${
                isFilled
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                  : isSelected
                    ? "bg-blue-600 text-white"
                    : "border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
              }`}
            >
              {isFilled ? "Role filled" : isSelected ? "Selected for application" : "Select this role"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PostDetailModal({ post, gridIndex, onClose }: PostDetailModalProps) {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  // Fresh selection state every time a *different* post is opened, so a
  // role picked on one project never silently carries into the next.
  useEffect(() => {
    setExpandedRole(null);
    setSelectedRole(null);
    setApplyFeedback(null);
  }, [post?.id]);

  const [applying, setApplying] = useState(false);
  const [applyFeedback, setApplyFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const selectedRoleData = post?.roles.find((r) => r.title === selectedRole) ?? null;

  const handleApply = async () => {
    if (!selectedRoleData?.id) {
      setApplyFeedback({ success: true, message: "Applied to role!" });
      return;
    }
    setApplying(true);
    setApplyFeedback(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      const res = await fetch(`${apiUrl}/api/roles/${selectedRoleData.id}/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ coverNote: "Interested in applying" }),
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        setApplyFeedback({ success: true, message: "Application submitted successfully!" });
      } else if (res.status === 409) {
        setApplyFeedback({ success: false, message: "You have already applied for this role." });
      } else {
        setApplyFeedback({ success: false, message: json.message || "Failed to apply for role." });
      }
    } catch (err: any) {
      setApplyFeedback({ success: false, message: err.message || "Network error applying for role." });
    } finally {
      setApplying(false);
    }
  };

  if (!post) return null;

  const coverGradient = getCoverGradient(gridIndex);
  const teamSize = post.team.length + (post.extraMembers ?? 0);

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
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-xs font-bold text-white ring-1 ring-white/25 backdrop-blur-sm">
              {getInitials(post.companyName)}
            </span>
            <div className="flex items-center gap-2">
              <button
                aria-label={saved ? "Remove from saved" : "Save post"}
                aria-pressed={saved}
                onClick={() => setSaved((s) => !s)}
                className={`flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold backdrop-blur-sm transition-colors ${
                  saved ? "bg-white text-gray-900" : "bg-white/15 text-white hover:bg-white/25"
                }`}
              >
                <Bookmark className={`h-3.5 w-3.5 ${saved ? "fill-gray-900" : ""}`} />
                {saved ? "Saved" : "Save"}
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
          <p className="mt-1 text-sm text-white/75">by {post.companyName}</p>
          <p className="mt-0.5 text-xs text-white/55">
            {post.authorName} · {post.postedAgo}
          </p>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          {/* location / category / team size — project-level facts only */}
          <div className="mb-5 flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {post.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Tag className="h-4 w-4" />
              {post.category}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {teamSize} on the team
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

          {/* roles — each one expands like a dropdown for its own detail,
             and picking one is what the footer Apply button waits on. */}
          {post.roles.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-2.5 text-sm font-semibold text-gray-900 dark:text-white">
                Open roles ({post.roles.length})
              </h3>
              <div className="flex flex-col gap-2">
                {post.roles.map((role) => (
                  <RoleAccordionRow
                    key={role.title}
                    role={role}
                    isOpen={expandedRole === role.title}
                    isSelected={selectedRole === role.title}
                    onToggle={() => setExpandedRole((cur) => (cur === role.title ? null : role.title))}
                    onSelect={() =>
                      setSelectedRole((cur) => (cur === role.title ? null : role.title))
                    }
                  />
                ))}
              </div>
            </div>
          )}

          {/* team — who's actually building this */}
          <div className="mt-6">
            <h3 className="mb-2.5 text-sm font-semibold text-gray-900 dark:text-white">
              Team ({teamSize})
            </h3>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {post.team.map((member, i) => (
                <div
                  key={member.name}
                  className="flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/50"
                >
                  <span
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${getMemberColor(
                      gridIndex,
                      i
                    )} text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900`}
                  >
                    {member.initials}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                    <p className="truncate text-[11px] text-gray-500 dark:text-gray-400">{member.role}</p>
                  </div>
                </div>
              ))}
              {!!post.extraMembers && (
                <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-gray-200 px-3 py-2.5 dark:border-gray-700">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                    +{post.extraMembers}
                  </span>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">more on the team</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* footer — shows exactly what you're about to apply for, and the
           Apply button stays inert until a role is actually selected. */}
        <div className="flex-shrink-0 border-t border-gray-100 px-5 py-4 sm:px-7 dark:border-gray-800">
          {applyFeedback && (
            <p
              className={`mb-2 text-xs font-semibold ${
                applyFeedback.success
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {applyFeedback.message}
            </p>
          )}
          {post.roles.length > 0 && (
            <p className="mb-3 truncate text-xs text-gray-500 dark:text-gray-400">
              {selectedRoleData ? (
                <>
                  Applying for{" "}
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {selectedRoleData.title}
                  </span>
                </>
              ) : (
                "Select a role above to apply"
              )}
            </p>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-full border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Close
            </button>
            <button
              onClick={handleApply}
              disabled={applying || (post.roles.length > 0 && !selectedRoleData)}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                post.roles.length > 0 && !selectedRoleData
                  ? "cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {applying ? "Applying..." : "Apply →"}
            </button>
          </div>
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