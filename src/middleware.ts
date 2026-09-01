import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "admin_session";
const LOGIN_PATH = "/admin/login";

function getSecret(): Uint8Array {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return new TextEncoder().encode("fallback-dev-secret-change-me");
  return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl;

  // ── Subdomain rewrite: life.shazamat.com → /life ──────────
  // Enable the vanity host in Vercel (add domain + CNAME) — no code change needed.
  if (host === "life.shazamat.com") {
    const url = request.nextUrl.clone();
    // /          → /life
    // /r/runId   → /life/r/runId
    if (pathname === "/" || pathname === "") {
      url.pathname = "/life";
    } else if (pathname.startsWith("/r/")) {
      url.pathname = `/life${pathname}`;
    } else {
      url.pathname = `/life${pathname}`;
    }
    return NextResponse.rewrite(url);
  }

  // ── Admin JWT gate ─────────────────────────────────────────
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === LOGIN_PATH) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  if (!token) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  try {
    await jwtVerify(token, getSecret());
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/((?!_next|favicon|images|icons|albums|game|fonts|api).*)"],
};
