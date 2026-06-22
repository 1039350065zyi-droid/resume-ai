import axios from 'axios';
import { ModelConfig } from '@/types';

interface MimoMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MimoChoice {
  message: { content: string };
}

interface MimoResponse {
  id: string;
  choices: MimoChoice[];
}

export class MimoClient {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor(apiKey: string, apiUrl: string, model: string) {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl;
    this.model = model;
  }

  getConfig() {
    return { apiKey: this.apiKey, apiUrl: this.apiUrl, model: this.model };
  }

  async chat(messages: MimoMessage[], maxTokens = 8192): Promise<string> {
    if (!this.apiKey) throw new Error('API Key 未配置');
    if (!this.apiUrl) throw new Error('API URL 未配置');

    try {
      const response = await axios.post<MimoResponse>(
        this.apiUrl,
        { model: this.model, messages, temperature: 0.7, max_tokens: maxTokens },
        {
          headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
          timeout: 180000,
        }
      );

      return response.data.choices[0]?.message?.content || '';
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const msg = error.response?.data?.error?.message || error.message;
        throw new Error(`AI 模型调用失败 (${status}): ${msg}`);
      }
      throw new Error('AI 模型调用失败，请检查网络和 API 配置');
    }
  }

  async analyzeMatch(resumeContent: string, jdContent: string, prompt: string): Promise<string> {
    const filled = prompt.replace('{resumeContent}', resumeContent).replace('{jdContent}', jdContent);
    return this.chat([
      { role: 'system', content: '你是一位资深HR和职业顾问。请严格按照要求的JSON格式返回结果，不要包含任何其他文字。' },
      { role: 'user', content: filled },
    ]);
  }

  async optimizeResume(resumeContent: string, jdContent: string, selectedRules: string, prompt: string): Promise<string> {
    const filled = prompt.replace('{resumeContent}', resumeContent).replace('{jdContent}', jdContent).replace('{selectedRules}', selectedRules);
    return this.chat([
      { role: 'system', content: '你是一位专业的简历优化顾问。请严格按照要求的JSON格式返回结果，不要包含任何其他文字。' },
      { role: 'user', content: filled },
    ]);
  }

  async generateInterview(resumeContent: string, jdContent: string, prompt: string): Promise<string> {
    const filled = prompt.replace('{resumeContent}', resumeContent).replace('{jdContent}', jdContent);
    return this.chat([
      { role: 'system', content: '你是一位资深面试官。请严格按照要求的JSON格式返回结果，不要包含任何其他文字。' },
      { role: 'user', content: filled },
    ], 8192);
  }
}

/**
 * Create a client from a ModelConfig
 */
export function createClient(config: ModelConfig): MimoClient {
  return new MimoClient(config.apiKey, config.apiUrl, config.model);
}

/**
 * Get a client using the default model from ModelManager.
 * Falls back to env vars if no model is configured.
 */
export async function getClient(): Promise<MimoClient> {
  const { modelManager } = await import('./model-manager');
  const model = modelManager.getDefault() || modelManager.getEnabled()[0];

  if (model) {
    return createClient(model);
  }

  // Fallback to env vars
  const apiKey = process.env.MIMO_API_KEY || '';
  const apiUrl = process.env.MIMO_API_URL || 'https://api.xiaomimimo.com/v1/chat/completions';
  const modelName = process.env.MIMO_MODEL || 'mimo-v2.5-pro';

  if (!apiKey) throw new Error('未配置任何AI模型，请在后台管理中配置模型');

  return new MimoClient(apiKey, apiUrl, modelName);
}
