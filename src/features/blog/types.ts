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
