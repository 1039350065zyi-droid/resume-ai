import path from 'path';
import { parseImageWithVision } from './ocr';

export async function parsePDF(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import('pdf-parse');

  // Configure worker path for Next.js/Turbopack environment
  // Windows requires file:// URL for ESM loader
  const workerPath = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.mjs');
  const workerUrl = new URL(`file:///${workerPath.replace(/\\/g, '/')}`).href;
  PDFParse.setWorker(workerUrl);

  const parser = new PDFParse({ data: new Uint8Array(buffer) });

  try {
    // Step 1: Try text extraction
    const result = await parser.getText();
    const text = result.text?.trim() || '';
    if (text.length > 10) {
      await parser.destroy();
      return text;
    }
    console.log('PDF text returned minimal content, rendering pages to images...');
  } catch (error) {
    console.log('PDF text extraction failed, rendering pages to images...');
  }

  // Step 2: Render PDF pages to images, use mimo-v2.5 vision
  try {
    const screenshot = await parser.getScreenshot({ imageBuffer: true, scale: 2.0 });
    const allText: string[] = [];

    if (screenshot?.pages) {
      for (const page of screenshot.pages) {
        if (page.data && page.data.length > 0) {
          try {
            const pageText = await parseImageWithVision(Buffer.from(page.data));
            if (pageText.trim().length > 5) allText.push(pageText.trim());
          } catch (e) {
            console.log(`Vision failed for page ${page.pageNumber}:`, e instanceof Error ? e.message : e);
          }
        }
      }
    }

    await parser.destroy();
    if (allText.length > 0) return allText.join('\n\n');
    throw new Error('无法从PDF中提取文字');
  } catch (error) {
    await parser.destroy().catch(() => {});
    throw new Error('PDF解析失败，请尝试将PDF内容复制粘贴为文字');
  }
}
