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
}

export interface Post {
  id: string;
  title: string;
  status: "Recruiting" | "In Progress" | "Closed" | "Hiring";
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