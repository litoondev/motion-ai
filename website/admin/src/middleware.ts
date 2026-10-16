import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("admin_auth_token")?.value;

  // If on login and has token, redirect to dashboard
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p)) && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If on protected route and no token, redirect to login
  if (!PUBLIC_PATHS.some((p) => pathname.startsWith(p)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image, favicon.ico, public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
