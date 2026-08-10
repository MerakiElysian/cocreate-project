import { Post } from "./types";

// aspectRatio = width / height. Varying these (like the reference grid) is
// what makes card widths feel organic once every card shares a fixed height.
export const trendingPosts: Post[] = [
  {
    id: "1",
    title: "MindFlow AI",
    status: "Recruiting",
    authorName: "Priya Mehta",
    postedAgo: "3 days ago",
    description:
      "AI-powered mental wellness platform adapting CBT therapy using LLMs. Built for 10M+ users globally across...",
    tags: ["Next.js", "Python", "LLMs", "SaaS"],
    roles: [
      { title: "Backend Engineer", compType: "Equity", compValue: "1.5%", employment: "Full-time", filled: 1, total: 2 },
      { title: "UI/UX Designer", compType: "Revenue-share", compValue: "3%", employment: "Full-time", filled: 1, total: 1 },
      { title: "ML Researcher", compType: "Equity", compValue: "2%", employment: "Full-time", filled: 2, total: 2 },
    ],
    team: [
      { initials: "PM", color: "from-blue-500 to-blue-400" },
      { initials: "RK", color: "from-purple-500 to-purple-400" },
      { initials: "AS", color: "from-emerald-500 to-emerald-400" },
    ],
    extraMembers: 2,
    location: "Remote",
    employment: "Full-time",
    aspectRatio: 0.8,
    coverGradient: "from-indigo-900 via-blue-800 to-slate-900",
  },
  {
    id: "2",
    title: "PixelForge",
    status: "Recruiting",
    authorName: "Dev Anand",
    postedAgo: "1 day ago",
    description:
      "Collaborative design-to-code platform that turns Figma files into production-ready React components instantly...",
    tags: ["React", "TypeScript", "Figma API"],
    roles: [
      { title: "Frontend Engineer", compType: "Equity", compValue: "1%", employment: "Full-time", filled: 0, total: 2 },
      { title: "DevRel", compType: "Revenue-share", compValue: "2%", employment: "Part-time", filled: 0, total: 1 },
    ],
    team: [
      { initials: "DA", color: "from-orange-500 to-orange-400" },
      { initials: "LT", color: "from-pink-500 to-pink-400" },
    ],
    extraMembers: 0,
    location: "Remote",
    employment: "Full-time",
    aspectRatio: 1.4,
    coverGradient: "from-slate-800 via-slate-700 to-zinc-900",
  },
  {
    id: "3",
    title: "CivicPulse",
    status: "In Progress",
    authorName: "Meera Iyer",
    postedAgo: "5 days ago",
    description:
      "Local governance transparency dashboard aggregating municipal budgets and civic project timelines for citizens...",
    tags: ["Next.js", "PostgreSQL", "GovTech"],
    roles: [
      { title: "Data Engineer", compType: "Equity", compValue: "1.2%", employment: "Full-time", filled: 1, total: 1 },
      { title: "Policy Researcher", compType: "Stipend", compValue: "Fixed", employment: "Part-time", filled: 0, total: 2 },
    ],
    team: [
      { initials: "MI", color: "from-teal-500 to-teal-400" },
      { initials: "KJ", color: "from-blue-500 to-purple-500" },
    ],
    extraMembers: 1,
    location: "Bengaluru",
    employment: "Hybrid",
    aspectRatio: 1.0,
    coverGradient: "from-teal-800 via-emerald-800 to-slate-900",
  },
];

export const newPosts: Post[] = [
  {
    id: "4",
    title: "LoopStudio",
    status: "Recruiting",
    authorName: "Aarav Shah",
    postedAgo: "6 hours ago",
    description:
      "Generative music tool for indie game developers — describe a mood, get a royalty-free adaptive soundtrack...",
    tags: ["Node.js", "Audio ML", "Electron"],
    roles: [
      { title: "Audio ML Engineer", compType: "Equity", compValue: "2.5%", employment: "Full-time", filled: 0, total: 1 },
      { title: "Community Lead", compType: "Revenue-share", compValue: "1%", employment: "Part-time", filled: 0, total: 1 },
    ],
    team: [{ initials: "AS", color: "from-indigo-500 to-indigo-400" }],
    extraMembers: 0,
    location: "Remote",
    employment: "Full-time",
    aspectRatio: 0.65,
    coverGradient: "from-fuchsia-900 via-purple-800 to-indigo-900",
  },
  {
    id: "5",
    title: "Harvestly",
    status: "Recruiting",
    authorName: "Neha Kapoor",
    postedAgo: "2 days ago",
    description:
      "Farm-to-table marketplace connecting small growers directly with local restaurants, cutting out distributors...",
    tags: ["React Native", "Stripe", "Marketplace"],
    roles: [
      { title: "Mobile Engineer", compType: "Equity", compValue: "1.8%", employment: "Full-time", filled: 1, total: 2 },
      { title: "Growth Marketer", compType: "Revenue-share", compValue: "1.5%", employment: "Full-time", filled: 0, total: 1 },
    ],
    team: [
      { initials: "NK", color: "from-rose-500 to-rose-400" },
      { initials: "VG", color: "from-amber-500 to-amber-400" },
    ],
    extraMembers: 3,
    location: "Remote",
    employment: "Full-time",
    aspectRatio: 1.6,
    coverGradient: "from-amber-800 via-orange-800 to-rose-900",
  },
  {
    id: "6",
    title: "Nimbus Notes",
    status: "Recruiting",
    authorName: "Rohan Das",
    postedAgo: "12 hours ago",
    description:
      "Offline-first note-taking app with end-to-end encrypted sync, built for researchers and journalists...",
    tags: ["Rust", "CRDT", "Privacy"],
    roles: [
      { title: "Rust Engineer", compType: "Equity", compValue: "2%", employment: "Full-time", filled: 0, total: 1 },
    ],
    team: [{ initials: "RD", color: "from-cyan-500 to-cyan-400" }],
    extraMembers: 0,
    location: "Remote",
    employment: "Full-time",
    aspectRatio: 0.9,
    coverGradient: "from-cyan-900 via-sky-800 to-slate-900",
  },
  {
    id: "7",
    title: "Kindred",
    status: "Recruiting",
    authorName: "Sana Qureshi",
    postedAgo: "4 days ago",
    description:
      "Peer-support network matching people going through similar life transitions with trained volunteer listeners...",
    tags: ["Next.js", "Supabase", "Community"],
    roles: [
      { title: "Full-stack Engineer", compType: "Equity", compValue: "1.5%", employment: "Full-time", filled: 0, total: 1 },
      { title: "Clinical Advisor", compType: "Stipend", compValue: "Fixed", employment: "Part-time", filled: 1, total: 1 },
    ],
    team: [{ initials: "SQ", color: "from-fuchsia-500 to-fuchsia-400" }],
    extraMembers: 0,
    location: "Remote",
    employment: "Full-time",
    aspectRatio: 0.75,
    coverGradient: "from-rose-900 via-pink-800 to-purple-900",
  },
  {
    id: "8",
    title: "RouteWise",
    status: "Recruiting",
    authorName: "Karan Malhotra",
    postedAgo: "9 hours ago",
    description:
      "Fleet routing optimizer for last-mile delivery startups, cutting fuel costs with real-time traffic-aware planning...",
    tags: ["Go", "Maps API", "Logistics"],
    roles: [
      { title: "Backend Engineer", compType: "Equity", compValue: "1.8%", employment: "Full-time", filled: 0, total: 2 },
    ],
    team: [{ initials: "KM", color: "from-lime-500 to-lime-400" }],
    extraMembers: 0,
    location: "Remote",
    employment: "Full-time",
    aspectRatio: 1.2,
    coverGradient: "from-lime-900 via-green-800 to-slate-900",
  },
  {
    id: "9",
    title: "Verso Reads",
    status: "In Progress",
    authorName: "Ishaan Bose",
    postedAgo: "1 week ago",
    description:
      "Book club platform pairing readers with AI-generated discussion guides tailored to their group's pace...",
    tags: ["React", "OpenAI API"],
    roles: [
      { title: "Product Designer", compType: "Revenue-share", compValue: "2%", employment: "Part-time", filled: 1, total: 1 },
    ],
    team: [{ initials: "IB", color: "from-sky-500 to-sky-400" }],
    extraMembers: 0,
    location: "Remote",
    employment: "Part-time",
    aspectRatio: 1.1,
    coverGradient: "from-sky-900 via-indigo-800 to-slate-900",
  },
];