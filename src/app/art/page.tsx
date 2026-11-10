"use client";

import { useEffect, useState } from "react";
import ResultsLayout from "@/components/ResultsLayout";
import type { PublicPhoto } from "@/lib/gallery";

type ArtPiece = {
  title: string;
  emoji?: string;      // placeholder until a real photo is added
  image?: string;      // uploaded via /admin, or a file in public/art/
  gradient?: string;
  height?: number;     // placeholder heights for the masonry feel
  width?: number;      // real photo dimensions (keeps the layout from jumping)
  imgHeight?: number;
};

/*
 * Photos come from two places:
 *  1. uploaded through the admin panel (/admin) — the easy way
 *  2. files committed to public/art/ — add `{ title, image: "/art/file.jpg" }` below
 * The emoji placeholders only show while there are no real photos yet.
 */
const STATIC_PIECES: ArtPiece[] = [
  { title: "Resin flower preservation — wedding bouquet block", emoji: "🌹", gradient: "linear-gradient(135deg,#fbd3e9,#f463b1)", height: 220 },
  { title: "LED-engraved acrylic sign", emoji: "💡", gradient: "linear-gradient(135deg,#d4e8ff,#4b9df5)", height: 160 },
  { title: "Handmade earrings — resin drop set", emoji: "💎", gradient: "linear-gradient(135deg,#fff3c9,#f7d54b)", height: 190 },
  { title: "Cricut sticker sheet — cat pack", emoji: "🐱", gradient: "linear-gradient(135deg,#d9f7e5,#4bc97a)", height: 150 },
  { title: "Split monogram wedding sign", emoji: "💍", gradient: "linear-gradient(135deg,#ffe3cf,#f5a34b)", height: 230 },
  { title: "Layered resin pour — ocean coaster set", emoji: "🌊", gradient: "linear-gradient(135deg,#cfe8ff,#7db8f7)", height: 170 },
  { title: "Basswood frame — laser cut", emoji: "🖼️", gradient: "linear-gradient(135deg,#f2e2ce,#d9a86b)", height: 200 },
  { title: "Family portrait illustration — vectorized", emoji: "👨‍👩‍👧", gradient: "linear-gradient(135deg,#eadcff,#b28df7)", height: 240 },
  { title: "Squishmallow-inspired keychain charms", emoji: "🧸", gradient: "linear-gradient(135deg,#ffe0ef,#f78fc8)", height: 150 },
  { title: "Dried flower frame — pressed dahlia", emoji: "🌸", gradient: "linear-gradient(135deg,#ffeff5,#f4a0c4)", height: 210 },
  { title: "Custom acrylic cake topper", emoji: "🎂", gradient: "linear-gradient(135deg,#fff8d6,#f7dd6e)", height: 160 },
  { title: "UV resin bookmark — glitter shift", emoji: "🔖", gradient: "linear-gradient(135deg,#dcf5ec,#6ed3ae)", height: 185 },
];

function Thumb({ p, big = false }: { p: ArtPiece; big?: boolean }) {
  if (p.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={p.image}
        alt={p.title}
        width={p.width}
        height={p.imgHeight}
        loading={big ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }
  return <span aria-hidden="true">{p.emoji}</span>;
}

export default function ArtPage() {
  const [uploaded, setUploaded] = useState<ArtPiece[] | null>(null);
  const [open, setOpen] = useState<ArtPiece | null>(null);

  useEffect(() => {
    fetch("/api/gallery")
      .then((r) => r.json())
      .then((d: { photos: PublicPhoto[] }) =>
        setUploaded(
          d.photos.map((p) => ({ title: p.title, image: p.src, width: p.width, imgHeight: p.height }))
        )
      )
      .catch(() => setUploaded([]));
  }, []);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [open]);

  const realStatic = STATIC_PIECES.filter((p) => p.image);
  const real = [...(uploaded ?? []), ...realStatic];
  // placeholders only while there are no real photos (and not mid-load)
  const pieces = uploaded === null ? realStatic : real.length > 0 ? real : STATIC_PIECES;

  return (
    <ResultsLayout placeholder="Aaleeyah's Art" activeTab="Images" resultsCount={pieces.length}>
      <div className="artGrid">
        {pieces.map((p, i) => (
          <button key={`${p.title}-${i}`} className="artTile" onClick={() => setOpen(p)}>
            <span
              className={`thumb ${p.image ? "photo" : ""}`}
              style={p.image ? undefined : { height: p.height, background: p.gradient }}
            >
              <Thumb p={p} />
            </span>
            <span className="caption">{p.title}</span>
            <span className="source">aaleeyah.net › madedhd</span>
          </button>
        ))}
      </div>

      {open && (
        <div className="lightbox" onClick={() => setOpen(null)} role="dialog" aria-modal="true" aria-label={open.title}>
          <div className="lightboxCard" onClick={(e) => e.stopPropagation()}>
            <button className="lightboxClose" onClick={() => setOpen(null)} aria-label="Close">✕</button>
            <div className="bigThumb" style={{ background: open.image ? undefined : open.gradient }}>
              <Thumb p={open} big />
            </div>
            <div className="lightboxTitle">{open.title}</div>
            <div className="source pixel" style={{ color: "#666", fontSize: "0.85rem" }}>aaleeyah.net › madedhd</div>
          </div>
        </div>
      )}
    </ResultsLayout>
  );
}
