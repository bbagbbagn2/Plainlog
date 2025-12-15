// components/post/PostCard.tsx

import { Post } from '@/src/types';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <Link href={`/posts/${post.slug}`}>
      <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 h-full border border-gray-100 hover:border-[#A855F7] cursor-pointer">
        {/* Category Badge */}
        {post.category && (
          <span className="inline-block px-3 py-1 bg-[#EDE9FE] text-[#A855F7] text-sm rounded-full mb-3">
            {post.category}
          </span>
        )}

        {/* Title */}
        <h2 className="text-xl font-bold text-[#1E1E1E] mb-3 line-clamp-2 hover:text-[#A855F7] transition">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <time dateTime={post.created_at}>
              {format(new Date(post.created_at), 'yyyy.MM.dd')}
            </time>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                <Tag size={12} />
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-gray-400">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}
