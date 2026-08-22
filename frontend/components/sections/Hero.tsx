"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

const features = [
  {
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    title: "Collaborate",
    description: "Work together in real-time with teams from around the world",
    path: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    title: "Innovate",
    description: "Turn your creative ideas into reality with powerful tools",
    path: "M13 10V3L4 14h7v7l9-11h-7z",
  },
  {
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    title: "Succeed",
    description: "Launch your projects with confidence and achieve your goals",
    path: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z",
  },
];

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    setIsLoggedIn(!!token);
  }, []);

  return (
    <main className="container mx-auto px-6 py-16">
      <div className="mx-auto max-w-4xl text-center">
        <div className="mb-8">
          <Image
            src="/logo-removebg-preview.png"
            alt="Logo"
            width={175}
            height={175}
            priority
            className="mx-auto"
          />
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight text-gray-900 md:text-6xl">
          Create Together,
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {" "}Build Better
          </span>
        </h1>

        <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-600 md:text-2xl">
          The ultimate collaborative platform where ideas meet innovation.
          Connect with creators, share your vision, and bring projects to
          life together.
        </p>

        <div className="mb-16 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href={isLoggedIn ? "/explore" : "/login"}
            className="transform rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:bg-blue-700 hover:shadow-xl"
          >
            Start Creating Now
          </Link>
          <Link
            href={isLoggedIn ? "/profile" : "/signup"}
            className="rounded-full border-2 border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 transition-all duration-200 hover:border-blue-600 hover:text-blue-600"
          >
            {isLoggedIn ? "My Profile" : "Create Free Account"}
          </Link>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-8 shadow-lg transition-shadow hover:shadow-xl"
            >
              <div
                className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${feature.iconBg}`}
              >
                <svg
                  className={`h-8 w-8 ${feature.iconColor}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.path} />
                </svg>
              </div>
              <h3 className="mb-3 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}