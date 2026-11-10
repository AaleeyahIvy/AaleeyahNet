import { promises as fs } from "fs";
import path from "path";

/**
 * Tiny JSON-file store under /app/data (a Docker volume in production).
 * Writes are serialized per file and done atomically (write temp → rename)
 * so two visitors posting at once can't corrupt the file.
 */
export const DATA_DIR = path.join(process.cwd(), "data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

const locks = new Map<string, Promise<unknown>>();

export async function readJson<T>(name: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, name), "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeAtomic(file: string, data: string | Buffer) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, data);
  await fs.rename(tmp, file);
}

/**
 * Read-modify-write a JSON file under a per-file lock. The updater returns
 * [nextData, result]; nextData is written and result is passed back.
 */
export async function updateJson<T, R = void>(
  name: string,
  fallback: T,
  updater: (data: T) => [T, R] | Promise<[T, R]>
): Promise<R> {
  const prev = locks.get(name) ?? Promise.resolve();
  let release!: () => void;
  const mine = new Promise<void>((r) => (release = r));
  const chain = prev.then(() => mine);
  locks.set(name, chain);
  await prev;
  try {
    const [next, result] = await updater(await readJson<T>(name, fallback));
    await writeAtomic(path.join(DATA_DIR, name), JSON.stringify(next));
    return result;
  } finally {
    release();
    if (locks.get(name) === chain) locks.delete(name);
  }
}

/** Upload sub-folders we allow — nothing else is ever read or written. */
export type UploadKind = "gallery" | "drawings" | "resume";

export function uploadPath(kind: UploadKind, file: string) {
  // file names are generated server-side, but double check: no traversal
  if (!/^[a-z0-9-]+\.(webp|pdf|docx)$/.test(file)) throw new Error("bad file name");
  return path.join(UPLOAD_DIR, kind, file);
}

export async function saveUpload(kind: UploadKind, file: string, data: Buffer) {
  await writeAtomic(uploadPath(kind, file), data);
}

export async function readUpload(kind: UploadKind, file: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(uploadPath(kind, file));
  } catch {
    return null;
  }
}

export async function deleteUpload(kind: UploadKind, file: string) {
  try {
    await fs.unlink(uploadPath(kind, file));
  } catch {}
}
