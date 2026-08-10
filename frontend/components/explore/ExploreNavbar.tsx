"use client";

import Image from "next/image";
import Link from "next/link";
import { Caveat } from "next/font/google";
import { Search } from "lucide-react";

const caveat = Caveat({ subsets: ["latin"], weight: ["600", "700"] });

export default function ExploreNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/80 px-6 py-3 backdrop-blur lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center gap-6">
        {/* logo + wordmark */}
        <Link href="/" className="flex flex-shrink-0 items-center gap-2">
          <Image src="/Logo.png" alt="CoCreate Logo" width={34} height={34} className="rounded-lg" />
          <span className="text-lg font-bold text-gray-900">CoCreate</span>
          <span className={`${caveat.className} -ml-0.5 text-2xl italic text-blue-600`}>
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
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white"
        >
          You
        </Link>
      </div>
    </header>
  );
}