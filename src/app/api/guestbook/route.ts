import { NextResponse } from "next/server";
import { validateEntry } from "@/lib/validate";
import { saveUpload, deleteUpload } from "@/lib/storage";
import { cleanImage, isBlank, sniffImage } from "@/lib/images";
import {
  checkFormToken, clientIp, isAdmin, issueFormToken, newId, rateLimit, sameOrigin,
} from "@/lib/security";
import { Entry, loadEntries, publicEntry, updateEntries } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

const MAX_DRAWING_BYTES = 600_000; // base64 PNG from the canvas

export async function GET() {
  const entries = (await loadEntries()).filter((e) => e.approved);
  return NextResponse.json({
    entries: entries.slice(-100).reverse().map(publicEntry),
    token: issueFormToken(),
  });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid request." }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) ?? {};
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { name, message, website, token, drawing } = body;
  const admin = isAdmin(req);

  // honeypot: real visitors never fill this hidden field
  if (website) return NextResponse.json({ error: "Nope." }, { status: 400 });

  if (!admin) {
    const tokenError = checkFormToken(token);
    if (tokenError) return NextResponse.json({ error: tokenError }, { status: 400 });

    const ip = clientIp(req);
    if (!rateLimit(`gb:${ip}`, 3, 10 * 60_000) || !rateLimit(`gb-day:${ip}`, 10, 24 * 60 * 60_000))
      return NextResponse.json({ error: "You've signed a lot recently — take a break and come back later!" }, { status: 429 });
  }

  const hasDrawing = typeof drawing === "string" && drawing.length > 0;
  const result = validateEntry(name, message, { allowEmptyMessage: hasDrawing });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  // ---- drawing: decode → verify PNG → re-encode (never stored as sent) ----
  let drawingFile: string | undefined;
  if (hasDrawing) {
    const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(drawing as string);
    if (!m || drawing!.toString().length > MAX_DRAWING_BYTES)
      return NextResponse.json({ error: "That drawing is too big — try a simpler one." }, { status: 400 });
    const buf = Buffer.from(m[1], "base64");
    if (sniffImage(buf) !== "png") return NextResponse.json({ error: "Invalid drawing." }, { status: 400 });
    try {
      if (await isBlank(buf)) return NextResponse.json({ error: "Your drawing is empty — draw something first!" }, { status: 400 });
      const clean = await cleanImage(buf, { maxSide: 800, quality: 85 });
      drawingFile = `${newId()}.webp`;
      await saveUpload("drawings", drawingFile, clean.data);
    } catch {
      return NextResponse.json({ error: "Couldn't read that drawing — try again." }, { status: 400 });
    }
  }

  const entry: Entry = {
    id: newId(),
    name: admin ? "Aaleeyah" : result.name,
    message: result.message,
    ts: Date.now(),
    drawing: drawingFile,
    // text is auto-moderated; drawings can't be, so they wait for approval
    approved: admin || !drawingFile,
    admin: admin || undefined,
    replies: [],
  };

  try {
    const dupe = await updateEntries((entries) => {
      const msg = entry.message.toLowerCase();
      if (msg && entries.slice(-50).some((e) => e.message.toLowerCase() === msg)) return true;
      entries.push(entry);
      return false;
    });
    if (dupe) {
      if (drawingFile) await deleteUpload("drawings", drawingFile);
      return NextResponse.json({ error: "Someone already said exactly that — say it your way!" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Couldn't save right now, try again!" }, { status: 500 });
  }

  return NextResponse.json({ entry: publicEntry(entry), pending: !entry.approved });
}
