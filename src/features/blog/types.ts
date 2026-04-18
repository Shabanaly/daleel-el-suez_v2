export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  imageUrl: string | null;
  imagePublicId: string | null;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  authorId: string | null;
  categoryName?: string | null;
  categorySlug?: string | null;
  categoryIcon?: string | null;
  categoryId?: string | null;
}

export interface BlogPostListItem extends BlogPost {
  authorName?: string | null;
}

export interface BlogPostsResult {
  posts: BlogPostListItem[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface BlogFormValues {
  title: string;
  content: string;
  publishedAt: string;
  isPublished: boolean;
}

export interface BlogComment {
  id: string;
  blog_post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}
