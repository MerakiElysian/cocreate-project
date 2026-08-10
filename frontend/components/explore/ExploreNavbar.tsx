"use client";

import Image from "next/image";
import Link from "next/link";
import { Bungee } from "next/font/google";
import { Search } from "lucide-react";
 
const bungee = Bungee({ subsets: ["latin"], weight: "400" });
 
export default function ExploreNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 px-4 py-2.5 backdrop-blur sm:px-6 sm:py-3 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center gap-3 sm:gap-6">
        {/* logo + wordmark */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <Image src="/Logo.png" alt="CoCreate Logo" width={34} height={34} className="rounded-lg" />
          <span className="hidden text-lg font-bold text-gray-900 sm:inline">CoCreate</span>
          <span className={`${bungee.className} explore-flare -ml-0.5 text-lg tracking-wide`}>
            Explore
          </span>
        </Link>
 
        {/* search bar */}
        <div className="relative mx-auto w-full max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, roles, people..."
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-11 pr-4 text-sm text-gray-900 transition-colors focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-600"
          />
        </div>
 
        {/* profile */}
        <Link
          href="/profile"
          aria-label="Your profile"
          // The gradient stays as the base layer, so if the image is
          // missing, still loading, or has transparent edges, there's
          // always a filled circle behind it instead of a broken-image box.
          className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white"
        >
          <Image
            src="/user.jpg"
            alt=""
            fill
            sizes="40px"
            className="object-cover"
          />
        </Link>
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