import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import fs from 'fs';
import path from 'path';

let chineseFontLoaded = false;

function loadChineseFont(doc: jsPDF): void {
  if (chineseFontLoaded) return;
  try {
    const fontPaths = [
      'C:/Windows/Fonts/NotoSansSC-VF.ttf',
      'C:/Windows/Fonts/msyh.ttc',
      'C:/Windows/Fonts/SIMYOU.TTF',
    ];
    for (const fp of fontPaths) {
      if (fs.existsSync(fp)) {
        const buf = fs.readFileSync(fp);
        doc.addFileToVFS('chinese.ttf', buf.toString('base64'));
        doc.addFont('chinese.ttf', 'Chinese', 'normal');
        chineseFontLoaded = true;
        break;
      }
    }
  } catch (e) {
    console.warn('Failed to load Chinese font:', e);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, content } = await request.json();
    if (!type || !content) {
      return NextResponse.json({ success: false, error: '请提供下载类型和内容' }, { status: 400 });
    }

    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxW = pageW - margin * 2;

    loadChineseFont(doc);
    const font = chineseFontLoaded ? 'Chinese' : 'helvetica';
    doc.setFont(font);

    // Title
    doc.setFontSize(20);
    const titles: Record<string, string> = {
      report: '简历匹配度分析报告',
      resume: '优化后简历',
      interview: '面试题准备',
    };
    doc.text(titles[type] || '报告', pageW / 2, 20, { align: 'center' });

    let y = 40;
    const pageBreak = (needed: number) => {
      if (y + needed > 280) { doc.addPage(); y = 20; }
    };

    if (type === 'report' && content.summary) {
      doc.setFontSize(16);
      doc.text(`综合匹配度：${content.overallScore}分`, margin, y); y += 15;

      doc.setFontSize(14);
      doc.text('各维度分析：', margin, y); y += 10;
      doc.setFontSize(11);
      for (const d of [
        { n: '关键词覆盖率', s: content.dimensions?.keywordCoverage?.score },
        { n: '经历相关度', s: content.dimensions?.experienceRelevance?.score },
        { n: '行业匹配度', s: content.dimensions?.industryMatch?.score },
      ]) {
        doc.text(`${d.n}：${d.s}%`, margin + 5, y); y += 8;
      }

      // Keywords
      const kw = content.dimensions?.keywordCoverage;
      if (kw) { y += 5; pageBreak(30); doc.setFontSize(14); doc.text('关键词分析：', margin, y); y += 10; doc.setFontSize(11);
        if (kw.matchedKeywords?.length) { pageBreak(10); doc.text(`已匹配：${kw.matchedKeywords.join('、')}`, margin + 5, y); y += 8; }
        if (kw.missingKeywords?.length) { pageBreak(10); doc.text(`缺失：${kw.missingKeywords.join('、')}`, margin + 5, y); y += 8; }
      }

      // Strengths / Weaknesses / Suggestions
      for (const [label, items] of [['优势', content.summary.strengths], ['不足', content.summary.weaknesses], ['改进建议', content.summary.suggestions]] as const) {
        y += 5; pageBreak(20); doc.setFontSize(14); doc.text(`${label}：`, margin, y); y += 10; doc.setFontSize(11);
        for (const item of items || []) { pageBreak(10); const lines = doc.splitTextToSize(`• ${item}`, maxW - 10); doc.text(lines, margin + 5, y); y += lines.length * 6; }
      }
    } else if (type === 'resume' && content.optimizedResume) {
      const lines = doc.splitTextToSize(content.optimizedResume, maxW);
      for (const line of lines) { pageBreak(6); doc.text(line, margin, y); y += 6; }
    } else if (type === 'interview') {
      for (const [label, questions] of [['行为面试题', content.behavioralQuestions], ['技术面试题', content.technicalQuestions]] as const) {
        if (!questions?.length) continue;
        pageBreak(20); doc.setFontSize(14); doc.text(`${label}：`, margin, y); y += 10;
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i]; pageBreak(30);
          doc.setFontSize(12); const ql = doc.splitTextToSize(`${i + 1}. ${q.question}`, maxW); doc.text(ql, margin, y); y += ql.length * 7;
          doc.setFontSize(10); doc.text(`考察要点：${q.focus}`, margin + 5, y); y += 6;
          const al = doc.splitTextToSize(`参考答案：${q.referenceAnswer}`, maxW - 10); doc.text(al, margin + 5, y); y += al.length * 5 + 8;
        }
      }
    }

    const buf = Buffer.from(doc.output('arraybuffer'));
    return new NextResponse(buf, {
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
