import { readUpload } from "@/lib/storage";
import { isAdmin } from "@/lib/security";
import { loadEntries } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

const SAFE_HEADERS = {
  "Content-Type": "image/webp",
  "X-Content-Type-Options": "nosniff",
  "Content-Security-Policy": "default-src 'none'; sandbox",
};

/** Serves re-encoded uploads. Unapproved drawings are visible to the admin only. */
export async function GET(req: Request, { params }: { params: { kind: string; file: string } }) {
  const { kind, file } = params;
  if ((kind !== "gallery" && kind !== "drawings") || !/^[a-z0-9]{8,40}\.webp$/.test(file))
    return new Response("Not found", { status: 404 });

  if (kind === "drawings" && !isAdmin(req)) {
    const entry = (await loadEntries()).find((e) => e.drawing === file);
    if (!entry?.approved) return new Response("Not found", { status: 404 });
  }

  const data = await readUpload(kind, file);
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      ...SAFE_HEADERS,
      // file names are random + never reused, so they can be cached hard
      "Cache-Control": kind === "gallery" ? "public, max-age=31536000, immutable" : "private, max-age=300",
    },
  });
}
