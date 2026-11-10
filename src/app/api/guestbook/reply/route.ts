import { NextResponse } from "next/server";
import { REPLY_MAX, validateEntry } from "@/lib/validate";
import { checkFormToken, clientIp, isAdmin, newId, rateLimit, sameOrigin } from "@/lib/security";
import { MAX_REPLIES, Reply, updateEntries } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) ?? {};
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { entryId, name, message, website, token } = body;
  const admin = isAdmin(req);

  if (website) return NextResponse.json({ error: "Nope." }, { status: 400 });
  if (typeof entryId !== "string" || !/^[a-z0-9]{1,40}$/.test(entryId))
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  if (!admin) {
    const tokenError = checkFormToken(token);
    if (tokenError) return NextResponse.json({ error: tokenError }, { status: 400 });
    const ip = clientIp(req);
    if (!rateLimit(`reply:${ip}`, 5, 10 * 60_000) || !rateLimit(`reply-day:${ip}`, 20, 24 * 60 * 60_000))
      return NextResponse.json({ error: "Lots of replies lately — take a break and come back later!" }, { status: 429 });
  }

  const result = validateEntry(admin ? "Aaleeyah" : name, message, { max: REPLY_MAX });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const reply: Reply = {
    id: newId(),
    name: result.name,
    message: result.message,
    ts: Date.now(),
    admin: admin || undefined,
  };

  const error = await updateEntries((entries) => {
    const entry = entries.find((e) => e.id === entryId && e.approved);
    if (!entry) return "That message doesn't exist anymore.";
    if (entry.replies.length >= MAX_REPLIES) return "This conversation is full!";
    if (entry.replies.some((r) => r.message.toLowerCase() === reply.message.toLowerCase()))
      return "Someone already replied exactly that!";
    entry.replies.push(reply);
    return null;
  }).catch(() => "Couldn't save right now, try again!");

  if (error) return NextResponse.json({ error }, { status: 400 });
  return NextResponse.json({ reply });
}
