'use client';

import { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';

const GENERATE_DURATION = 45;

interface ResumeData {
  personalInfo: { name: string; phone: string; email: string; city: string; age?: string; targetPosition: string; tagline: string; };
  summary: string;
  workExperience: { company: string; position: string; period: string; highlights: string[]; }[];
  projects: { name: string; role: string; period: string; description: string; highlights: string[]; }[];
  education: { school: string; major: string; degree: string; period: string; }[];
  skills: { category: string; items: string[]; }[];
  certificates: string[];
  selfEvaluation: string;
}

export default function GeneratePanel({ resumeContent, jdContent, onClose }: {
  resumeContent: string; jdContent: string; onClose: () => void;
}) {
  const [step, setStep] = useState<'generate' | 'preview'>('generate');
  const [template, setTemplate] = useState<'classic' | 'modern' | 'creative'>('modern');
  const [format, setFormat] = useState({ pdf: true, docx: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ResumeData | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  useEffect(() => {
    if (loading) {
      const pct = Math.min(95, (elapsed / GENERATE_DURATION) * 100);
      setProgress(pct);
    }
  }, [elapsed, loading]);

  const startTimer = () => {
    startTimeRef.current = Date.now(); setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 200);
  };

  const stopTimer = () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };

  const formatTime = (s: number) => s < 60 ? `${s}秒` : `${Math.floor(s / 60)}分${s % 60}秒`;

  const handleGenerate = async () => {
    setLoading(true); setError(null); startTimer();
    try {
      const res = await fetch('/api/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent, jdContent }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setData((await res.json()).data);
      setStep('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败');
    } finally {
      stopTimer(); setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current || !data) return;
    const el = previewRef.current;
    const w = 595, h = 842;
    const canvas = document.createElement('canvas');
    canvas.width = w * 2; canvas.height = h * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h);

    let html2canvas;
    try {
      html2canvas = (await import('html2canvas')).default;
    } catch {
      alert('PDF 生成功能需要安装依赖，请在项目目录执行：npm install html2canvas');
      return;
    }
    const c = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff', width: w, windowWidth: w });
    ctx.drawImage(c, 0, 0, w, h);

    const doc = new jsPDF({ unit: 'px', format: [w, h] });
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
    doc.save(`${data.personalInfo.name || '简历'}-${template}.pdf`);
  };

  const handleDownloadDOCX = async () => {
    if (!data) return;
    let docx;
    try {
      docx = await import('docx');
    } catch {
      alert('Word 生成功能需要安装依赖，请在项目目录执行：npm install docx');
      return;
    }
    const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } = docx;
    const s = (text: string, opts: any = {}) => new TextRun({ text, font: 'Microsoft YaHei', size: 22, ...opts });
    const h = (text: string, level: any = HeadingLevel.HEADING_2) => new Paragraph({ children: [new TextRun({ text, font: 'Microsoft YaHei', bold: true, size: level === HeadingLevel.HEADING_1 ? 32 : 26, color: level === HeadingLevel.HEADING_1 ? '1a1a2e' : '2c3e50' })], heading: level, spacing: { before: 200, after: 100 } });
    const p = (text: string, indent?: number) => new Paragraph({ children: [s(text)], indent: indent ? { left: indent } : undefined, spacing: { after: 60 } });
    const bullet = (text: string) => new Paragraph({ children: [s(text)], bullet: { level: 0 }, spacing: { after: 40 } });

    const info = data.personalInfo;
    const doc = new Document({
      sections: [{
        children: [
          new Paragraph({ children: [new TextRun({ text: info.name, font: 'Microsoft YaHei', bold: true, size: 48, color: '1a1a2e' })], alignment: AlignmentType.CENTER, spacing: { after: 60 } }),
          new Paragraph({ children: [new TextRun({ text: info.tagline, font: 'Microsoft YaHei', size: 22, color: '666', italics: true })], alignment: AlignmentType.CENTER, spacing: { after: 40 } }),
          new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [s(`${info.phone} | ${info.email} | ${info.city}${info.age ? ' | ' + info.age : ''} | 求职意向：${info.targetPosition}`, { size: 20, color: '555' })] }),
          new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'e2e8f0' } }, spacing: { after: 200 }, children: [] }),
          h('个人摘要'),
          p(data.summary),
          h('工作经历'),
          ...data.workExperience.flatMap(w => [
            new Paragraph({ spacing: { before: 120, after: 40 }, children: [s(w.company, { bold: true, size: 24 }), s(`  |  ${w.position}`, { size: 22, color: '444' }), s(`  |  ${w.period}`, { size: 20, color: '888' })] }),
            ...w.highlights.map(hi => bullet(hi)),
          ]),
          h('项目经历'),
          ...data.projects.flatMap(pj => [
            new Paragraph({ spacing: { before: 120, after: 40 }, children: [s(pj.name, { bold: true, size: 24 }), s(`  |  ${pj.role}`, { size: 22, color: '444' }), s(`  |  ${pj.period}`, { size: 20, color: '888' })] }),
            p(pj.description),
            ...pj.highlights.map(hi => bullet(hi)),
          ]),
          h('教育背景'),
          ...data.education.map(e => new Paragraph({ spacing: { after: 60 }, children: [s(e.school, { bold: true }), s(`  |  ${e.major}  |  ${e.degree}`, { color: '444' }), s(`  |  ${e.period}`, { color: '888' })] })),
          h('技能特长'),
          ...data.skills.flatMap(sk => [
            new Paragraph({ spacing: { after: 40 }, children: [s(sk.category + '：', { bold: true }), s(sk.items.join('、'))] }),
          ]),
          h('证书荣誉'),
          ...data.certificates.map(c => bullet(c)),
          h('自我评价'),
          p(data.selfEvaluation),
        ],
      }],
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${info.name || '简历'}.docx`; a.click();
    URL.revokeObjectURL(url);
  };

  // ─── 经典模板 ───
  const ClassicTemplate = () => d && (
    <div style={{ background: '#fff', width: 595, minHeight: 842, padding: '48px 52px', fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', lineHeight: 1.55 }}>
      <div style={{ textAlign: 'center', marginBottom: 28, paddingBottom: 20, borderBottom: '2px solid #1a1a2e' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>{d.personalInfo.name}</h1>
        <p style={{ fontSize: 13, color: '#555', fontStyle: 'italic', marginBottom: 8 }}>{d.personalInfo.tagline}</p>
        <p style={{ fontSize: 11, color: '#666' }}>{[d.personalInfo.phone, d.personalInfo.email, d.personalInfo.city, d.personalInfo.age, `求职意向：${d.personalInfo.targetPosition}`].filter(Boolean).join('  |  ')}</p>
      </div>
      <Section title="个人摘要"><p style={{ fontSize: 12, color: '#333' }}>{d.summary}</p></Section>
      <Section title="工作经历">{d.workExperience.map(w => <ExpBlock key={w.company} company={w.company} position={w.position} period={w.period} highlights={w.highlights} />)}</Section>
      <Section title="项目经历">{d.projects.map(pj => <ProjectBlock key={pj.name} {...pj} />)}</Section>
      <Section title="教育背景">{d.education.map(e => <div key={e.school} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}><div><span style={{ fontWeight: 600 }}>{e.school}</span><span style={{ color: '#555', marginLeft: 10 }}>{e.major} | {e.degree}</span></div><span style={{ color: '#888', fontSize: 11 }}>{e.period}</span></div>)}</Section>
      <Section title="技能特长">{d.skills.map(sk => <p key={sk.category} style={{ fontSize: 12, marginBottom: 4 }}><strong>{sk.category}：</strong>{sk.items.join('、')}</p>)}</Section>
      <Section title="证书荣誉">{d.certificates.map(c => <p key={c} style={{ fontSize: 12, marginBottom: 3 }}>• {c}</p>)}</Section>
      <Section title="自我评价"><p style={{ fontSize: 12, color: '#333' }}>{d.selfEvaluation}</p></Section>
    </div>
  );

  // ─── 现代模板 ───
  const ModernTemplate = () => d && (
    <div style={{ background: '#fff', width: 595, minHeight: 842, fontFamily: 'system-ui, sans-serif', color: '#2d3748', display: 'flex' }}>
      <div style={{ width: 195, background: 'linear-gradient(180deg, #1a1a2e 0%, #2d3748 100%)', color: '#fff', padding: '36px 22px', fontSize: 11 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 6 }}>{d.personalInfo.name}</h1>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 24, lineHeight: 1.5 }}>{d.personalInfo.tagline}</p>
        <SidebarSection title="联系方式">
          <SidebarItem label="电话" value={d.personalInfo.phone} />
          <SidebarItem label="邮箱" value={d.personalInfo.email} />
          <SidebarItem label="城市" value={d.personalInfo.city} />
          {d.personalInfo.age && <SidebarItem label="年龄" value={d.personalInfo.age} />}
          <SidebarItem label="意向岗位" value={d.personalInfo.targetPosition} />
        </SidebarSection>
        <SidebarSection title="技能特长">{d.skills.map(sk => <div key={sk.category} style={{ marginBottom: 10 }}><p style={{ color: '#e2e8f0', fontSize: 10.5, marginBottom: 4 }}>{sk.category}</p><div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>{sk.items.map(i => <span key={i} style={{ background: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: 4, fontSize: 10 }}>{i}</span>)}</div></div>)}</SidebarSection>
        <SidebarSection title="教育背景">{d.education.map(e => <div key={e.school} style={{ marginBottom: 10 }}><p style={{ fontWeight: 600, fontSize: 11 }}>{e.school}</p><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{e.major} | {e.degree}</p><p style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>{e.period}</p></div>)}</SidebarSection>
        {d.certificates.length > 0 && <SidebarSection title="证书荣誉">{d.certificates.map(c => <p key={c} style={{ fontSize: 10.5, marginBottom: 4, color: '#e2e8f0' }}>• {c}</p>)}</SidebarSection>}
      </div>
      <div style={{ flex: 1, padding: '36px 28px' }}>
        <Section title="个人摘要" accent><p style={{ fontSize: 12, color: '#4a5568' }}>{d.summary}</p></Section>
        <Section title="工作经历" accent>{d.workExperience.map(w => <ExpBlock key={w.company} company={w.company} position={w.position} period={w.period} highlights={w.highlights} />)}</Section>
        <Section title="项目经历" accent>{d.projects.map(pj => <ProjectBlock key={pj.name} {...pj} />)}</Section>
        <Section title="自我评价" accent><p style={{ fontSize: 12, color: '#4a5568' }}>{d.selfEvaluation}</p></Section>
      </div>
    </div>
  );

  // ─── 创意模板 ───
  const CreativeTemplate = () => d && (
    <div style={{ background: '#fff', width: 595, minHeight: 842, padding: '40px 46px', fontFamily: 'system-ui, sans-serif', color: '#1a1a2e', lineHeight: 1.6 }}>
      <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #ec4899)', borderRadius: 12, padding: '28px 32px', marginBottom: 28, color: '#fff' }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>{d.personalInfo.name}</h1>
        <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 10, fontStyle: 'italic' }}>{d.personalInfo.tagline}</p>
        <p style={{ fontSize: 11, opacity: 0.8 }}>{[d.personalInfo.phone, d.personalInfo.email, d.personalInfo.city, d.personalInfo.age, `意向：${d.personalInfo.targetPosition}`].filter(Boolean).join('  •  ')}</p>
      </div>
      <CreativeSection icon="📋" title="个人摘要"><p style={{ fontSize: 12, color: '#374151' }}>{d.summary}</p></CreativeSection>
      <CreativeSection icon="💼" title="工作经历">{d.workExperience.map(w => <ExpBlock key={w.company} company={w.company} position={w.position} period={w.period} highlights={w.highlights} />)}</CreativeSection>
      <CreativeSection icon="🚀" title="项目经历">{d.projects.map(pj => <ProjectBlock key={pj.name} {...pj} />)}</CreativeSection>
      <CreativeSection icon="🎓" title="教育背景">{d.education.map(e => <div key={e.school} style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}><div><span style={{ fontWeight: 600 }}>{e.school}</span><span style={{ color: '#555', marginLeft: 10 }}>{e.major} | {e.degree}</span></div><span style={{ color: '#888', fontSize: 11 }}>{e.period}</span></div>)}</CreativeSection>
      <CreativeSection icon="⚡" title="技能特长"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{d.skills.flatMap(sk => sk.items).map(s => <span key={s} style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(168,85,247,0.1))', border: '1px solid rgba(99,102,241,0.2)', padding: '4px 12px', borderRadius: 20, fontSize: 11, color: '#4f46e5', fontWeight: 500 }}>{s}</span>)}</div></CreativeSection>
      {d.certificates.length > 0 && <CreativeSection icon="🏅" title="证书荣誉"><div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{d.certificates.map(c => <span key={c} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '4px 12px', borderRadius: 8, fontSize: 11, color: '#15803d' }}>{c}</span>)}</div></CreativeSection>}
      <CreativeSection icon="✨" title="自我评价"><p style={{ fontSize: 12, color: '#374151' }}>{d.selfEvaluation}</p></CreativeSection>
    </div>
  );

  // ─── 共用子组件 ───
  const d = data;
  const Section = ({ title, children, accent }: { title: string; children: React.ReactNode; accent?: boolean }) => (
    <div style={{ marginBottom: 22 }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: accent ? '#6366f1' : '#1a1a2e', borderBottom: `2px solid ${accent ? '#6366f1' : '#e2e8f0'}`, paddingBottom: 6, marginBottom: 12 }}>{title}</h2>
      {children}
    </div>
  );
  const CreativeSection = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}><span style={{ fontSize: 18 }}>{icon}</span><h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e' }}>{title}</h2></div>
      <div style={{ borderLeft: '3px solid #e2e8f0', paddingLeft: 14 }}>{children}</div>
    </div>
  );
  const SidebarSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ marginBottom: 20 }}><h2 style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 5, marginBottom: 10 }}>{title}</h2>{children}</div>
  );
  const SidebarItem = ({ label, value }: { label: string; value: string }) => (
    <p style={{ fontSize: 10.5, marginBottom: 5, color: 'rgba(255,255,255,0.8)' }}><span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}：</span>{value}</p>
  );
  const ExpBlock = ({ company, position, period, highlights }: any) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><div><span style={{ fontWeight: 600, fontSize: 13 }}>{company}</span><span style={{ color: '#555', marginLeft: 10, fontSize: 12 }}>{position}</span></div><span style={{ color: '#888', fontSize: 11 }}>{period}</span></div>
      <ul style={{ margin: 0, paddingLeft: 16 }}>{highlights.map((h: string, i: number) => <li key={i} style={{ fontSize: 11.5, color: '#333', marginBottom: 3 }}>{h}</li>)}</ul>
    </div>
  );
  const ProjectBlock = ({ name, role, period, description, highlights }: any) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}><div><span style={{ fontWeight: 600, fontSize: 13 }}>{name}</span><span style={{ color: '#555', marginLeft: 10, fontSize: 12 }}>{role}</span></div><span style={{ color: '#888', fontSize: 11 }}>{period}</span></div>
      <p style={{ fontSize: 11.5, color: '#555', marginBottom: 4 }}>{description}</p>
      <ul style={{ margin: 0, paddingLeft: 16 }}>{highlights.map((h: string, i: number) => <li key={i} style={{ fontSize: 11.5, color: '#333', marginBottom: 3 }}>{h}</li>)}</ul>
    </div>
  );

  const templates = [
    { key: 'classic' as const, name: '经典黑白', desc: '简洁专业，ATS友好', icon: '📄' },
    { key: 'modern' as const, name: '现代双栏', desc: '深色侧栏，层次分明', icon: '🎨' },
    { key: 'creative' as const, name: '创意渐变', desc: '视觉冲击，适合创意岗', icon: '✨' },
  ];

  return (
    <div className="card-solid overflow-hidden fade-up">
      <div className="flex items-center justify-between p-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-xl border border-emerald-100">📄</div>
          <div><h3 className="text-lg font-bold text-emerald-600">生成简历</h3><p className="text-xs text-slate-400">AI深度改写 · 模板化排版 · 一键下载</p></div>
        </div>
        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-sm">✕</button>
      </div>

      {/* 生成中 */}
      {step === 'generate' && (
        <div className="p-8">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-emerald-50 flex items-center justify-center pulse-soft"><div className="w-8 h-8 rounded-full border-[3px] border-emerald-100 border-t-emerald-500 animate-spin" /></div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AI 正在深度改写简历</h3>
              <p className="text-slate-500 mb-6">基于JD分析结果重新组织内容，约需45秒</p>
              <div className="max-w-md mx-auto">
                <div className="flex justify-between text-xs text-slate-400 mb-2"><span>{step === 'generate' ? 'AI改写中' : ''}</span><span>{formatTime(elapsed)}</span></div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full progress-bar" style={{ width: `${progress}%` }} /></div>
                <p className="text-xs text-slate-400 mt-2">{Math.round(progress)}%</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">生成失败</h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <button onClick={handleGenerate} className="btn btn-primary">重新生成</button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-4xl border border-emerald-100">📄</div>
              <h3 className="text-2xl font-semibold text-slate-900 mb-3">生成格式化简历</h3>
              <p className="text-slate-500 mb-8 max-w-md mx-auto">AI将基于分析结果深度改写简历内容，生成8大模块的完整简历</p>
              <button onClick={handleGenerate} className="btn btn-primary text-base px-10 py-3.5">🚀 开始生成简历</button>
            </div>
          )}
        </div>
      )}

      {/* 预览 */}
      {step === 'preview' && data && (
        <div className="p-6">
          {/* 模板选择 */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">选择模板</h4>
            <div className="grid grid-cols-3 gap-3">{templates.map(t => (
              <button key={t.key} onClick={() => setTemplate(t.key)} className={`p-4 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] ${template === t.key ? 'card-blue shadow-lg ring-2 ring-indigo-200' : 'card hover:shadow-lg'}`}>
                <div className="text-2xl mb-2">{t.icon}</div>
                <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
              </button>
            ))}</div>
          </div>

          {/* 预览 + 下载 */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* 预览区 */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">简历预览</h4>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#f1f5f9', padding: 20, display: 'flex', justifyContent: 'center' }}>
                <div style={{ transform: 'scale(0.55)', transformOrigin: 'top center', width: 595, boxShadow: '0 4px 20px rgba(0,0,0,0.12)', borderRadius: 4 }}>
                  <div ref={previewRef}>
                    {template === 'classic' ? <ClassicTemplate /> : template === 'modern' ? <ModernTemplate /> : <CreativeTemplate />}
                  </div>
                </div>
              </div>
            </div>

            {/* 下载区 */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">下载设置</h4>
              <div className="card p-5 space-y-4 mb-4">
                <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setFormat(f => ({ ...f, pdf: !f.pdf }))}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${format.pdf ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>{format.pdf && <span className="text-white text-xs">✓</span>}</div>
                  <div><p className="text-sm font-medium text-slate-900">PDF 格式</p><p className="text-xs text-slate-400">排版精确，适合打印</p></div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setFormat(f => ({ ...f, docx: !f.docx }))}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${format.docx ? 'bg-indigo-500 border-indigo-500' : 'border-slate-300'}`}>{format.docx && <span className="text-white text-xs">✓</span>}</div>
                  <div><p className="text-sm font-medium text-slate-900">Word 格式</p><p className="text-xs text-slate-400">可编辑，方便二次修改</p></div>
                </div>
              </div>
              <button onClick={() => { if (format.pdf) handleDownloadPDF(); if (format.docx) handleDownloadDOCX(); }} disabled={!format.pdf && !format.docx} className="btn btn-primary w-full text-sm py-3 mb-3">📥 下载简历</button>
              <button onClick={() => { setStep('generate'); setData(null); setError(null); }} className="btn btn-soft w-full text-sm py-2.5">🔄 重新生成</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
