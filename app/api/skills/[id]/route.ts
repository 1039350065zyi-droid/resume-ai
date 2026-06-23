import { NextRequest, NextResponse } from 'next/server';
import { skillManager } from '@/lib/ai/skill-manager';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const skill = skillManager.getSkill(id);
    if (!skill) return NextResponse.json({ success: false, error: '技能不存在' }, { status: 404 });
    return NextResponse.json({ success: true, data: skill });
  } catch {
    return NextResponse.json({ success: false, error: '获取技能详情失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const updates = await request.json();
    const updated = await skillManager.updateSkill(id, updates);
    if (!updated) return NextResponse.json({ success: false, error: '技能不存在' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json({ success: false, error: '更新技能失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    const skill = skillManager.getSkill(id);
    if (!skill) return NextResponse.json({ success: false, error: '技能不存在' }, { status: 404 });
    if (skill.level === 'module') return NextResponse.json({ success: false, error: '不能删除模块级技能' }, { status: 400 });
    skillManager.deleteSkill(id);
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch {
    return NextResponse.json({ success: false, error: '删除技能失败' }, { status: 500 });
  }
}
