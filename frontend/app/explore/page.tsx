import ExploreNavbar from "@/components/explore/ExploreNavbar";
import PostGrid from "@/components/explore/PostGrid";
import BottomDock from "@/components/explore/BottomDock";
import { trendingPosts, newPosts } from "@/components/explore/mock-data";

const allPosts = [...trendingPosts, ...newPosts];

export default function ExplorePage() {
  return (
    // h-screen + overflow-hidden on the page itself: there is nothing here
    // for the browser to scroll vertically. ExploreNavbar stays sticky at
    // the top, PostGrid is centered in the remaining space, and BottomDock
    // floats fixed above it all.
    <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <ExploreNavbar />

      <main className="flex flex-1 items-center overflow-hidden">
        <PostGrid posts={allPosts} />
      </main>

      <BottomDock />
    </div>
  );
}