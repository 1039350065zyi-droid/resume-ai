'use client';

import { useState, useEffect, useCallback } from 'react';
import { Skill } from '@/types';

export default function SkillsPage() {
  const [modules, setModules] = useState<Skill[]>([]);
  const [rules, setRules] = useState<Skill[]>([]);
  const [sel, setSel] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/skills');
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || '获取技能列表失败');
      }
      setModules(payload.data.modules);
      setRules(payload.data.rules);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取技能列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const handleSave = async () => {
    if (!sel) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/skills/${sel.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: sel.name, description: sel.description, prompt: sel.prompt, priority: sel.priority, enabled: sel.enabled }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || '保存失败');
      }
      setSel(payload.data);
      setSuccess('保存成功');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!sel) return;
    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/skills/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skillId: sel.id, testData: { resumeContent: '测试简历', jdContent: '测试JD' } }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || '测试失败');
      }
      setTestResult(payload.data.output);
    } catch (err) {
      setError(err instanceof Error ? err.message : '测试失败');
    } finally {
      setTesting(false);
    }
  };

  const handleToggle = async (s: Skill) => {
    const response = await fetch(`/api/skills/${s.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: !s.enabled }) });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      setError(payload.error || '状态更新失败');
      return;
    }
    await load();
    if (sel?.id === s.id) setSel({ ...sel, enabled: !sel.enabled });
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-indigo-500 animate-spin" /></div>;

  const Item = (s: Skill) => (
    <div key={s.id} className={`p-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${sel?.id === s.id ? 'bg-indigo-50/60 border border-indigo-200/60' : 'hover:bg-white/40 border border-transparent'}`}
      onClick={() => { setSel({ ...s }); setSuccess(null); setError(null); setTestResult(null); }}>
      <div className="flex items-center justify-between">
        <div><p className="text-sm font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-400">{s.id}</p></div>
        <div className="flex items-center gap-2">
          <span className={`badge ${s.enabled ? 'badge-green' : 'badge-gray'}`}>{s.enabled ? '启用' : '禁用'}</span>
          <button onClick={(e) => { e.stopPropagation(); handleToggle(s); }} className="text-xs">{s.enabled ? '🟢' : '⚪'}</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">技能列表</h2>
            <div className="mb-5"><p className="text-xs font-medium text-gray-400 mb-2">模块级</p><div className="space-y-1">{modules.map(Item)}</div></div>
            <div><p className="text-xs font-medium text-gray-400 mb-2">子规则级</p><div className="space-y-1">{rules.map(Item)}</div></div>
          </div>
        </div>
        <div className="lg:col-span-2">
          {sel ? (
            <div className="card-solid p-6">
              <div className="flex items-center justify-between mb-5">
                <div><h2 className="text-base font-semibold text-gray-900">{sel.name}</h2><p className="text-xs text-gray-400">ID: {sel.id}</p></div>
                <span className={`badge ${sel.level === 'module' ? 'badge-indigo' : 'badge-purple'}`}>{sel.level === 'module' ? '模块级' : '子规则级'}</span>
              </div>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm">{success}</div>}
              <div className="space-y-4">
                <div><label className="block text-sm font-medium text-gray-600 mb-1">名称</label><input type="text" value={sel.name} onChange={(e) => setSel({ ...sel, name: e.target.value })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">描述</label><input type="text" value={sel.description} onChange={(e) => setSel({ ...sel, description: e.target.value })} className="input w-full" /></div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">提示词</label><textarea value={sel.prompt} onChange={(e) => setSel({ ...sel, prompt: e.target.value })} rows={10} className="input w-full font-mono text-sm resize-none" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-600 mb-1">优先级</label><input type="number" value={sel.priority} onChange={(e) => setSel({ ...sel, priority: parseInt(e.target.value, 10) })} min={1} max={10} className="input w-full" /></div>
                  <div><label className="block text-sm font-medium text-gray-600 mb-1">状态</label><div className="flex items-center h-[42px]"><span className={`badge ${sel.enabled ? 'badge-green' : 'badge-gray'}`}>{sel.enabled ? '已启用' : '已禁用'}</span></div></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">可用变量</label><div className="flex flex-wrap gap-1.5">{sel.variables.map((v, i) => <span key={i} className="badge badge-gray">{`{${v}}`}</span>)}</div></div>
                <div className="text-xs text-gray-400">版本: {sel.version} · 更新: {sel.updatedAt}</div>
              </div>
              <div className="flex justify-between mt-5 pt-5 border-t border-gray-100">
                <button onClick={handleTest} disabled={testing} className="btn btn-soft text-sm">{testing ? '测试中...' : '🧪 测试'}</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary text-sm">{saving ? '保存中...' : '💾 保存'}</button>
              </div>
              {testResult && <div className="mt-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100"><p className="text-sm font-medium text-gray-900 mb-2">测试结果</p><pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto max-h-72">{testResult}</pre></div>}
            </div>
          ) : (
            <div className="card-solid p-20 text-center"><div className="text-5xl mb-3">👈</div><h3 className="text-base font-semibold text-gray-900 mb-1">选择一个 Skill</h3><p className="text-sm text-gray-500">从左侧列表选择</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
