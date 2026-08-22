"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, LogOut, Compass } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout } from "@/store/slices/authSlice";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ id: string; name: string; email: string; avatarUrl?: string } | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (token && userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    if (refreshToken) {
      fetch(`${apiUrl}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => {});
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    dispatch(logout());
    setUser(null);
  };

  const initials = user?.name
    ? user.name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <header className="container mx-auto px-6 py-4">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/Logo.png"
            alt="CoCreate Logo"
            width={40}
            height={40}
            priority
            className="rounded-lg"
          />
          <span className="text-2xl font-bold text-gray-900">CoCreate</span>
        </Link>

        <div className="hidden items-center space-x-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 transition-colors hover:text-blue-600"
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <Link
              href="/explore"
              className="flex items-center gap-1.5 font-semibold text-blue-600 transition-colors hover:text-blue-700"
            >
              <Compass className="h-4 w-4" />
              Explore
            </Link>
          )}
        </div>

        <div className="hidden items-center space-x-4 md:flex">
          {user ? (
            <>
              <Link
                href="/explore"
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
              >
                Go to Explore
              </Link>
              <Link
                href="/profile"
                aria-label="View profile"
                className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-sm font-bold text-white shadow-md ring-2 ring-blue-100"
              >
                {user.avatarUrl ? (
                  <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Log Out"
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="font-medium text-gray-600 transition-colors hover:text-blue-600"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6 text-gray-900" /> : <Menu className="h-6 w-6 text-gray-900" />}
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-20 z-50 mx-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-lg md:hidden">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 transition-colors hover:text-blue-600"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-gray-100" />
              {user ? (
                <>
                  <Link
                    href="/explore"
                    className="flex items-center gap-2 font-semibold text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    <Compass className="h-4 w-4" />
                    Explore Projects
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 py-1 font-medium text-gray-800"
                    onClick={() => setOpen(false)}
                  >
                    <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-xs font-bold text-white">
                      {user.avatarUrl ? (
                        <Image src={user.avatarUrl} alt={user.name} fill className="object-cover" />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <span>{user.name} (My Profile)</span>
                  </Link>
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-2 text-left text-sm font-semibold text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="font-medium text-gray-600 transition-colors hover:text-blue-600"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <span className="block w-full rounded-full bg-blue-600 px-6 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700">
                      Sign Up
                    </span>
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}