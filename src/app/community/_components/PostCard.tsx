"use client";

import Image from "next/image";
import { MessageCircle, Heart, Share2 } from "lucide-react";

interface Props {
  post: any;
  onOpenComments: (id: string) => void;
}

export default function PostCard({ post, onOpenComments }: Props) {
  return (
    <div className="bg-surface border border-border-subtle rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex gap-3 items-center">
          <div className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image src={post.author.avatar} alt={post.author.name} fill />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              {post.author.name}
            </h3>
            <p className="text-xs text-text-muted">
              {post.timestamp} • {post.author.location}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-text-primary text-sm leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Image */}
      {post.hasImage && post.imageUrl && (
        <div className="relative aspect-video">
          <Image src={post.imageUrl} alt="" fill className="object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center px-4 py-3 border-t border-border-subtle text-text-muted text-sm">
        <span>{post.likes} إعجاب</span>

        <div className="flex gap-6">
          <button className="flex items-center gap-1 hover:text-primary">
            <Heart className="w-4 h-4" />
            أعجبني
          </button>

          <button
            onClick={() => onOpenComments(post.id)}
            className="flex items-center gap-1 hover:text-primary"
          >
            <MessageCircle className="w-4 h-4" />
            تعليق
          </button>

          <button className="flex items-center gap-1 hover:text-primary">
            <Share2 className="w-4 h-4" />
            مشاركة
          </button>
        </div>
      </div>
    </div>
  );
}