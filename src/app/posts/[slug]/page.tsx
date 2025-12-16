// app/posts/[slug]/page.tsx
import { supabase } from '@/lib/supabase';
import { Post } from '@/types';
import { notFound } from 'next/navigation';
import { PostContent } from '@/components/post/PostContent';
import { formatDate, calculateReadingTime, getRelativeTime } from '@/lib/utils';
import { Calendar, Tag, Edit, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

interface PostDetailPageProps {
  params: Promise<{ slug: string }>;
}

async function getPost(slug: string): Promise<Post | null> {
  const decodedSlug = decodeURIComponent(slug);

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', decodedSlug)
    .eq('published', true)
    .maybeSingle();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  return data;
}

export async function generateMetadata({
  params,
}: PostDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return {
      title: '글을 찾을 수 없습니다',
    };
  }

  return {
    title: `${post.title} | BlockSmith`,
    description: post.excerpt || post.content.slice(0, 150),
    keywords: post.tags,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.content.slice(0, 150),
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      tags: post.tags,
    },
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const readingTime = calculateReadingTime(post.content);
  const isUpdated = post.updated_at !== post.created_at;

  return (
    <div className="min-h-screen bg-background">
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-text-light hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>목록으로</span>
        </Link>

        {/* Header */}
        <header className="mb-8 pb-8 border-b-2 border-gray-200">
          {/* Category */}
          {post.category && <span className="badge mb-4">{post.category}</span>}

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-text mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <time dateTime={post.created_at}>
                {formatDate(post.created_at)}
              </time>
            </div>

            <span className="text-gray-300">•</span>

            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{readingTime}분 읽기</span>
            </div>

            {isUpdated && (
              <>
                <span className="text-gray-300">•</span>
                <span className="text-gray-400">
                  {getRelativeTime(post.updated_at)} 수정됨
                </span>
              </>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-secondary text-text-light hover:text-primary text-sm rounded-full transition-colors"
                >
                  <Tag size={14} />
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm border border-gray-200 mb-12">
          <PostContent content={post.content} />
        </div>

        {/* Actions */}
        <div className="flex justify-end items-center pt-8 border-t-2 border-gray-200">
          <Link
            href={`/edit/${post.id}`}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <Edit size={18} />
            수정
          </Link>
        </div>
      </article>
    </div>
  );
}
