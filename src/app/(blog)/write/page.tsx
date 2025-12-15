'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { Save, Send, X, FolderOpen, Clock } from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { PostFormData } from '@/types';

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false });

interface Draft {
  id: number;
  content: string;
  created_at: string;
}

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
  const [showDrafts, setShowDrafts] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

  // 자동 저장
  useEffect(() => {
    if (!formData.content) return;

    const autoSave = setTimeout(() => {
      saveDraft();
    }, 60000);

    return () => clearTimeout(autoSave);
  }, [formData.content]);

  // 임시저장 목록 불러오기
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

  // 임시저장 모달 열기
  const handleOpenDrafts = () => {
    setShowDrafts(true);
    loadDrafts();
  };

  // 임시저장 불러오기
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

  // 임시저장 삭제
  const handleDeleteDraft = async (draftId: number) => {
    if (!confirm('이 임시저장을 삭제하시겠습니까?')) return;

    try {
      const { error } = await supabase
        .from('drafts')
        .delete()
        .eq('id', draftId);

      if (error) throw error;

      // 목록 새로고침
      loadDrafts();
      alert('삭제되었습니다.');
    } catch (err) {
      console.error('Error deleting draft:', err);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

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

  // 슬러그 중복 방지: 기존에 같은 슬러그가 있으면 접미사 숫자를 붙여 반환
  const getUniqueSlug = async (baseTitle: string, publish: boolean) => {
    const base = generateSlug(baseTitle);
    let candidate = base;

    for (let i = 0; i < 10; i++) {
      try {
        let query = supabase
          .from('posts')
          .select('id')
          .eq('slug', candidate)
          .limit(1);
        if (publish) query = query.eq('published', true);

        const { data } = await query;

        if (!data || (Array.isArray(data) && data.length === 0)) {
          return candidate;
        }
      } catch (e) {
        console.error('Error checking slug existence:', e);
        return candidate;
      }

      candidate = `${base}-${i + 1}`;
    }

    return `${base}-${Date.now().toString(36)}`;
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
      const slug = await getUniqueSlug(formData.title, publish);
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
    } catch (err: any) {
      console.error('Error saving post:', err);
      try {
        console.error(
          'Error (stringified):',
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2),
        );
      } catch (e) {
        console.error('Error stringifying error object failed', e);
      }

      const message =
        err?.message ??
        err?.error ??
        err?.statusText ??
        err?.status ??
        JSON.stringify(err);
      alert(`저장 중 오류가 발생했습니다: ${message}`);
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
            {/* 임시저장 불러오기 버튼 */}
            <button
              onClick={handleOpenDrafts}
              className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition"
            >
              <FolderOpen size={18} />
              임시저장 목록
            </button>
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

        {/* 임시저장 모달 */}
        {showDrafts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">임시저장 목록</h2>
                <button
                  onClick={() => setShowDrafts(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {loadingDrafts ? (
                <div className="text-center py-8 text-gray-500">
                  불러오는 중...
                </div>
              ) : drafts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
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
                        className="border border-gray-200 rounded-lg p-4 hover:border-[#A855F7] transition"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => handleLoadDraft(draft)}
                          >
                            <h3 className="font-bold text-lg mb-1">
                              {parsedData.title || '제목 없음'}
                            </h3>
                            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                              {parsedData.content?.slice(0, 100) || '내용 없음'}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock size={14} />
                              <span>
                                {new Date(draft.created_at).toLocaleString(
                                  'ko-KR',
                                )}
                              </span>
                              {parsedData.category && (
                                <span className="px-2 py-0.5 bg-[#EDE9FE] text-[#A855F7] rounded">
                                  {parsedData.category}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleLoadDraft(draft)}
                              className="px-3 py-1.5 bg-[#A855F7] text-white text-sm rounded hover:bg-[#9333EA] transition"
                            >
                              불러오기
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDraft(draft.id);
                              }}
                              className="px-3 py-1.5 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition"
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
