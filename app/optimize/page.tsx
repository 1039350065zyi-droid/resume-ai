'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OptimizeResult, OptimizeMode } from '@/types';

const readSessionValue = (key: string) => typeof window === 'undefined' ? '' : sessionStorage.getItem(key) || '';

export default function OptimizePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [rc] = useState(() => readSessionValue('resumeContent'));
  const [jc] = useState(() => readSessionValue('jdContent'));
  const [mode, setMode] = useState<OptimizeMode>('smart');

  useEffect(() => { if (!rc || !jc) router.push('/'); }, [jc, rc, router]);

  const handleOptimize = async () => {
    setLoading(true); setError(null);
    try { const r = await fetch('/api/optimize', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumeContent: rc, jdContent: jc, mode }) }); if (!r.ok) throw new Error((await r.json()).error); setResult((await r.json()).data); }
    catch (err) { setError(err instanceof Error ? err.message : '优化失败'); } finally { setLoading(false); }
  };

  const handleDownload = async () => { if (!result) return; const r = await fetch('/api/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'resume', content: result }) }); if (!r.ok) return; const b = await r.blob(); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = `resume-${Date.now()}.pdf`; a.click(); URL.revokeObjectURL(u); };

  const modes = [
    { v: 'smart' as const, icon: '🤖', title: '智能模式', desc: 'AI自动判断需要哪些规则', badge: '推荐' },
    { v: 'full' as const, icon: '📋', title: '完整模式', desc: '按顺序执行全部8个规则' },
    { v: 'custom' as const, icon: '⚙️', title: '自定义模式', desc: '手动选择要应用的规则' },
  ];

  if (!rc || !jc) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-indigo-500 animate-spin" /></div>;

  return (
    <>
      <nav className="nav sticky top-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3"><button onClick={() => router.push('/analyze')} className="btn btn-ghost">← 返回</button><h1 className="text-lg font-semibold text-gray-900">简历优化</h1></div>
          {result && <button onClick={handleDownload} className="btn btn-soft">📥 下载简历</button>}
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        {!result && !loading && (
          <div className="card-solid p-8 mb-8 fade-up">
            <h2 className="text-base font-semibold text-gray-900 mb-5">选择优化模式</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {modes.map((m) => (
                <button key={m.v} onClick={() => setMode(m.v)} className={`p-5 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] ${mode === m.v ? 'card-blue shadow-lg' : 'card hover:shadow-lg'}`}>
                  <div className="text-3xl mb-2">{m.icon}</div>
                  <h3 className="font-semibold text-gray-900 mb-1">{m.title}</h3>
                  <p className="text-sm text-gray-500">{m.desc}</p>
                  {m.badge && <span className="badge badge-indigo mt-2">{m.badge}</span>}
                </button>
              ))}
            </div>
            <div className="text-center"><button onClick={handleOptimize} className="btn btn-primary text-base px-8 py-3">✨ 开始优化简历</button></div>
          </div>
        )}
        {loading && <div className="card-solid p-20 text-center fade-up"><div className="w-16 h-16 mx-auto mb-5 rounded-full bg-purple-50 flex items-center justify-center pulse-soft"><div className="w-8 h-8 rounded-full border-[3px] border-purple-100 border-t-purple-500 animate-spin" /></div><h2 className="text-xl font-semibold text-gray-900 mb-2">AI 正在优化中</h2><p className="text-gray-500">请稍候...</p></div>}
        {error && <div className="card-solid p-20 text-center fade-up"><div className="text-5xl mb-4">❌</div><h2 className="text-xl font-semibold text-gray-900 mb-2">优化失败</h2><p className="text-gray-500 mb-6">{error}</p><button onClick={handleOptimize} className="btn btn-primary">重新优化</button></div>}
        {result && (
          <div className="space-y-5">
            <div className="card-blue p-5 fade-up"><h3 className="text-sm font-semibold text-gray-900 mb-3">已应用的优化规则</h3><div className="flex flex-wrap gap-1.5">{result.appliedSkills.map((s, i) => <span key={i} className="badge badge-indigo">{s}</span>)}</div></div>
            <div className="card-solid p-6 fade-up fade-up-d1"><h3 className="text-base font-semibold text-gray-900 mb-4">优化后简历</h3><div className="bg-gray-50/80 p-5 rounded-2xl whitespace-pre-wrap text-sm text-gray-700 leading-relaxed border border-gray-100">{result.optimizedResume}</div></div>
            <div className="card-solid p-6 fade-up fade-up-d2">
              <h3 className="text-base font-semibold text-gray-900 mb-4">修改详情</h3>
              <div className="space-y-4">{result.changes.map((c, i) => (
                <div key={i} className="rounded-2xl bg-gray-50/80 border border-gray-100 p-4">
                  <span className="badge badge-purple mb-3">{c.rule}</span>
                  <div className="grid md:grid-cols-2 gap-4 mt-2">
                    <div><p className="text-xs font-medium text-red-500 mb-1">原文</p><p className="text-sm text-gray-600 bg-red-50/60 p-3 rounded-xl border border-red-100">{c.original}</p></div>
                    <div><p className="text-xs font-medium text-emerald-600 mb-1">优化后</p><p className="text-sm text-gray-600 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">{c.optimized}</p></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">{c.explanation}</p>
                </div>
              ))}</div>
            </div>
            <div className="flex justify-center gap-4 pt-2 fade-up fade-up-d3">
              <button onClick={handleOptimize} className="btn btn-soft text-base px-8 py-3">🔄 重新优化</button>
              <button onClick={() => router.push('/interview')} className="btn btn-primary text-base px-8 py-3">🎤 生成面试题</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
