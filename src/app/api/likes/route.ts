import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Simple file-based like counter. Works locally and on any host with a
 * persistent filesystem. For serverless deploys (Vercel/Netlify), swap the
 * read/write below for a hosted store like Vercel KV, Upstash Redis, or
 * Supabase — the GET/POST shape can stay identical.
 */
const FILE = path.join(process.cwd(), "data", "likes.json");
const START = 5000; // seed to match the design :)

async function readLikes(): Promise<number> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw).likes ?? START;
  } catch {
    return START;
  }
}

async function writeLikes(likes: number) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify({ likes }));
}

export async function GET() {
  return NextResponse.json({ likes: await readLikes() });
}

export async function POST() {
  const likes = (await readLikes()) + 1;
  try {
    await writeLikes(likes);
  } catch {}
  return NextResponse.json({ likes });
}
