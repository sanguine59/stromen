import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/watch', '/upload', '/admin'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!isProtected) return NextResponse.next();

  const presence = req.cookies.get('stromen_token_present')?.value;
  if (presence === '1') return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/auth/login';
  url.searchParams.set('next', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/watch/:path*', '/upload/:path*', '/admin/:path*'],
};
