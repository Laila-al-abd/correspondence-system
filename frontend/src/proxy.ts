// src/proxy.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// const PROTECTED_MATCHER = '/dashboard';

// export function proxy(request: NextRequest) {
//   const token = request.cookies.get('auth_token')?.value;


//   if (!token) {
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('from', request.nextUrl.pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   // Presence-only check. Actual validity (expired, tampered, revoked) is
//   // enforced by JwtAuthGuard on every request; axios-client's 401 handler
//   // clears this cookie and redirects the moment the backend rejects it.
//   // This middleware only prevents a flash of protected UI before that
//   // round-trip completes — it is not the security boundary.
//   return NextResponse.next();
// }

//  export const config = { matcher: [`${PROTECTED_MATCHER}/:path*`] };

//src/proxy.ts
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// const PROTECTED_MATCHER = '/dashboard';

// export function proxy(request: NextRequest) {
//   // Defensive guard: never redirect a request that's already headed to
//   // /login, no matter what the matcher below resolves to. Without this, a
//   // matcher that (for whatever reason) also catches /login causes an
//   // infinite bounce -- /login -> /login?from=/login -> ... -> ERR_TOO_MANY_REDIRECTS.
//   console.log('[middleware]', request.nextUrl.pathname)
//   if (request.nextUrl.pathname.startsWith('/login')) {
//     return NextResponse.next();
//   }

//   const token = request.cookies.get('auth_token')?.value;

//   if (!token) {
//     const loginUrl = new URL('/login', request.url);
//     loginUrl.searchParams.set('from', request.nextUrl.pathname);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// }

// export const config = { matcher: [`${PROTECTED_MATCHER}/:path*`] };

// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIX = '/dashboard';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only ever act on protected routes -- checked here, not via the matcher
  // config, so this is correct regardless of how that config's shape may
  // have changed in the middleware -> proxy rename.
  if (!pathname.startsWith(PROTECTED_PREFIX)) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}