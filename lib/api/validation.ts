import type { OptimizeMode } from '@/types';

export const MAX_RESUME_TEXT_LENGTH = 120_000;
export const MAX_JD_TEXT_LENGTH = 80_000;
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

const ALLOWED_UPLOAD_EXTENSIONS = new Set(['pdf', 'txt', 'md', 'markdown', 'png', 'jpg', 'jpeg']);
const ALLOWED_OPTIMIZE_MODES = new Set<OptimizeMode>(['smart', 'full', 'custom']);
const SKILL_ID_PATTERN = /^[a-z0-9_-]{1,80}$/i;

export class ValidationError extends Error {
  status = 400;
}

function assertPlainObject(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError('请求体格式错误');
  }
}

function readRequiredText(body: Record<string, unknown>, key: string, maxLength: number): string {
  const value = body[key];
  if (typeof value !== 'string' || !value.trim()) {
    throw new ValidationError(key === 'resumeContent' ? '请提供简历内容' : '请提供JD内容');
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new ValidationError(`${key === 'resumeContent' ? '简历' : 'JD'}内容过长，请精简后重试`);
  }

  return normalized;
}

export function parseResumeJdPayload(body: unknown): { resumeContent: string; jdContent: string } {
  assertPlainObject(body);
  return {
    resumeContent: readRequiredText(body, 'resumeContent', MAX_RESUME_TEXT_LENGTH),
    jdContent: readRequiredText(body, 'jdContent', MAX_JD_TEXT_LENGTH),
  };
}

export function parseOptimizePayload(body: unknown): {
  resumeContent: string;
  jdContent: string;
  mode: OptimizeMode;
  selectedSkills: string[];
} {
  assertPlainObject(body);
  const { resumeContent, jdContent } = parseResumeJdPayload(body);
  const rawMode = typeof body.mode === 'string' ? body.mode : 'smart';
  if (!ALLOWED_OPTIMIZE_MODES.has(rawMode as OptimizeMode)) {
    throw new ValidationError('优化模式不合法');
  }

  const rawSelectedSkills = Array.isArray(body.selectedSkills) ? body.selectedSkills : [];
  const selectedSkills = rawSelectedSkills
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => SKILL_ID_PATTERN.test(item))
    .slice(0, 20);

  return { resumeContent, jdContent, mode: rawMode as OptimizeMode, selectedSkills };
}

export function sanitizeFilename(filename: string): string {
  const cleanName = filename
    .replace(/\\/g, '/')
    .split('/')
    .pop()
    ?.replace(/[\u0000-\u001f<>:"|?*]/g, '_')
    .trim();

  return cleanName?.slice(0, 160) || 'upload';
}

export function validateUpload(file: File, type: unknown): { filename: string; uploadType: 'resume' | 'jd' } {
  if (!file || typeof file.name !== 'string' || typeof file.size !== 'number') {
    throw new ValidationError('请选择文件');
  }

  if (type !== 'resume' && type !== 'jd') {
    throw new ValidationError('请指定文件类型');
  }

  if (file.size <= 0) {
    throw new ValidationError('文件内容为空');
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    throw new ValidationError('文件大小超过10MB限制');
  }

  const filename = sanitizeFilename(file.name);
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
    throw new ValidationError(`不支持的文件格式: .${ext || 'unknown'}`);
  }

  return { filename, uploadType: type };
}
