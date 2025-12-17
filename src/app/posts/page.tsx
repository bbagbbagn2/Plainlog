// app/posts/page.tsx
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { PostList } from '@/components/post/PostList';

async function getPosts(): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data ?? [];
}

export default async function PostsPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">
            전체 글
          </h1>

          <p className="text-[var(--color-text-light)]">
            총 {posts.length}개의 글
          </p>
        </div>

        {/* Posts */}
        <PostList posts={posts} emptyMessage={'아직 작성된 글이 없습니다.'} />
      </div>
    </div>
  );
}
