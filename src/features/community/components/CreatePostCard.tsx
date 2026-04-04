"use client";

import Image from "next/image";

export default function CreatePostCard() {
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl p-4 shadow-sm">
      <div className="flex gap-3 items-center">
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Me"
            alt="me"
            fill
          />
        </div>

        <button className="flex-1 h-10 bg-background rounded-full px-4 text-sm text-text-muted text-right border border-border-subtle">
          شارك ما يحدث في السويس...
        </button>
      </div>
    </div>
  );
}