// app/edit/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Save, Send, X, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PostFormData } from '@/types';
import { generateSlug, extractExcerpt } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import Link from 'next/link';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

export default function EditPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [formData, setFormData] = useState<PostFormData>({
    title: '',
    content: '',
    category: '',
    tags: [],
    published: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 기존 글 불러오기
  useEffect(() => {
    if (!id) return;

    async function loadPost() {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            title: data.title,
            content: data.content,
            category: data.category || '',
            tags: data.tags || [],
            published: data.published,
          });
        }
      } catch (err) {
        console.error('Error loading post:', err);
        alert('글을 불러오는 중 오류가 발생했습니다.');
        router.push('/');
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [id, router]);

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
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = async (publish: boolean) => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }

    setSaving(true);

    try {
      const slug = generateSlug(formData.title);
      const excerpt = extractExcerpt(formData.content);

      const { error } = await supabase
        .from('posts')
        .update({
          slug,
          title: formData.title,
          content: formData.content,
          excerpt,
          category: formData.category || null,
          tags: formData.tags,
          published: publish,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      alert(publish ? '글이 수정되었습니다!' : '임시 저장되었습니다.');
      router.push(publish ? `/posts/${slug}` : '/');
    } catch (err) {
      console.error('Error updating post:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              글 수정
            </h1>
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
            className="w-full px-4 py-3 text-2xl font-bold border-b-2 border-[var(--color-gray-200)] focus:border-[var(--color-primary)] outline-none bg-transparent transition-colors"
          />

          {/* Category */}
          <input
            type="text"
            placeholder="카테고리 (예: TIL, 회고)"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            className="input-base w-full md:w-1/2"
          />

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
                className="input-base flex-1"
              />
              <Button variant="secondary" onClick={handleAddTag}>
                추가
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--color-secondary)] text-[var(--color-primary)] rounded-full font-medium"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Markdown Editor */}
          <div
            data-color-mode="light"
            className="border border-[var(--color-gray-200)] rounded-lg overflow-hidden"
          >
            <MDEditor
              value={formData.content}
              onChange={(val) =>
                setFormData({ ...formData, content: val || '' })
              }
              height={500}
              preview="live"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => handleSubmit(false)}
              isLoading={saving}
              icon={<Save size={18} />}
            >
              임시저장
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit(true)}
              isLoading={saving}
              icon={<Send size={18} />}
            >
              발행
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
