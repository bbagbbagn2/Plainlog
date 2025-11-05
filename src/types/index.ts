export interface Tag {
  id: number;
  name: string;
}

// post_tags 안의 tags는 배열이 아니라 단일 객체
export interface PostTag {
  tag_id: number;
  tags: Tag; // 단일 객체
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  category?: string;
  published: boolean;
  created_at: string; // Supabase timestamp
  post_tags: PostTag[];
}

export interface PostRaw {
  id: number;
  title: string;
  slug: string;
  content: string;
  category?: string;
  published: boolean;
  created_at: string;
  post_tags?: {
    tag_id: number;
    tags: Tag[];
  }[];
}
