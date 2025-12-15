// app/write/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, X } from 'lucide-react';
import { supabase } from '@/src/lib/supabase';
import { PostFormData } from '@/src/types';

// Markdown 에디터를 동적으로 로드 (SSR 방지)
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function WritePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    category: '',
    tags: [],
    published: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 자동 저장 (5초마다)
  useEffect(() => {
    if (!formData.content) return;

    const autoSave = setTimeout(() => {
      saveDraft();
    }, 5000);

    return () => clearTimeout(autoSave);
  }, [formData.content]);

  const saveDraft = async () => {
    try {
      const { error } = await supabase.from('drafts').insert({
        content: JSON.stringify(formData),
      });

      if (!error) {
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error('Draft save error:', err);
    }
  };

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = async (publish: boolean) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const slug = generateSlug(formData.title);
      const excerpt = formData.content.slice(0, 150).replace(/[#*`]/g, '');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          slug,
          title: formData.title,
          content: formData.content,
          excerpt,
          category: formData.category || null,
          tags: formData.tags,
          published: publish,
        })
        .select();

      if (error) throw error;

      alert(publish ? '글이 발행되었습니다!' : '임시 저장되었습니다.');
      router.push(publish ? `/posts/${slug}` : '/');
    } catch (err) {
      console.error('Error saving post:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAFAF9]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#1E1E1E]">글 작성</h1>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-sm text-gray-500">
                마지막 저장: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              취소
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition disabled:opacity-50"
            >
              <Save size={18} />
              임시저장
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-lg transition disabled:opacity-50"
            >
              <Send size={18} />
              발행
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Title */}
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-4 py-3 text-2xl font-bold border-b-2 border-gray-200 focus:border-[#A855F7] outline-none bg-transparent"
          />

          {/* Meta */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="카테고리 (예: TIL, 회고)"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-[#A855F7] outline-none"
            />
          </div>

          {/* Tags */}
          <div>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="태그 입력 후 엔터"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:border-[#A855F7] outline-none"
              />
              <button
                onClick={handleAddTag}
                className="px-4 py-2 bg-[#EDE9FE] text-[#A855F7] rounded-lg hover:bg-[#DDD6FE] transition"
              >
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[#EDE9FE] text-[#A855F7] rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500 transition"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Markdown Editor */}
          <div data-color-mode="light">
            <MDEditor
              value={formData.content}
              onChange={(val) =>
                setFormData({ ...formData, content: val || '' })
              }
              height={500}
              preview="live"
              hideToolbar={false}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
