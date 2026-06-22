import { NextRequest } from 'next/server';
import { getClient } from '@/lib/ai/mimo';
import { skillManager } from '@/lib/ai/skill-manager';
import { extractJSON } from '@/lib/utils/json';

export async function POST(request: NextRequest) {
  const { resumeContent, jdContent } = await request.json();

  if (!resumeContent || !jdContent) {
    return new Response(JSON.stringify({ error: '请提供简历和JD内容' }), { status: 400 });
  }

  const prompt = skillManager.getPrompt('analyze_skill');
  if (!prompt) {
    return new Response(JSON.stringify({ error: '分析技能配置缺失' }), { status: 500 });
  }

  const client = await getClient();
  const cfg = client.getConfig();
  const filled = prompt.replace('{resumeContent}', resumeContent).replace('{jdContent}', jdContent);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: any) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));

      try {
        send({ type: 'status', content: '正在连接AI模型...' });

        const response = await fetch(cfg.apiUrl, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${cfg.apiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: cfg.model,
            messages: [
              { role: 'system', content: '你是一位资深HR和职业顾问。请严格按照要求的JSON格式返回结果，不要包含任何其他文字。' },
              { role: 'user', content: filled },
            ],
            temperature: 0.7,
            max_tokens: 8192,
            stream: true,
          }),
        });

        if (!response.ok) {
          send({ type: 'error', content: `API错误: ${response.status}` });
          controller.close();
          return;
        }

        send({ type: 'status', content: 'AI正在分析中...' });

        const reader = response.body?.getReader();
        if (!reader) { send({ type: 'error', content: '无法读取响应' }); controller.close(); return; }

        const decoder = new TextDecoder();
        let buffer = '';
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;
              if (!delta) continue;

              if (delta.reasoning_content) {
                send({ type: 'reasoning', content: delta.reasoning_content });
              }
              if (delta.content) {
                fullContent += delta.content;
                send({ type: 'content', content: delta.content });
              }
            } catch {}
          }
        }

        if (fullContent) {
          try {
            const result = extractJSON(fullContent);
            send({ type: 'result', data: result });
          } catch {
            send({ type: 'error', content: 'AI返回的结果格式错误，无法解析JSON' });
          }
        } else {
          send({ type: 'error', content: 'AI未返回有效内容' });
        }

        send({ type: 'done' });
        controller.close();
      } catch (error) {
        send({ type: 'error', content: error instanceof Error ? error.message : '分析失败' });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}
