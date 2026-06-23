import { NextRequest, NextResponse } from 'next/server';
import { validateUpload, ValidationError } from '@/lib/api/validation';
import { parseFile } from '@/lib/parser';
import { generateId } from '@/lib/utils/format';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const { filename } = validateUpload(file, formData.get('type'));

    const buffer = Buffer.from(await file.arrayBuffer());
    const { content, fileType } = await parseFile(buffer, filename);

    if (!content.trim()) {
      return NextResponse.json({ success: false, error: '文件内容为空' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: { id: generateId(), filename, content, fileType, size: file.size },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '文件上传失败' },
      { status: 500 }
    );
  }
}
