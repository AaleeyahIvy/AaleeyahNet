import { NextResponse } from "next/server";
import {
  SESSION_COOKIE, adminConfigured, clientIp, createSession, isAdmin, loginTransportOk,
  rateLimit, sameOrigin, sessionCookieOptions, verifyPassword,
} from "@/lib/security";

export const dynamic = "force-dynamic";

/** Am I signed in? */
export async function GET(req: Request) {
  return NextResponse.json({ configured: adminConfigured(), admin: isAdmin(req) });
}

/** Sign in. */
export async function POST(req: Request) {
  if (!adminConfigured())
    return NextResponse.json({ error: "The admin panel isn't set up on this server yet." }, { status: 503 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Bad origin." }, { status: 403 });
  if (!loginTransportOk(req))
    return NextResponse.json({ error: "Sign-in is only allowed over HTTPS." }, { status: 403 });

  // brute-force protection: 5 tries / 15 min per IP, 30 / hour overall
  if (!rateLimit(`login:${clientIp(req)}`, 5, 15 * 60_000) || !rateLimit("login:all", 30, 60 * 60_000))
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });

  let password: unknown;
  try {
    ({ password } = await req.json());
  } catch {}
  if (typeof password !== "string" || password.length > 200 || !verifyPassword(password)) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, createSession(), sessionCookieOptions(req));
  return res;
}

/** Sign out. */
export async function DELETE(req: Request) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(req), maxAge: 0 });
  return res;
}
