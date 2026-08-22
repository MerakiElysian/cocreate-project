"use client";

import { useState } from "react";
import { X, Plus, Trash2, Sparkles, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { Post, Role } from "./types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
}

interface NewRole {
  title: string;
  compType: string;
  compValue: string;
  employment: string;
  total: number;
  description: string;
  requirements: string[];
}

const DEFAULT_CATEGORIES = [
  "AI & ML",
  "Design Tools",
  "SaaS",
  "Fintech",
  "Mobile",
  "Developer Tools",
  "Web3",
  "Productivity",
  "Gaming",
];

const COMP_TYPES = ["Equity", "Revenue-share", "Hourly", "Salary", "Paid", "Token"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance"];

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [companyLogo, setCompanyLogo] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [category, setCategory] = useState("AI & ML");
  const [customCategory, setCustomCategory] = useState("");
  const [location, setLocation] = useState("Remote");
  const [employment, setEmployment] = useState("Full-time");
  const [description, setDescription] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(["SaaS", "AI"]);
  const [roles, setRoles] = useState<NewRole[]>([
    {
      title: "Frontend Engineer",
      compType: "Equity",
      compValue: "2.0%",
      employment: "Full-time",
      total: 1,
      description: "Build user-facing interfaces with React/Next.js and create smooth, engaging experiences.",
      requirements: ["Strong TypeScript & React skills", "Experience with modern UI/UX design systems"],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notLoggedIn, setNotLoggedIn] = useState(false);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddRole = () => {
    setRoles([
      ...roles,
      {
        title: "",
        compType: "Equity",
        compValue: "1.5%",
        employment: "Part-time",
        total: 1,
        description: "",
        requirements: [],
      },
    ]);
  };

  const handleUpdateRole = (index: number, field: keyof NewRole, value: any) => {
    const updated = [...roles];
    updated[index] = { ...updated[index], [field]: value };
    setRoles(updated);
  };

  const handleRemoveRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const handleAddRequirement = (roleIndex: number, reqText: string) => {
    if (!reqText.trim()) return;
    const updated = [...roles];
    updated[roleIndex].requirements = [...updated[roleIndex].requirements, reqText.trim()];
    setRoles(updated);
  };

  const handleRemoveRequirement = (roleIndex: number, reqIndex: number) => {
    const updated = [...roles];
    updated[roleIndex].requirements = updated[roleIndex].requirements.filter((_, i) => i !== reqIndex);
    setRoles(updated);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      setNotLoggedIn(true);
      setError("Please log in to upload images.");
      return;
    }

    setUploadingLogo(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/uploads/image?folder=projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to upload company logo");
      }

      setCompanyLogo(json.data.secure_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotLoggedIn(false);

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }
    if (!description.trim()) {
      setError("Project description is required");
      return;
    }

    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      setNotLoggedIn(true);
      setError("You must be logged in to create a project.");
      return;
    }

    const selectedCategory = category === "Other" && customCategory.trim() ? customCategory.trim() : category;

    const payload = {
      title: title.trim(),
      companyName: companyName.trim() || undefined,
      coverImageUrl: companyLogo.trim() || undefined,
      category: selectedCategory,
      location: location.trim() || "Remote",
      employment,
      workType: location.toLowerCase().includes("remote") ? "Remote" : "Onsite",
      description: description.trim(),
      tags,
      roles: roles
        .filter((r) => r.title.trim().length > 0)
        .map((r) => ({
          title: r.title.trim(),
          compType: r.compType,
          compValue: r.compValue.trim(),
          employment: r.employment,
          totalSpots: Number(r.total) || 1,
          filledSpots: 0,
          description: r.description.trim() || undefined,
          requirements: r.requirements,
        })),
    };

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json.success) {
        if (res.status === 401) {
          setNotLoggedIn(true);
          throw new Error("Your session has expired. Please log in again.");
        }
        let msg = json.message || "Failed to create project";
        if (json.details?.fieldErrors) {
          const firstField = Object.keys(json.details.fieldErrors)[0];
          if (firstField) {
            msg = `${firstField}: ${json.details.fieldErrors[firstField][0]}`;
          }
        }
        throw new Error(msg);
      }

      const created = json.data;
      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const newPost: Post = {
        id: created.id,
        title: created.title,
        status: "Recruiting",
        companyName: created.companyName || currentUser?.name || "CoCreate",
        category: created.category || "General",
        authorName: created.owner?.name || currentUser?.name || "You",
        postedAgo: "Just now",
        description: created.description,
        tags: created.tags || [],
        roles: (created.roles || payload.roles).map((r: any) => ({
          title: r.title,
          compType: r.compType || "Equity",
          compValue: r.compValue || "Negotiable",
          employment: r.employment || "Full-time",
          filled: 0,
          total: r.totalSpots || r.total || 1,
          description: r.description || "",
          requirements: r.requirements || [],
        })),
        team: [
          {
            initials: (currentUser?.name || "You")
              .split(" ")
              .map((w: string) => w[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
            name: currentUser?.name || "You",
            role: "Project Lead",
          },
        ],
        extraMembers: 0,
        location: created.location || "Remote",
        employment: created.employment || "Full-time",
        coverImageUrl: created.coverImageUrl || companyLogo || undefined,
      };

      onPostCreated(newPost);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong creating the post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-gray-900 dark:ring-white/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-6 py-4 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
              <Sparkles className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Create New Project Post</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Share your vision, find collaborators, and build your team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="mb-5 flex items-center justify-between rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <span>{error}</span>
              {notLoggedIn && (
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Log In
                </Link>
              )}
            </div>
          )}

          <div className="space-y-5">
            {/* Title & Company */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Nimbus — collaborative whiteboard"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Company / Organization Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Nimbus Labs"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Company Logo Upload */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Company / Project Logo
              </label>
              <div className="flex items-center gap-3">
                {companyLogo && (
                  <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={companyLogo} alt="Logo preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCompanyLogo("")}
                      className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                  {uploadingLogo ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                      <span>Uploading logo...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 text-blue-600" />
                      <span>{companyLogo ? "Change Logo" : "Upload Logo (Cloudinary)"}</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
                <input
                  type="url"
                  value={companyLogo}
                  onChange={(e) => setCompanyLogo(e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-900 transition-colors focus:border-blue-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Category & Location & Employment */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {DEFAULT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Other">Other (Custom)</option>
                </select>
                {category === "Other" && (
                  <input
                    type="text"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Enter custom category"
                    className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Remote or Austin, TX"
                  className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Default Employment
                </label>
                <select
                  value={employment}
                  onChange={(e) => setEmployment(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Project Pitch / Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your project, the vision, and what stage you are currently at..."
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Tags (keywords)
              </label>
              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-800">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-950 dark:hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag & press Enter..."
                  className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white"
                />
              </div>
            </div>

            {/* Open Roles Section */}
            <div className="pt-2">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Open Roles to Recruit ({roles.length})
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Define the positions and compensation for contributors
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddRole}
                  className="flex items-center gap-1.5 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-500/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Role
                </button>
              </div>

              <div className="space-y-4">
                {roles.map((role, rIndex) => (
                  <div
                    key={rIndex}
                    className="rounded-2xl border border-gray-200 bg-gray-50/50 p-4 transition-colors dark:border-gray-800 dark:bg-gray-800/40"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                        Role #{rIndex + 1}
                      </span>
                      {roles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveRole(rIndex)}
                          className="text-gray-400 hover:text-red-500"
                          aria-label="Remove role"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          Role Title
                        </label>
                        <input
                          type="text"
                          required
                          value={role.title}
                          onChange={(e) => handleUpdateRole(rIndex, "title", e.target.value)}
                          placeholder="e.g. Senior Frontend Engineer"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          Compensation
                        </label>
                        <select
                          value={role.compType}
                          onChange={(e) => handleUpdateRole(rIndex, "compType", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                          {COMP_TYPES.map((ct) => (
                            <option key={ct} value={ct}>
                              {ct}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          Value / Rate
                        </label>
                        <input
                          type="text"
                          value={role.compValue}
                          onChange={(e) => handleUpdateRole(rIndex, "compValue", e.target.value)}
                          placeholder="e.g. 2% or $60/hr"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          Employment Type
                        </label>
                        <select
                          value={role.employment}
                          onChange={(e) => handleUpdateRole(rIndex, "employment", e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        >
                          {EMPLOYMENT_TYPES.map((et) => (
                            <option key={et} value={et}>
                              {et}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          Open Spots
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={role.total}
                          onChange={(e) => handleUpdateRole(rIndex, "total", parseInt(e.target.value, 10) || 1)}
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="mb-1 block text-[11px] font-medium text-gray-600 dark:text-gray-400">
                          Role Responsibilities & Description
                        </label>
                        <textarea
                          rows={2}
                          value={role.description}
                          onChange={(e) => handleUpdateRole(rIndex, "description", e.target.value)}
                          placeholder="What will this person be responsible for?"
                          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 pt-5 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-7 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing...</span>
                </>
              ) : (
                "Publish Post"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
