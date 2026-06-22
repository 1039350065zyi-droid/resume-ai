# 产品需求文档 (PRD)

> **产品名称**：待定（暂称 ResumeAI）
> **版本**：v1.1
> **更新日期**：2026-06-21
> **状态**：需求确认中
> **更新记录**：新增 Skill 配置管理功能

---

## 1. 产品概述

### 1.1 产品定位
AI驱动的简历优化与面试准备平台，帮助求职者精准匹配岗位需求，提升简历质量和面试通过率。

### 1.2 目标用户
- 正在求职的职场人士
- 准备跳槽的在职人员
- 应届毕业生
- 需要优化简历的任何人

### 1.3 核心价值
1. **精准匹配**：分析简历与岗位JD的匹配度，找出差距
2. **智能优化**：基于8大规则体系，AI自动优化简历
3. **面试准备**：生成针对性面试题和参考答案
4. **效率提升**：将专业的简历优化方法论自动化
5. **可配置性**：所有AI提示词可后台配置，方便迭代优化

---

## 2. 功能需求

### 2.1 功能架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          ResumeAI 产品功能                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   文件上传    │───▶│  匹配度分析   │───▶│   简历优化    │              │
│  │  简历 + JD   │    │  4个维度分析  │    │  8大规则体系  │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                   │                   │                        │
│         ▼                   ▼                   ▼                        │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   文件解析    │    │   报告生成    │    │   面试题生成  │              │
│  │ PDF/TXT/MD/图│    │  网页+PDF下载 │    │  题目+答案   │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│                                                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                      ⚙️ Skill 配置管理（后台）                             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  模块级 Skill          子规则级 Skill                            │  │
│  │  ├── 匹配度分析         ├── 关键词匹配                           │  │
│  │  ├── 简历优化           ├── STAR原则重构                         │  │
│  │  └── 面试题生成         ├── 量化数据强化                         │  │
│  │                         ├── 动词升级                              │  │
│  │                         ├── 胜任力呈现                            │  │
│  │                         ├── 结构逻辑优化                          │  │
│  │                         ├── ATS友好格式                           │  │
│  │                         └── 表述合规优化                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 模块详细说明

#### 模块1：文件上传

**功能描述**：用户上传个人简历和目标岗位JD

| 功能点 | 说明 | 优先级 |
|--------|------|--------|
| 简历上传区 | 支持拖拽和点击上传 | P0 |
| JD上传区 | 支持拖拽和点击上传 | P0 |
| 格式支持 | PDF、TXT、MD、图片（PNG/JPG） | P0 |
| 文件大小限制 | 单文件最大 10MB | P0 |
| 上传进度 | 显示上传进度条 | P1 |
| 文件预览 | 上传后可预览内容 | P1 |

**交互流程**：
```
用户进入首页
    ↓
看到两个上传区域（左右或上下布局）
    ↓
拖拽或点击上传简历 → 显示文件名 + 预览
    ↓
拖拽或点击上传JD → 显示文件名 + 预览
    ↓
点击"开始分析"按钮
    ↓
进入分析流程
```

#### 模块2：匹配度分析

**功能描述**：分析简历与JD的匹配程度，输出详细报告

**分析维度**（4个）：

| 维度 | 分析内容 | 输出指标 |
|------|----------|----------|
| **关键词覆盖率** | 提取JD中的核心关键词，检查简历是否覆盖 | 百分比 + 缺失关键词列表 |
| **经历相关度** | 分析工作经历与岗位要求的相关程度 | 0-100分 + 具体分析 |
| **硬性条件匹配** | 检查学历、工作年限、证书等硬性要求 | 达标/不达标 + 差距说明 |
| **行业匹配度** | 分析行业背景和领域知识的匹配度 | 0-100分 + 建议 |

**综合评分算法**：
```
综合匹配度 = 关键词覆盖率 × 30% + 经历相关度 × 35% + 硬性条件匹配 × 20% + 行业匹配度 × 15%
```

**输出内容**：
- 综合匹配度评分（0-100分）
- 各维度详细分析
- 优势和不足总结
- 改进建议
- 可下载PDF报告

#### 模块3：简历优化

**功能描述**：基于规则体系，AI自动优化简历内容

**优化规则**（8个）：

| 序号 | 规则名称 | 说明 | 示例 |
|------|----------|------|------|
| 1 | 关键词匹配 | 将JD核心关键词融入简历 | "用户增长" → "负责用户增长策略，实现DAU提升30%" |
| 2 | STAR原则重构 | 按情境-任务-行动-结果框架重写 | "负责活动策划" → "针对新用户留存问题(S)，策划并执行3场拉新活动(T/A)，带来5000+新用户(R)" |
| 3 | 量化数据强化 | 将模糊描述转化为具体数据 | "提升了很多" → "提升45%" |
| 4 | 动词升级 | 弱动词替换为强动词 | "做了" → "主导"、"推动"、"落地" |
| 5 | 胜任力呈现 | 突出核心竞争力和独特价值 | 增加"核心优势"模块 |
| 6 | 结构逻辑优化 | 优化信息呈现顺序和层次 | 按"核心能力→工作经历→项目经历→教育背景"排列 |
| 7 | ATS友好格式 | 兼容招聘系统解析 | 避免复杂排版、使用标准字段名 |
| 8 | 表述合规优化 | 去除主观冗余信息 | 删除"吃苦耐劳"等空泛描述 |

**执行模式**（3种）：

| 模式 | 说明 | 默认 |
|------|------|------|
| 智能模式 | AI自动判断需要哪些规则，针对性优化 | ✅ 默认 |
| 完整模式 | 按顺序执行全部8个规则 | — |
| 自定义模式 | 用户手动选择要应用的规则 | — |

**输出内容**：
- 优化后简历（网页展示）
- 优化前后对比（高亮修改部分）
- 应用的规则列表
- 可下载PDF/Word格式

#### 模块4：面试题生成

**功能描述**：根据简历和JD生成针对性面试题

**题目类型**：

| 类型 | 说明 | 数量 |
|------|------|------|
| 行为面试题 | 基于简历经历的STAR问题 | 5-8题 |
| 技术面试题 | 基于岗位要求的专业问题 | 5-8题 |

**每题包含**：
- 题目描述
- 考察要点
- 参考答案
- 回答技巧和框架

**输出内容**：
- 面试题列表（网页展示）
- 参考答案和技巧
- 可下载PDF格式

#### 模块5：Skill 配置管理（后台）

**功能描述**：管理和配置各功能模块的AI提示词，支持两层结构

**为什么需要这个功能**：
- 提示词需要不断优化迭代
- 不同场景可能需要不同的提示词
- 方便A/B测试和效果对比

**两层 Skill 结构**：

```
第一层：模块级 Skill（3个）
├── analyze_skill      # 匹配度分析的整体提示词
├── optimize_skill     # 简历优化的整体提示词
└── interview_skill    # 面试题生成的整体提示词

第二层：子规则级 Skill（8个，属于简历优化模块）
├── keyword_match      # 关键词匹配规则
├── star_rewrite       # STAR原则重构
├── quantification     # 量化数据强化
├── action_verb        # 动词升级
├── competency         # 胜任力呈现
├── structure          # 结构逻辑优化
├── ats_friendly       # ATS友好格式
└── compliance         # 表述合规优化
```

**Skill 配置项**：

| 字段 | 说明 | 示例 |
|------|------|------|
| id | 唯一标识 | "keyword_match" |
| name | 显示名称 | "关键词匹配" |
| description | 功能描述 | "将JD核心关键词融入简历" |
| level | 层级 | "module" 或 "rule" |
| parentId | 父级ID（子规则才有） | "optimize_skill" |
| prompt | 提示词模板 | "你是一位专业的简历优化顾问..." |
| variables | 可用变量列表 | ["resumeContent", "jdContent"] |
| enabled | 是否启用 | true/false |
| priority | 执行优先级 | 1-10 |
| version | 版本号 | "v1.0" |
| updatedAt | 更新时间 | "2026-06-21T10:00:00Z" |

**后台管理功能**：

| 功能 | 说明 | 优先级 |
|------|------|--------|
| Skill 列表 | 查看所有Skill，按模块分组 | P0 |
| 编辑 Skill | 修改提示词、描述、优先级等 | P0 |
| 启用/禁用 | 控制Skill是否生效 | P0 |
| 测试 Skill | 输入测试内容，预览AI输出 | P1 |
| 版本历史 | 查看Skill的修改历史 | P2 |
| 导入/导出 | 批量导入导出Skill配置 | P2 |

**后台页面布局**：

```
/admin/skills
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Skill 配置管理                                           │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌──────────────────────────────────────┐ │
│  │ 模块级 Skill │  │  编辑区                               │ │
│  │             │  │                                      │ │
│  │ ▶ 匹配度分析 │  │  名称：[关键词匹配              ]    │ │
│  │   简历优化   │  │  描述：[将JD核心关键词融入简历  ]    │ │
│  │   面试题生成 │  │                                      │ │
│  │             │  │  提示词：                              │ │
│  ├─────────────┤  │  ┌────────────────────────────────┐ │ │
│  │ 子规则级 Skill│  │  │ 你是一位专业的简历优化顾问。   │ │ │
│  │             │  │  │ 请根据以下规则优化简历...       │ │ │
│  │ ▶ 关键词匹配 │  │  │                                │ │ │
│  │   STAR原则   │  │  └────────────────────────────────┘ │ │
│  │   量化数据   │  │                                      │ │
│  │   动词升级   │  │  优先级：[5]  状态：[✓ 启用]        │ │
│  │   ...       │  │                                      │ │
│  │             │  │  [保存]  [测试]  [重置]              │ │
│  └─────────────┘  └──────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 技术架构

### 3.1 技术选型

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Next.js 14+ (App Router) | 全栈框架，API Routes |
| 前端 | React 18 + TypeScript | 组件化开发 |
| 样式 | Tailwind CSS | 实用优先的CSS框架 |
| UI组件 | shadcn/ui | 可复用的UI组件库 |
| 大模型 | mimo API（小米官方） | 文本理解和生成 |
| OCR | Tesseract.js | 图片文字识别 |
| PDF生成 | jsPDF + html2canvas | 服务端PDF生成 |
| 存储 | JSON文件 / SQLite | Skill配置存储 |
| 部署 | Vercel | 自动部署，边缘计算 |

### 3.2 项目结构

```
resume-ai/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局
│   ├── page.tsx                  # 首页（上传页面）
│   ├── analyze/                  # 分析结果页
│   │   └── page.tsx
│   ├── optimize/                 # 优化结果页
│   │   └── page.tsx
│   ├── interview/                # 面试题页
│   │   └── page.tsx
│   ├── admin/                    # 后台管理
│   │   ├── layout.tsx            # 后台布局
│   │   └── skills/               # Skill管理
│   │       └── page.tsx          # Skill列表和编辑页
│   └── api/                      # API Routes
│       ├── upload/
│       │   └── route.ts          # 文件上传处理
│       ├── analyze/
│       │   └── route.ts          # 匹配度分析
│       ├── optimize/
│       │   └── route.ts          # 简历优化
│       ├── interview/
│       │   └── route.ts          # 面试题生成
│       ├── download/
│       │   └── route.ts          # PDF生成下载
│       └── skills/               # Skill管理API
│           ├── route.ts          # GET列表/POST创建
│           └── [id]/
│               └── route.ts      # GET详情/PUT更新/DELETE删除
├── components/                   # React组件
│   ├── ui/                       # 基础UI组件
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── FileUpload.tsx            # 文件上传组件
│   ├── MatchReport.tsx           # 匹配度报告组件
│   ├── ResumeCompare.tsx         # 简历对比组件
│   ├── InterviewQA.tsx           # 面试题展示组件
│   └── admin/                    # 后台管理组件
│       ├── SkillList.tsx         # Skill列表组件
│       ├── SkillEditor.tsx       # Skill编辑器
│       └── SkillTester.tsx       # Skill测试组件
├── lib/                          # 工具函数
│   ├── ai/
│   │   ├── mimo.ts               # mimo API调用
│   │   ├── skill-manager.ts      # Skill加载和管理
│   │   └── skills/               # Skill配置文件（JSON）
│   │       ├── analyze.json      # 匹配度分析Skill
│   │       ├── optimize.json     # 简历优化Skill（含子规则）
│   │       └── interview.json    # 面试题生成Skill
│   ├── parser/
│   │   ├── pdf.ts                # PDF解析
│   │   ├── md.ts                 # Markdown解析
│   │   └── ocr.ts                # OCR识别
│   └── utils/
│       ├── score.ts              # 评分算法
│       └── format.ts             # 格式化工具
├── data/                         # 数据存储
│   └── skills.json               # Skill配置（可选SQLite）
├── public/                       # 静态资源
├── .env.local                    # 环境变量
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

### 3.3 API设计

#### POST /api/upload
**功能**：上传文件并解析内容

**请求**：
```typescript
// FormData
{
  file: File,           // 上传的文件
  type: 'resume' | 'jd'  // 文件类型
}
```

**响应**：
```typescript
{
  success: boolean,
  data: {
    id: string,           // 文件ID
    filename: string,     // 文件名
    content: string,      // 解析后的文本内容
    fileType: string      // 文件类型
  }
}
```

#### POST /api/analyze
**功能**：匹配度分析

**请求**：
```typescript
{
  resumeContent: string,  // 简历内容
  jdContent: string       // JD内容
}
```

**响应**：
```typescript
{
  success: boolean,
  data: {
    overallScore: number,           // 综合匹配度（0-100）
    dimensions: {
      keywordCoverage: {
        score: number,
        matchedKeywords: string[],
        missingKeywords: string[],
        analysis: string
      },
      experienceRelevance: {
        score: number,
        analysis: string,
        highlights: string[]
      },
      hardRequirements: {
        met: boolean,
        items: Array<{
          requirement: string,
          status: 'met' | 'partial' | 'unmet',
          detail: string
        }>
      },
      industryMatch: {
        score: number,
        analysis: string
      }
    },
    summary: {
      strengths: string[],
      weaknesses: string[],
      suggestions: string[]
    }
  }
}
```

#### POST /api/optimize
**功能**：简历优化

**请求**：
```typescript
{
  resumeContent: string,      // 简历内容
  jdContent: string,          // JD内容
  mode: 'smart' | 'full' | 'custom',  // 优化模式
  selectedSkills?: string[]   // 自定义模式下选择的规则ID
}
```

**响应**：
```typescript
{
  success: boolean,
  data: {
    optimizedResume: string,       // 优化后简历内容
    changes: Array<{
      original: string,            // 原文
      optimized: string,           // 优化后
      rule: string,                // 应用的规则
      explanation: string          // 修改说明
    }>,
    appliedSkills: string[]        // 应用的规则列表
  }
}
```

#### POST /api/interview
**功能**：生成面试题

**请求**：
```typescript
{
  resumeContent: string,  // 简历内容
  jdContent: string       // JD内容
}
```

**响应**：
```typescript
{
  success: boolean,
  data: {
    behavioralQuestions: Array<{
      question: string,           // 题目
      focus: string,              // 考察要点
      referenceAnswer: string,    // 参考答案
      tips: string                // 回答技巧
    }>,
    technicalQuestions: Array<{
      question: string,
      focus: string,
      referenceAnswer: string,
      tips: string
    }>
  }
}
```

#### POST /api/download
**功能**：生成PDF下载

**请求**：
```typescript
{
  type: 'report' | 'resume' | 'interview',  // 下载类型
  content: object                             // 对应的内容数据
}
```

**响应**：
```
Content-Type: application/pdf
[PDF文件流]
```

#### GET /api/skills
**功能**：获取所有Skill列表

**响应**：
```typescript
{
  success: boolean,
  data: {
    modules: Skill[],      // 模块级Skill
    rules: Skill[]         // 子规则级Skill
  }
}
```

#### GET /api/skills/[id]
**功能**：获取单个Skill详情

**响应**：
```typescript
{
  success: boolean,
  data: Skill
}
```

#### PUT /api/skills/[id]
**功能**：更新Skill配置

**请求**：
```typescript
{
  name?: string,
  description?: string,
  prompt?: string,
  priority?: number,
  enabled?: boolean
}
```

**响应**：
```typescript
{
  success: boolean,
  data: Skill  // 更新后的Skill
}
```

#### POST /api/skills/test
**功能**：测试Skill效果

**请求**：
```typescript
{
  skillId: string,
  testData: {
    resumeContent: string,
    jdContent: string
  }
}
```

**响应**：
```typescript
{
  success: boolean,
  data: {
    output: string,        // AI输出结果
    executionTime: number  // 执行时间(ms)
  }
}
```

### 3.4 Skill 配置文件结构

**文件位置**：`lib/ai/skills/`

**analyze.json**（匹配度分析）：
```json
{
  "id": "analyze_skill",
  "name": "匹配度分析",
  "description": "分析简历与JD的匹配程度",
  "level": "module",
  "prompt": "你是一位资深的HR和职业顾问。请分析以下简历与岗位JD的匹配度。\n\n【简历内容】\n{resumeContent}\n\n【岗位JD】\n{jdContent}\n\n请从以下4个维度进行分析...",
  "variables": ["resumeContent", "jdContent"],
  "enabled": true,
  "priority": 1,
  "version": "v1.0",
  "updatedAt": "2026-06-21T10:00:00Z"
}
```

**optimize.json**（简历优化，含子规则）：
```json
{
  "id": "optimize_skill",
  "name": "简历优化",
  "description": "基于规则体系优化简历内容",
  "level": "module",
  "prompt": "你是一位专业的简历优化顾问。请根据以下规则优化简历...",
  "variables": ["resumeContent", "jdContent", "selectedRules"],
  "enabled": true,
  "priority": 1,
  "version": "v1.0",
  "updatedAt": "2026-06-21T10:00:00Z",
  "children": [
    {
      "id": "keyword_match",
      "name": "关键词匹配",
      "description": "将JD核心关键词融入简历",
      "level": "rule",
      "parentId": "optimize_skill",
      "prompt": "请分析JD中的核心关键词，并将它们自然地融入简历中...",
      "variables": ["resumeContent", "jdContent", "keywords"],
      "enabled": true,
      "priority": 1,
      "version": "v1.0",
      "updatedAt": "2026-06-21T10:00:00Z"
    },
    {
      "id": "star_rewrite",
      "name": "STAR原则重构",
      "description": "按情境-任务-行动-结果框架重写经历",
      "level": "rule",
      "parentId": "optimize_skill",
      "prompt": "请用STAR原则重写以下工作经历...",
      "variables": ["experience"],
      "enabled": true,
      "priority": 2,
      "version": "v1.0",
      "updatedAt": "2026-06-21T10:00:00Z"
    }
  ]
}
```

---

## 4. UI设计规范

### 4.1 设计原则
- **简洁清晰**：减少认知负担，突出核心功能
- **专业可信**：使用稳重配色，建立信任感
- **高效易用**：最少操作步骤完成核心任务

### 4.2 页面布局

#### 首页（上传页面）
```
┌─────────────────────────────────────────────────────────────┐
│  Logo    产品名称                              [后台管理]    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│     ┌─────────────────┐    ┌─────────────────┐              │
│     │                 │    │                 │              │
│     │   📄 上传简历    │    │   📋 上传JD     │              │
│     │                 │    │                 │              │
│     │  拖拽文件到此处   │    │  拖拽文件到此处   │              │
│     │  或点击选择文件   │    │  或点击选择文件   │              │
│     │                 │    │                 │              │
│     │  支持 PDF/TXT/  │    │  支持 PDF/TXT/  │              │
│     │  MD/图片        │    │  MD             │              │
│     └─────────────────┘    └─────────────────┘              │
│                                                               │
│                    [ 开始分析 ]                               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  8大优化规则展示区（可选）                                      │
└─────────────────────────────────────────────────────────────┘
```

#### 分析结果页面
```
┌─────────────────────────────────────────────────────────────┐
│  ← 返回    分析结果                        [下载报告]        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  综合匹配度：85分                                             │
│  ████████████████████░░░░ 85%                                │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  关键词覆盖率    经历相关度    硬性条件    行业匹配度          │
│     90%           85%        ✅达标        80%               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  优势：                                                       │
│  • 关键词覆盖全面                                             │
│  • 工作经历与岗位高度相关                                      │
│                                                               │
│  不足：                                                       │
│  • 缺少量化数据                                               │
│  • 行业经验描述不够突出                                        │
│                                                               │
│  建议：                                                       │
│  • 添加具体数据支撑                                           │
│  • 强调行业相关项目经验                                        │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              [ 继续优化简历 ]    [ 生成面试题 ]               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

#### Skill 管理页面
```
┌─────────────────────────────────────────────────────────────┐
│  ← 返回首页    ⚙️ Skill 配置管理                [+ 新增Skill] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────┐  ┌───────────────────────────────────┐│
│  │ 模块级 Skill     │  │ 编辑区                            ││
│  │                 │  │                                   ││
│  │ ▶ 匹配度分析 ✓  │  │ ID:    keyword_match              ││
│  │   简历优化 ✓    │  │ 名称:  [关键词匹配          ]     ││
│  │   面试题生成 ✓  │  │ 描述:  [将JD核心关键词融入   ]     ││
│  │                 │  │                                   ││
│  ├─────────────────┤  │ 提示词：                           ││
│  │ 子规则级 Skill   │  │ ┌─────────────────────────────┐  ││
│  │                 │  │ │ 你是一位专业的简历优化顾问。 │  ││
│  │ ▶ 关键词匹配 ✓  │  │ │ 请分析JD中的核心关键词...   │  ││
│  │   STAR原则 ✓    │  │ │                             │  ││
│  │   量化数据 ✓    │  │ └─────────────────────────────┘  ││
│  │   动词升级 ✓    │  │                                   ││
│  │   胜任力呈现 ✓  │  │ 优先级: [5]    状态: [✓ 启用]     ││
│  │   结构优化 ✓    │  │                                   ││
│  │   ATS格式 ✓    │  │ [保存]  [测试效果]  [重置默认]     ││
│  │   表述合规 ✓    │  │                                   ││
│  └─────────────────┘  └───────────────────────────────────┘│
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### 4.3 配色方案

```css
/* 主色调 - 专业蓝 */
--primary: #2563EB;
--primary-hover: #1D4ED8;

/* 辅助色 */
--success: #10B981;  /* 达标/匹配 */
--warning: #F59E0B;  /* 部分匹配 */
--danger: #EF4444;   /* 不达标/缺失 */

/* 中性色 */
--background: #F9FAFB;
--surface: #FFFFFF;
--text-primary: #111827;
--text-secondary: #6B7280;
--border: #E5E7EB;
```

---

## 5. 开发计划

### 5.1 里程碑

| 阶段 | 内容 | 时间（估） |
|------|------|-----------|
| **MVP** | 核心功能开发 | 2-3周 |
| **Beta** | 测试优化 + Skill管理后台 | 1周 |
| **V1.0** | 正式发布 | — |

### 5.2 MVP功能范围

**必须实现（P0）**：
- ✅ 文件上传（简历 + JD）
- ✅ 文件解析（PDF、TXT、MD）
- ✅ 匹配度分析（4个维度）
- ✅ 简历优化（智能模式）
- ✅ 面试题生成
- ✅ 网页展示结果
- ✅ 下载PDF报告
- ✅ Skill配置管理（基础版）

**可以延后（P1）**：
- OCR图片识别
- 优化模式切换
- 简历对比高亮
- Skill测试功能
- Skill版本历史
- 动画和过渡效果

### 5.3 开发分工

| 角色 | 负责内容 |
|------|----------|
| **AI助手** | 项目搭建、后端逻辑、AI集成、基础UI、Skill管理后台 |
| **用户** | UI设计反馈、测试验收、需求确认、Skill优化迭代 |

---

## 6. 风险与约束

### 6.1 技术风险
| 风险 | 影响 | 应对方案 |
|------|------|----------|
| mimo API 调用限制 | 高 | 准备备选模型（通义千问） |
| PDF解析兼容性 | 中 | 使用成熟库，测试多种格式 |
| OCR识别准确率 | 中 | 优先支持清晰图片，提示用户 |
| Skill配置存储 | 低 | 先用JSON文件，后续可迁移SQLite |

### 6.2 约束条件
- API Key 由用户自行配置
- 文件大小限制 10MB
- 不存储用户数据（匿名使用）
- Skill配置本地存储

---

## 附录

### A. 术语表
- **JD**：Job Description，岗位描述
- **ATS**：Applicant Tracking System，招聘管理系统
- **STAR**：Situation-Task-Action-Result，情境-任务-行动-结果
- **MVP**：Minimum Viable Product，最小可行产品
- **Skill**：可配置的AI提示词模块

### B. 参考资料
- [ResumeAI Pro](https://resumeaipro.coze.site/) — 竞品参考
- [mimo API 文档](待补充)
- [Next.js 文档](https://nextjs.org/docs)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)

---

**文档状态**：待用户确认
**下一步**：确认需求后开始开发MVP
