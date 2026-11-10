import { NextResponse } from "next/server";
import { loadPhotos, publicPhoto } from "@/lib/gallery";

export const dynamic = "force-dynamic";

export async function GET() {
  const photos = await loadPhotos();
  return NextResponse.json({ photos: photos.slice().reverse().map(publicPhoto) });
}
