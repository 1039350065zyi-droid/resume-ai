import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 允许登录页和登录 API 通过
  if (pathname === '/admin/login' || pathname.startsWith('/api/admin/login')) {
    return NextResponse.next();
  }

  // 保护 /admin 路由
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 如果没设置管理员密码，说明未配置，允许访问（开发环境）
    if (!adminPassword) {
      return NextResponse.next();
    }

    // 验证 token
    if (token !== adminPassword) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
