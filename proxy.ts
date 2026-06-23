import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_COOKIE,
  ADMIN_ENTRY_COOKIE,
  setAdminEntryCookie,
  verifyAdminEntryToken,
  verifyAdminToken,
} from './lib/auth/admin';

const INTERNAL_ADMIN_LOGIN_PATH = '/admin/login';
const DEFAULT_ADMIN_LOGIN_PATH = '/owner-resume-ai-admin/login';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getAdminLoginPath(): string {
  const configured = process.env.ADMIN_LOGIN_PATH?.trim();
  if (!configured) return isProduction() ? DEFAULT_ADMIN_LOGIN_PATH : INTERNAL_ADMIN_LOGIN_PATH;
  return configured.startsWith('/') ? configured : `/${configured}`;
}

function notFound(): NextResponse {
  return new NextResponse('Not Found', { status: 404 });
}

function isProtectedApi(pathname: string): boolean {
  return pathname.startsWith('/api/models')
    || pathname.startsWith('/api/skills')
    || pathname === '/api/admin/logout';
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminLoginPath = getAdminLoginPath();

  if (pathname === adminLoginPath && pathname !== INTERNAL_ADMIN_LOGIN_PATH) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = INTERNAL_ADMIN_LOGIN_PATH;
    return setAdminEntryCookie(NextResponse.rewrite(rewriteUrl));
  }

  if (pathname === INTERNAL_ADMIN_LOGIN_PATH) {
    return isProduction() && adminLoginPath !== INTERNAL_ADMIN_LOGIN_PATH
      ? notFound()
      : NextResponse.next();
  }

  if (pathname === '/api/admin/login') {
    if (isProduction() && adminLoginPath !== INTERNAL_ADMIN_LOGIN_PATH) {
      const hasEntryToken = verifyAdminEntryToken(request.cookies.get(ADMIN_ENTRY_COOKIE)?.value);
      return hasEntryToken ? NextResponse.next() : notFound();
    }
    return NextResponse.next();
  }

  const isAuthenticated = verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname.startsWith('/admin') && !isAuthenticated) {
    if (isProduction()) return notFound();

    const loginUrl = new URL(adminLoginPath, request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedApi(pathname) && !isAuthenticated) {
    return NextResponse.json(
      { success: false, error: '未登录或登录已过期' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
