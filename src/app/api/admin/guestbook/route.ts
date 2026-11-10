import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
import { deleteUpload } from "@/lib/storage";
import { Entry, loadEntries, publicEntry, updateEntries } from "@/lib/guestbook";

export const dynamic = "force-dynamic";

/** Everything, including drawings waiting for approval. */
export async function GET(req: Request) {
  const denied = requireAdmin(req, { write: false });
  if (denied) return denied;
  const entries = await loadEntries();
  return NextResponse.json({
    entries: entries
      .slice()
      .reverse()
      .map((e) => ({ ...publicEntry(e), approved: e.approved })),
  });
}

/**
 * Moderation actions:
 *  { action: "approve", id }            show a pending drawing
 *  { action: "delete", id }             remove an entry (and its drawing)
 *  { action: "deleteReply", id, replyId }
 */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const { action, id, replyId } = await req.json().catch(() => ({}));
  if (typeof id !== "string") return NextResponse.json({ error: "Invalid request." }, { status: 400 });

  const result = await updateEntries<{ error?: string; removed?: Entry }>((entries) => {
    const i = entries.findIndex((e) => e.id === id);
    if (i === -1) return { error: "Not found." };
    if (action === "approve") {
      entries[i].approved = true;
      return {};
    }
    if (action === "delete") {
      const [removed] = entries.splice(i, 1);
      return { removed };
    }
    if (action === "deleteReply") {
      entries[i].replies = entries[i].replies.filter((r) => r.id !== replyId);
      return {};
    }
    return { error: "Unknown action." };
  });

  if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });
  if (result.removed?.drawing) await deleteUpload("drawings", result.removed.drawing);
  return NextResponse.json({ ok: true });
}
