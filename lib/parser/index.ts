import { parsePDF } from './pdf';
import { parseMarkdown } from './md';
import { parseImage } from './ocr';

export interface ParseResult {
  content: string;
  fileType: string;
}

export async function parseFile(buffer: Buffer, filename: string): Promise<ParseResult> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  switch (ext) {
    case 'pdf':
      return { content: await parsePDF(buffer), fileType: 'pdf' };

    case 'txt':
      return { content: buffer.toString('utf-8'), fileType: 'txt' };

    case 'md':
    case 'markdown':
      return { content: parseMarkdown(buffer.toString('utf-8')), fileType: 'md' };

    case 'png':
    case 'jpg':
    case 'jpeg':
      return { content: await parseImage(buffer), fileType: 'image' };

    default:
      throw new Error(`不支持的文件格式: .${ext}`);
  }
}
