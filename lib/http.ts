import type { NextRequest } from "next/server";

/**
 * Build an absolute URL on the request's *external* origin.
 *
 * `request.url` / `request.nextUrl` can carry an internal host (e.g. `localhost`)
 * when the app runs behind a proxy or tunnel (Vercel, ngrok), which leaks into
 * redirects. Prefer the forwarded headers the proxy sets so redirects land on
 * the host the browser actually used.
 */
export function externalUrl(request: NextRequest, path: string): URL {
  const host =
    request.headers.get("x-forwarded-host") ??
    request.headers.get("host") ??
    request.nextUrl.host;
  const protocol =
    request.headers.get("x-forwarded-proto") ??
    request.nextUrl.protocol.replace(/:$/, "") ??
    "https";

  return new URL(path, `${protocol}://${host}`);
}
