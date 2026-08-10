"use client";

import { Settings, Bookmark, MessageCircle, Plus } from "lucide-react";

const dockButtons = [
  { icon: Settings, label: "Settings" },
  { icon: Bookmark, label: "Saved" },
  { icon: MessageCircle, label: "Conversations" },
];

export default function BottomDock() {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white/90 px-3 py-2 shadow-xl backdrop-blur-md">
        {dockButtons.map(({ icon: Icon, label }) => (
          <button
            key={label}
            aria-label={label}
            className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}

        <button
          aria-label="Add post"
          className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition-colors hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}