import axios from 'axios';

/**
 * Image text extraction using mimo-v2.5 multimodal vision.
 * Falls back to tesseract.js if vision fails.
 */
export async function parseImage(buffer: Buffer): Promise<string> {
  // Strategy 1: Use mimo-v2.5 vision
  try {
    const text = await parseImageWithVision(buffer);
    if (text.trim().length > 5) return text;
  } catch (e) {
    console.log('Vision API failed, trying tesseract OCR:', e instanceof Error ? e.message : e);
  }

  // Strategy 2: Fallback to tesseract.js
  try {
    return await parseImageWithOCR(buffer);
  } catch (e) {
    console.error('OCR fallback also failed:', e);
    throw new Error('图片文字识别失败，请直接复制文字粘贴到输入框');
  }
}

export async function parseImageWithVision(buffer: Buffer): Promise<string> {
  const { getClient } = await import('@/lib/ai/mimo');
  const client = await getClient();
  const config = client.getConfig();
  const visionModel = process.env.MIMO_VISION_MODEL || config.model || 'mimo-v2.5';
  if (!config.apiUrl || !config.apiKey) {
    throw new Error('Vision API 未配置');
  }

  const base64 = buffer.toString('base64');
  const mimeType = detectMimeType(buffer);
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await axios.post(
    config.apiUrl,
    {
      model: visionModel,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: '请仔细识别这张图片中的所有文字内容。这是一份简历或岗位描述文档。请完整提取所有文字，保持原有的格式和结构。只输出识别到的文字内容，不要添加任何额外说明。' },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      }],
      max_tokens: 4096,
    },
    {
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
      timeout: 60000,
    }
  );

  const content = response.data.choices?.[0]?.message?.content || '';
  if (!content) throw new Error('Vision returned empty');
  return content;
}

async function parseImageWithOCR(buffer: Buffer): Promise<string> {
  const path = await import('path');
  const Tesseract = (await import('tesseract.js')).default;
  const workerPath = path.default.join(process.cwd(), 'node_modules', 'tesseract.js', 'src', 'worker-script', 'node', 'index.js');
  const { data } = await Tesseract.recognize(buffer, 'chi_sim+eng', { workerPath });
  return data.text?.trim() || '';
}

function detectMimeType(buffer: Buffer): string {
  if (buffer[0] === 0x89 && buffer[1] === 0x50) return 'image/png';
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
  if (buffer[0] === 0x47 && buffer[1] === 0x49) return 'image/gif';
  if (buffer[0] === 0x52 && buffer[1] === 0x49) return 'image/webp';
  return 'image/png';
}
