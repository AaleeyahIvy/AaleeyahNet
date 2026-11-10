import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/security";
import { deleteUpload, saveUpload } from "@/lib/storage";
import { RESUME_FORMATS, ResumeFormat, findResume, sniffResume } from "@/lib/resume";

export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024;

/** Which resume files are live right now? */
export async function GET(req: Request) {
  const denied = requireAdmin(req, { write: false });
  if (denied) return denied;
  const status: Record<string, string | null> = {};
  for (const f of Object.keys(RESUME_FORMATS) as ResumeFormat[]) {
    const found = await findResume(f);
    status[f] = found ? found.mtime.toISOString() : null;
  }
  return NextResponse.json({ status });
}

/** Upload a resume (multipart: file). Format is detected from the file itself. */
export async function POST(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Pick a file." }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Resume must be under 10 MB." }, { status: 413 });

  const buf = Buffer.from(await file.arrayBuffer());
  const format = sniffResume(buf);
  if (!format)
    return NextResponse.json({ error: "Only PDF or Word (.docx) files are allowed. (Old .doc files: re-save as .docx.)" }, { status: 400 });

  await saveUpload("resume", `resume.${format}`, buf);
  return NextResponse.json({ ok: true, format });
}

/** Remove an uploaded resume: ?format=pdf|docx */
export async function DELETE(req: Request) {
  const denied = requireAdmin(req);
  if (denied) return denied;
  const format = new URL(req.url).searchParams.get("format");
  if (format !== "pdf" && format !== "docx") return NextResponse.json({ error: "Invalid format." }, { status: 400 });
  await deleteUpload("resume", `resume.${format}`);
  return NextResponse.json({ ok: true });
}
