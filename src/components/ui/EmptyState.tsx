import { FileText, Search, Inbox } from 'lucide-react';

interface EmptyStateProps {
  type?: 'posts' | 'search' | 'drafts';
  message?: string;
}

export function EmptyState({ type = 'posts', message }: EmptyStateProps) {
  const icons = {
    posts: FileText,
    search: Search,
    drafts: Inbox,
  };

  const messages = {
    posts: '아직 작성된 글이 없습니다.',
    search: '검색 결과가 없습니다.',
    drafts: '임시저장된 글이 없습니다.',
  };

  const Icon = icons[type];

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon size={64} className="text-[var(--color-gray-400)] mb-4" />
      <p className="text-lg text-[var(--color-text-light)]">
        {message || messages[type]}
      </p>
    </div>
  );
}
