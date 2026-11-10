import { NextResponse } from "next/server";
import { requireAdmin, newId } from "@/lib/security";
import { cleanImage } from "@/lib/images";
import { deleteUpload, saveUpload, updateJson } from "@/lib/storage";
import { GALLERY_FILE, Photo, publicPhoto } from "@/lib/gallery";

export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024;

/** Upload one or more photos (multipart: files[], title). */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  if (Number(req.headers.get("content-length") ?? 0) > MAX_BYTES * 5)
    return NextResponse.json({ error: "Upload too large." }, { status: 413 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const title = String(form.get("title") ?? "").trim().slice(0, 120);
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) return NextResponse.json({ error: "Pick at least one image." }, { status: 400 });

  const added: Photo[] = [];
  const errors: string[] = [];
  for (const f of files.slice(0, 10)) {
    if (f.size > MAX_BYTES) {
      errors.push(`${f.name}: bigger than 15 MB`);
      continue;
    }
    try {
      const clean = await cleanImage(Buffer.from(await f.arrayBuffer()));
      const id = newId();
      const file = `${id}.webp`;
      await saveUpload("gallery", file, clean.data);
      added.push({
        id,
        file,
        title: title || f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 120),
        width: clean.width,
        height: clean.height,
        ts: Date.now(),
      });
    } catch (e) {
      errors.push(`${f.name}: ${(e as Error).message}`);
    }
  }

  if (added.length)
    await updateJson<Photo[]>(GALLERY_FILE, [], (photos) => [[...photos, ...added], undefined]);

  return NextResponse.json({ added: added.map(publicPhoto), errors }, { status: added.length ? 200 : 400 });
}

/** Rename a photo: { id, title } */
export async function PATCH(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { id, title } = await req.json().catch(() => ({}));
  if (typeof id !== "string" || typeof title !== "string" || !title.trim())
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  await updateJson<Photo[]>(GALLERY_FILE, [], (photos) => [
    photos.map((p) => (p.id === id ? { ...p, title: title.trim().slice(0, 120) } : p)),
    undefined,
  ]);
  return NextResponse.json({ ok: true });
}

/** Delete a photo: ?id= */
export async function DELETE(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const id = new URL(req.url).searchParams.get("id");
  const removed = await updateJson<Photo[], Photo | undefined>(GALLERY_FILE, [], (photos) => [
    photos.filter((p) => p.id !== id),
    photos.find((p) => p.id === id),
  ]);
  if (!removed) return NextResponse.json({ error: "Not found." }, { status: 404 });
  await deleteUpload("gallery", removed.file);
  return NextResponse.json({ ok: true });
}
