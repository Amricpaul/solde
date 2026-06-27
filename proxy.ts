import { NextResponse, type NextRequest } from "next/server";

import { verifySession } from "@/lib/auth/jwt";

// Optimistic route guard only. The real gate is requireUser() inside the
// (app) pages — this just avoids rendering protected shells for logged-out
// users and bounces logged-in users away from the auth pages.

// `/` is the dashboard (protected). Other public routes (/design-system, /sample, …)
// are not listed, so they stay public.
const protectedPrefixes = ["/transactions", "/budgets", "/goals", "/settings"];
const authPages = ["/login", "/register"];

function isProtected(pathname: string) {
  return pathname === "/" || protectedPrefixes.some((p) => pathname.startsWith(p));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get("session")?.value);
  const isAuthed = !!session?.userId;

  if (!isAuthed && isProtected(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthed && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
