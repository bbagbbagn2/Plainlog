// types/index.ts

export interface Post {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  category?: string;
  tags: string[];
  published: boolean;
  created_at: string;
  updated_at: string;
  author_id?: string;
}

export interface Draft {
  id: string;
  post_id?: string;
  content: string;
  created_at: string;
  author_id?: string;
}

export interface PostFormData {
  title: string;
  content: string;
  category?: string;
  tags: string[];
  published: boolean;
}

export interface SearchParams {
  query?: string;
  category?: string;
  tag?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
