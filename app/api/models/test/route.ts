import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/ai/mimo';
import { ModelConfig } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const config: ModelConfig = await request.json();

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
