import { NextRequest, NextResponse } from 'next/server';
import { modelManager } from '@/lib/ai/model-manager';

export async function GET() {
  try {
    return NextResponse.json({ success: true, data: modelManager.getAll() });
  } catch (error) {
    return NextResponse.json({ success: false, error: '获取模型列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    return NextResponse.json({ success: true, data: model });
  } catch (error) {
    return NextResponse.json({ success: false, error: '创建模型失败' }, { status: 500 });
  }
}
