import { NextRequest, NextResponse } from 'next/server';
import { parseResumeJdPayload, ValidationError } from '@/lib/api/validation';
import { getClient } from '@/lib/ai/mimo';
import { skillManager } from '@/lib/ai/skill-manager';
import { extractJSON } from '@/lib/utils/json';

export async function POST(request: NextRequest) {
  try {
    const { resumeContent, jdContent } = parseResumeJdPayload(await request.json());

    const prompt = skillManager.getPrompt('analyze_skill');
    if (!prompt) {
      return NextResponse.json({ success: false, error: '分析技能配置缺失' }, { status: 500 });
    }

    const client = await getClient();
    const result = await client.analyzeMatch(resumeContent, jdContent, prompt);
    const data = extractJSON(result);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    console.error('Analyze error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '分析失败' },
      { status: 500 }
    );
  }
}
