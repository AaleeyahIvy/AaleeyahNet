import crypto from "crypto";

/**
 * Admin auth + anti-bot helpers.
 *
 *  - The admin password is never stored: only an scrypt hash lives in the
 *    ADMIN_PASSWORD_HASH env var (generate with `npm run hash-password`).
 *  - A successful login gets an HMAC-signed, httpOnly, SameSite=Strict
 *    session cookie (signed with ADMIN_SESSION_SECRET). It can't be read by
 *    page scripts or forged without the secret.
 *  - Every admin write also checks the Origin header (CSRF protection).
 */

export const SESSION_COOKIE = "aaleeyah_admin";
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

function sessionSecret(): string | null {
  const s = process.env.ADMIN_SESSION_SECRET;
  return s && s.length >= 32 ? s : null;
}

// Guestbook form tokens can use the admin secret, or a per-process random
// one if the admin panel isn't configured (tokens then reset on restart).
const FORM_SECRET = sessionSecret() ?? crypto.randomBytes(32).toString("hex");

export function adminConfigured(): boolean {
  return !!sessionSecret() && !!process.env.ADMIN_PASSWORD_HASH;
}

function hmac(secret: string, value: string) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
}

/* ---------------- password check (scrypt; hash made by scripts/hash-password.mjs) ---------------- */

export function verifyPassword(password: string): boolean {
  const stored = process.env.ADMIN_PASSWORD_HASH ?? "";
  const [scheme, saltHex, hashHex] = stored.split(":");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), expected.length, {
    N: 16384, r: 8, p: 1,
  });
  return crypto.timingSafeEqual(actual, expected);
}

/* ---------------- sessions ---------------- */

export function createSession(): string {
  const secret = sessionSecret();
  if (!secret) throw new Error("ADMIN_SESSION_SECRET not set");
  const payload = Buffer.from(
    JSON.stringify({ exp: Date.now() + SESSION_TTL_MS, n: crypto.randomBytes(8).toString("hex") })
  ).toString("base64url");
  return `${payload}.${hmac(secret, payload)}`;
}

function verifySession(token: string | undefined): boolean {
  const secret = sessionSecret();
  if (!secret || !token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig || !safeEqual(sig, hmac(secret, payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" && exp > Date.now();
  } catch {
    return false;
  }
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k === name) return decodeURIComponent(v.join("="));
  }
  return undefined;
}

export function isAdmin(req: Request): boolean {
  return verifySession(readCookie(req, SESSION_COOKIE));
}

/** Is this request arriving over HTTPS (directly or via nginx)? */
export function isHttps(req: Request): boolean {
  const proto = req.headers.get("x-forwarded-proto") ?? new URL(req.url).protocol.replace(":", "");
  return proto.split(",")[0].trim() === "https";
}

/** Passwords may only travel over HTTPS (except local dev / explicit opt-out). */
export function loginTransportOk(req: Request): boolean {
  return (
    isHttps(req) ||
    process.env.NODE_ENV !== "production" ||
    process.env.ADMIN_ALLOW_HTTP === "true"
  );
}

export function sessionCookieOptions(req: Request) {
  return {
    httpOnly: true,
    secure: isHttps(req),
    sameSite: "strict" as const,
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  };
}

/** CSRF: writes must come from a page on this same site. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!origin || !host) return false;
  try {
    // compare host names (nginx's $host drops the port)
    return new URL(origin).hostname === host.split(":")[0];
  } catch {
    return false;
  }
}

/** Admin guard for API routes: returns an error Response, or null if OK. */
export function requireAdmin(req: Request, { write = true } = {}): Response | null {
  if (!isAdmin(req)) return Response.json({ error: "Not signed in." }, { status: 401 });
  if (write && !sameOrigin(req)) return Response.json({ error: "Bad origin." }, { status: 403 });
  return null;
}

/* ---------------- guestbook form tokens (anti-bot) ---------------- */

/**
 * Issued when the guestbook loads. A post must carry a token that is at
 * least MIN_AGE old (bots submit instantly) and not older than MAX_AGE.
 */
const TOKEN_MIN_AGE_MS = 3000;
const TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 3;

export function issueFormToken(): string {
  const ts = Date.now().toString(36);
  return `${ts}.${hmac(FORM_SECRET, `form:${ts}`)}`;
}

export function checkFormToken(token: unknown): string | null {
  if (typeof token !== "string") return "Please refresh the page and try again.";
  const [ts, sig] = token.split(".");
  if (!ts || !sig || !safeEqual(sig, hmac(FORM_SECRET, `form:${ts}`)))
    return "Please refresh the page and try again.";
  const age = Date.now() - parseInt(ts, 36);
  if (age < TOKEN_MIN_AGE_MS) return "Whoa, that was fast! Wait a moment and try again.";
  if (age > TOKEN_MAX_AGE_MS) return "This page has been open a while — refresh and try again.";
  return null;
}

/* ---------------- rate limiting (in-memory) ---------------- */

const buckets = new Map<string, number[]>();

/** Returns true if the action is allowed (and records it). */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= limit) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  // keep memory bounded
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (!v.some((t) => now - t < windowMs)) buckets.delete(k);
  }
  return true;
}

export function clientIp(req: Request): string {
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "local"
  );
}

export function newId(): string {
  return crypto.randomBytes(12).toString("hex");
}
