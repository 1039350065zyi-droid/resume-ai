'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  { path: '/admin/skills', label: 'Skill 配置', icon: '🧩' },
  { path: '/admin/models', label: '模型配置', icon: '🤖' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
  };

  // 登录页不显示后台导航
  if (pathname === '/admin/login') {
    return <main className="relative z-10">{children}</main>;
  }

  return (
    <>
      <nav className="nav sticky top-0">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <button onClick={() => router.push('/')} className="btn btn-ghost">← 返回首页</button>
              <span className="text-gray-300">|</span>
              <h1 className="text-lg font-semibold text-gray-900">⚙️ 后台管理</h1>
            </div>
            <button onClick={handleLogout} className="btn btn-ghost text-sm text-gray-400">🚪 退出登录</button>
          </div>
          <div className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const active = pathname === tab.path || pathname.startsWith(tab.path + '/');
              return (
                <button key={tab.path} onClick={() => router.push(tab.path)}
                  className={`px-5 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 flex items-center gap-2 ${active ? 'bg-white/80 text-gray-900 border border-gray-200/60 border-b-white/80 shadow-sm backdrop-blur-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/30'}`}>
                  <span>{tab.icon}</span><span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      <main className="relative z-10">{children}</main>
    </>
  );
}
