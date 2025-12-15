// app/page.tsx

import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import PostCard from '@/components/post/PostCard';
import SearchBar from '@/components/ui/SearchBar';
import CategoryFilter from '@/components/ui/CategoryFilter';

async function getPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
}

async function getCategories(): Promise<string[]> {
  const result: {
    data: { category: string | null }[] | null;
    error: unknown;
  } = await supabase.from('posts').select('category').eq('published', true);

  if (result.error || !result.data) return [];

  const data = result.data;

  const categories = Array.from(
    new Set(data.map((p) => p.category).filter(Boolean)),
  );
  return categories as string[];
}

export default async function Home() {
  const posts = await getPosts();
  const categories = await getCategories();

  return (
    <main className="min-h-screen bg-[#FAFAF9]">
      {/* Hero Section */}
      <section className="py-20 px-4 text-center border-b border-gray-200">
        <h1 className="text-5xl font-bold text-[#1E1E1E] mb-4">개발 블로그</h1>
        <p className="text-xl text-gray-600 mb-8">
          TIL, 회고, 학습 기록을 공유합니다
        </p>
        <SearchBar />
      </section>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Category Filter */}
        <CategoryFilter categories={categories} />

        {/* Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="col-span-full text-center py-20 text-gray-500">
              아직 작성된 글이 없습니다.
            </div>
          )}
        </div>

        {/* View All Link */}
        {posts.length >= 10 && (
          <div className="text-center mt-12">
            <Link
              href="/posts"
              className="inline-block px-6 py-3 bg-[#A855F7] text-white rounded-lg hover:bg-[#9333EA] transition"
            >
              전체 글 보기
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
