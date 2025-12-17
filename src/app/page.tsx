import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { PostList } from '@/components/post/PostList';
import { CategoryFilter } from '@/components/ui/CategoryFilter';

interface HomePageProps {
  searchParams: { category?: string };
}

async function getPosts(category?: string): Promise<Post[]> {
  let query = supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query.limit(6);

  if (error) {
    console.error('Error fetching posts:', error);
    return [];
  }

  return data || [];
}

async function getCategories(): Promise<string[]> {
  const result: {
    data: { category: string }[] | null;
    error: unknown;
  } = await supabase.from('posts').select('category').eq('published', true);

  //오류거나 데이터가 없으면 빈 값 호출
  if (result.error || !result.data) return [];

  const categories = Array.from(
    new Set(result.data.map((p) => p.category).filter(Boolean)),
  );
  return categories as string[];
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const categoryParam = resolvedSearchParams?.category;
  const category =
    typeof categoryParam === 'string' ? categoryParam : undefined;

  const posts = await getPosts(category);
  const categories = await getCategories();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <section className="py-20 px-4 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-black mb-4 leading-tight">
            개발을 기록하다
          </h1>
          <p className="text-lg md:text-xl text-text-light mb-4">
            TIL, 회고, 학습 내용을 정리하고 공유합니다
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-2 px-4 py-12">
        {/* Category Filter */}
        <div className="mb-8">
          <CategoryFilter categories={categories} />
        </div>

        {/* Posts Grid */}
        <PostList
          posts={posts}
          emptyMessage={
            searchParams.category
              ? `"${searchParams.category}" 카테고리에 글이 없습니다.`
              : '아직 작성된 글이 없습니다.'
          }
        />

        {/* View All Button */}
        {posts.length >= 6 && (
          <div className="text-center mt-12">
            <Link
              href="/posts"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              전체 글 보기
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>

      {/* Featured Section */}
      {posts.length > 0 && (
        <section className="bg-color-gray-50 py-16 px-4 mt-20 border-t border-gray-200">
          <div className="mx-auto">
            <h2 className="text-3xl font-bold text-black mb-8 text-center">
              최근 작성한 글
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {posts.slice(0, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.slug}`}
                  className="bg-white p-6 rounded-lg hover:shadow-md transition-shadow border border-gray-200"
                >
                  <h3 className="font-bold text-lg text-[var(--color-text)] mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-[var(--color-text-light)] line-clamp-3">
                    {post.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
