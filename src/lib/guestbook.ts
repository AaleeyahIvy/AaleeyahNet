import { readJson, updateJson } from "./storage";

export type Reply = { id: string; name: string; message: string; ts: number; admin?: boolean };
export type Entry = {
  id: string;
  name: string;
  message: string;
  ts: number;
  drawing?: string;     // file name in uploads/drawings
  approved: boolean;    // drawings wait for admin approval; text posts go live
  admin?: boolean;      // posted by Aaleeyah from the admin panel
  replies: Reply[];
};

export const GUESTBOOK_FILE = "guestbook.json";
export const MAX_ENTRIES = 500;
export const MAX_REPLIES = 30;

/** Upgrades entries saved by the old guestbook (no id / replies). */
export function normalizeEntries(raw: unknown): Entry[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((e) => ({
    ...e,
    id: e.id ?? `legacy${e.ts}`,
    approved: e.approved ?? true,
    replies: Array.isArray(e.replies) ? e.replies : [],
  }));
}

/** Locked read-modify-write; `fn` may mutate the entries array in place. */
export function updateEntries<R>(fn: (entries: Entry[]) => R): Promise<R> {
  return updateJson<unknown, R>(GUESTBOOK_FILE, [], (raw) => {
    const entries = normalizeEntries(raw);
    const result = fn(entries);
    return [entries.slice(-MAX_ENTRIES), result];
  });
}

export async function loadEntries(): Promise<Entry[]> {
  return normalizeEntries(await readJson<unknown>(GUESTBOOK_FILE, []));
}

/** What visitors see: approved entries, newest first, no internal flags. */
export function publicEntry(e: Entry) {
  return {
    id: e.id,
    name: e.name,
    message: e.message,
    ts: e.ts,
    admin: !!e.admin,
    drawing: e.drawing ? `/api/media/drawings/${e.drawing}` : undefined,
    replies: e.replies,
  };
}
export type PublicEntry = ReturnType<typeof publicEntry>;
