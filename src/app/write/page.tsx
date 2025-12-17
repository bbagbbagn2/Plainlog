// app/write/page.tsx
'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Send, X, FolderOpen, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { PostFormData, Draft } from '@/types';
import { generateSlug, extractExcerpt } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

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
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  // 임시저장 함수 (버튼 클릭 시에만 실행)
  const handleSaveDraft = async () => {
    if (!formData.title.trim() && !formData.content.trim()) {
      alert('제목이나 내용을 입력해주세요.');
      return;
    }

    setSavingDraft(true);

    try {
      const { error } = await supabase.from('drafts').insert({
        content: JSON.stringify(formData),
      });

      if (error) throw error;

      setLastSaved(new Date());
      alert('임시저장되었습니다.');
    } catch (err) {
      console.error('Draft save error:', err);
      alert('임시저장 중 오류가 발생했습니다.');
    } finally {
      setSavingDraft(false);
    }
  };

  const loadDrafts = async () => {
    setLoadingDrafts(true);
    try {
      const { data, error } = await supabase
        .from('drafts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDrafts(data || []);
    } catch (err) {
      console.error('Error loading drafts:', err);
      alert('임시저장 목록을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoadingDrafts(false);
    }
  };

  const handleOpenDrafts = () => {
    setShowDrafts(true);
    loadDrafts();
  };

  const handleLoadDraft = (draft: Draft) => {
    try {
      const parsedData = JSON.parse(draft.content);
      setFormData(parsedData);
      setShowDrafts(false);
      alert('임시저장된 글을 불러왔습니다.');
    } catch (err) {
      console.error('Error parsing draft:', err);
      alert('임시저장 데이터를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteDraft = async (draftId: string) => {
    if (!confirm('이 임시저장을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;
      loadDrafts();
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('Error deleting draft:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
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
      const excerpt = extractExcerpt(formData.content);

      const { error } = await supabase.from('posts').insert({
        slug,
        title: formData.title,
        content: formData.content,
        excerpt,
        category: formData.category || null,
        tags: formData.tags,
        published: publish,
      });

      if (error) throw error;

      if (publish) {
        alert('글이 발행되었습니다!');
        router.push(`/posts/${slug}`);
        router.refresh();
      } else {
        alert('임시 저장되었습니다.');
        router.push('/posts');
        router.refresh();
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-[var(--color-text-light)] hover:text-[var(--color-primary)]"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">
              글 작성
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {lastSaved && (
              <span className="text-sm text-[var(--color-gray-500)]">
                마지막 저장: {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button
              variant="secondary"
              onClick={handleOpenDrafts}
              icon={<FolderOpen size={18} />}
            >
              임시저장 목록
            </Button>
          </div>
        </div>

        {/* Draft Modal */}
        {showDrafts && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto mx-3 md:mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text">임시저장 목록</h2>
                <button
                  onClick={() => setShowDrafts(false)}
                  className="text-gray-500 hover:text-text"
                >
                  <X size={24} />
                </button>
              </div>

              {loadingDrafts ? (
                <div className="text-center py-8 text-[var(--color-gray-500)]">
                  불러오는 중...
                </div>
              ) : drafts.length === 0 ? (
                <div className="text-center py-8 text-[var(--color-gray-500)]">
                  임시저장된 글이 없습니다.
                </div>
              ) : (
                <div className="space-y-3">
                  {drafts.map((draft) => {
                    let parsedData;
                    try {
                      parsedData = JSON.parse(draft.content);
                    } catch {
                      return null;
                    }

                    return (
                      <div
                        key={draft.id}
                        className="border border-[var(--color-gray-200)] rounded-lg p-4 hover:border-[var(--color-primary)] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleLoadDraft(draft)}
                          >
                            <h3 className="font-bold text-lg mb-1 text-[var(--color-text)]">
                              {parsedData.title || '제목 없음'}
                            </h3>
                            <p className="text-sm text-[var(--color-text-light)] mb-2 line-clamp-2">
                              {parsedData.content?.slice(0, 100) || '내용 없음'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-[var(--color-gray-500)]">
                              <Clock size={14} />
                              <span>
                                {new Date(draft.created_at).toLocaleString(
                                  'ko-KR',
                                )}
                              </span>
                              {parsedData.category && (
                                <span className="badge text-xs">
                                  {parsedData.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLoadDraft(draft)}
                              className="px-3 py-1.5 bg-[var(--color-primary)] text-white text-sm rounded-lg hover:bg-[var(--color-primary-hover)] transition-colors"
                            >
                              불러오기
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDraft(draft.id);
                              }}
                              className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded-lg hover:bg-red-200 transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

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
          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="secondary"
              onClick={handleSaveDraft}
              isLoading={savingDraft}
              icon={<Save size={18} />}
            >
              임시저장
            </Button>
            <Button
              variant="primary"
              onClick={() => handleSubmit(true)}
              isLoading={loading}
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
