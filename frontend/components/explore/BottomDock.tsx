"use client";

import { Settings, Bookmark, MessageCircle, Plus } from "lucide-react";

const dockButtons = [
  { icon: Settings, label: "Settings" },
  { icon: Bookmark, label: "Saved" },
  { icon: MessageCircle, label: "Conversations" },
];

export default function BottomDock() {
  return (
    <div
      className="fixed inset-x-0 z-50 flex justify-center px-4"
      style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div className="flex items-center gap-1 rounded-full border border-gray-100 bg-white/90 px-2 py-1.5 shadow-xl backdrop-blur-md sm:gap-2 sm:px-3 sm:py-2">
        {dockButtons.map(({ icon: Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:h-11 sm:w-11"
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>
        ))}

        <button
          aria-label="Add post"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700 sm:h-12 sm:w-12"
        >
          <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>
    </div>
  );
}