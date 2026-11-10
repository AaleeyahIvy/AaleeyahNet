import sharp from "sharp";

/**
 * Image safety: never trust an uploaded file as-is.
 *  1. Check the real file signature ("magic bytes"), not the extension or
 *     the browser-supplied MIME type. SVG (which can carry scripts) is never
 *     accepted.
 *  2. Fully decode and RE-ENCODE the pixels to a fresh WebP with sharp.
 *     Anything hidden in the original file (scripts, polyglot payloads,
 *     EXIF/GPS metadata) is discarded — only pixels survive.
 *  3. Cap dimensions/pixel count so "decompression bomb" images are refused.
 */

export type SniffedType = "jpeg" | "png" | "gif" | "webp";

export function sniffImage(buf: Buffer): SniffedType | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString("ascii") === "GIF8") return "gif";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "webp";
  return null;
}

export type CleanImage = { data: Buffer; width: number; height: number };

export async function cleanImage(
  buf: Buffer,
  { maxSide = 1800, quality = 82 }: { maxSide?: number; quality?: number } = {}
): Promise<CleanImage> {
  if (!sniffImage(buf)) throw new Error("Only JPEG, PNG, GIF or WebP images are allowed.");
  try {
    const { data, info } = await sharp(buf, { limitInputPixels: 50_000_000, animated: false, failOn: "error" })
      .rotate() // respect phone orientation before metadata is stripped
      .resize({ width: maxSide, height: maxSide, fit: "inside", withoutEnlargement: true })
      .webp({ quality })
      .toBuffer({ resolveWithObject: true });
    return { data, width: info.width, height: info.height };
  } catch {
    throw new Error("That image couldn't be read — it may be corrupted.");
  }
}

/** True if a drawing is a single flat color (nothing was drawn). */
export async function isBlank(buf: Buffer): Promise<boolean> {
  const stats = await sharp(buf).stats();
  return stats.channels.every((c) => c.max - c.min < 4);
}
