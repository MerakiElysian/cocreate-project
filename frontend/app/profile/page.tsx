"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  LogOut,
  Edit3,
  Mail,
  Calendar,
  Briefcase,
  Layers,
  Send,
  Bookmark,
  Plus,
  X,
  Check,
  Loader2,
  ExternalLink,
  UploadCloud,
  Trash2,
  Sparkles,
  Share2,
  Copy,
  CheckCheck,
  ShieldCheck,
  MapPin,
  TrendingUp,
  Clock,
  ChevronRight,
  User as UserIcon,
  Sun,
  Moon,
} from "lucide-react";
import { ThemeProvider, useTheme } from "@/components/explore/ThemeProvider";
import { useDispatch } from "react-redux";
import { logout, loginSuccess } from "@/store/slices/authSlice";

interface ProjectRole {
  id?: string;
  title: string;
  compType?: string;
  compValue?: string;
  employment?: string;
  totalSpots: number;
  filledSpots?: number;
  description?: string;
  requirements?: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  companyName?: string;
  coverImageUrl?: string;
  category?: string;
  location: string;
  employment?: string;
  tags: string[];
  status: string;
  createdAt: string;
  roles: ProjectRole[];
}

interface Application {
  id: string;
  status: string;
  coverNote?: string;
  createdAt: string;
  role: {
    id: string;
    title: string;
    compensation?: string;
    project: {
      id: string;
      title: string;
      companyName?: string;
      category?: string;
    };
  };
}

interface Collaboration {
  id: string;
  title?: string;
  role: string;
  project: {
    id: string;
    title: string;
    description: string;
    owner: {
      id: string;
      name: string;
      avatarUrl?: string;
    };
  };
}

interface SavedRole {
  id: string;
  role: {
    id: string;
    title: string;
    compType?: string;
    compValue?: string;
    employment?: string;
    project: {
      id: string;
      title: string;
      companyName?: string;
      category?: string;
    };
  };
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  skills: string[];
  createdAt: string;
  ownedProjects: Project[];
  applications: Application[];
  collaborations: Collaboration[];
  savedRoles: SavedRole[];
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
const STATUS_OPTIONS = ["RECRUITING", "HIRING", "IN_PROGRESS", "CLOSED"];

function ProfileContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"projects" | "applications" | "collaborations" | "saved">("projects");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edit Profile form state
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [editSkills, setEditSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Project state
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectCompany, setProjectCompany] = useState("");
  const [projectLogo, setProjectLogo] = useState("");
  const [uploadingProjectLogo, setUploadingProjectLogo] = useState(false);
  const [projectCategory, setProjectCategory] = useState("AI & ML");
  const [projectLocation, setProjectLocation] = useState("Remote");
  const [projectEmployment, setProjectEmployment] = useState("Full-time");
  const [projectStatus, setProjectStatus] = useState("RECRUITING");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectTags, setProjectTags] = useState<string[]>([]);
  const [projectTagInput, setProjectTagInput] = useState("");
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [savingProject, setSavingProject] = useState(false);
  const [projectSaveError, setProjectSaveError] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      if (refreshToken) {
        await fetch(`${apiUrl}/api/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      dispatch(logout());
      setLoggingOut(false);
      router.push("/login");
    }
  }, [dispatch, router]);

  useEffect(() => {
    async function loadProfile() {
      const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiUrl}/api/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          if (res.status === 401) {
            handleLogout();
            return;
          }
          throw new Error(json.message || "Failed to load profile");
        }

        const data: UserProfile = json.data;
        setProfile(data);
        setEditName(data.name || "");
        setEditBio(data.bio || "");
        setEditAvatar(data.avatarUrl || "");
        setEditSkills(data.skills || []);
      } catch {
        const cachedUserStr = localStorage.getItem("user");
        if (cachedUserStr) {
          const cached = JSON.parse(cachedUserStr);
          setProfile({
            id: cached.id || "user-1",
            name: cached.name || "Creator",
            email: cached.email || "creator@cocreate.io",
            avatarUrl: cached.avatarUrl,
            bio: "Passionate creator & innovator building scalable products on CoCreate.",
            skills: ["React", "TypeScript", "Node.js", "UI/UX", "Next.js", "PostgreSQL"],
            createdAt: new Date().toISOString(),
            ownedProjects: [],
            applications: [],
            collaborations: [],
            savedRoles: [],
          });
        }
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, handleLogout]);

  // Upload Avatar to Cloudinary via backend
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      handleLogout();
      return;
    }

    setUploadingAvatar(true);
    setSaveError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/uploads/image?folder=avatars`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to upload image to Cloudinary");
      }

      setEditAvatar(json.data.secure_url);
      showToast("Avatar image uploaded! Remember to save changes.");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !editSkills.includes(clean)) {
      setEditSkills([...editSkills, clean]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setEditSkills(editSkills.filter((s) => s !== skillToRemove));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setSaveError("");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/users/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editName.trim(),
          bio: editBio.trim(),
          avatarUrl: editAvatar.trim() || undefined,
          skills: editSkills,
        }),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update profile");
      }

      const updatedUser: UserProfile = {
        ...profile!,
        name: editName.trim(),
        bio: editBio.trim(),
        avatarUrl: editAvatar.trim() || undefined,
        skills: editSkills,
      };

      setProfile(updatedUser);

      // Update localStorage user object
      const cached = localStorage.getItem("user");
      if (cached) {
        const parsed = JSON.parse(cached);
        const newLocal = {
          ...parsed,
          name: editName.trim(),
          avatarUrl: editAvatar.trim() || undefined,
        };
        localStorage.setItem("user", JSON.stringify(newLocal));
        dispatch(
          loginSuccess({
            user: newLocal,
            accessToken: token,
          })
        );
      }

      setIsEditModalOpen(false);
      showToast("Profile successfully updated!");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // Open Edit Project Modal
  const handleOpenEditProject = (p: Project) => {
    setEditingProject(p);
    setProjectTitle(p.title);
    setProjectCompany(p.companyName || "");
    setProjectLogo(p.coverImageUrl || "");
    setProjectCategory(p.category || "AI & ML");
    setProjectLocation(p.location || "Remote");
    setProjectEmployment(p.employment || "Full-time");
    setProjectStatus(p.status || "RECRUITING");
    setProjectDescription(p.description);
    setProjectTags(p.tags || []);
    setProjectRoles(
      p.roles?.map((r) => ({
        id: r.id,
        title: r.title,
        compType: r.compType || "Equity",
        compValue: r.compValue || "1.5%",
        employment: r.employment || "Full-time",
        totalSpots: r.totalSpots || 1,
        filledSpots: r.filledSpots || 0,
        description: r.description || "",
        requirements: r.requirements || [],
      })) || []
    );
    setProjectSaveError("");
  };

  // Upload Project Logo to Cloudinary
  const handleProjectLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    setUploadingProjectLogo(true);
    setProjectSaveError("");

    try {
      const formData = new FormData();
      formData.append("image", file);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiUrl}/api/uploads/image?folder=projects`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to upload project logo");
      }

      setProjectLogo(json.data.secure_url);
    } catch (err) {
      setProjectSaveError(err instanceof Error ? err.message : "Logo upload failed");
    } finally {
      setUploadingProjectLogo(false);
    }
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setSavingProject(true);
    setProjectSaveError("");

    const token = localStorage.getItem("accessToken");
    if (!token) {
      handleLogout();
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const payload = {
        title: projectTitle.trim(),
        companyName: projectCompany.trim() || undefined,
        coverImageUrl: projectLogo.trim() || undefined,
        category: projectCategory,
        location: projectLocation.trim() || "Remote",
        employment: projectEmployment,
        status: projectStatus,
        description: projectDescription.trim(),
        tags: projectTags,
        roles: projectRoles
          .filter((r) => r.title.trim().length > 0)
          .map((r) => ({
            title: r.title.trim(),
            compType: r.compType || "Equity",
            compValue: r.compValue || "1.5%",
            employment: r.employment || "Full-time",
            totalSpots: Number(r.totalSpots) || 1,
            filledSpots: Number(r.filledSpots) || 0,
            description: r.description || undefined,
            requirements: r.requirements || [],
          })),
      };

      const res = await fetch(`${apiUrl}/api/projects/${editingProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to update project");
      }

      const updatedProject: Project = json.data;

      // Update in profile list
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              ownedProjects: prev.ownedProjects.map((p) =>
                p.id === updatedProject.id ? { ...p, ...updatedProject } : p
              ),
            }
          : null
      );

      setEditingProject(null);
      showToast("Project successfully updated!");
    } catch (err) {
      setProjectSaveError(err instanceof Error ? err.message : "Failed to update project");
    } finally {
      setSavingProject(false);
    }
  };

  const handleCopyProfile = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
      showToast("Profile link copied to clipboard!");
    }
  };

  const initials = profile?.name
    ? profile.name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "CC";

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
          <p className="text-sm font-semibold tracking-wide text-gray-500 dark:text-gray-400">
            Loading your creator workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-[#0b0f19] dark:text-slate-100">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[120] flex items-center gap-2 rounded-2xl bg-gray-900/90 px-4 py-3 text-xs font-semibold text-white shadow-2xl backdrop-blur-md ring-1 ring-white/15 dark:bg-blue-600/90">
          <Check className="h-4 w-4 text-emerald-400 dark:text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/70 px-4 py-3 backdrop-blur-xl transition-colors sm:px-8 dark:border-slate-800/80 dark:bg-[#0b0f19]/70">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Back to Explore"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2.5">
              <Image src="/Logo.png" alt="CoCreate Logo" width={32} height={32} className="rounded-xl shadow-sm" />
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white">CoCreate</span>
              <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                PORTFOLIO
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>

            <Link
              href="/explore"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 sm:inline-flex dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              Explore Feed
            </Link>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-1.5 rounded-xl bg-red-500/10 px-4 py-2 text-xs font-bold text-red-600 transition-all hover:bg-red-500/20 dark:text-red-400"
            >
              {loggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
              <span>{loggingOut ? "Logging out..." : "Log Out"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8 sm:py-8">
        {/* Bento Hero Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40 dark:border-slate-800/80 dark:bg-[#111625] dark:shadow-black/40">
          {/* Ambient Mesh Cover */}
          <div className="relative h-44 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 sm:h-56">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-black/30" />
            <div className="absolute right-6 top-6 flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md ring-1 ring-white/20">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                Verified Creator
              </span>
            </div>
          </div>

          {/* User Profile Header Row */}
          <div className="relative px-6 pb-8 pt-0 sm:px-10">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:justify-between">
              {/* Profile Avatar with Online Ring */}
              <div className="group relative -mt-16 sm:-mt-20 flex-shrink-0">
                <div className="relative flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-black text-white shadow-2xl ring-4 ring-white dark:ring-[#111625]">
                  {profile?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={profile.avatarUrl} alt={profile.name} className="h-full w-full object-cover" />
                  ) : (
                    <span>{initials}</span>
                  )}
                  {/* Quick Upload Trigger on Hover */}
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    title="Change Photo"
                  >
                    <UploadCloud className="h-6 w-6" />
                    <span className="mt-1 text-[10px] font-bold">Edit Photo</span>
                  </button>
                </div>
                {/* Active Indicator Pulse */}
                <span className="absolute bottom-1 right-1 flex h-4 w-4">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-white bg-emerald-500 dark:border-[#111625]" />
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleCopyProfile}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {copiedLink ? <CheckCheck className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copiedLink ? "Link Copied!" : "Share"}</span>
                </button>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-700 hover:shadow-blue-600/40"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* Profile Identity Details */}
            <div className="mt-5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  {profile?.name || "Creator"}
                </h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  Builder
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {profile?.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  Member since {memberSince}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  Remote & Global
                </span>
              </div>

              <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {profile?.bio || "No bio added yet. Click 'Edit Profile' to share what you build, your passions, and tools."}
              </p>

              {/* Skills Tags */}
              {profile?.skills && profile.skills.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 rounded-xl border border-blue-200/60 bg-blue-50/70 px-3 py-1 text-xs font-semibold text-blue-700 backdrop-blur-sm transition-colors hover:bg-blue-100 dark:border-blue-800/40 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                      <Sparkles className="h-3 w-3 text-blue-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Metric Bento Widgets */}
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div
                onClick={() => setActiveTab("projects")}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                  activeTab === "projects"
                    ? "border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/20"
                    : "border-slate-200/80 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Created Projects</span>
                  <Layers className="h-4 w-4 text-blue-500 transition-transform group-hover:scale-110" />
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {profile?.ownedProjects?.length || 0}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">Owned & Led</p>
              </div>

              <div
                onClick={() => setActiveTab("applications")}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                  activeTab === "applications"
                    ? "border-purple-500 bg-purple-500/5 ring-2 ring-purple-500/20"
                    : "border-slate-200/80 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Applications</span>
                  <Send className="h-4 w-4 text-purple-500 transition-transform group-hover:scale-110" />
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {profile?.applications?.length || 0}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">Submitted</p>
              </div>

              <div
                onClick={() => setActiveTab("collaborations")}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                  activeTab === "collaborations"
                    ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20"
                    : "border-slate-200/80 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Teams</span>
                  <Briefcase className="h-4 w-4 text-emerald-500 transition-transform group-hover:scale-110" />
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {profile?.collaborations?.length || 0}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">Active roles</p>
              </div>

              <div
                onClick={() => setActiveTab("saved")}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-200 ${
                  activeTab === "saved"
                    ? "border-amber-500 bg-amber-500/5 ring-2 ring-amber-500/20"
                    : "border-slate-200/80 bg-slate-50/80 hover:border-slate-300 dark:border-slate-800/80 dark:bg-slate-900/60 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Saved Roles</span>
                  <Bookmark className="h-4 w-4 text-amber-500 transition-transform group-hover:scale-110" />
                </div>
                <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                  {profile?.savedRoles?.length || 0}
                </p>
                <p className="mt-0.5 text-[11px] font-medium text-slate-400">Bookmarked</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="mt-8 flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("projects")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "projects"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white/80 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>My Projects</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === "projects" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}>
                {profile?.ownedProjects?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("applications")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "applications"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white/80 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Applications</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === "applications" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}>
                {profile?.applications?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("collaborations")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "collaborations"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white/80 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Collaborations</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === "collaborations" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}>
                {profile?.collaborations?.length || 0}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "saved"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "bg-white/80 text-slate-600 hover:bg-slate-100 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              <Bookmark className="h-4 w-4" />
              <span>Saved Roles</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                activeTab === "saved" ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              }`}>
                {profile?.savedRoles?.length || 0}
              </span>
            </button>
          </div>

          <Link
            href="/explore"
            className="hidden items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 sm:flex"
          >
            <Plus className="h-4 w-4" />
            Post New Idea
          </Link>
        </div>

        {/* Tab Content Panels */}
        <div className="mt-6">
          {/* Projects Tab */}
          {activeTab === "projects" && (
            <div>
              {profile?.ownedProjects && profile.ownedProjects.length > 0 ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {profile.ownedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="group flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/30 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800/80 dark:bg-[#111625] dark:shadow-black/20"
                    >
                      <div>
                        {/* Header: Logo + Category + Status */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            {project.coverImageUrl ? (
                              <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={project.coverImageUrl} alt="" className="h-full w-full object-cover" />
                              </div>
                            ) : (
                              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
                                {(project.companyName || project.title).slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                {project.category || "General"}
                              </span>
                              {project.companyName && (
                                <p className="text-[11px] font-semibold text-slate-400">{project.companyName}</p>
                              )}
                            </div>
                          </div>

                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-wide ${
                              project.status === "CLOSED"
                                ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <h3 className="mt-4 text-base font-bold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                          {project.title}
                        </h3>

                        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                          {project.description}
                        </p>

                        {/* Roles Badge List */}
                        {project.roles && project.roles.length > 0 && (
                          <div className="mt-4 space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Open Roles ({project.roles.length})
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {project.roles.map((r, i) => (
                                <span
                                  key={r.id || i}
                                  className="rounded-lg border border-slate-200/60 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                                >
                                  {r.title} · <span className="text-blue-600 dark:text-blue-400">{r.compValue || r.compType || "Equity"}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
                        <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {project.location}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditProject(project)}
                            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-blue-500" />
                            <span>Edit</span>
                          </button>
                          <Link
                            href="/explore"
                            className="flex items-center gap-1 rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            <span>Feed</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 p-14 text-center dark:border-slate-800 dark:bg-[#111625]/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 shadow-inner dark:bg-blue-900/30">
                    <Layers className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No projects created yet</h3>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Publish your product or startup idea, attract top co-creators, and build together.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-6 flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    Launch Your First Project
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div>
              {profile?.applications && profile.applications.length > 0 ? (
                <div className="space-y-3.5">
                  {profile.applications.map((app) => (
                    <div
                      key={app.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center dark:border-slate-800/80 dark:bg-[#111625]"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-900/30">
                          <Send className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {app.role?.title || "Role Application"}
                            </h4>
                            <span className="text-xs text-slate-400">at</span>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                              {app.role?.project?.title}
                            </span>
                          </div>
                          {app.coverNote && (
                            <p className="mt-1.5 text-xs italic text-slate-500 dark:text-slate-400">
                              &ldquo;{app.coverNote}&rdquo;
                            </p>
                          )}
                          <span className="mt-1 block text-[10px] text-slate-400">
                            Submitted on {new Date(app.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black tracking-wide ${
                            app.status === "ACCEPTED"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : app.status === "REJECTED"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 p-14 text-center dark:border-slate-800 dark:bg-[#111625]/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 shadow-inner dark:bg-purple-900/30">
                    <Send className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No applications yet</h3>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Browse open roles across AI, SaaS, Fintech, and join high-potential founding teams.
                  </p>
                  <Link
                    href="/explore"
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-700"
                  >
                    Browse Opportunities
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Collaborations Tab */}
          {activeTab === "collaborations" && (
            <div>
              {profile?.collaborations && profile.collaborations.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profile.collaborations.map((collab) => (
                    <div
                      key={collab.id}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#111625]"
                    >
                      <span className="rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {collab.title || collab.role || "Team Member"}
                      </span>
                      <h4 className="mt-3 text-base font-bold text-slate-900 dark:text-white">
                        {collab.project.title}
                      </h4>
                      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Led by {collab.project.owner?.name}
                      </p>
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                        {collab.project.description}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 p-14 text-center dark:border-slate-800 dark:bg-[#111625]/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-inner dark:bg-emerald-900/30">
                    <Briefcase className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No active collaborations</h3>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    When you are accepted onto a project team, your shared spaces and workspaces will appear here.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Saved Tab */}
          {activeTab === "saved" && (
            <div>
              {profile?.savedRoles && profile.savedRoles.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {profile.savedRoles.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#111625]"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.role.title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {s.role.project.title} · {s.role.employment}
                        </p>
                      </div>
                      <Link
                        href="/explore"
                        className="rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/50 p-14 text-center dark:border-slate-800 dark:bg-[#111625]/50">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-inner dark:bg-amber-900/30">
                    <Bookmark className="h-7 w-7" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">No saved roles yet</h3>
                  <p className="mt-1 max-w-sm text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Bookmark interesting roles from the Explore feed to review and apply whenever you want.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Edit Profile Modal Drawer */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-md"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-[#111625] dark:ring-white/10"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Edit3 className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Creator Profile</h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto p-6">
              {saveError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                  {saveError}
                </div>
              )}

              <div className="space-y-4">
                {/* Avatar upload */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Profile Avatar (Cloudinary Storage)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white shadow-md">
                      {editAvatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={editAvatar} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <label className="flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                        {uploadingAvatar ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600" />
                            <span>Uploading to Cloudinary...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="h-3.5 w-3.5 text-blue-600" />
                            <span>Upload Avatar</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                          className="hidden"
                        />
                      </label>
                      <input
                        type="url"
                        value={editAvatar}
                        onChange={(e) => setEditAvatar(e.target.value)}
                        placeholder="Or direct image URL"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Bio & Vision
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell co-creators what you're building, what excites you..."
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Skills & Tech Stack
                  </label>
                  <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
                    {editSkills.map((skill) => (
                      <span
                        key={skill}
                        className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-blue-950 dark:hover:text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Add skill & Enter..."
                      className="min-w-[110px] flex-1 bg-transparent px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProfile || uploadingAvatar}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingProfile ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>{savingProfile ? "Saving..." : "Save Profile"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Project Modal Drawer */}
      {editingProject && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/70 p-4 backdrop-blur-md"
          onClick={() => setEditingProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-[#111625] dark:ring-white/10"
          >
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                  <Edit3 className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Edit Project Details</h2>
              </div>
              <button
                onClick={() => setEditingProject(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProject} className="flex-1 overflow-y-auto p-6">
              {projectSaveError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300">
                  {projectSaveError}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Project Title
                    </label>
                    <input
                      type="text"
                      required
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Company / Org Name
                    </label>
                    <input
                      type="text"
                      value={projectCompany}
                      onChange={(e) => setProjectCompany(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                {/* Project Logo Upload */}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Company / Project Logo
                  </label>
                  <div className="flex items-center gap-3">
                    {projectLogo && (
                      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={projectLogo} alt="" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setProjectLogo("")}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700">
                      {uploadingProjectLogo ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="h-4 w-4 text-blue-600" />
                          <span>{projectLogo ? "Change Logo" : "Upload Logo"}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProjectLogoUpload}
                        disabled={uploadingProjectLogo}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="url"
                      value={projectLogo}
                      onChange={(e) => setProjectLogo(e.target.value)}
                      placeholder="Or paste image URL"
                      className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Category
                    </label>
                    <select
                      value={projectCategory}
                      onChange={(e) => setProjectCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {DEFAULT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Location
                    </label>
                    <input
                      type="text"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Status
                    </label>
                    <select
                      value={projectStatus}
                      onChange={(e) => setProjectStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Project Description
                  </label>
                  <textarea
                    rows={4}
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Roles Management */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Open Roles & Team Vacancies
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setProjectRoles([
                          ...projectRoles,
                          {
                            title: "",
                            compType: "Equity",
                            compValue: "1.5%",
                            employment: "Full-time",
                            totalSpots: 1,
                            filledSpots: 0,
                          },
                        ])
                      }
                      className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Role
                    </button>
                  </div>

                  <div className="space-y-3">
                    {projectRoles.map((role, idx) => (
                      <div
                        key={role.id || idx}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-700 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            placeholder="Role Title (e.g. Frontend Engineer)"
                            value={role.title}
                            onChange={(e) => {
                              const updated = [...projectRoles];
                              updated[idx].title = e.target.value;
                              setProjectRoles(updated);
                            }}
                            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <button
                            type="button"
                            onClick={() => setProjectRoles(projectRoles.filter((_, i) => i !== idx))}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="mt-2.5 grid grid-cols-3 gap-2">
                          <select
                            value={role.compType || "Equity"}
                            onChange={(e) => {
                              const updated = [...projectRoles];
                              updated[idx].compType = e.target.value;
                              setProjectRoles(updated);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          >
                            {COMP_TYPES.map((ct) => (
                              <option key={ct} value={ct}>
                                {ct}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            placeholder="Comp (e.g. 2.0%)"
                            value={role.compValue || ""}
                            onChange={(e) => {
                              const updated = [...projectRoles];
                              updated[idx].compValue = e.target.value;
                              setProjectRoles(updated);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                          <input
                            type="number"
                            min={1}
                            placeholder="Spots"
                            value={role.totalSpots}
                            onChange={(e) => {
                              const updated = [...projectRoles];
                              updated[idx].totalSpots = Number(e.target.value) || 1;
                              setProjectRoles(updated);
                            }}
                            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProject || uploadingProjectLogo}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingProject ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                  <span>{savingProject ? "Saving..." : "Save Project"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ThemeProvider>
      <ProfileContent />
    </ThemeProvider>
  );
}
