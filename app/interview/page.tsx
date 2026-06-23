'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { InterviewResult, InterviewQuestion } from '@/types';

const readSessionValue = (key: string) => typeof window === 'undefined' ? '' : sessionStorage.getItem(key) || '';

export default function InterviewPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewResult | null>(null);
  const [rc] = useState(() => readSessionValue('resumeContent'));
  const [jc] = useState(() => readSessionValue('jdContent'));
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => { if (!rc || !jc) router.push('/'); }, [jc, rc, router]);

  const handleGenerate = async () => {
    setLoading(true); setError(null);
    try { const r = await fetch('/api/interview', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeContent: rc, jdContent: jc }) }); if (!r.ok) throw new Error((await r.json()).error); setResult((await r.json()).data); }
    catch (err) { setError(err instanceof Error ? err.message : '生成失败'); } finally { setLoading(false); }
  };

  const handleDownload = async () => { if (!result) return; const r = await fetch('/api/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'interview', content: result }) }); if (!r.ok) return; const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `interview-${Date.now()}.pdf`; a.click(); URL.revokeObjectURL(u); };

  const toggle = (i: number) => setExpanded(expanded === i ? null : i);

  const renderQ = (qs: InterviewQuestion[], label: string, icon: string, start: number, bg: string, bdr: string) => (
    <div className="card-solid p-6">
      <div className="flex items-center mb-5">
        <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center text-xl mr-3 border ${bdr} shadow-sm`}>{icon}</div>
        <div className="flex-1"><h3 className="text-base font-semibold text-gray-900">{label}</h3><p className="text-xs text-gray-500">基于你的简历和岗位要求</p></div>
        <span className="badge badge-indigo">{qs.length} 题</span>
      </div>
      <div className="space-y-2.5">{qs.map((q, i) => {
        const idx = start + i, isOpen = expanded === idx;
        return (
          <div key={i} className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'bg-indigo-50/40 border-indigo-100' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-100/60'}`}>
            <div className="p-4 cursor-pointer" onClick={() => toggle(idx)}>
              <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2 mb-1.5"><span className="text-xs text-gray-400">第 {i + 1} 题</span><span className="badge badge-purple">{q.focus}</span></div>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">{q.question}</p>
                </div>
                <span className={`text-gray-300 transition-transform duration-300 text-xs ${isOpen ? 'rotate-90' : ''}`}>▶</span>
              </div>
            </div>
            {isOpen && (
              <div className="px-4 pb-4 pt-3 border-t border-gray-100 space-y-3">
                <div><p className="text-xs font-medium text-indigo-500 mb-1">💡 回答技巧</p><p className="text-sm text-gray-600 leading-relaxed">{q.tips}</p></div>
                <div><p className="text-xs font-medium text-emerald-600 mb-1">✅ 参考答案</p><p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{q.referenceAnswer}</p></div>
              </div>
            )}
          </div>
        );
      })}</div>
    </div>
  );

  if (!rc || !jc) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-indigo-500 animate-spin" /></div>;

  return (
    <>
      <nav className="nav sticky top-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><button onClick={() => router.push('/')} className="btn btn-ghost">← 返回</button><h1 className="text-lg font-semibold text-gray-900">面试准备</h1></div>
          {result && <button onClick={handleDownload} className="btn btn-soft">📥 下载面试题</button>}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        {!result && !loading && (
          <div className="card-blue p-16 text-center fade-up">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-3xl border border-purple-200/50 shadow-sm">🎤</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">生成面试题</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">基于你的简历和目标岗位JD，AI将生成针对性的面试题</p>
            <button onClick={handleGenerate} className="btn btn-primary text-base px-8 py-3">🚀 开始生成面试题</button>
          </div>
        )}
        {loading && <div className="card-solid p-20 text-center fade-up"><div className="w-16 h-16 mx-auto mb-5 rounded-full bg-purple-50 flex items-center justify-center pulse-soft"><div className="w-8 h-8 rounded-full border-[3px] border-purple-100 border-t-purple-500 animate-spin" /></div><h2 className="text-xl font-semibold text-gray-900 mb-2">AI 正在生成面试题</h2><p className="text-gray-500">请稍候...</p></div>}
        {error && <div className="card-solid p-20 text-center fade-up"><div className="text-5xl mb-4">❌</div><h2 className="text-xl font-semibold text-gray-900 mb-2">生成失败</h2><p className="text-gray-500 mb-6">{error}</p><button onClick={handleGenerate} className="btn btn-primary">重新生成</button></div>}
        {result && (
          <div className="space-y-5">
            {renderQ(result.behavioralQuestions, '行为面试题', '🗣️', 0, 'bg-blue-50', 'border-blue-100')}
            {renderQ(result.technicalQuestions, '技术面试题', '💻', result.behavioralQuestions.length, 'bg-purple-50', 'border-purple-100')}
            <div className="flex justify-center gap-4 pt-2 fade-up"><button onClick={handleGenerate} className="btn btn-soft text-base px-8 py-3">🔄 重新生成</button><button onClick={() => router.push('/')} className="btn btn-primary text-base px-8 py-3">🏠 返回首页</button></div>
          </div>
        )}
      </main>
    </>
  );
}
