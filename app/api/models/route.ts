import { NextRequest, NextResponse } from 'next/server';
import { modelManager } from '@/lib/ai/model-manager';
import { requireAdmin } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    return NextResponse.json({ success: true, data: modelManager.getSafeAll() });
  } catch {
    return NextResponse.json({ success: false, error: '获取模型列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    if (!body.name || !body.apiUrl || !body.model) {
      return NextResponse.json({ success: false, error: '请填写完整信息' }, { status: 400 });
    }
    const model = modelManager.create({
      name: body.name,
      provider: body.provider || '',
      apiUrl: body.apiUrl,
      model: body.model,
      apiKey: body.apiKey || '',
      enabled: body.enabled ?? false,
      isDefault: body.isDefault ?? false,
    });
    return NextResponse.json({ success: true, data: modelManager.toSafeModel(model) });
  } catch {
    return NextResponse.json({ success: false, error: '创建模型失败' }, { status: 500 });
  }
}
