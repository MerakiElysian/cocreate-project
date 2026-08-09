import Image from "next/image";
import Link from "next/link";

const links = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <Link href="/" className="mb-4 flex items-center space-x-2 md:mb-0">
            <Image src="/Logo.png" alt="CoCreate Logo" width={32} height={32} className="rounded" />
            <span className="text-lg font-semibold text-gray-900">CoCreate</span>
          </Link>

          <div className="flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 transition-colors hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-500">
            © 2025 CoCreate. All rights reserved. Built with ❤️ for creators
            worldwide.
          </p>
        </div>
      </div>
    </footer>
  );
}