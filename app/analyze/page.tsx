'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MatchAnalysis } from '@/types';

const readSessionValue = (key: string) => typeof window === 'undefined' ? '' : sessionStorage.getItem(key) || '';
const scoreClass = (s: number) => s >= 80 ? 'grad-green' : s >= 60 ? 'grad-indigo' : 'grad-orange';
const badgeClass = (s: string) => s === 'met' ? 'badge-green' : s === 'partial' ? 'badge-orange' : 'badge-red';

const Ring = ({ v, sz = 170 }: { v: number; sz?: number }) => {
  const sw = 11, r = (sz - sw) / 2, c = 2 * Math.PI * r, o = c - (v / 100) * c;
  const g = v >= 80 ? 'rg' : v >= 60 ? 'rb' : v >= 40 ? 'ro' : 'rr';
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={sz} height={sz} className="ring">
        <defs>
          <linearGradient id="rg"><stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#06b6d4" /></linearGradient>
          <linearGradient id="rb"><stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#a855f7" /></linearGradient>
          <linearGradient id="ro"><stop offset="0%" stopColor="#f59e0b" /><stop offset="100%" stopColor="#ef4444" /></linearGradient>
          <linearGradient id="rr"><stop offset="0%" stopColor="#ef4444" /><stop offset="100%" stopColor="#ec4899" /></linearGradient>
        </defs>
        <circle className="ring-track" cx={sz/2} cy={sz/2} r={r} strokeWidth={sw} />
        <circle className="ring-fill" cx={sz/2} cy={sz/2} r={r} strokeWidth={sw} stroke={`url(#${g})`} strokeDasharray={c} strokeDashoffset={o} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-5xl font-extrabold ${scoreClass(v)}`}>{v}</span>
        <span className="text-sm text-slate-400 mt-0.5">分</span>
      </div>
    </div>
  );
};

export default function AnalyzePage() {
  const router = useRouter();
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MatchAnalysis | null>(null);
  const [resumeContent] = useState(() => readSessionValue('resumeContent'));
  const [jdContent] = useState(() => readSessionValue('jdContent'));
  const [reasoning, setReasoning] = useState('');
  const [content, setContent] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleAnalyze = useCallback(async (resume: string, jd: string) => {
    setAnalyzing(true); setError(null); setReasoning(''); setContent(''); setResult(null);
    startTimeRef.current = Date.now();
    setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 200);

    try {
      const res = await fetch('/api/analyze/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent: resume, jdContent: jd }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || '分析失败');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('无法读取响应');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            switch (parsed.type) {
              case 'reasoning':
                setReasoning(prev => prev + parsed.content);
                break;
              case 'content':
                setContent(prev => prev + parsed.content);
                break;
              case 'result':
                setResult(parsed.data);
                sessionStorage.setItem('analysisResult', JSON.stringify(parsed.data));
                break;
              case 'error':
                setError(parsed.content);
                break;
            }
          } catch {}
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '分析失败');
    } finally {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    if (!resumeContent || !jdContent) {
      router.push('/');
      return;
    }

    if (startedRef.current) return;
    startedRef.current = true;
    void Promise.resolve().then(() => handleAnalyze(resumeContent, jdContent));
  }, [handleAnalyze, jdContent, resumeContent, router]);

  // Auto scroll content
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [reasoning, content]);

  const formatTime = (s: number) => s < 60 ? `${s}秒` : `${Math.floor(s / 60)}分${s % 60}秒`;

  const handleDownload = async () => {
    if (!result) return;
    const res = await fetch('/api/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'report', content: result }) });
    if (!res.ok) return;
    const b = await res.blob(); const u = URL.createObjectURL(b);
    const a = document.createElement('a'); a.href = u; a.download = `report-${Date.now()}.pdf`; a.click(); URL.revokeObjectURL(u);
  };

  if (!resumeContent || !jdContent) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 rounded-full border-[3px] border-slate-200 border-t-indigo-500 animate-spin" /></div>;

  return (
    <>
      <nav className="nav sticky top-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="btn btn-ghost">← 返回</button>
            <h1 className="text-lg font-semibold text-slate-900">匹配度分析</h1>
          </div>
          {result && <button onClick={handleDownload} className="btn btn-soft">📥 下载报告</button>}
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {analyzing ? (
          <div className="card-solid p-8 fade-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-5 h-5 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
              <span className="text-sm font-semibold text-slate-900">AI 正在分析中</span>
              <span className="text-xs text-slate-400 ml-auto">已用时 {formatTime(elapsed)}</span>
            </div>

            {/* Live streaming output */}
            <div ref={contentRef} className="max-h-[500px] overflow-y-auto space-y-3 bg-slate-50 rounded-xl p-5 border border-slate-100">
              {reasoning && (
                <div>
                  <p className="text-xs font-medium text-slate-400 mb-1">💭 AI 思考过程：</p>
                  <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed">{reasoning}</p>
                </div>
              )}
              {content && (
                <div>
                  <p className="text-xs font-medium text-indigo-500 mb-1">📊 分析结果：</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">{content}</p>
                </div>
              )}
              {!reasoning && !content && (
                <p className="text-sm text-slate-400 text-center py-8">正在连接AI模型，请稍候...</p>
              )}
            </div>
          </div>
        ) : error ? (
          <div className="card-solid p-20 text-center fade-up">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">分析失败</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button onClick={() => handleAnalyze(resumeContent, jdContent)} className="btn btn-primary">重新分析</button>
          </div>
        ) : result && (
          <div className="space-y-5">
            <div className="card-blue p-10 text-center fade-up"><p className="text-sm text-slate-500 mb-5">综合匹配度</p><Ring v={result.overallScore} /></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 fade-up fade-up-d1">
              {[
                { icon: '🎯', label: '关键词覆盖率', val: `${result.dimensions.keywordCoverage.score}%`, s: result.dimensions.keywordCoverage.score, bg: 'from-blue-50 to-indigo-50', b: 'border-blue-100' },
                { icon: '💼', label: '经历相关度', val: `${result.dimensions.experienceRelevance.score}分`, s: result.dimensions.experienceRelevance.score, bg: 'from-purple-50 to-pink-50', b: 'border-purple-100' },
                { icon: '✅', label: '硬性条件', val: result.dimensions.hardRequirements.met ? '达标' : '未达标', s: result.dimensions.hardRequirements.met ? 100 : 40, bg: 'from-emerald-50 to-teal-50', b: 'border-emerald-100' },
                { icon: '🏢', label: '行业匹配度', val: `${result.dimensions.industryMatch.score}分`, s: result.dimensions.industryMatch.score, bg: 'from-amber-50 to-orange-50', b: 'border-amber-100' },
              ].map((d) => (
                <div key={d.label} className="card-solid p-5 text-center">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${d.bg} flex items-center justify-center text-lg mx-auto mb-2 border ${d.b} shadow-sm`}>{d.icon}</div>
                  <p className="text-xs text-slate-500 mb-0.5">{d.label}</p>
                  <p className={`text-2xl font-bold ${scoreClass(d.s)}`}>{d.val}</p>
                </div>
              ))}
            </div>

            <div className="card-solid p-6 fade-up fade-up-d2">
              <h3 className="text-base font-semibold text-slate-900 mb-4">关键词分析</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div><p className="text-xs font-medium text-emerald-600 mb-2">✅ 已匹配</p><div className="flex flex-wrap gap-1.5">{result.dimensions.keywordCoverage.matchedKeywords.map((k, i) => <span key={i} className="badge badge-green">{k}</span>)}</div></div>
                <div><p className="text-xs font-medium text-red-500 mb-2">❌ 缺失</p><div className="flex flex-wrap gap-1.5">{result.dimensions.keywordCoverage.missingKeywords.map((k, i) => <span key={i} className="badge badge-red">{k}</span>)}</div></div>
              </div>
            </div>

            <div className="card-solid p-6 fade-up fade-up-d2">
              <h3 className="text-base font-semibold text-slate-900 mb-4">硬性条件检查</h3>
              <div className="space-y-2">{result.dimensions.hardRequirements.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50">
                  <div><p className="text-sm font-medium text-slate-900">{item.requirement}</p><p className="text-xs text-slate-500">{item.detail}</p></div>
                  <span className={`badge ${badgeClass(item.status)}`}>{item.status === 'met' ? '达标' : item.status === 'partial' ? '部分达标' : '未达标'}</span>
                </div>
              ))}</div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 fade-up fade-up-d3">
              {[
                { t: '💪 优势', items: result.summary.strengths, cls: 'card-green', tc: 'text-emerald-600' },
                { t: '⚠️ 不足', items: result.summary.weaknesses, cls: 'card-red', tc: 'text-red-500' },
                { t: '💡 建议', items: result.summary.suggestions, cls: 'card-blue', tc: 'text-indigo-600' },
              ].map((s) => (
                <div key={s.t} className={`${s.cls} p-5`}>
                  <h3 className={`text-sm font-semibold ${s.tc} mb-3`}>{s.t}</h3>
                  <ul className="space-y-2">{s.items.map((item, i) => <li key={i} className="text-sm text-slate-600 leading-relaxed flex items-start"><span className="mr-2 text-slate-400">•</span>{item}</li>)}</ul>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4 pt-4 fade-up fade-up-d4">
              <button onClick={() => router.push('/optimize')} className="btn btn-primary text-base px-8 py-3.5">✨ 继续优化简历</button>
              <button onClick={() => router.push('/interview')} className="btn btn-soft text-base px-8 py-3.5">🎤 生成面试题</button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
