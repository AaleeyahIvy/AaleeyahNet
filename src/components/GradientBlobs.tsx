"use client";

import { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";

// Soft rainbow blobs that slowly drift around behind the page,
// matching the airbrushed gradient spots in the Figma design.
const BLOBS = [
  { color: "#f463b1", size: 340, top: "-6%", left: "-8%" },
  { color: "#f5a34b", size: 300, top: "2%", left: "18%" },
  { color: "#4b9df5", size: 360, top: "-4%", left: "68%" },
  { color: "#4bc97a", size: 300, top: "16%", left: "86%" },
  { color: "#f7d54b", size: 320, top: "38%", left: "-10%" },
  { color: "#4b9df5", size: 300, top: "48%", left: "30%" },
  { color: "#f463b1", size: 340, top: "62%", left: "72%" },
  { color: "#f5a34b", size: 300, top: "80%", left: "8%" },
  { color: "#4bc97a", size: 320, top: "84%", left: "44%" },
  { color: "#f7d54b", size: 280, top: "70%", left: "-6%" },
];

export default function GradientBlobs() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!layerRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const blobs = layerRef.current.querySelectorAll<HTMLElement>(".blob");
    const animations: anime.AnimeInstance[] = [];

    blobs.forEach((el) => {
      const drift = () => {
        const a = anime({
          targets: el,
          translateX: anime.random(-90, 90),
          translateY: anime.random(-90, 90),
          scale: anime.random(85, 115) / 100,
          duration: anime.random(9000, 16000),
          easing: "easeInOutSine",
          complete: drift,
        });
        animations.push(a);
      };
      drift();
    });

    return () => animations.forEach((a) => a.pause());
  }, []);

  return (
    <div className="blobLayer" ref={layerRef} aria-hidden="true">
      {BLOBS.map((b, i) => (
        <span
          key={i}
          className="blob"
          style={{
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
          }}
        />
      ))}
    </div>
  );
}
