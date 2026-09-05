export interface Role {
  id?: string;
  title: string;
  compType: string; // e.g. "Equity" | "Revenue-share"
  compValue: string; // e.g. "1.5%" | "3%"
  employment: string; // e.g. "Full-time" | "Part-time"
  filled: number;
  total: number;
  /** Shown only inside the role's own expanded detail — never on the card. */
  description: string;
  requirements: string[];
}

export interface TeamMember {
  initials: string;
  name: string;
  role: string; // e.g. "Co-founder & Design"
}

export interface Post {
  id: string;
  title: string;
  status: "Recruiting" | "In Progress" | "Closed" | "Hiring";
  companyName: string;
  category: string;
  authorName: string;
  postedAgo: string;
  description: string;
  tags: string[];
  roles: Role[];
  team: TeamMember[];
  extraMembers?: number;
  location: string;
  employment: string;
  coverImageUrl?: string;
}