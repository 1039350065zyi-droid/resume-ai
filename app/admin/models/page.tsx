'use client';

import { useState, useEffect, useCallback } from 'react';
import { ModelConfig, SafeModelConfig } from '@/types';

const PRESETS: Record<string, Partial<ModelConfig>> = {
  mimo: { name: 'mimo-v2.5-pro', provider: '小米', apiUrl: 'https://token-plan-cn.xiaomimimo.com/v1/chat/completions', model: 'mimo-v2.5-pro' },
  deepseek: { name: 'DeepSeek V3', provider: 'DeepSeek', apiUrl: 'https://api.deepseek.com/v1/chat/completions', model: 'deepseek-chat' },
  glm: { name: 'GLM-4', provider: '智谱', apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', model: 'glm-4-flash' },
  minimax: { name: 'MiniMax', provider: 'MiniMax', apiUrl: 'https://api.minimax.chat/v1/text/chatcompletion_v2', model: 'MiniMax-Text-01' },
  qwen: { name: '通义千问', provider: '阿里云', apiUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', model: 'qwen-plus' },
  custom: { name: '', provider: '', apiUrl: '', model: '' },
};

type ModelFormState = Omit<SafeModelConfig, 'apiKey'> & { apiKey: string };

function toFormState(model: SafeModelConfig): ModelFormState {
  return { ...model, apiKey: '' };
}

export default function ModelsPage() {
  const [models, setModels] = useState<SafeModelConfig[]>([]);
  const [sel, setSel] = useState<ModelFormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/models');
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || '获取模型列表失败');
      }
      setModels(payload.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取模型列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const handleNew = (k: string) => {
    const p = PRESETS[k];
    setSel({ id: k, name: p.name || '', provider: p.provider || '', apiUrl: p.apiUrl || '', model: p.model || '', apiKey: '', hasApiKey: false, enabled: false, isDefault: false });
    setSuccess(null);
    setError(null);
    setTestResult(null);
    setShowKey(true);
  };

  const handleSave = async () => {
    if (!sel) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const exists = models.some((m) => m.id === sel.id);
      const body: Partial<ModelConfig> = {
        id: sel.id,
        name: sel.name,
        provider: sel.provider,
        apiUrl: sel.apiUrl,
        model: sel.model,
        enabled: sel.enabled,
        isDefault: sel.isDefault,
      };
      const { apiKey } = sel;
      if (!exists || apiKey.trim()) {
        body.apiKey = apiKey.trim();
      }
      const response = await fetch(exists ? `/api/models/${sel.id}` : '/api/models', {
        method: exists ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || '保存失败');
      }
      setSel(toFormState(payload.data));
      setSuccess('保存成功');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!sel) return;
    const response = await fetch(`/api/models/${sel.id}`, { method: 'DELETE' });
    const payload = await response.json();
    if (!response.ok || !payload.success) {
      setError(payload.error || '删除失败');
      return;
    }
    setSel(null);
    await load();
  };

  const handleTest = async () => {
    if (!sel) return;
    setTesting(true);
    setTestResult(null);
    try {
      const body = sel.apiKey.trim()
        ? { modelId: sel.id, config: { ...sel, apiKey: sel.apiKey.trim() } }
        : { modelId: sel.id };
      const response = await fetch('/api/models/test', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const payload = await response.json();
      setTestResult(payload.success ? `连接成功！${payload.data.executionTime}ms\n\n${payload.data.output}` : `失败：${payload.error}`);
    } catch {
      setTestResult('测试失败');
    } finally {
      setTesting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-[3px] border-gray-200 border-t-indigo-500 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="card p-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">模型列表</h2>
            <div className="space-y-1.5 mb-5">
              {models.map((m) => (
                <div key={m.id} className={`p-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${sel?.id === m.id ? 'bg-indigo-50/60 border border-indigo-200/60' : 'hover:bg-white/40 border border-transparent'}`}
                  onClick={() => { setSel(toFormState(m)); setSuccess(null); setError(null); setTestResult(null); setShowKey(false); }}>
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-gray-900">{m.name}</p><p className="text-xs text-gray-400">{m.provider}</p></div>
                    <div className="flex items-center gap-1.5">
                      {m.isDefault && <span className="badge badge-indigo">默认</span>}
                      <span className={`badge ${m.enabled && m.hasApiKey ? 'badge-green' : 'badge-gray'}`}>{m.enabled && m.hasApiKey ? '可用' : '未配置'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div><p className="text-xs font-medium text-gray-400 mb-2">+ 添加模型</p>
              <div className="flex flex-wrap gap-1.5">{Object.entries(PRESETS).map(([k, p]) => <button key={k} onClick={() => handleNew(k)} className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/50 text-gray-600 hover:bg-white/80 active:scale-95 transition-all border border-gray-100">{p.name || '自定义'}</button>)}</div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          {sel ? (
            <div className="card-solid p-6">
              <div className="flex items-center justify-between mb-5">
                <div><h2 className="text-base font-semibold text-gray-900">{sel.name || '新模型'}</h2><p className="text-xs text-gray-400">ID: {sel.id}</p></div>
                <div className="flex items-center gap-2">{sel.isDefault && <span className="badge badge-indigo">默认</span>}<span className={`badge ${sel.enabled ? 'badge-green' : 'badge-gray'}`}>{sel.enabled ? '已启用' : '已禁用'}</span></div>
              </div>
              {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">{error}</div>}
              {success && <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm">{success}</div>}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-gray-600 mb-1">模型名称</label><input type="text" value={sel.name} onChange={(e) => setSel({ ...sel, name: e.target.value })} className="input w-full" /></div>
                  <div><label className="block text-sm font-medium text-gray-600 mb-1">厂商</label><input type="text" value={sel.provider} onChange={(e) => setSel({ ...sel, provider: e.target.value })} className="input w-full" /></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">API Endpoint</label><input type="text" value={sel.apiUrl} onChange={(e) => setSel({ ...sel, apiUrl: e.target.value })} className="input w-full font-mono text-sm" /></div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">API Key</label>
                  <div className="relative"><input type={showKey ? 'text' : 'password'} value={sel.apiKey} placeholder={sel.hasApiKey ? '已配置，留空则保留当前密钥' : '请输入 API Key'} onChange={(e) => setSel({ ...sel, apiKey: e.target.value })} className="input w-full font-mono text-sm pr-16" /><button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-indigo-500 font-medium">{showKey ? '隐藏' : '显示'}</button></div>
                </div>
                <div><label className="block text-sm font-medium text-gray-600 mb-1">模型标识</label><input type="text" value={sel.model} onChange={(e) => setSel({ ...sel, model: e.target.value })} className="input w-full" /></div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sel.enabled} onChange={(e) => setSel({ ...sel, enabled: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm text-gray-600">启用</span></label>
                  <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={sel.isDefault} onChange={(e) => setSel({ ...sel, isDefault: e.target.checked })} className="w-4 h-4 rounded" /><span className="text-sm text-gray-600">设为默认</span></label>
                </div>
              </div>
              <div className="flex justify-between mt-5 pt-5 border-t border-gray-100">
                <div className="flex gap-2">
                  <button onClick={handleTest} disabled={testing} className="btn btn-soft text-sm">{testing ? '测试中...' : '🔌 测试连接'}</button>
                  {models.find((m) => m.id === sel.id) && <button onClick={handleDelete} className="btn btn-ghost text-sm text-red-500">删除</button>}
                </div>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary text-sm">{saving ? '保存中...' : '💾 保存'}</button>
              </div>
              {testResult && <div className="mt-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100"><p className="text-sm font-medium text-gray-900 mb-2">测试结果</p><pre className="text-xs text-gray-600 whitespace-pre-wrap">{testResult}</pre></div>}
            </div>
          ) : (
            <div className="card-solid p-20 text-center"><div className="text-5xl mb-3">👈</div><h3 className="text-base font-semibold text-gray-900 mb-1">选择或添加模型</h3><p className="text-sm text-gray-500">从左侧列表选择</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
