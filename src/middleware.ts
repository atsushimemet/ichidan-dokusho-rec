import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 管理者ページへのアクセスをチェック
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // クライアントサイドで認証チェックを行うため、ここでは何もしない
    // 実際の認証チェックはクライアントサイドのAuthContextで行う
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};