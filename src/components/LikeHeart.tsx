"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";
import ShimmerCard from "./ShimmerCard";

// Pixel heart drawn on a grid (1 = filled cell)
const HEART = [
  [0, 1, 1, 0, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
];
const CELL = 12;

export default function LikeHeart() {
  const [likes, setLikes] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const heartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    setLiked(localStorage.getItem("aaleeyah-liked") === "true");
    fetch("/api/likes")
      .then((r) => r.json())
      .then((d) => setLikes(d.likes))
      .catch(() => setLikes(5000));
  }, []);

  const like = async () => {
    if (liked) return;
    setLiked(true);
    localStorage.setItem("aaleeyah-liked", "true");
    setLikes((n) => (n ?? 0) + 1);
    window.dispatchEvent(new CustomEvent("aaleeyah:hearted"));

    anime({
      targets: heartRef.current,
      scale: [1, 1.35, 1],
      rotate: [0, -6, 6, 0],
      duration: 700,
      easing: "easeInOutBack",
    });

    try {
      const res = await fetch("/api/likes", { method: "POST" });
      const d = await res.json();
      setLikes(d.likes);
    } catch {
      /* keep optimistic count */
    }
  };

  return (
    <ShimmerCard
      className="heartCard"
      role="button"
      tabIndex={0}
      onClick={like}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && like()}
      ariaLabel={liked ? "You've hearted this portfolio" : "Heart this portfolio"}
    >
      <svg
        ref={heartRef}
        className="pixelSvg"
        width={HEART[0].length * CELL}
        height={HEART.length * CELL}
        aria-hidden="true"
      >
        {HEART.flatMap((row, y) =>
          row.map((v, x) =>
            v ? (
              <rect
                key={`${x}-${y}`}
                x={x * CELL}
                y={y * CELL}
                width={CELL - 1}
                height={CELL - 1}
                fill={liked ? "#f463b1" : "#111"}
              />
            ) : null
          )
        )}
      </svg>
      <div className="likeCount">
        {likes === null ? "…" : likes.toLocaleString()} Likes
      </div>
      {!liked && <div style={{ fontSize: "0.8rem", fontStyle: "italic", marginTop: 4 }}>click to heart!</div>}
    </ShimmerCard>
  );
}
