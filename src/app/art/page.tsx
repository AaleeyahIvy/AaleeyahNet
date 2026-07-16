"use client";

import { useState } from "react";
import ResultsLayout from "@/components/ResultsLayout";

type ArtPiece = {
  title: string;
  emoji: string;       // placeholder until a real photo is added
  image?: string;      // e.g. "/art/resin-rose.jpg" once photos are in public/art/
  gradient: string;
  height: number;      // varied heights for the masonry feel
};

// Swap `emoji`/`gradient` for real photos by adding `image: "/art/file.jpg"`
const PIECES: ArtPiece[] = [
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

export default function ArtPage() {
  const [open, setOpen] = useState<ArtPiece | null>(null);

  return (
    <ResultsLayout placeholder="Aaleeyah's Art" activeTab="Images" resultsCount={PIECES.length}>
      <div className="artGrid">
        {PIECES.map((p) => (
          <button key={p.title} className="artTile" onClick={() => setOpen(p)}>
            <span className="thumb" style={{ height: p.height, background: p.image ? undefined : p.gradient }}>
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt={p.title} />
              ) : (
                <span aria-hidden="true">{p.emoji}</span>
              )}
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
              {open.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={open.image} alt={open.title} />
              ) : (
                <span aria-hidden="true">{open.emoji}</span>
              )}
            </div>
            <div className="lightboxTitle">{open.title}</div>
            <div className="source pixel" style={{ color: "#666", fontSize: "0.85rem" }}>aaleeyah.net › madedhd</div>
          </div>
        </div>
      )}
    </ResultsLayout>
  );
}
