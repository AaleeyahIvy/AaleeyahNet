import { promises as fs } from "fs";
import { RESUME_DOWNLOAD_NAME, RESUME_FORMATS, ResumeFormat, findResume } from "@/lib/resume";

export const dynamic = "force-dynamic";

/** /api/resume/pdf or /api/resume/docx — add ?view=1 to open the PDF in the browser. */
export async function GET(req: Request, { params }: { params: { format: string } }) {
  const format = params.format as ResumeFormat;
  if (!(format in RESUME_FORMATS)) return new Response("Not found", { status: 404 });

  const found = await findResume(format);
  if (!found) return new Response("Resume not uploaded yet.", { status: 404 });

  const inline = format === "pdf" && new URL(req.url).searchParams.has("view");
  return new Response(new Uint8Array(await fs.readFile(found.file)), {
    headers: {
      "Content-Type": RESUME_FORMATS[format].mime,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${RESUME_DOWNLOAD_NAME}.${format}"`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
      "Last-Modified": found.mtime.toUTCString(),
    },
  });
}
