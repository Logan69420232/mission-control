import { NextRequest, NextResponse } from "next/server";

const SESSION_TOKEN = "mc_secret_token_nfs_2026";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow /login and auth API routes through
  if (pathname === "/login" || pathname.startsWith("/api/auth/")) {
    return NextResponse.next();
  }

  const session = request.cookies.get("mc_session");

  if (!session || session.value !== SESSION_TOKEN) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
