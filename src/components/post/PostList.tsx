import { Post } from '@/types';
import { PostCard } from './PostCard';
import { EmptyState } from '../ui/EmptyState';

interface PostListProps {
  posts: Post[];
  emptyMessage?: string;
}

export function PostList({ posts, emptyMessage }: PostListProps) {
  if (posts.length === 0) {
    return <EmptyState type="posts" message={emptyMessage} />;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
