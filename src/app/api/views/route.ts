import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * Daily page-view counter. Stored as { "2026-07-16": 42, ... } in a JSON
 * file inside the volume-mounted data dir. Same note as likes/guestbook:
 * on serverless hosts, swap for a hosted KV store.
 */
const FILE = path.join(process.cwd(), "data", "views.json");
const DAYS_SHOWN = 7;

type ViewMap = Record<string, number>;

async function readViews(): Promise<ViewMap> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    return {};
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildDays(map: ViewMap) {
  const days: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: map[key] ?? 0 });
  }
  const total = Object.values(map).reduce((a, b) => a + b, 0);
  return { days, total };
}

export async function GET() {
  return NextResponse.json(buildDays(await readViews()));
}

export async function POST() {
  const map = await readViews();
  const key = today();
  map[key] = (map[key] ?? 0) + 1;

  // keep the file from growing forever: retain the last 90 days
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() - 90);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const trimmed: ViewMap = {};
  for (const [k, v] of Object.entries(map)) if (k >= cutoffKey) trimmed[k] = v;

  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(trimmed));
  } catch {}
  return NextResponse.json(buildDays(trimmed));
}
