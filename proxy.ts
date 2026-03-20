import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Forwards the request pathname so Server Components can read it via
 * `headers().get("x-pathname")` (used by portal layout + root layout).
 * Without this, `/portal/login` was never recognized and caused a redirect loop.
 */
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
