"use client";

import { useState } from "react";
const MOCK_POSTS: any[] = [];
import CreatePostCard from "./_components/CreatePostCard";
import PostCard from "./_components/PostCard";
import CommentsSheet from "./_components/CommentsSheet";

export default function CommunityPage() {
  const [selectedPost, setSelectedPost] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <CreatePostCard />

        {MOCK_POSTS.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onOpenComments={setSelectedPost}
          />
        ))}
      </div>

      <CommentsSheet
        postId={selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
}