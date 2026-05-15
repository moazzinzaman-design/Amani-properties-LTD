import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // Only protect the /mc (Mission Control) route
  if (!req.nextUrl.pathname.startsWith('/mc')) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // Get credentials from env
    const expectedUser = process.env.BASIC_AUTH_USER || 'admin';
    const expectedPwd = process.env.BASIC_AUTH_PASSWORD || 'password';

    if (user === expectedUser && pwd === expectedPwd) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Auth Required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

export const config = {
  matcher: ['/mc/:path*', '/mc'],
};
