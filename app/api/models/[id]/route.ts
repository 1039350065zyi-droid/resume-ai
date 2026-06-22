import { NextRequest, NextResponse } from 'next/server';
import { modelManager } from '@/lib/ai/model-manager';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const model = modelManager.getById(id);
    if (!model) return NextResponse.json({ success: false, error: '模型不存在' }, { status: 404 });
    return NextResponse.json({ success: true, data: model });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取模型详情失败' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const updated = modelManager.update(id, updates);
    if (!updated) return NextResponse.json({ success: false, error: '模型不存在' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: '更新模型失败' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!modelManager.delete(id)) return NextResponse.json({ success: false, error: '模型不存在' }, { status: 404 });
    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    return NextResponse.json({ success: false, error: '删除模型失败' }, { status: 500 });
  }
}
