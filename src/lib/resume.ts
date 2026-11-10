import { promises as fs } from "fs";
import path from "path";
import { uploadPath } from "./storage";

export type ResumeFormat = "pdf" | "docx";

export const RESUME_FORMATS: Record<ResumeFormat, { mime: string; label: string }> = {
  pdf: { mime: "application/pdf", label: "PDF" },
  docx: {
    mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    label: "Word (.docx)",
  },
};

export const RESUME_DOWNLOAD_NAME = "Aaleeyah-Ivy-Kilgore-Resume";

/** Uploaded via the admin panel first, then a file committed in /public. */
export function resumeCandidates(format: ResumeFormat): string[] {
  return [
    uploadPath("resume", `resume.${format}`),
    path.join(process.cwd(), "public", `${RESUME_DOWNLOAD_NAME}.${format}`),
  ];
}

export async function findResume(format: ResumeFormat): Promise<{ file: string; mtime: Date } | null> {
  for (const file of resumeCandidates(format)) {
    try {
      const st = await fs.stat(file);
      if (st.isFile()) return { file, mtime: st.mtime };
    } catch {}
  }
  return null;
}

/** Real file signatures: PDFs start with %PDF-, .docx files are ZIPs. */
export function sniffResume(buf: Buffer): ResumeFormat | null {
  if (buf.subarray(0, 5).toString("ascii") === "%PDF-") return "pdf";
  if (
    buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04 &&
    buf.includes(Buffer.from("word/"))
  )
    return "docx";
  return null;
}
