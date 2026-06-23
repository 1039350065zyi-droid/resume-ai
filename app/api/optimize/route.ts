import { NextRequest, NextResponse } from 'next/server';
import { parseOptimizePayload, ValidationError } from '@/lib/api/validation';
import { getClient } from '@/lib/ai/mimo';
import { skillManager } from '@/lib/ai/skill-manager';
import { extractJSON } from '@/lib/utils/json';

export async function POST(request: NextRequest) {
  try {
    const { resumeContent, jdContent, mode, selectedSkills } = parseOptimizePayload(await request.json());

    const prompt = skillManager.getPrompt('optimize_skill');
    if (!prompt) {
      return NextResponse.json({ success: false, error: '优化技能配置缺失' }, { status: 500 });
    }

    const allRules = skillManager.getRuleSkills('optimize_skill');
    let rulesDesc = '';

    switch (mode) {
      case 'smart':
        rulesDesc = '请智能判断需要应用哪些规则，针对性优化。';
        break;
      case 'full':
        rulesDesc = '请按顺序应用所有规则：' + allRules.map((r) => r.name).join('、');
        break;
      case 'custom': {
        const selected = allRules.filter((r) => selectedSkills.includes(r.id));
        rulesDesc = '请只应用以下规则：' + selected.map((r) => r.name).join('、');
        break;
      }
    }

    const client = await getClient();
    const result = await client.optimizeResume(resumeContent, jdContent, rulesDesc, prompt);
    const data = extractJSON(result);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    console.error('Optimize error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '优化失败' },
      { status: 500 }
    );
  }
}
