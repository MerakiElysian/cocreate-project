"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

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
        </div>

        <div className="hidden items-center space-x-4 md:flex">
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
              <Link
                href="/login"
                className="font-medium text-gray-600 transition-colors hover:text-blue-600"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <span className="block w-full rounded-full bg-blue-600 px-6 py-2 text-center font-medium text-white transition-colors hover:bg-blue-700">
                  Sign Up
                </span>
              </Link>
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}