import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/ai/mimo';
import { skillManager } from '@/lib/ai/skill-manager';
import { extractJSON } from '@/lib/utils/json';

export async function POST(request: NextRequest) {
  try {
    const { resumeContent, jdContent } = await request.json();

    if (!resumeContent || !jdContent) {
      return NextResponse.json({ success: false, error: '请提供简历和JD内容' }, { status: 400 });
    }

    const prompt = skillManager.getPrompt('interview_skill');
    if (!prompt) {
      return NextResponse.json({ success: false, error: '面试技能配置缺失' }, { status: 500 });
    }

    const client = await getClient();
    const result = await client.generateInterview(resumeContent, jdContent, prompt);
    const data = extractJSON(result);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Interview error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '生成面试题失败' },
      { status: 500 }
    );
  }
}
