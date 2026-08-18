import { Post } from "./types";

/**
 * Visual styling for post cards, kept separate from content (mock-data.ts).
 * Nothing here is stored per-post — cover color and member colors are
 * resolved from a card's position in the grid, and aspect ratio is derived
 * from how much a post actually has to show (roles + description length).
 * This means new posts automatically get sensible, well-distributed styling
 * with no manual "pick a gradient" step.
 */

export const COVER_GRADIENTS = [
  "from-blue-600 to-purple-600",
  "from-purple-600 to-pink-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-500",
  "from-indigo-600 to-blue-500",
  "from-pink-500 to-rose-500",
  "from-teal-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-violet-600 to-indigo-600",
  "from-cyan-500 to-blue-600",
] as const;

export const MEMBER_COLORS = [
  "from-blue-400 to-blue-600",
  "from-purple-400 to-purple-600",
  "from-pink-400 to-pink-600",
  "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
  "from-rose-400 to-rose-600",
  "from-indigo-400 to-indigo-600",
] as const;

/**
 * Deterministic PRNG (mulberry32) so a given grid position always resolves
 * to the same gradient on every render. True Math.random() would make cards
 * flicker between colors on re-render and mismatch between server/client.
 */
function seededRandom(seed: number): number {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

/** Cover gradient chosen by a card's position in the grid (its "block
 * number"), not by post id — re-ordering or filtering the feed still
 * produces a well-distributed, stable spread of colors. */
export function getCoverGradient(gridIndex: number): string {
  const r = seededRandom(gridIndex * 97 + 13);
  return COVER_GRADIENTS[Math.floor(r * COVER_GRADIENTS.length)];
}

/** Team-avatar color, seeded off the card's grid position plus the
 * member's index within that card, so avatars on one card don't collide. */
export function getMemberColor(gridIndex: number, memberIndex: number): string {
  const r = seededRandom(gridIndex * 131 + memberIndex * 17 + 5);
  return MEMBER_COLORS[Math.floor(r * MEMBER_COLORS.length)];
}

/** Two-letter initials for a name, used by the logo chip and team avatars.
 * "Nimbus Labs" -> "NL", "Chorus" -> "CH", so single-word names still read
 * as a real mark instead of collapsing to one letter. */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const DESKTOP_MIN_ASPECT = 1; // square
const DESKTOP_MAX_ASPECT = 1.8; // wide
const MOBILE_MIN_ASPECT = 0.68; // tall
const MOBILE_MAX_ASPECT = 1; // square

/**
 * Aspect ratio is derived from how much a post needs to say, not hand-set
 * per post. Desktop cards have a fixed height, so more content pushes width
 * up (ratio >= 1, wide). Mobile cards have a fixed width, so more content
 * pushes height up instead (ratio <= 1, tall) — same underlying "more
 * content needs more room" idea, applied along whichever axis is free.
 */
export function getAspectRatio(
  post: Pick<Post, "roles" | "description">,
  viewport: "desktop" | "mobile"
): number {
  const roleWeight = Math.min(post.roles.length, 4) / 4; // 0..1
  const descWeight = Math.min(post.description.length, 160) / 160; // 0..1
  const contentWeight = roleWeight * 0.6 + descWeight * 0.4; // 0..1

  if (viewport === "desktop") {
    return DESKTOP_MIN_ASPECT + contentWeight * (DESKTOP_MAX_ASPECT - DESKTOP_MIN_ASPECT);
  }
  return MOBILE_MAX_ASPECT - contentWeight * (MOBILE_MAX_ASPECT - MOBILE_MIN_ASPECT);
}