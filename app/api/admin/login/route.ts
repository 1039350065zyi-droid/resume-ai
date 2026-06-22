import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    // 如果没设置密码，说明是开发环境，直接放行
    if (!adminPassword) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', 'dev', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
      });
      return response;
    }

    if (password !== adminPassword) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', adminPassword, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: '登录失败' }, { status: 500 });
  }
}
