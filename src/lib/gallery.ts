import { readJson } from "./storage";

export type Photo = {
  id: string;
  file: string;       // name in uploads/gallery
  title: string;
  width: number;
  height: number;
  ts: number;
};

export const GALLERY_FILE = "gallery.json";

export async function loadPhotos(): Promise<Photo[]> {
  const raw = await readJson<unknown>(GALLERY_FILE, []);
  return Array.isArray(raw) ? (raw as Photo[]) : [];
}

export function publicPhoto(p: Photo) {
  return { id: p.id, title: p.title, width: p.width, height: p.height, src: `/api/media/gallery/${p.file}` };
}
export type PublicPhoto = ReturnType<typeof publicPhoto>;
