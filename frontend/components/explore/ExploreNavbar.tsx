"use client";

import Image from "next/image";
import Link from "next/link";
import { Bungee } from "next/font/google";
import { Search, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeProvider";

const bungee = Bungee({ subsets: ["latin"], weight: "400" });

export default function ExploreNavbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 px-4 py-2.5 backdrop-blur transition-colors sm:px-6 sm:py-3 lg:px-12 dark:border-gray-800 dark:bg-gray-950/80">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 sm:gap-8">
        {/* logo + wordmark — pinned to the far left edge of the bar */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <Image src="/Logo.png" alt="CoCreate Logo" width={34} height={34} className="rounded-lg" />
          <span className="hidden text-lg font-bold text-gray-900 sm:inline dark:text-white">
            CoCreate
          </span>
          <span className={`${bungee.className} explore-flare -ml-0.5 text-lg tracking-wide`}>
            Explore
          </span>
        </Link>

        {/* search bar — floats in the middle of whatever space is left */}
        <div className="relative mx-auto w-full max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search projects, roles, people..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 transition-colors placeholder:text-gray-400 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-blue-500 dark:focus:bg-gray-900 dark:focus:ring-blue-500"
          />
        </div>

        {/* theme toggle + profile — grouped and pinned to the far right edge */}
        <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:h-10 sm:w-10 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            ) : (
              <Sun className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            )}
          </button>

          {/* profile */}
          <Link
            href="/profile"
            aria-label="Your profile"
            // The gradient stays as the base layer, so if the image is
            // missing, still loading, or has transparent edges, there's
            // always a filled circle behind it instead of a broken-image box.
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white"
          >
            <Image src="/user.jpg" alt="" fill sizes="40px" className="object-cover" />
          </Link>
        </div>
      </div>
      <style jsx>{`
        .explore-flare {
          background-image: linear-gradient(
            90deg,
            #7646e5 0%,
            #a855f7 20%,
            #ec4899 40%,
            #a855f7 60%,
            #4f46e5 80%,
            #7646e5 100%
          );
          background-size: 300% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: flare-sweep 10s linear infinite;
        }

        @keyframes flare-sweep {
          0% {
            background-position: 0% 50%;
          }
          100% {
            background-position: -200% 50%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .explore-flare {
            animation: none;
            background-position: 0% 50%;
          }
        }
      `}</style>
    </header>
  );
}