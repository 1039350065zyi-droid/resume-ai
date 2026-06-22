# ResumeAI - 智能简历优化 & 面试准备平台

基于AI的智能简历优化与面试准备平台，帮助求职者精准匹配岗位需求，提升面试通过率。

## 功能特性

### 核心功能

1. **文件上传**
   - 支持简历和岗位JD上传
   - 支持格式：PDF、TXT、MD、图片（OCR识别）
   - 拖拽上传和点击上传

2. **匹配度分析**
   - 关键词覆盖率分析
   - 经历相关度评估
   - 硬性条件匹配检查
   - 行业匹配度分析
   - 综合评分和详细报告

3. **简历优化**
   - 8大优化规则体系
   - 三种优化模式（智能/完整/自定义）
   - 优化前后对比
   - 下载优化后简历

4. **面试题生成**
   - 行为面试题（基于STAR原则）
   - 技术面试题（基于岗位要求）
   - 参考答案和回答技巧
   - 下载面试题集

5. **Skill配置管理**
   - 两层Skill结构（模块级+子规则级）
   - 可视化编辑提示词
   - 启用/禁用Skill
   - 测试Skill效果

### 优化规则（8个）

1. 关键词匹配 - 将JD核心关键词融入简历
2. STAR原则重构 - 按情境-任务-行动-结果框架重写
3. 量化数据强化 - 将模糊描述转化为具体数据
4. 动词升级 - 弱动词替换为强动词
5. 胜任力呈现 - 突出核心竞争力
6. 结构逻辑优化 - 优化信息呈现顺序
7. ATS友好格式 - 兼容招聘系统解析
8. 表述合规优化 - 去除主观冗余信息

## 技术栈

- **框架**: Next.js 14+ (App Router)
- **前端**: React 18 + TypeScript
- **样式**: Tailwind CSS
- **大模型**: mimo API（小米）
- **OCR**: Tesseract.js
- **PDF生成**: jsPDF

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env.local`，填入你的API Key：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
MIMO_API_KEY=your_mimo_api_key_here
MIMO_API_URL=https://api.mimo.com/v1/chat/completions
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## 项目结构

```
resume-ai/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # 首页（上传页面）
│   ├── analyze/                  # 分析结果页
│   ├── optimize/                 # 优化结果页
│   ├── interview/                # 面试题页
│   ├── admin/                    # 后台管理
│   │   └── skills/               # Skill管理页面
│   └── api/                      # API Routes
├── components/                   # React组件
│   ├── ui/                       # 基础UI组件
│   └── FileUpload.tsx            # 文件上传组件
├── lib/                          # 工具函数
│   ├── ai/                       # AI相关
│   │   ├── mimo.ts               # mimo API调用
│   │   ├── skill-manager.ts      # Skill管理
│   │   └── skills/               # Skill配置文件
│   ├── parser/                   # 文件解析
│   └── utils/                    # 工具函数
├── types/                        # TypeScript类型
└── PRD.md                        # 产品需求文档
```

## 使用流程

1. **上传文件** - 在首页上传简历和岗位JD
2. **查看分析** - 系统自动分析匹配度，查看详细报告
3. **优化简历** - 选择优化模式，AI自动优化简历
4. **生成面试题** - 生成针对性面试题和参考答案
5. **下载结果** - 下载分析报告、优化简历、面试题

## Skill配置

### 访问后台

点击首页右上角"后台管理"按钮，或访问 `/admin/skills`

### 修改Skill

1. 在左侧列表选择要修改的Skill
2. 修改提示词、描述等配置
3. 点击"保存修改"
4. 可点击"测试效果"预览

### Skill结构

```
模块级 Skill（3个）
├── analyze_skill      # 匹配度分析
├── optimize_skill     # 简历优化
└── interview_skill    # 面试题生成

子规则级 Skill（8个，属于简历优化）
├── keyword_match      # 关键词匹配
├── star_rewrite       # STAR原则重构
├── quantification     # 量化数据强化
├── action_verb        # 动词升级
├── competency         # 胜任力呈现
├── structure          # 结构逻辑优化
├── ats_friendly       # ATS友好格式
└── compliance         # 表述合规优化
```

## 部署

### Vercel部署

1. Push代码到GitHub
2. 在Vercel导入项目
3. 配置环境变量
4. 部署完成

### 自建服务器

```bash
npm run build
npm start
```

## 开发计划

### MVP（已完成）
- ✅ 文件上传
- ✅ 匹配度分析
- ✅ 简历优化
- ✅ 面试题生成
- ✅ PDF下载
- ✅ Skill配置管理

### 后续迭代
- OCR图片识别优化
- 简历对比高亮
- Skill版本历史
- 更多文件格式支持

## 许可证

MIT License

---

**ResumeAI** - 让AI帮你打造完美简历 🚀
