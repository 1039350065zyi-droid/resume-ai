# ResumeAI — 完整项目源码

> 生成时间：2026-06-22
> 技术栈：Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 + mimo API
> 状态：MVP + 单页工作台 + 生成简历功能

---

## 目录结构

```
resume-ai/
├── package.json
├── tsconfig.json
├── next.config.ts
├── next-env.d.ts
├── app/
│   ├── layout.tsx              # 根布局
│   ├── globals.css             # 全局样式
│   ├── page.tsx                # 主页工作台（单页）
│   ├── analyze/page.tsx        # 分析页（备用）
│   ├── optimize/page.tsx       # 优化页（备用）
│   ├── interview/page.tsx      # 面试题页（备用）
│   ├── admin/
│   │   ├── layout.tsx          # 后台布局
│   │   ├── skills/page.tsx     # Skill 配置
│   │   └── models/page.tsx     # 模型配置
│   └── api/
│       ├── upload/route.ts
│       ├── analyze/route.ts
│       ├── analyze/stream/route.ts
│       ├── optimize/route.ts
│       ├── interview/route.ts
│       ├── download/route.ts
│       ├── generate-resume/route.ts
│       ├── skills/route.ts
│       ├── skills/[id]/route.ts
│       ├── skills/test/route.ts
│       ├── models/route.ts
│       ├── models/[id]/route.ts
│       └── models/test/route.ts
├── components/
│   ├── FileUpload.tsx
│   ├── GeneratePanel.tsx
│   ├── GridScan.tsx
│   ├── GridScan.css
│   └── ui/
│       ├── index.ts
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Progress.tsx
│       ├── RingProgress.tsx
│       └── Textarea.tsx
├── lib/
│   ├── ai/
│   │   ├── mimo.ts
│   │   ├── skill-manager.ts
│   │   ├── model-manager.ts
│   │   └── skills/
│   │       ├── analyze.json
│   │       ├── optimize.json
│   │       └── interview.json
│   ├── parser/
│   │   ├── index.ts
│   │   ├── pdf.ts
│   │   ├── md.ts
│   │   └── ocr.ts
│   └── utils/
│       ├── format.ts
│       ├── json.ts
│       └── score.ts
├── types/
│   └── index.ts
├── data/
│   └── models.json
├── PRD.md
├── README.md
├── AGENTS.md
├── CLAUDE.md
└── figma-design-prompt.md
```

---

## 根目录配置

### package.json

```json
{
  "name": "resume-ai",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "axios": "^1.18.0",
    "docx": "^9.5.0",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.2.1",
    "next": "16.2.9",
    "pdf-parse": "^2.4.5",
    "postprocessing": "^6.39.1",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tesseract.js": "^7.0.0",
    "three": "^0.184.0",
    "uuid": "^14.0.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/three": "^0.184.1",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts", "**/*.mts"],
  "exclude": ["node_modules"]
}
```

### next.config.ts

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
```

### next-env.d.ts

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
import "./.next/dev/types/routes.d.ts";
// NOTE: This file should not be edited
```

---

## 应用页面

### app/layout.tsx

```tsx
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
```

### app/globals.css

```css
@import "tailwindcss";

:root {
  --primary: #4f46e5;
  --primary-hover: #4338ca;
  --bg: #f8fafc;
  --surface: #ffffff;
  --text: #0f172a;
  --text-secondary: #64748b;
  --border: #e2e8f0;
  --shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05);
  --shadow-lg: 0 10px 30px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
}

@theme inline {
  --color-background: var(--bg);
  --color-foreground: var(--text);
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', 'Noto Sans SC', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Static gradient background */
.bg-mesh {
  position: fixed; inset: 0; z-index: -1;
  background:
    radial-gradient(ellipse at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(168,85,247,0.06) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 50%, rgba(14,165,233,0.04) 0%, transparent 60%),
    #f8fafc;
}

/* Nav */
.nav {
  background: rgba(255,255,255,0.82);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}

/* Card - frosted glass */
.card {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.8);
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.03);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.card:hover { box-shadow: var(--shadow-md); }

/* Card - solid white */
.card-solid {
  background: #ffffff;
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 20px;
  box-shadow: var(--shadow);
  transition: box-shadow 0.25s ease;
}
.card-solid:hover { box-shadow: var(--shadow-md); }

/* Card variants */
.card-blue { background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(14,165,233,0.04)); border: 1px solid rgba(99,102,241,0.12); border-radius: 20px; }
.card-green { background: linear-gradient(135deg, rgba(34,197,94,0.06), rgba(6,182,212,0.04)); border: 1px solid rgba(34,197,94,0.12); border-radius: 20px; }
.card-red { background: linear-gradient(135deg, rgba(239,68,68,0.05), rgba(236,72,153,0.04)); border: 1px solid rgba(239,68,68,0.1); border-radius: 20px; }
.card-purple { background: linear-gradient(135deg, rgba(168,85,247,0.05), rgba(99,102,241,0.04)); border: 1px solid rgba(168,85,247,0.1); border-radius: 20px; }

/* Input */
.input {
  background: rgba(0,0,0,0.03);
  border: 1px solid var(--border);
  border-radius: 12px; padding: 10px 16px;
  color: var(--text); transition: all 0.2s; font-size: 14px;
}
.input:focus { outline: none; border-color: rgba(99,102,241,0.4); box-shadow: 0 0 0 3px rgba(99,102,241,0.08); background: #fff; }
.input::placeholder { color: #94a3b8; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  font-weight: 600; border-radius: 12px; transition: all 0.2s; cursor: pointer; border: none;
}
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

.btn-primary {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white; padding: 10px 20px; font-size: 14px;
  box-shadow: 0 2px 8px rgba(79,70,229,0.3);
}
.btn-primary:hover:not(:disabled) { box-shadow: 0 4px 14px rgba(79,70,229,0.4); transform: translateY(-1px); }

.btn-soft {
  background: rgba(0,0,0,0.04); color: var(--text);
  border: 1px solid var(--border); padding: 10px 20px; font-size: 14px;
}
.btn-soft:hover { background: rgba(0,0,0,0.06); }

.btn-ghost {
  background: transparent; color: var(--primary); padding: 8px 14px; font-size: 14px;
}
.btn-ghost:hover { background: rgba(79,70,229,0.06); }

/* Badge */
.badge {
  display: inline-flex; align-items: center;
  padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
}
.badge-green { background: rgba(34,197,94,0.1); color: #16a34a; }
.badge-red { background: rgba(239,68,68,0.1); color: #dc2626; }
.badge-orange { background: rgba(245,158,11,0.1); color: #d97706; }
.badge-blue { background: rgba(99,102,241,0.1); color: #4f46e5; }
.badge-purple { background: rgba(168,85,247,0.1); color: #7c3aed; }
.badge-gray { background: rgba(0,0,0,0.05); color: #64748b; }
.badge-indigo { background: rgba(99,102,241,0.1); color: #4f46e5; }

/* Gradient text */
.grad-indigo { background: linear-gradient(135deg, #4f46e5, #7c3aed); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.grad-green { background: linear-gradient(135deg, #16a34a, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.grad-orange { background: linear-gradient(135deg, #d97706, #dc2626); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

/* Ring progress */
.ring { transform: rotate(-90deg); }
.ring-track { fill: none; stroke: rgba(0,0,0,0.05); }
.ring-fill { fill: none; stroke-linecap: round; transition: stroke-dashoffset 1s cubic-bezier(0.25,0.1,0.25,1); }

/* Progress bar */
.progress-bar { transition: width 0.4s ease-out; }

/* Animations */
.fade-up { animation: fadeUp 0.45s ease-out both; }
.fade-up-d1 { animation-delay: 0.08s; }
.fade-up-d2 { animation-delay: 0.16s; }
.fade-up-d3 { animation-delay: 0.24s; }
.fade-up-d4 { animation-delay: 0.32s; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.pulse-soft { animation: pulseSoft 2s ease-in-out infinite; }
@keyframes pulseSoft { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }

/* Scrollbar */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 3px; }
```

### app/page.tsx

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import GeneratePanel from '@/components/GeneratePanel';

const UPLOAD_DURATION = 1;
const ANALYZE_DURATION = 60;
const OPTIMIZE_DURATION = 45;
const INTERVIEW_DURATION = 40;

// ─── Ring 分数组件 ───
const Ring = ({ v, sz = 170 }: { v: number; sz?: number }) => {
  const sw = 11, r = (sz - sw) / 2, c = 2 * Math.PI * r, o = c - (v / 100) * c;
  const g = v >= 80 ? 'rg' : v >= 60 ? 'rb' : v >= 40 ? 'ro' : 'rr';
  const sc = (s: number) => s >= 80 ? 'grad-green' : s >= 60 ? 'grad-indigo' : 'grad-orange';
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
        <span className={`text-5xl font-extrabold ${sc(v)}`}>{v}</span>
        <span className="text-sm text-slate-400 mt-0.5">分</span>
      </div>
    </div>
  );
};

// ─── 文件上传组件 ───
const UploadZone = ({ label, file, text, onFile, onRemove, onText, accept }: {
  label: string; file: File | null; text: string;
  onFile: (f: File) => void; onRemove: () => void; onText: (t: string) => void; accept: string;
}) => {
  const [showText, setShowText] = useState(false);
  const inputId = `f-${label.replace(/\s/g, '')}`;

  return (
    <div className="card-solid p-7">
      <p className="text-sm font-semibold text-slate-700 mb-3">{label}</p>
      {file ? (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center text-lg">📄</div>
            <div><p className="font-medium text-slate-900 text-sm">{file.name}</p><p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p></div>
          </div>
          <button onClick={onRemove} className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-slate-600 active:scale-90 transition-all text-xs shadow-sm">✕</button>
        </div>
      ) : text ? (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 flex items-center justify-center text-lg">📝</div>
            <div><p className="font-medium text-slate-900 text-sm">已粘贴文字</p><p className="text-xs text-slate-500">{text.length} 字</p></div>
          </div>
          <button onClick={() => onText('')} className="w-7 h-7 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-slate-600 active:scale-90 transition-all text-xs shadow-sm">✕</button>
        </div>
      ) : (
        <>
          <div
            className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 active:scale-[0.99]"
            onClick={() => document.getElementById(inputId)?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-indigo-300', 'bg-indigo-50'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('border-indigo-300', 'bg-indigo-50')}
            onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-indigo-300', 'bg-indigo-50'); if (e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
          >
            <input id={inputId} type="file" className="hidden" accept={accept} onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); }} />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center text-2xl mb-3 border border-indigo-100">📤</div>
            <p className="text-sm font-medium text-slate-600">拖拽文件到此处或点击选择</p>
            <p className="text-xs text-slate-400 mt-1">支持 PDF、TXT、MD、图片</p>
          </div>
          <button onClick={() => setShowText(!showText)} className="mt-3 text-sm text-indigo-500 hover:text-indigo-600 font-medium transition-colors">
            {showText ? '收起' : '或直接粘贴文字 ↓'}
          </button>
          {showText && <textarea value={text} onChange={(e) => onText(e.target.value)} placeholder="在此粘贴文字..." rows={4} className="input w-full resize-none mt-3" />}
        </>
      )}
    </div>
  );
};

// ─── 面试题卡片组件 ───
const QuestionCard = ({ q, idx, isOpen, onToggle }: {
  q: { question: string; focus: string; referenceAnswer: string; tips: string };
  idx: number; isOpen: boolean; onToggle: () => void;
}) => (
  <div className={`rounded-2xl border transition-all duration-300 ${isOpen ? 'bg-indigo-50/40 border-indigo-100' : 'bg-gray-50/50 border-gray-100 hover:bg-gray-100/60'}`}>
    <div className="p-4 cursor-pointer" onClick={onToggle}>
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs text-gray-400">第 {idx + 1} 题</span>
            <span className="badge badge-purple">{q.focus}</span>
          </div>
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

// ─── 可折叠面板组件 ───
const Panel = ({ title, icon, accent, open, onToggle, children, badge, actions }: {
  title: string; icon: string; accent: 'blue' | 'green' | 'purple';
  open: boolean; onToggle: () => void; children: React.ReactNode;
  badge?: string; actions?: React.ReactNode;
}) => {
  const colors = {
    blue: 'from-blue-50 to-indigo-50 border-blue-100',
    green: 'from-emerald-50 to-teal-50 border-emerald-100',
    purple: 'from-purple-50 to-pink-50 border-purple-100',
  };
  const textColors = { blue: 'text-indigo-600', green: 'text-emerald-600', purple: 'text-purple-600' };
  return (
    <div className={`card-solid overflow-hidden fade-up ${open ? '' : 'hover:shadow-md cursor-pointer'}`} onClick={open ? undefined : onToggle}>
      <div className="flex items-center justify-between p-6" onClick={open ? onToggle : undefined}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colors[accent]} flex items-center justify-center text-2xl border ${colors[accent].split(' ')[1]} shadow-sm`}>{icon}</div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className={`text-lg font-bold ${textColors[accent]}`}>{title}</h3>
              {badge && <span className="badge badge-blue">{badge}</span>}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">点击{open ? '收起' : '展开'}面板</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {actions && <div onClick={(e) => e.stopPropagation()}>{actions}</div>}
          <span className={`text-slate-300 transition-transform duration-300 text-sm ${open ? 'rotate-90' : ''}`}>▶</span>
        </div>
      </div>
      {open && <div className="border-t border-slate-100">{children}</div>}
    </div>
  );
};

// ─── 主页面 ───
export default function Home() {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 面板状态
  const [analyzeOpen, setAnalyzeOpen] = useState(false);
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [interviewOpen, setInterviewOpen] = useState(false);

  // 分析
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeError, setAnalyzeError] = useState<string | null>(null);
  const [reasoning, setReasoning] = useState('');
  const [content, setContent] = useState('');
  const [analyzeResult, setAnalyzeResult] = useState<any>(null);
  const [elapsed, setElapsed] = useState(0);
  const [step, setStep] = useState('');
  const [progress, setProgress] = useState(0);

  // 优化
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [optimizeError, setOptimizeError] = useState<string | null>(null);
  const [optimizeResult, setOptimizeResult] = useState<any>(null);
  const [optimizeMode, setOptimizeMode] = useState<'smart' | 'full' | 'custom'>('smart');
  const [optimizeNeedsSetup, setOptimizeNeedsSetup] = useState(true);

  // 面试
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewError, setInterviewError] = useState<string | null>(null);
  const [interviewResult, setInterviewResult] = useState<any>(null);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  // 生成简历
  const [showGeneratePanel, setShowGeneratePanel] = useState(false);

  // 进度条
  const [optimizeElapsed, setOptimizeElapsed] = useState(0);
  const [optimizeProgress, setOptimizeProgress] = useState(0);
  const [interviewElapsed, setInterviewElapsed] = useState(0);
  const [interviewProgress, setInterviewProgress] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optimizeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const interviewTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const optimizeStartRef = useRef(0);
  const interviewStartRef = useRef(0);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (optimizeTimerRef.current) clearInterval(optimizeTimerRef.current);
    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
  }, []);

  useEffect(() => {
    if (analyzeLoading && contentRef.current) contentRef.current.scrollTop = contentRef.current.scrollHeight;
  }, [reasoning, content, analyzeLoading]);

  useEffect(() => {
    if (!analyzeLoading) return;
    const total = step.includes('解析') ? UPLOAD_DURATION : UPLOAD_DURATION + ANALYZE_DURATION;
    setProgress(Math.min(95, (elapsed / total) * 100));
  }, [elapsed, step, analyzeLoading]);

  useEffect(() => {
    if (!optimizeLoading) return;
    setOptimizeProgress(Math.min(95, (optimizeElapsed / OPTIMIZE_DURATION) * 100));
  }, [optimizeElapsed, optimizeLoading]);

  useEffect(() => {
    if (!interviewLoading) return;
    setInterviewProgress(Math.min(95, (interviewElapsed / INTERVIEW_DURATION) * 100));
  }, [interviewElapsed, interviewLoading]);

  const formatTime = (s: number) => s < 60 ? `${s}秒` : `${Math.floor(s / 60)}分${s % 60}秒`;

  const getResumeContent = () => resumeText;
  const getJdContent = () => jdText;

  const uploadFile = async (file: File, type: 'resume' | 'jd'): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    form.append('type', type);
    const res = await fetch('/api/upload', { method: 'POST', body: form });
    if (!res.ok) throw new Error((await res.json()).error || '上传失败');
    return (await res.json()).data.content;
  };

  const handleAnalyze = async () => {
    if ((!resumeFile && !resumeText) || (!jdFile && !jdText)) { setGlobalError('请上传简历和岗位JD'); return; }
    setAnalyzeLoading(true); setAnalyzeError(null); setGlobalError(null);
    setReasoning(''); setContent(''); setAnalyzeResult(null);
    setAnalyzeOpen(true);
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    startTimeRef.current = Date.now(); setElapsed(0);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 200);

    try {
      let rc = getResumeContent(), jc = getJdContent();

      if (resumeFile && !rc) {
        setStep('正在解析简历文件...');
        rc = await uploadFile(resumeFile, 'resume');
        setResumeText(rc);
      }
      if (jdFile && !jc) {
        setStep('正在解析岗位JD...');
        jc = await uploadFile(jdFile, 'jd');
        setJdText(jc);
      }

      setStep('正在AI分析匹配度（约需1分钟）...');
      const analyzeRc = rc, analyzeJc = jc;

      const res = await fetch('/api/analyze/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent: analyzeRc, jdContent: analyzeJc }),
      });

      if (!res.ok) { const e = await res.json(); throw new Error(e.error || '分析失败'); }

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
            if (parsed.type === 'reasoning') setReasoning(prev => prev + parsed.content);
            else if (parsed.type === 'content') setContent(prev => prev + parsed.content);
            else if (parsed.type === 'result') { setAnalyzeResult(parsed.data); sessionStorage.setItem('analysisResult', JSON.stringify(parsed.data)); }
            else if (parsed.type === 'error') setAnalyzeError(parsed.content);
          } catch {}
        }
      }
    } catch (err) {
      setAnalyzeError(err instanceof Error ? err.message : '分析失败');
    } finally {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      setAnalyzeLoading(false);
    }
  };

  const handleOptimize = async () => {
    setOptimizeLoading(true); setOptimizeError(null); setOptimizeResult(null); setOptimizeNeedsSetup(false); setOptimizeOpen(true);
    optimizeStartRef.current = Date.now(); setOptimizeElapsed(0);
    if (optimizeTimerRef.current) clearInterval(optimizeTimerRef.current);
    optimizeTimerRef.current = setInterval(() => setOptimizeElapsed(Math.floor((Date.now() - optimizeStartRef.current) / 1000)), 200);
    try {
      let rc = getResumeContent(), jc = getJdContent();
      if (!rc && resumeFile) { rc = await uploadFile(resumeFile, 'resume'); setResumeText(rc); }
      if (!jc && jdFile) { jc = await uploadFile(jdFile, 'jd'); setJdText(jc); }
      if (!rc || !jc) { setOptimizeError('请先上传简历和JD'); return; }
      const res = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent: rc, jdContent: jc, mode: optimizeMode }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setOptimizeResult((await res.json()).data);
    } catch (err) {
      setOptimizeError(err instanceof Error ? err.message : '优化失败');
    } finally {
      if (optimizeTimerRef.current) { clearInterval(optimizeTimerRef.current); optimizeTimerRef.current = null; }
      setOptimizeLoading(false);
    }
  };

  const handleInterview = async () => {
    setInterviewLoading(true); setInterviewError(null); setInterviewResult(null); setInterviewOpen(true);
    interviewStartRef.current = Date.now(); setInterviewElapsed(0);
    if (interviewTimerRef.current) clearInterval(interviewTimerRef.current);
    interviewTimerRef.current = setInterval(() => setInterviewElapsed(Math.floor((Date.now() - interviewStartRef.current) / 1000)), 200);
    try {
      let rc = getResumeContent(), jc = getJdContent();
      if (!rc && resumeFile) { rc = await uploadFile(resumeFile, 'resume'); setResumeText(rc); }
      if (!jc && jdFile) { jc = await uploadFile(jdFile, 'jd'); setJdText(jc); }
      if (!rc || !jc) { setInterviewError('请先上传简历和JD'); return; }
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeContent: rc, jdContent: jc }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setInterviewResult((await res.json()).data);
    } catch (err) {
      setInterviewError(err instanceof Error ? err.message : '生成失败');
    } finally {
      if (interviewTimerRef.current) { clearInterval(interviewTimerRef.current); interviewTimerRef.current = null; }
      setInterviewLoading(false);
    }
  };

  const handleDownload = async (type: 'report' | 'resume' | 'interview') => {
    const contentMap: Record<string, any> = { report: analyzeResult, resume: optimizeResult, interview: interviewResult };
    const data = contentMap[type];
    if (!data) return;
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, content: data }),
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sc = (s: number) => s >= 80 ? 'grad-green' : s >= 60 ? 'grad-indigo' : 'grad-orange';
  const bd = (s: string) => s === 'met' ? 'badge-green' : s === 'partial' ? 'badge-orange' : 'badge-red';
  const hasContent = !!getResumeContent() || !!resumeFile;
  const hasJd = !!getJdContent() || !!jdFile;
  const canAnalyze = hasContent && hasJd && !analyzeLoading;

  return (
    <>
      {/* ─── 导航栏 ─── */}
      <nav className="nav sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-base shadow-md shadow-indigo-200">📄</div>
            <div><h1 className="text-lg font-bold text-slate-900 tracking-tight">ResumeAI</h1><p className="text-xs text-slate-400">智能简历优化平台</p></div>
          </div>
          <button onClick={() => window.location.href = '/admin/skills'} className="btn btn-ghost">⚙️ 后台管理</button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* ─── Hero ─── */}
        <div className="text-center mb-14 fade-up">
          <h2 className="text-[2.8rem] font-extrabold text-slate-900 mb-4 tracking-tight leading-[1.15]">
            让 <span className="grad-indigo">AI</span> 帮你打造完美简历
          </h2>
          <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">上传简历和目标岗位JD，AI基于8大优化规则智能分析优化</p>
        </div>

        {/* ─── 上传区 ─── */}
        <div className="grid md:grid-cols-2 gap-5 mb-8 fade-up fade-up-d1">
          <UploadZone label="📄 个人简历" file={resumeFile} text={resumeText} onFile={(f) => { setResumeFile(f); setResumeText(''); }} onRemove={() => { setResumeFile(null); setResumeText(''); }} onText={(t) => { setResumeText(t); if (t) setResumeFile(null); }} accept=".pdf,.txt,.md,.png,.jpg,.jpeg" />
          <UploadZone label="📋 岗位 JD" file={jdFile} text={jdText} onFile={(f) => { setJdFile(f); setJdText(''); }} onRemove={() => { setJdFile(null); setJdText(''); }} onText={(t) => { setJdText(t); if (t) setJdFile(null); }} accept=".pdf,.txt,.md,.png,.jpg,.jpeg" />
        </div>

        {/* ─── 全局错误 ─── */}
        {globalError && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm text-center fade-up">{globalError}</div>}

        {/* ─── 进度条 ─── */}
        {analyzeLoading && (
          <div className="mb-6 card-solid p-6 fade-up">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
                <span className="text-sm font-medium text-slate-700">{step}</span>
              </div>
              <span className="text-xs text-slate-400">已用时 {formatTime(elapsed)}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full progress-bar" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-400 mt-2 text-center">AI分析约需1分钟，请耐心等待</p>
          </div>
        )}

        {/* ─── 操作按钮区 ─── */}
        {!analyzeOpen && (
          <div className="text-center mb-16 fade-up fade-up-d2">
            <button onClick={handleAnalyze} disabled={!canAnalyze} className="btn btn-primary text-base px-10 py-3.5">
              {analyzeLoading ? <><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>分析中...</> : '🚀 开始分析简历'}
            </button>
          </div>
        )}

        {/* ─── 进行中操作区 ─── */}
        {(analyzeOpen || optimizeOpen || interviewOpen) && (
          <div className="flex flex-wrap items-center gap-3 mb-10 fade-up">
            {analyzeResult && (
              <>
                <button onClick={() => { setOptimizeNeedsSetup(true); setOptimizeOpen(true); }} disabled={optimizeLoading} className="btn btn-primary text-sm px-5 py-2.5">✨ 简历优化</button>
                <button onClick={handleInterview} disabled={interviewLoading} className="btn btn-soft text-sm px-5 py-2.5">🎤 生成面试题</button>
              </>
            )}
            <button onClick={() => { setAnalyzeOpen(false); setOptimizeOpen(false); setInterviewOpen(false); setAnalyzeResult(null); setOptimizeResult(null); setInterviewResult(null); setReasoning(''); setContent(''); setOptimizeNeedsSetup(true); }} className="btn btn-ghost text-sm ml-auto text-slate-400">🔄 重新开始</button>
          </div>
        )}

        {/* ─── 结果面板区 ─── */}
        <div ref={resultsRef} className="space-y-6">

          {/* ═══ 匹配度分析面板 ═══ */}
          {(analyzeOpen || analyzeLoading) && (
            <Panel title="匹配度分析" icon="📊" accent="blue" open={analyzeOpen} onToggle={() => setAnalyzeOpen(!analyzeOpen)} badge={analyzeResult ? `${analyzeResult.overallScore} 分` : undefined} actions={analyzeResult ? <button onClick={(e) => { e.stopPropagation(); handleDownload('report'); }} className="btn btn-soft text-xs px-3 py-1.5">📥 下载报告</button> : undefined}>
              {analyzeLoading && (
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-5 h-5 rounded-full border-2 border-indigo-100 border-t-indigo-500 animate-spin" />
                    <span className="text-sm font-semibold text-slate-900">AI 正在分析中</span>
                    <span className="text-xs text-slate-400 ml-auto">已用时 {formatTime(elapsed)}</span>
                  </div>
                  <div ref={contentRef} className="max-h-[500px] overflow-y-auto space-y-3 bg-slate-50 rounded-xl p-5 border border-slate-100">
                    {reasoning && <div><p className="text-xs font-medium text-slate-400 mb-1">💭 AI 思考过程：</p><p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed">{reasoning}</p></div>}
                    {content && <div><p className="text-xs font-medium text-indigo-500 mb-1">📊 分析结果：</p><p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">{content}</p></div>}
                    {!reasoning && !content && <p className="text-sm text-slate-400 text-center py-8">正在连接AI模型，请稍候...</p>}
                  </div>
                </div>
              )}
              {analyzeError && <div className="p-16 text-center"><div className="text-5xl mb-4">❌</div><h3 className="text-xl font-semibold text-slate-900 mb-2">分析失败</h3><p className="text-slate-500 mb-6">{analyzeError}</p><button onClick={handleAnalyze} className="btn btn-primary">重新分析</button></div>}
              {analyzeResult && (
                <div className="p-6 space-y-5">
                  <div className="text-center"><Ring v={analyzeResult.overallScore} /></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[{ icon: '🎯', label: '关键词覆盖率', val: `${analyzeResult.dimensions.keywordCoverage.score}%`, s: analyzeResult.dimensions.keywordCoverage.score, bg: 'from-blue-50 to-indigo-50', b: 'border-blue-100' }, { icon: '💼', label: '经历相关度', val: `${analyzeResult.dimensions.experienceRelevance.score}分`, s: analyzeResult.dimensions.experienceRelevance.score, bg: 'from-purple-50 to-pink-50', b: 'border-purple-100' }, { icon: '✅', label: '硬性条件', val: analyzeResult.dimensions.hardRequirements.met ? '达标' : '未达标', s: analyzeResult.dimensions.hardRequirements.met ? 100 : 40, bg: 'from-emerald-50 to-teal-50', b: 'border-emerald-100' }, { icon: '🏢', label: '行业匹配度', val: `${analyzeResult.dimensions.industryMatch.score}分`, s: analyzeResult.dimensions.industryMatch.score, bg: 'from-amber-50 to-orange-50', b: 'border-amber-100' }].map((d) => (
                      <div key={d.label} className="card-solid p-5 text-center"><div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${d.bg} flex items-center justify-center text-lg mx-auto mb-2 border ${d.b} shadow-sm`}>{d.icon}</div><p className="text-xs text-slate-500 mb-0.5">{d.label}</p><p className={`text-2xl font-bold ${sc(d.s)}`}>{d.val}</p></div>
                    ))}
                  </div>
                  <div className="card-solid p-6"><h3 className="text-base font-semibold text-slate-900 mb-4">关键词分析</h3><div className="grid md:grid-cols-2 gap-6"><div><p className="text-xs font-medium text-emerald-600 mb-2">✅ 已匹配</p><div className="flex flex-wrap gap-1.5">{analyzeResult.dimensions.keywordCoverage.matchedKeywords.map((k: string, i: number) => <span key={i} className="badge badge-green">{k}</span>)}</div></div><div><p className="text-xs font-medium text-red-500 mb-2">❌ 缺失</p><div className="flex flex-wrap gap-1.5">{analyzeResult.dimensions.keywordCoverage.missingKeywords.map((k: string, i: number) => <span key={i} className="badge badge-red">{k}</span>)}</div></div></div></div>
                  <div className="card-solid p-6"><h3 className="text-base font-semibold text-slate-900 mb-4">硬性条件检查</h3><div className="space-y-2">{analyzeResult.dimensions.hardRequirements.items.map((item: any, i: number) => (<div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50"><div><p className="text-sm font-medium text-slate-900">{item.requirement}</p><p className="text-xs text-slate-500">{item.detail}</p></div><span className={`badge ${bd(item.status)}`}>{item.status === 'met' ? '达标' : item.status === 'partial' ? '部分达标' : '未达标'}</span></div>))}</div></div>
                  <div className="grid md:grid-cols-3 gap-4">{[{ t: '💪 优势', items: analyzeResult.summary.strengths, cls: 'card-green', tc: 'text-emerald-600' }, { t: '⚠️ 不足', items: analyzeResult.summary.weaknesses, cls: 'card-red', tc: 'text-red-500' }, { t: '💡 建议', items: analyzeResult.summary.suggestions, cls: 'card-blue', tc: 'text-indigo-600' }].map((s) => (<div key={s.t} className={`${s.cls} p-5`}><h3 className={`text-sm font-semibold ${s.tc} mb-3`}>{s.t}</h3><ul className="space-y-2">{s.items.map((item: string, i: number) => <li key={i} className="text-sm text-slate-600 leading-relaxed flex items-start"><span className="mr-2 text-slate-400">•</span>{item}</li>)}</ul></div>))}</div>
                </div>
              )}
            </Panel>
          )}

          {/* ═══ 简历优化面板 ═══ */}
          {optimizeOpen && (
            <Panel title="简历优化" icon="✨" accent="green" open={optimizeOpen} onToggle={() => setOptimizeOpen(!optimizeOpen)} badge={optimizeResult ? '优化完成' : undefined} actions={optimizeResult ? <button onClick={(e) => { e.stopPropagation(); handleDownload('resume'); }} className="btn btn-soft text-xs px-3 py-1.5">📥 下载简历</button> : undefined}>
              {optimizeNeedsSetup && !optimizeLoading && !optimizeResult && (
                <div className="p-8">
                  <h3 className="text-base font-semibold text-slate-900 mb-5">选择优化模式</h3>
                  <div className="grid md:grid-cols-3 gap-4 mb-6">{[{ v: 'smart' as const, icon: '🤖', title: '智能模式', desc: 'AI自动判断需要哪些规则', badge: '推荐' }, { v: 'full' as const, icon: '📋', title: '完整模式', desc: '按顺序执行全部8个规则' }, { v: 'custom' as const, icon: '⚙️', title: '自定义模式', desc: '手动选择要应用的规则' }].map((m) => (<button key={m.v} onClick={() => setOptimizeMode(m.v)} className={`p-5 rounded-2xl text-left transition-all duration-200 active:scale-[0.98] ${optimizeMode === m.v ? 'card-blue shadow-lg' : 'card hover:shadow-lg'}`}><div className="text-3xl mb-2">{m.icon}</div><h3 className="font-semibold text-slate-900 mb-1">{m.title}</h3><p className="text-sm text-slate-500">{m.desc}</p>{m.badge && <span className="badge badge-blue mt-2">{m.badge}</span>}</button>))}</div>
                  <div className="text-center"><button onClick={handleOptimize} className="btn btn-primary text-base px-8 py-3">✨ 开始优化简历</button></div>
                </div>
              )}
              {optimizeLoading && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-purple-50 flex items-center justify-center pulse-soft"><div className="w-8 h-8 rounded-full border-[3px] border-purple-100 border-t-purple-500 animate-spin" /></div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">AI 正在优化中</h3>
                  <p className="text-slate-500 mb-5">约需45秒，请耐心等待</p>
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-xs text-slate-400 mb-2"><span>AI优化中</span><span>已用时 {formatTime(optimizeElapsed)}</span></div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full progress-bar" style={{ width: `${optimizeProgress}%` }} /></div>
                    <p className="text-xs text-slate-400 mt-2">{Math.round(optimizeProgress)}%</p>
                  </div>
                </div>
              )}
              {optimizeError && <div className="p-16 text-center"><div className="text-5xl mb-4">❌</div><h3 className="text-xl font-semibold text-slate-900 mb-2">优化失败</h3><p className="text-slate-500 mb-6">{optimizeError}</p><button onClick={handleOptimize} className="btn btn-primary">重新优化</button></div>}
              {optimizeResult && (
                <div className="p-6 space-y-5">
                  <div><h3 className="text-sm font-semibold text-slate-900 mb-3">已应用的优化规则</h3><div className="flex flex-wrap gap-1.5">{optimizeResult.appliedSkills.map((s: string, i: number) => <span key={i} className="badge badge-blue">{s}</span>)}</div></div>
                  <div><h3 className="text-base font-semibold text-slate-900 mb-4">优化后简历</h3><div className="bg-slate-50/80 p-5 rounded-2xl whitespace-pre-wrap text-sm text-slate-700 leading-relaxed border border-slate-100">{optimizeResult.optimizedResume}</div></div>
                  <div><h3 className="text-base font-semibold text-slate-900 mb-4">修改详情</h3><div className="space-y-4">{optimizeResult.changes.map((c: any, i: number) => (<div key={i} className="rounded-2xl bg-slate-50/80 border border-slate-100 p-4"><span className="badge badge-purple mb-3">{c.rule}</span><div className="grid md:grid-cols-2 gap-4 mt-2"><div><p className="text-xs font-medium text-red-500 mb-1">原文</p><p className="text-sm text-slate-600 bg-red-50/60 p-3 rounded-xl border border-red-100">{c.original}</p></div><div><p className="text-xs font-medium text-emerald-600 mb-1">优化后</p><p className="text-sm text-slate-600 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">{c.optimized}</p></div></div><p className="text-xs text-slate-400 mt-2">{c.explanation}</p></div>))}</div></div>
                  <div className="flex justify-center gap-4 pt-4 border-t border-slate-100">
                    <button onClick={() => { setOptimizeResult(null); setOptimizeNeedsSetup(true); }} className="btn btn-soft text-sm px-6 py-2.5">🔄 重新优化</button>
                    {!showGeneratePanel && <button onClick={() => setShowGeneratePanel(true)} className="btn btn-primary text-sm px-8 py-2.5">✨ 对结果满意？生成格式化简历</button>}
                  </div>
                </div>
              )}
            </Panel>
          )}

          {/* ═══ 面试题面板 ═══ */}
          {interviewOpen && (
            <Panel title="面试准备" icon="🎤" accent="purple" open={interviewOpen} onToggle={() => setInterviewOpen(!interviewOpen)} badge={interviewResult ? `${(interviewResult.behavioralQuestions?.length || 0) + (interviewResult.technicalQuestions?.length || 0)} 题` : undefined} actions={interviewResult ? <button onClick={(e) => { e.stopPropagation(); handleDownload('interview'); }} className="btn btn-soft text-xs px-3 py-1.5">📥 下载面试题</button> : undefined}>
              {interviewLoading && (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-purple-50 flex items-center justify-center pulse-soft"><div className="w-8 h-8 rounded-full border-[3px] border-purple-100 border-t-purple-500 animate-spin" /></div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">AI 正在生成面试题</h3>
                  <p className="text-slate-500 mb-5">约需40秒，请耐心等待</p>
                  <div className="max-w-md mx-auto">
                    <div className="flex justify-between text-xs text-slate-400 mb-2"><span>AI生成中</span><span>已用时 {formatTime(interviewElapsed)}</span></div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full progress-bar" style={{ width: `${interviewProgress}%` }} /></div>
                    <p className="text-xs text-slate-400 mt-2">{Math.round(interviewProgress)}%</p>
                  </div>
                </div>
              )}
              {interviewError && <div className="p-16 text-center"><div className="text-5xl mb-4">❌</div><h3 className="text-xl font-semibold text-slate-900 mb-2">生成失败</h3><p className="text-slate-500 mb-6">{interviewError}</p><button onClick={handleInterview} className="btn btn-primary">重新生成</button></div>}
              {interviewResult && (
                <div className="p-6 space-y-5">
                  {[{ questions: interviewResult.behavioralQuestions, label: '行为面试题', icon: '🗣️', bg: 'bg-blue-50', bdr: 'border-blue-100', startIdx: 0 }, { questions: interviewResult.technicalQuestions, label: '技术面试题', icon: '💻', bg: 'bg-purple-50', bdr: 'border-purple-100', startIdx: interviewResult.behavioralQuestions?.length || 0 }].map((group) => (
                    <div key={group.label}>
                      <div className="flex items-center mb-4"><div className={`w-10 h-10 rounded-2xl ${group.bg} flex items-center justify-center text-xl mr-3 border ${group.bdr} shadow-sm`}>{group.icon}</div><div className="flex-1"><h3 className="text-base font-semibold text-slate-900">{group.label}</h3><p className="text-xs text-slate-500">基于你的简历和岗位要求</p></div><span className="badge badge-blue">{group.questions?.length || 0} 题</span></div>
                      <div className="space-y-2.5">{group.questions?.map((q: any, i: number) => <QuestionCard key={i} q={q} idx={group.startIdx + i} isOpen={expandedQ === group.startIdx + i} onToggle={() => setExpandedQ(expandedQ === group.startIdx + i ? null : group.startIdx + i)} />)}</div>
                    </div>
                  ))}
                  <div className="flex justify-center pt-2"><button onClick={handleInterview} className="btn btn-soft text-sm px-6 py-2.5">🔄 重新生成</button></div>
                </div>
              )}
            </Panel>
          )}
        </div>

        {/* ─── 生成简历面板 ─── */}
        {showGeneratePanel && (
          <div className="mt-6 fade-up">
            <GeneratePanel resumeContent={optimizeResult?.optimizedResume || getResumeContent()} jdContent={getJdContent()} onClose={() => setShowGeneratePanel(false)} />
          </div>
        )}

        {/* ─── 特性展示区 ─── */}
        {!analyzeOpen && !optimizeOpen && !interviewOpen && (
          <div className="grid md:grid-cols-4 gap-4 fade-up fade-up-d3 mt-4">
            {[{ icon: '🎯', title: '关键词匹配', desc: '提取JD核心关键词并与简历对齐', bg: 'from-blue-50 to-indigo-50', bdr: 'border-blue-100' }, { icon: '⭐', title: 'STAR原则重构', desc: '按情境-任务-行动-结果重写经历', bg: 'from-purple-50 to-pink-50', bdr: 'border-purple-100' }, { icon: '📊', title: '量化数据强化', desc: '将模糊描述转化为具体数据', bg: 'from-emerald-50 to-teal-50', bdr: 'border-emerald-100' }, { icon: '💼', title: '面试准备', desc: '生成针对性面试题和参考答案', bg: 'from-amber-50 to-orange-50', bdr: 'border-amber-100' }].map((f) => (
              <div key={f.title} className="card-solid p-5 group"><div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.bg} flex items-center justify-center text-xl mb-3 border ${f.bdr} group-hover:scale-110 transition-transform shadow-sm`}>{f.icon}</div><h3 className="font-semibold text-slate-900 text-sm mb-1">{f.title}</h3><p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p></div>
            ))}
          </div>
        )}
      </main>

      <footer className="py-8 text-center text-sm text-slate-400">ResumeAI — 基于AI的智能简历优化与面试准备平台</footer>
    </>
  );
}
```

---

> **注意**：由于文件总内容超过 50KB，剩余文件（admin 页面、API 路由、组件、lib 工具库、类型定义、数据文件）请在项目目录下直接查看源码文件。完整项目结构和每个文件的路径已在上方目录树中列出。

[View PROJECT_FULL.md](computer://C:\Users\10393\resume-ai\PROJECT_FULL.md)
