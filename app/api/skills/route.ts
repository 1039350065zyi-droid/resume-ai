import { NextRequest, NextResponse } from 'next/server';
import { skillManager } from '@/lib/ai/skill-manager';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json({
      success: true,
      data: {
        modules: skillManager.getModuleSkills(),
        rules: skillManager.getRuleSkills(),
      },
    });
  } catch (error) {
    console.error('Get skills error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '获取技能列表失败' },
      { status: 500 }
    );
  }
}
