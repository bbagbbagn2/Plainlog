import Link from 'next/link';
import { Calendar, Tag, Clock } from 'lucide-react';
import { Post } from '@/types';
import { formatDate, calculateReadingTime } from '@/lib/utils';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const readingTime = calculateReadingTime(post.content);

  return (
    <Link href={`/posts/${post.slug}`}>
      <article className="card p-6 h-full hover:border-[var(--color-primary)] transition-all duration-200 cursor-pointer animate-fade-in">
        {/* Category Badge */}
        {post.category && <span className="badge mb-3">{post.category}</span>}

        {/* Title */}
        <h2 className="text-xl font-bold text-[var(--color-text)] mb-3 line-clamp-2 hover:text-[var(--color-primary)] transition-colors">
          {post.title}
        </h2>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-[var(--color-text-light)] mb-4 line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-[var(--color-gray-500)] mb-3">
          <div className="flex items-center gap-1">
            <Calendar size={16} />
            <time dateTime={post.created_at}>
              {formatDate(post.created_at, 'short')}
            </time>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{readingTime}분</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="tag">
                <Tag size={12} />
                {tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-[var(--color-gray-400)]">
                +{post.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </article>
    </Link>
  );
}
