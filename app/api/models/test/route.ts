import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/ai/mimo';
import { modelManager } from '@/lib/ai/model-manager';
import { requireAdmin } from '@/lib/auth/admin';
import { ModelConfig } from '@/types';

interface ModelTestBody {
  modelId?: string;
  config?: Partial<ModelConfig>;
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json() as ModelTestBody & Partial<ModelConfig>;
    const configInput: Partial<ModelConfig> = body.config ?? body;
    const savedModel = body.modelId ? modelManager.getById(body.modelId) : undefined;
    const config: ModelConfig = {
      id: configInput?.id || savedModel?.id || 'test',
      name: configInput?.name || savedModel?.name || 'test',
      provider: configInput?.provider || savedModel?.provider || '',
      apiUrl: configInput?.apiUrl || savedModel?.apiUrl || '',
      model: configInput?.model || savedModel?.model || '',
      apiKey: configInput?.apiKey || savedModel?.apiKey || '',
      enabled: configInput?.enabled ?? savedModel?.enabled ?? false,
      isDefault: configInput?.isDefault ?? savedModel?.isDefault ?? false,
    };

    if (!config.apiUrl || !config.apiKey || !config.model) {
      return NextResponse.json({ success: false, error: '请填写完整的模型配置' }, { status: 400 });
    }

    const client = createClient(config);
    const start = Date.now();
    const output = await client.chat([
      { role: 'user', content: '请回复"连接成功"四个字' },
    ], 50);
    const elapsed = Date.now() - start;

    return NextResponse.json({
      success: true,
      data: { output: output || '(模型返回为空，但连接成功)', executionTime: elapsed },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '测试连接失败' },
      { status: 500 }
    );
  }
}
