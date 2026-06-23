import { NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/auth/admin';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return clearAdminCookie(response);
}
