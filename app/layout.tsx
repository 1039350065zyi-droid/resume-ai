import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ResumeAI - 智能简历优化 & 面试准备平台',
  description: '让AI帮你打造完美简历，精准匹配岗位需求，提升面试通过率',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full">
        <div className="bg-mesh" />
        {children}
      </body>
    </html>
  );
}
