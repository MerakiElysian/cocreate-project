export interface Role {
  title: string;
  compType: string; // e.g. "Equity" | "Revenue-share"
  compValue: string; // e.g. "1.5%" | "3%"
  employment: string; // e.g. "Full-time" | "Part-time"
  filled: number;
  total: number;
}

export interface TeamMember {
  initials: string;
  color: string; // tailwind gradient classes
}

export interface Post {
  id: string;
  /** width-to-height ratio, like a photo's aspect ratio — drives card
   * width against the row's fixed height. ~0.65 = narrow, ~1.1 = wide. */
  aspectRatio: number;
  /** stand-in for a cover photo until real post images exist */
  coverGradient: string;
  title: string;
  status: "Recruiting" | "In Progress" | "Closed";
  authorName: string;
  postedAgo: string;
  description: string;
  tags: string[];
  roles: Role[];
  team: TeamMember[];
  extraMembers?: number;
  location: string;
  employment: string;
}