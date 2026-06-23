// ========== 文件相关 ==========

export interface UploadedFile {
  id: string;
  filename: string;
  content: string;
  fileType: string;
  size: number;
}

// ========== 匹配度分析 ==========

export interface KeywordCoverage {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  analysis: string;
}

export interface ExperienceRelevance {
  score: number;
  analysis: string;
  highlights: string[];
}

export interface HardRequirement {
  requirement: string;
  status: 'met' | 'partial' | 'unmet';
  detail: string;
}

export interface HardRequirements {
  met: boolean;
  items: HardRequirement[];
}

export interface IndustryMatch {
  score: number;
  analysis: string;
}

export interface AnalysisDimensions {
  keywordCoverage: KeywordCoverage;
  experienceRelevance: ExperienceRelevance;
  hardRequirements: HardRequirements;
  industryMatch: IndustryMatch;
}

export interface AnalysisSummary {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export interface MatchAnalysis {
  overallScore: number;
  dimensions: AnalysisDimensions;
  summary: AnalysisSummary;
}

// ========== 简历优化 ==========

export interface OptimizeChange {
  original: string;
  optimized: string;
  rule: string;
  explanation: string;
}

export interface OptimizeResult {
  optimizedResume: string;
  changes: OptimizeChange[];
  appliedSkills: string[];
}

export type OptimizeMode = 'smart' | 'full' | 'custom';

// ========== 面试题 ==========

export interface InterviewQuestion {
  question: string;
  focus: string;
  referenceAnswer: string;
  tips: string;
}

export interface InterviewResult {
  behavioralQuestions: InterviewQuestion[];
  technicalQuestions: InterviewQuestion[];
}

// ========== Skill 配置 ==========

export interface Skill {
  id: string;
  name: string;
  description: string;
  level: 'module' | 'rule';
  parentId?: string;
  prompt: string;
  variables: string[];
  enabled: boolean;
  priority: number;
  version: string;
  updatedAt: string;
  children?: Skill[];
}

// ========== 下载 ==========

export type DownloadType = 'report' | 'resume' | 'interview';

// ========== 模型配置 ==========

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  apiUrl: string;
  model: string;
  apiKey: string;
  enabled: boolean;
  isDefault: boolean;
}

export interface SafeModelConfig extends Omit<ModelConfig, 'apiKey'> {
  apiKey: '';
  hasApiKey: boolean;
}
