import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export const ADMIN_COOKIE = 'admin_token';
export const ADMIN_ENTRY_COOKIE = 'admin_entry_token';
const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;
const ADMIN_ENTRY_MAX_AGE_SECONDS = 10 * 60;

interface AdminSessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
  nonce: string;
}

interface AdminEntryPayload {
  role: 'admin_entry';
  iat: number;
  exp: number;
  nonce: string;
}

function getSessionSecret(): string | null {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || null;
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function secureCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function isAdminConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && getSessionSecret());
}

export function isValidAdminPassword(password: unknown): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || typeof password !== 'string') {
    return false;
  }

  return secureCompare(password, adminPassword);
}

export function createAdminToken(maxAgeSeconds = ADMIN_SESSION_MAX_AGE_SECONDS): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('管理员会话密钥未配置');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: AdminSessionPayload = {
    role: 'admin',
    iat: now,
    exp: now + maxAgeSeconds,
    nonce: randomBytes(16).toString('base64url'),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

function verifySignedToken<T extends { role?: string; exp?: number }>(
  token: string | null | undefined,
  role: string
): boolean {
  const secret = getSessionSecret();
  if (!token || !secret) {
    return false;
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return false;
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = sign(encodedPayload, secret);
  if (!secureCompare(signature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<T>;
    return payload.role === role
      && typeof payload.exp === 'number'
      && payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function verifyAdminToken(token?: string | null): boolean {
  return verifySignedToken<AdminSessionPayload>(token, 'admin');
}

export function createAdminEntryToken(maxAgeSeconds = ADMIN_ENTRY_MAX_AGE_SECONDS): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error('管理员会话密钥未配置');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload: AdminEntryPayload = {
    role: 'admin_entry',
    iat: now,
    exp: now + maxAgeSeconds,
    nonce: randomBytes(16).toString('base64url'),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function verifyAdminEntryToken(token?: string | null): boolean {
  return verifySignedToken<AdminEntryPayload>(token, 'admin_entry');
}

export function setAdminCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE, createAdminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    path: '/',
  });

  return response;
}

export function setAdminEntryCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_ENTRY_COOKIE, createAdminEntryToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: ADMIN_ENTRY_MAX_AGE_SECONDS,
    path: '/',
  });

  return response;
}

export function clearAdminCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}

export function requireAdmin(request: NextRequest): NextResponse | null {
  const token = request.cookies.get(ADMIN_COOKIE)?.value;
  if (verifyAdminToken(token)) {
    return null;
  }

  return NextResponse.json(
    { success: false, error: '未登录或登录已过期' },
    { status: 401 }
  );
}
