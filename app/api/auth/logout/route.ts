import { NextResponse, type NextRequest } from "next/server";

import { deleteSession } from "@/lib/auth/session";
import { externalUrl } from "@/lib/http";

// Clears the session cookie, then sends the user to /login. Lives in a route
// handler (not a Server Component) because cookies can only be mutated here or
// in a Server Action. requireUser() redirects here when it holds a valid token
// for a user that no longer exists — clearing the cookie breaks the proxy's
// authed/not-authed redirect loop.
export async function GET(request: NextRequest) {
  await deleteSession();
  return NextResponse.redirect(externalUrl(request, "/login"));
}
