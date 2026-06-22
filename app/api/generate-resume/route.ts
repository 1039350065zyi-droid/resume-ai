import { NextRequest, NextResponse } from 'next/server';
import { getClient } from '@/lib/ai/mimo';

export async function POST(request: NextRequest) {
  try {
    const { resumeContent, jdContent } = await request.json();

    if (!resumeContent || !jdContent) {
      return NextResponse.json({ success: false, error: '请提供简历和JD内容' }, { status: 400 });
    }

    const prompt = `你是一位顶级简历优化专家。请基于以下原始简历，结合岗位JD分析结果，深度改写简历内容，使其更精准匹配目标岗位。

【原始简历】
${resumeContent}

【目标岗位JD】
${jdContent}

请按照以下8个模块重新组织和改写简历内容：

1. **个人信息**（personalInfo）：
   - 姓名、手机号、邮箱
   - 城市、年龄/出生年月（如原简历有）
   - 求职意向岗位（基于JD）
   - 一句话个人标签/定位（突出与JD最匹配的核心优势）

2. **个人摘要**（summary）：
   - 3-5句话的精炼概述
   - 突出与JD最匹配的经验和能力
   - 包含核心数据和成就
   - 用关键词自然融入JD中的核心词汇

3. **工作经历**（workExperience）：
   - 按时间倒序排列
   - 每段经历用STAR原则重写
   - 量化所有成果（数据、百分比、金额）
   - 重点突出与JD要求匹配的职责和成就
   - 使用强有力的动词（主导、推动、落地、构建、统筹）

4. **项目经历**（projects）：
   - 精选2-4个与JD最匹配的项目
   - 突出项目规模、你的角色、核心成果
   - 量化项目成果

5. **教育背景**（education）：
   - 学校、专业、学历、时间
   - 突出与岗位相关的课程或成就

6. **技能特长**（skills）：
   - 分类列出：产品技能、工具、软技能等
   - 优先列出JD中提到的技能
   - 标注熟练程度

7. **证书荣誉**（certificates）：
   - 列出相关证书、获奖情况
   - 按相关性排序

8. **自我评价**（selfEvaluation）：
   - 简洁有力，2-3句话
   - 突出差异化优势
   - 避免空泛描述，用事实支撑

要求：
- 内容必须基于原简历的真实信息，不可编造
- 表述要专业、简洁、有力
- 所有描述尽量量化
- 关键词自然融入，不堆砌
- 使用中文

请严格按照以下JSON格式返回，不要包含任何其他文字：
{
  "personalInfo": {
    "name": "姓名",
    "phone": "手机号",
    "email": "邮箱",
    "city": "城市",
    "age": "年龄（如有）",
    "targetPosition": "目标岗位",
    "tagline": "一句话个人标签"
  },
  "summary": "个人摘要内容...",
  "workExperience": [
    {
      "company": "公司名称",
      "position": "职位",
      "period": "2023.07 - 至今",
      "highlights": ["成果1：用STAR原则描述，含数据", "成果2..."]
    }
  ],
  "projects": [
    {
      "name": "项目名称",
      "role": "你的角色",
      "period": "时间",
      "description": "项目简述",
      "highlights": ["核心成果1", "成果2"]
    }
  ],
  "education": [
    {
      "school": "学校名称",
      "major": "专业",
      "degree": "学历",
      "period": "时间"
    }
  ],
  "skills": [
    {
      "category": "技能类别",
      "items": ["技能1", "技能2"]
    }
  ],
  "certificates": ["证书/荣誉1", "证书/荣誉2"],
  "selfEvaluation": "自我评价内容..."
}`;

    const client = await getClient();
    const result = await client.chat([
      { role: 'system', content: '你是一位顶级简历优化专家。请严格按照要求的JSON格式返回结果，不要包含任何其他文字。确保所有内容基于真实信息，不编造。' },
      { role: 'user', content: prompt },
    ]);

    const { extractJSON } = await import('@/lib/utils/json');
    const data = extractJSON(result);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Generate resume error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : '生成简历失败' },
      { status: 500 }
    );
  }
}
