'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get('category');

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/"
        className={cn(
          'px-4 py-2 rounded-full transition-all duration-200 font-medium',
          !currentCategory
            ? 'bg-[var(--color-primary)] text-white shadow-md'
            : 'bg-white text-[var(--color-text-light)] hover:bg-[var(--color-gray-50)] border border-[var(--color-gray-200)]',
        )}
      >
        전체
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/?category=${category}`}
          className={cn(
            'px-4 py-2 rounded-full transition-all duration-200 font-medium',
            currentCategory === category
              ? 'bg-[var(--color-primary)] text-white shadow-md'
              : 'bg-white text-[var(--color-text-light)] hover:bg-[var(--color-gray-50)] border border-[var(--color-gray-200)]',
          )}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
