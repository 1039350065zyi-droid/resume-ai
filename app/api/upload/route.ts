import { NextRequest, NextResponse } from 'next/server';
import { parseFile } from '@/lib/parser';
import { generateId } from '@/lib/utils/format';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as 'resume' | 'jd';

    if (!file) {
      return NextResponse.json({ success: false, error: '请选择文件' }, { status: 400 });
    }

    if (!type || !['resume', 'jd'].includes(type)) {
      return NextResponse.json({ success: false, error: '请指定文件类型' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: '文件大小超过10MB限制' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const { content, fileType } = await parseFile(buffer, file.name);

    if (!content.trim()) {
      return NextResponse.json({ success: false, error: '文件内容为空' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { id: generateId(), filename: file.name, content, fileType, size: file.size },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '文件上传失败' },
      { status: 500 }
    );
  }
}
