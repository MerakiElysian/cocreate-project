"use client";

import { useEffect, useMemo, useRef } from "react";
import PostCard from "./PostCard";
import { Post } from "./types";

const ROWS = 2;
// The single source of truth for every card's height. PostCard receives this
// exact number as a prop and sizes itself in pixels from it — nothing here
// is responsive-class-driven, so this constant IS the real rendered height,
// not an estimate. That's what guarantees the grid can't overflow vertically.
const CARD_HEIGHT = 300;
const GAP = 20;

// Clamp so an extreme aspectRatio in the data can never produce a card wide
// or narrow enough to look broken or to throw off the row-balancing math.
const MIN_ASPECT = 0.55;
const MAX_ASPECT = 1.8;

export default function PostGrid({ posts }: { posts: Post[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Translate any vertical wheel/trackpad input into horizontal scroll, and
  // always prevent the default so this section never bubbles a vertical
  // scroll up to the page — it should ONLY ever scroll horizontally.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollLeft += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Greedily place each post into whichever row currently has the least
  // total width, so all rows fill up roughly evenly as you scroll right —
  // this is the "masonry rotated 90°" packing. Every width is computed from
  // the same fixed CARD_HEIGHT that PostCard will actually render at.
  const rows = useMemo(() => {
    const buckets: { items: Post[]; width: number }[] = Array.from({ length: ROWS }, () => ({
      items: [],
      width: 0,
    }));

    posts.forEach((post) => {
      const aspect = Math.min(MAX_ASPECT, Math.max(MIN_ASPECT, post.aspectRatio));
      const width = CARD_HEIGHT * aspect;
      const target = buckets.reduce((min, b) => (b.width < min.width ? b : min), buckets[0]);
      target.items.push({ ...post, aspectRatio: aspect });
      target.width += width + GAP;
    });

    return buckets.map((b) => b.items);
  }, [posts]);

  const gridHeight = ROWS * CARD_HEIGHT + (ROWS - 1) * GAP;

  return (
    <div
      ref={scrollRef}
      // Explicit fixed height (not h-full / min-h-*) so this box is exactly
      // as tall as its rows and can never be pushed taller by content — the
      // browser has nothing to vertically scroll even if it wanted to.
      style={{ height: gridHeight }}
      className="w-full overflow-x-auto overflow-y-hidden scroll-smooth px-6 [&::-webkit-scrollbar]:hidden lg:px-12"
    >
      <div className="flex h-full w-max flex-col gap-5">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-5" style={{ height: CARD_HEIGHT }}>
            {row.map((post) => (
              <PostCard key={post.id} post={post} height={CARD_HEIGHT} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}