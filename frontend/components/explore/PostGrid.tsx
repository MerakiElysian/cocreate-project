"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import PostCard from "./PostCard";
import { Post } from "./types";
import { getAspectRatio } from "./PostStyle";

// Fixed per-card height on desktop. PostCard receives this exact number as a
// prop and sizes itself in pixels from it — nothing here is
// responsive-class-driven, so this constant IS the real rendered height, not
// an estimate. That's what lets us safely divide available space by it to
// get a row count.
const CARD_HEIGHT = 300;
const GAP = 20;
const MOBILE_GAP = 16;

// Below this, we drop the horizontal masonry entirely and render one
// full-width column that scrolls vertically like a normal feed — a
// horizontal-only layout doesn't work once there isn't room for it.
const MOBILE_BREAKPOINT = 768;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setIsMobile(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

interface GridItem {
  post: Post;
  gridIndex: number;
}

export default function PostGrid({ posts }: { posts: Post[] }) {
  const isMobile = useIsMobile();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Row count follows the section's real available height -----------
  // Measured (not assumed) via ResizeObserver on the wrapper that actually
  // fills the grid section, so a shorter viewport (small laptop, browser
  // zoom, a taller navbar) naturally gets fewer rows instead of clipping or
  // leaving dead space, and a taller viewport gets more.
  const [rowCount, setRowCount] = useState(3);

  useEffect(() => {
    if (isMobile) return;
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const compute = () => {
      const available = wrapper.clientHeight;
      const count = Math.max(1, Math.floor((available + GAP) / (CARD_HEIGHT + GAP)));
      setRowCount(count);
    };

    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(wrapper);
    return () => ro.disconnect();
  }, [isMobile]);

  // --- Desktop: eased, speed-limited wheel → horizontal scroll ---------
  // Raw deltaY per wheel tick varies wildly by device (a mouse notch can be
  // 100+, a trackpad much less), which is what made `scrollLeft += deltaY`
  // feel jumpy. Instead we scale the input down (SPEED) and drive scrollLeft
  // toward a target with an eased rAF loop (EASE) for consistent, smooth
  // motion regardless of input device.
  const SPEED = 0.6;
  const EASE = 0.14;
  const targetScroll = useRef(0);

  useEffect(() => {
    if (isMobile) return; // native vertical touch scroll handles mobile
    const el = scrollRef.current;
    if (!el) return;

    targetScroll.current = el.scrollLeft;
    let raf = 0;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const raw = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      const max = el.scrollWidth - el.clientWidth;
      targetScroll.current = Math.min(max, Math.max(0, targetScroll.current + raw * SPEED));
    };

    const tick = () => {
      const el2 = scrollRef.current;
      if (el2) {
        const delta = targetScroll.current - el2.scrollLeft;
        el2.scrollLeft += Math.abs(delta) < 0.5 ? delta : delta * EASE;
      }
      raf = requestAnimationFrame(tick);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    raf = requestAnimationFrame(tick);

    return () => {
      el.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  // Greedily place each post into whichever row currently has the least
  // total width, so all rows fill up roughly evenly as you scroll right —
  // this is the "masonry rotated 90°" packing, now against `rowCount` rows
  // instead of a fixed number. Each post's aspect ratio (and therefore its
  // width) is derived from its own content via getAspectRatio, and its
  // gridIndex (used for cover-gradient/avatar-color styling) is its
  // original position in the incoming `posts` array, so styling stays
  // stable even as rows are rebalanced.
  const rows = useMemo(() => {
    if (isMobile) return null;
    const buckets: { items: GridItem[]; width: number }[] = Array.from(
      { length: rowCount },
      () => ({ items: [], width: 0 })
    );

    posts.forEach((post, gridIndex) => {
      const aspect = getAspectRatio(post, "desktop");
      const width = CARD_HEIGHT * aspect;
      const target = buckets.reduce((min, b) => (b.width < min.width ? b : min), buckets[0]);
      target.items.push({ post, gridIndex });
      target.width += width + GAP;
    });

    return buckets.map((b) => b.items);
  }, [posts, isMobile, rowCount]);

  // --- Mobile: single full-width column, native vertical scroll --------
  if (isMobile) {
    return (
      <div
        ref={scrollRef}
        className="h-full w-full overflow-x-hidden overflow-y-auto overscroll-contain scroll-smooth px-4 pb-6 pt-4 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="flex flex-col" style={{ gap: MOBILE_GAP }}>
          {posts.map((post, gridIndex) => (
            <PostCard key={post.id} post={post} height={CARD_HEIGHT} gridIndex={gridIndex} fullWidth />
          ))}
        </div>
      </div>
    );
  }

  // --- Desktop: horizontal masonry, rowCount rows tall --------------------
  const gridHeight = rowCount * CARD_HEIGHT + (rowCount - 1) * GAP;

  return (
    // Fills the grid section completely — this is what ResizeObserver
    // measures. The scrollable inner box is vertically centered inside it
    // so any leftover fraction-of-a-row space is distributed evenly.
    <div ref={wrapperRef} className="flex h-full w-full items-center overflow-hidden">
      <div
        ref={scrollRef}
        style={{ height: gridHeight }}
        className="w-full overflow-x-auto overflow-y-hidden px-6 [&::-webkit-scrollbar]:hidden lg:px-12"
      >
        <div className="flex h-full w-max flex-col gap-5">
          {rows!.map((row, rowIndex) => (
            <div key={rowIndex} className="flex gap-5" style={{ height: CARD_HEIGHT }}>
              {row.map(({ post, gridIndex }) => (
                <PostCard key={post.id} post={post} height={CARD_HEIGHT} gridIndex={gridIndex} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}