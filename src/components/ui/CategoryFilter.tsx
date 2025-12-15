// components/ui/CategoryFilter.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface CategoryFilterProps {
  categories: string[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get('category');

  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/"
        className={`px-4 py-2 rounded-full transition ${
          !currentCategory
            ? 'bg-[#A855F7] text-white'
            : 'bg-white text-gray-600 hover:bg-gray-100'
        }`}
      >
        전체
      </Link>
      {categories.map((category) => (
        <Link
          key={category}
          href={`/?category=${category}`}
          className={`px-4 py-2 rounded-full transition ${
            currentCategory === category
              ? 'bg-[#A855F7] text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
          }`}
        >
          {category}
        </Link>
      ))}
    </div>
  );
}
