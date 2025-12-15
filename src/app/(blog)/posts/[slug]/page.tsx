import Link from 'next/link';
import { notFound } from 'next/navigation';

import { format } from 'date-fns';
import { Calendar, Tag, Edit, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import { supabase } from '@/lib/supabase';
import { Post } from '@/types';

import 'highlight.js/styles/github-dark.css';

async function getPost(slug: string): Promise<Post | null> {
  const decodedSlug =
    slug && slug.includes('%') ? decodeURIComponent(slug) : slug;

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

export default async function PostDetail({ params }: { params: any }) {
  const { slug } = (await params) as { slug: string };
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#FAFAF9]">
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#A855F7] mb-8 transition"
        >
          <ArrowLeft size={20} />
          <span>목록으로</span>
        </Link>

        {/* Header */}
        <header className="mb-8 pb-8 border-b border-gray-200">
          {/* Category */}
          {post.category && (
            <span className="inline-block px-3 py-1 bg-[#EDE9FE] text-[#A855F7] text-sm rounded-full mb-4">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-4xl font-bold text-[#1E1E1E] mb-4">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <time dateTime={post.created_at}>
                {format(new Date(post.created_at), 'yyyy년 MM월 dd일')}
              </time>
            </div>
            {post.updated_at !== post.created_at && (
              <span className="text-gray-400">
                (수정: {format(new Date(post.updated_at), 'yyyy.MM.dd')})
              </span>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag}`}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-[#EDE9FE] text-gray-700 hover:text-[#A855F7] text-sm rounded transition"
                >
                  <Tag size={14} />
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-[#1E1E1E] mt-8 mb-4">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-bold text-[#1E1E1E] mt-6 mb-3">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-bold text-[#1E1E1E] mt-4 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
              ),
              a: ({ href, children }) => (
                <a
                  href={href}
                  className="text-[#A855F7] hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              code: ({ className, children }) => {
                const isInline = !className;
                return isInline ? (
                  <code className="px-1.5 py-0.5 bg-gray-100 text-[#A855F7] rounded text-sm">
                    {children}
                  </code>
                ) : (
                  <code className={className}>{children}</code>
                );
              },
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[#A855F7] pl-4 py-2 my-4 bg-[#FAFAF9]">
                  {children}
                </blockquote>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Edit Button (관리자용 - 추후 권한 체크 추가) */}
        <div className="flex justify-end pt-8 border-t border-gray-200">
          <Link
            href={`/edit/${post.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
          >
            <Edit size={16} />
            <span>수정</span>
          </Link>
        </div>
      </article>
    </main>
  );
}
