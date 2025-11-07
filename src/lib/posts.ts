import { supabase } from "@/lib/supabase";
import type { Post, PostRaw } from "@/types";

function mapPostData(p: PostRaw): Post {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    content: p.content,
    category: p.category,
    published: p.published,
    created_at: p.created_at,
    post_tags: (p.post_tags ?? []).map((pt) => ({
      tag_id: pt.tag_id,
      tags: pt.tags[0],
    })),
  };
}

// 글 생성
export async function createPost(post: {
  title: string;
  slug: string;
  content: string;
  category?: string;
  published?: boolean;
  tags?: string[];
}) {
  // 1. post 생성
  const { data: postData, error: postError } = await supabase
    .from("posts")
    .insert([
      {
        title: post.title,
        slug: post.slug,
        content: post.content,
        category: post.category,
        published: post.published,
      },
    ])
    .select()
    .single();

  if (postError) throw postError;

  // 2. tag 처리
  if (post.tags && post.tags.length > 0) {
    for (const tagName of post.tags) {
      // 태그 존재 여부 확인 후 없으면 추가
      const { data: existingTag, error: findError } = await supabase
        .from("tags")
        .select("*")
        .eq("name", tagName)
        .maybeSingle();

      let tagId: number;
      if (!existingTag || findError) {
        const { data: newTag, error: insertError } = await supabase
          .from("tags")
          .insert([{ name: tagName }])
          .select()
          .single();

        if (insertError) throw insertError;
        tagId = newTag.id;
      } else {
        tagId = existingTag.id;
      }

      // post_tags 테이블에 연결
      await supabase
        .from("post_tags")
        .insert([{ post_id: postData.id, tag_id: tagId }]);
    }
  }

  return postData;
}

// 글 불러오기 (태그 포함)
export async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `
      id, title, slug, content, category, published, created_at,
      post_tags (
        tag_id,
        tags (id, name)
      )
    `,
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map(mapPostData);
}
