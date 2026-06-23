import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import fontkit from '@pdf-lib/fontkit';
import { PDFDocument, PDFFont, PDFPage, rgb } from 'pdf-lib';

const CHINESE_FONT_FILE = path.join(process.cwd(), 'public', 'fonts', 'WenQuanYiMicroHei.ttf');
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 52;
const MARGIN_TOP = 56;
const MARGIN_BOTTOM = 56;

type PdfContent = Record<string, unknown>;

interface WriterState {
  doc: PDFDocument;
  font: PDFFont;
  page: PDFPage;
  y: number;
}

interface TextOptions {
  size?: number;
  color?: ReturnType<typeof rgb>;
  indent?: number;
  lineGap?: number;
  x?: number;
  maxWidth?: number;
}

function asObject(value: unknown): PdfContent {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as PdfContent : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value);
}

function pageBreak(state: WriterState, needed = 24) {
  if (state.y - needed >= MARGIN_BOTTOM) return;
  state.page = state.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  state.y = PAGE_HEIGHT - MARGIN_TOP;
}

function splitText(font: PDFFont, text: string, size: number, maxWidth: number): string[] {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines: string[] = [];

  for (const paragraph of normalized.split('\n')) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }

    let current = '';
    const tokens = paragraph.match(/[A-Za-z0-9@._%+#/:-]+|\s+|[^\sA-Za-z0-9@._%+#/:-]/g) || [];

    for (const token of tokens) {
      const next = current + token;
      if (font.widthOfTextAtSize(next, size) <= maxWidth) {
        current = next;
        continue;
      }

      if (current.trim()) {
        lines.push(current.trimEnd());
      }

      const cleanToken = token.trimStart();
      if (!cleanToken) {
        current = '';
        continue;
      }

      if (font.widthOfTextAtSize(cleanToken, size) <= maxWidth) {
        current = cleanToken;
        continue;
      }

      current = '';
      for (const ch of cleanToken) {
        const charNext = current + ch;
        if (font.widthOfTextAtSize(charNext, size) <= maxWidth || !current) {
          current = charNext;
        } else {
          lines.push(current);
          current = ch;
        }
      }
    }
    if (current.trim()) lines.push(current.trimEnd());
  }

  return lines;
}

function drawText(state: WriterState, text: string, options?: TextOptions) {
  const size = options?.size ?? 11;
  const indent = options?.indent ?? 0;
  const lineGap = options?.lineGap ?? 6;
  const x = (options?.x ?? MARGIN_X) + indent;
  const maxWidth = options?.maxWidth ?? PAGE_WIDTH - MARGIN_X * 2 - indent;
  const lines = splitText(state.font, text, size, maxWidth);

  for (const line of lines) {
    pageBreak(state, size + lineGap);
    if (line) {
      state.page.drawText(line, {
        x,
        y: state.y,
        size,
        font: state.font,
        color: options?.color ?? rgb(0.13, 0.15, 0.19),
      });
    }
    state.y -= size + lineGap;
  }
}

function drawTextBlockAt(state: WriterState, text: string, x: number, y: number, width: number, size: number, color = rgb(0.13, 0.15, 0.19), lineGap = 4) {
  const lines = splitText(state.font, text, size, width);
  lines.forEach((line, index) => {
    state.page.drawText(line, { x, y: y - index * (size + lineGap), size, font: state.font, color });
  });
  return lines.length * (size + lineGap);
}

function drawSectionBar(state: WriterState, title: string, color = rgb(0.05, 0.22, 0.38)) {
  pageBreak(state, 30);
  const barHeight = 22;
  state.page.drawRectangle({
    x: MARGIN_X,
    y: state.y - barHeight + 3,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: barHeight,
    color,
  });
  state.page.drawText(title, {
    x: MARGIN_X + 8,
    y: state.y - 12,
    size: 12,
    font: state.font,
    color: rgb(1, 1, 1),
  });
  state.y -= barHeight + 9;
}

function drawTitle(state: WriterState, text: string) {
  const size = 20;
  const width = state.font.widthOfTextAtSize(text, size);
  state.page.drawText(text, {
    x: (PAGE_WIDTH - width) / 2,
    y: state.y,
    size,
    font: state.font,
    color: rgb(0.08, 0.09, 0.13),
  });
  state.y -= 38;
}

function drawSection(state: WriterState, title: string) {
  pageBreak(state, 34);
  state.y -= 8;
  drawText(state, title, { size: 14, color: rgb(0.09, 0.12, 0.18), lineGap: 8 });
}

function drawBulletList(state: WriterState, items: unknown[]) {
  for (const item of items) {
    drawText(state, `- ${asText(item)}`, { size: 10.5, indent: 16, lineGap: 5 });
  }
}

async function createWriter(): Promise<WriterState> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const fontBytes = fs.readFileSync(CHINESE_FONT_FILE);
  const font = await doc.embedFont(fontBytes, { subset: true });
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  return { doc, font, page, y: PAGE_HEIGHT - MARGIN_TOP };
}

function writeReport(state: WriterState, content: PdfContent) {
  const navy = rgb(0.05, 0.18, 0.31);
  const blue = rgb(0.08, 0.33, 0.56);
  const teal = rgb(0.02, 0.48, 0.56);
  const amber = rgb(0.72, 0.42, 0.08);
  const lightBlue = rgb(0.92, 0.96, 1);
  const pale = rgb(0.97, 0.98, 0.99);
  const dimensions = asObject(content.dimensions);
  const keywordCoverage = asObject(dimensions.keywordCoverage);
  const experienceRelevance = asObject(dimensions.experienceRelevance);
  const industryMatch = asObject(dimensions.industryMatch);
  const score = asText(content.overallScore) || '-';

  state.page.drawRectangle({ x: 0, y: PAGE_HEIGHT - 118, width: PAGE_WIDTH, height: 118, color: navy });
  state.y = PAGE_HEIGHT - 42;
  drawText(state, '简历匹配度分析报告', { size: 22, color: rgb(1, 1, 1), lineGap: 8 });
  drawText(state, 'ResumeAI Career Fit Report', { size: 10, color: rgb(0.74, 0.84, 0.94), lineGap: 5 });
  state.y = PAGE_HEIGHT - 148;

  state.page.drawRectangle({
    x: MARGIN_X,
    y: state.y - 74,
    width: PAGE_WIDTH - MARGIN_X * 2,
    height: 74,
    color: lightBlue,
    borderColor: rgb(0.74, 0.84, 0.96),
    borderWidth: 0.8,
  });
  state.page.drawText('综合匹配度', { x: MARGIN_X + 18, y: state.y - 28, size: 13, font: state.font, color: navy });
  state.page.drawText(`${score}分`, { x: MARGIN_X + 18, y: state.y - 56, size: 28, font: state.font, color: blue });
  drawTextBlockAt(state, '结论提示：分数用于快速判断匹配方向，真正可执行的优化点请看后续关键词、硬性条件和改进建议模块。', MARGIN_X + 128, state.y - 23, PAGE_WIDTH - MARGIN_X * 2 - 146, 10, rgb(0.24, 0.29, 0.36), 5);
  state.y -= 94;

  const cardGap = 10;
  const cardWidth = (PAGE_WIDTH - MARGIN_X * 2 - cardGap * 2) / 3;
  const metrics = [
    ['关键词覆盖率', `${asText(keywordCoverage.score)}%`, blue],
    ['经历相关度', `${asText(experienceRelevance.score)}分`, teal],
    ['行业匹配度', `${asText(industryMatch.score)}分`, amber],
  ] as const;
  pageBreak(state, 64);
  metrics.forEach(([label, value, color], index) => {
    const x = MARGIN_X + index * (cardWidth + cardGap);
    state.page.drawRectangle({ x, y: state.y - 56, width: cardWidth, height: 56, color: pale, borderColor: rgb(0.86, 0.9, 0.95), borderWidth: 0.8 });
    state.page.drawText(label, { x: x + 12, y: state.y - 20, size: 9.5, font: state.font, color: rgb(0.38, 0.45, 0.54) });
    state.page.drawText(value, { x: x + 12, y: state.y - 43, size: 18, font: state.font, color });
  });
  state.y -= 76;

  drawSectionBar(state, '01 关键词分析', blue);
  drawText(state, `已匹配：${asArray(keywordCoverage.matchedKeywords).map(asText).join('、') || '无'}`, { size: 10.5, lineGap: 6 });
  drawText(state, `待补强：${asArray(keywordCoverage.missingKeywords).map(asText).join('、') || '无'}`, { size: 10.5, color: rgb(0.54, 0.28, 0.08), lineGap: 6 });

  const hardRequirements = asObject(dimensions.hardRequirements);
  const items = asArray(hardRequirements.items);
  if (items.length) {
    drawSectionBar(state, '02 硬性条件检查', blue);
    for (const item of items) {
      const row = asObject(item);
      const detailLines = splitText(state.font, asText(row.detail), 9.2, PAGE_WIDTH - MARGIN_X * 2 - 248);
      const rowHeight = Math.max(32, detailLines.length * 12 + 12);
      pageBreak(state, rowHeight + 5);
      state.page.drawRectangle({
        x: MARGIN_X,
        y: state.y - rowHeight,
        width: PAGE_WIDTH - MARGIN_X * 2,
        height: rowHeight,
        color: rgb(0.99, 0.99, 1),
        borderColor: rgb(0.88, 0.91, 0.95),
        borderWidth: 0.6,
      });
      state.page.drawText(asText(row.requirement), { x: MARGIN_X + 10, y: state.y - 17, size: 9.5, font: state.font, color: navy });
      state.page.drawText(asText(row.status), { x: MARGIN_X + 172, y: state.y - 17, size: 9.5, font: state.font, color: amber });
      drawTextBlockAt(state, asText(row.detail), MARGIN_X + 238, state.y - 17, PAGE_WIDTH - MARGIN_X * 2 - 248, 9.2, rgb(0.28, 0.32, 0.38), 4);
      state.y -= rowHeight + 5;
    }
  }

  const summary = asObject(content.summary);
  drawSectionBar(state, '03 优势亮点', teal);
  drawBulletList(state, asArray(summary.strengths));
  drawSectionBar(state, '04 风险与短板', amber);
  drawBulletList(state, asArray(summary.weaknesses));
  drawSectionBar(state, '05 简历优化建议', blue);
  drawBulletList(state, asArray(summary.suggestions));
}

function writeResume(state: WriterState, content: PdfContent) {
  drawTitle(state, '优化后简历');
  drawText(state, asText(content.optimizedResume), { size: 10.5, lineGap: 6 });
}

function getTemplateColor(template: string) {
  if (template === 'creative') return rgb(0.39, 0.31, 0.82);
  if (template === 'modern') return rgb(0.06, 0.16, 0.28);
  return rgb(0.08, 0.09, 0.13);
}

function drawDenseBulletList(state: WriterState, items: unknown[]) {
  for (const item of items) {
    drawText(state, `- ${asText(item)}`, { size: 9.3, indent: 12, lineGap: 3.2 });
  }
}

function drawSkillTableRow(state: WriterState, category: string, items: string) {
  const leftWidth = 92;
  const rightWidth = PAGE_WIDTH - MARGIN_X * 2 - leftWidth;
  const lines = splitText(state.font, items, 9.2, rightWidth - 12);
  const rowHeight = Math.max(24, lines.length * 13 + 8);
  pageBreak(state, rowHeight + 2);

  const top = state.y;
  state.page.drawRectangle({
    x: MARGIN_X,
    y: top - rowHeight,
    width: leftWidth,
    height: rowHeight,
    color: rgb(0.91, 0.95, 0.98),
    borderColor: rgb(0.82, 0.88, 0.93),
    borderWidth: 0.5,
  });
  state.page.drawRectangle({
    x: MARGIN_X + leftWidth,
    y: top - rowHeight,
    width: rightWidth,
    height: rowHeight,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.82, 0.88, 0.93),
    borderWidth: 0.5,
  });
  state.page.drawText(category, { x: MARGIN_X + 8, y: top - 16, size: 9.3, font: state.font, color: rgb(0.05, 0.26, 0.43) });
  lines.forEach((line, index) => {
    state.page.drawText(line, {
      x: MARGIN_X + leftWidth + 8,
      y: top - 16 - index * 13,
      size: 9.2,
      font: state.font,
      color: rgb(0.13, 0.15, 0.19),
    });
  });
  state.y -= rowHeight;
}

function writeGeneratedResume(state: WriterState, content: PdfContent) {
  const resume = asObject(content.resume || content);
  const template = asText(content.template || 'classic');
  const color = getTemplateColor(template);
  const info = asObject(resume.personalInfo);

  const name = asText(info.name) || '个人简历';
  const nameSize = 25;
  const nameWidth = state.font.widthOfTextAtSize(name, nameSize);
  state.page.drawText(name, {
    x: (PAGE_WIDTH - nameWidth) / 2,
    y: state.y,
    size: nameSize,
    font: state.font,
    color,
  });
  state.y -= 20;

  const tagline = asText(info.tagline);
  if (tagline) {
    const tagWidth = state.font.widthOfTextAtSize(tagline, 9.6);
    state.page.drawText(tagline, { x: Math.max(MARGIN_X, (PAGE_WIDTH - tagWidth) / 2), y: state.y, size: 9.6, font: state.font, color: rgb(0.14, 0.18, 0.24) });
    state.y -= 15;
  }

  const contact = [
    asText(info.phone),
    asText(info.email),
    asText(info.city),
    asText(info.age),
    asText(info.targetPosition) ? `求职意向：${asText(info.targetPosition)}` : '',
  ].filter(Boolean).join(' | ');
  if (contact) {
    const contactWidth = state.font.widthOfTextAtSize(contact, 9.2);
    state.page.drawText(contact, { x: Math.max(MARGIN_X, (PAGE_WIDTH - contactWidth) / 2), y: state.y, size: 9.2, font: state.font, color: rgb(0.22, 0.26, 0.32) });
    state.y -= 22;
  }

  const summary = asText(resume.summary);
  if (summary) {
    drawSectionBar(state, '个人摘要', color);
    drawText(state, summary, { size: 9.5, lineGap: 4.4 });
  }

  const skills = asArray(resume.skills);
  if (skills.length) {
    drawSectionBar(state, '核心技能', color);
    for (const item of skills) {
      const skill = asObject(item);
      drawSkillTableRow(state, asText(skill.category), asArray(skill.items).map(asText).join('、'));
    }
    state.y -= 8;
  }

  const workExperience = asArray(resume.workExperience);
  if (workExperience.length) {
    drawSectionBar(state, '工作经历', color);
    for (const item of workExperience) {
      const work = asObject(item);
      const heading = [
        asText(work.company),
        asText(work.position),
        asText(work.period),
      ].filter(Boolean).join(' | ');
      if (heading) drawText(state, heading, { size: 10.6, color, lineGap: 4 });
      drawDenseBulletList(state, asArray(work.highlights));
      state.y -= 3;
    }
  }

  const projects = asArray(resume.projects);
  if (projects.length) {
    drawSectionBar(state, '项目经历', color);
    for (const item of projects) {
      const project = asObject(item);
      const heading = [
        asText(project.name),
        asText(project.role),
        asText(project.period),
      ].filter(Boolean).join(' | ');
      if (heading) drawText(state, heading, { size: 10.6, color, lineGap: 4 });
      const description = asText(project.description);
      if (description) drawText(state, description, { size: 9.3, color: rgb(0.28, 0.32, 0.38), lineGap: 3.5 });
      drawDenseBulletList(state, asArray(project.highlights));
      state.y -= 3;
    }
  }

  const education = asArray(resume.education);
  if (education.length) {
    drawSectionBar(state, '教育背景', color);
    for (const item of education) {
      const edu = asObject(item);
      drawText(state, [
        asText(edu.school),
        asText(edu.major),
        asText(edu.degree),
        asText(edu.period),
      ].filter(Boolean).join(' | '), { size: 9.5, lineGap: 4 });
    }
  }

  const certificates = asArray(resume.certificates);
  if (certificates.length) {
    drawSectionBar(state, '证书荣誉', color);
    drawText(state, certificates.map(asText).join(' | '), { size: 9.5, lineGap: 4 });
  }

  const selfEvaluation = asText(resume.selfEvaluation);
  if (selfEvaluation) {
    drawSectionBar(state, '自我评价', color);
    drawText(state, selfEvaluation, { size: 9.5, lineGap: 4 });
  }
}

function writeInterview(state: WriterState, content: PdfContent) {
  drawTitle(state, '面试题准备');
  for (const [label, questions] of [
    ['行为面试题', asArray(content.behavioralQuestions)],
    ['技术面试题', asArray(content.technicalQuestions)],
  ] as const) {
    if (!questions.length) continue;
    drawSection(state, label);
    questions.forEach((question, index) => {
      const q = asObject(question);
      drawText(state, `${index + 1}. ${asText(q.question)}`, { size: 11.5, lineGap: 6 });
      drawText(state, `考察要点：${asText(q.focus)}`, { size: 10.5, indent: 12, lineGap: 5 });
      drawText(state, `回答技巧：${asText(q.tips)}`, { size: 10.5, indent: 12, lineGap: 5 });
      drawText(state, `参考答案：${asText(q.referenceAnswer)}`, { size: 10.5, indent: 12, lineGap: 8 });
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, content } = await request.json();
    if (!type || !content) {
      return NextResponse.json({ success: false, error: '请提供下载类型和内容' }, { status: 400 });
    }

    const state = await createWriter();
    const safeContent = asObject(content);

    if (type === 'report') {
      writeReport(state, safeContent);
    } else if (type === 'resume') {
      writeResume(state, safeContent);
    } else if (type === 'generated-resume') {
      writeGeneratedResume(state, safeContent);
    } else if (type === 'interview') {
      writeInterview(state, safeContent);
    } else {
      return NextResponse.json({ success: false, error: '下载类型不支持' }, { status: 400 });
    }

    const bytes = await state.doc.save();
    return new NextResponse(Buffer.from(bytes), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '生成PDF失败' },
      { status: 500 }
    );
  }
}
