'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        const from = searchParams.get('from') || '/admin/skills';
        router.push(from);
      } else {
        setError('密码错误，请重试');
      }
    } catch {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="card-solid p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-200 mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-slate-900">管理员登录</h1>
          <p className="text-sm text-slate-500 mt-2">请输入管理员密码访问后台</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">管理密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入管理员密码"
              className="input w-full"
              autoFocus
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="btn btn-primary w-full py-3 text-base"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => router.push('/')} className="text-sm text-slate-400 hover:text-slate-600 transition-colors">
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
