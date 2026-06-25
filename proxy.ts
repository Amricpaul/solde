import { NextResponse, type NextRequest } from "next/server";

import { verifySession } from "@/lib/auth/jwt";

// Optimistic route guard only. The real gate is requireUser() inside the
// (app) pages — this just avoids rendering protected shells for logged-out
// users and bounces logged-in users away from the auth pages.

const protectedPrefixes = ["/dashboard", "/transactions", "/budgets", "/goals", "/settings"];
const authPages = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySession(request.cookies.get("session")?.value);
  const isAuthed = !!session?.userId;

  if (!isAuthed && protectedPrefixes.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthed && authPages.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Exclude API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
