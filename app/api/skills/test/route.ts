import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/ai/mimo';
import { skillManager } from '@/lib/ai/skill-manager';

export async function POST(request: NextRequest) {
  try {
    const { skillId, testData } = await request.json();
    if (!skillId || !testData) {
      return NextResponse.json({ success: false, error: '请提供技能ID和测试数据' }, { status: 400 });
    }

    const skill = skillManager.getSkill(skillId);
    if (!skill) return NextResponse.json({ success: false, error: '技能不存在' }, { status: 404 });

    let filled = skill.prompt;
    for (const [key, val] of Object.entries(testData)) {
      filled = filled.replace(new RegExp(`\\{${key}\\}`, 'g'), val as string);
    }

    const client = await getClient();
    const start = Date.now();
    const output = await client.chat([
      { role: 'system', content: '你是一位专业的AI助手。请根据提示词完成任务。' },
      { role: 'user', content: filled },
    ]);

    return NextResponse.json({ success: true, data: { output, executionTime: Date.now() - start } });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '测试技能失败' },
      { status: 500 }
    );
  }
}
