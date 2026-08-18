import ExploreNavbar from "@/components/explore/ExploreNavbar";
import ExploreContent from "@/components/explore/ExploreContent";
import BottomDock from "@/components/explore/BottomDock";
import { ThemeProvider } from "@/components/explore/ThemeProvider";
import { trendingPosts, newPosts } from "@/components/explore/mock-data";

export default function ExplorePage() {
  return (
    // ThemeProvider owns the `dark` class on <html> and persists the choice;
    // everything below just reacts to it via Tailwind's dark: variant.
    <ThemeProvider>
      {/* h-screen + overflow-hidden on the page itself: there is nothing
         here for the browser to scroll vertically. ExploreNavbar stays
         sticky at the top, ExploreContent (filters + grid) fills whatever's
         left and measures that space itself, and BottomDock floats fixed
         above it. */}
      <div className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 transition-colors dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
        <ExploreNavbar />

        <main className="min-h-0 flex-1 overflow-hidden">
          <ExploreContent trendingPosts={trendingPosts} newPosts={newPosts} />
        </main>

        <BottomDock />
      </div>
    </ThemeProvider>
  );
}