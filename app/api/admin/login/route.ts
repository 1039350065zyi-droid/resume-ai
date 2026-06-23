import { NextRequest, NextResponse } from 'next/server';
import { isAdminConfigured, isValidAdminPassword, setAdminCookie } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!isAdminConfigured()) {
      return NextResponse.json({ success: false, error: '管理员密码未配置' }, { status: 503 });
    }

    if (!isValidAdminPassword(password)) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    return setAdminCookie(response);
  } catch {
    return NextResponse.json({ success: false, error: '登录失败' }, { status: 500 });
  }
}
