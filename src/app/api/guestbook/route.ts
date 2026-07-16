import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { validateEntry } from "@/lib/validate";

/**
 * JSON-file guestbook. Like the likes counter: on serverless hosts swap the
 * file read/write for a hosted store (KV/Supabase). If you move to SQL,
 * use parameterized queries only — validation here is defense-in-depth.
 */
const FILE = path.join(process.cwd(), "data", "guestbook.json");
type Entry = { name: string; message: string; ts: number };

async function readEntries(): Promise<Entry[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return [];
  }
}

export async function GET() {
  const entries = await readEntries();
  return NextResponse.json({ entries: entries.slice(-100).reverse() });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { name, message, website } = (body ?? {}) as Record<string, unknown>;

  // honeypot: real visitors never fill this hidden field
  if (website) return NextResponse.json({ error: "Nope." }, { status: 400 });

  const result = validateEntry(name, message);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });

  const entries = await readEntries();
  const entry: Entry = { name: result.name, message: result.message, ts: Date.now() };
  entries.push(entry);
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(entries.slice(-500)));
  } catch {
    return NextResponse.json({ error: "Couldn't save right now, try again!" }, { status: 500 });
  }
  return NextResponse.json({ entry });
}
