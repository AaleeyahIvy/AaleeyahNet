"use client";

import { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";

const COLORS = ["#f463b1", "#f5a34b", "#f7d54b", "#4b9df5", "#4bc97a"];

/** Opt-in pixel sparkle trail — pure 2003 web energy. */
export default function CursorTrail() {
  const enabledRef = useRef(false);
  const lastRef = useRef(0);

  useEffect(() => {
    enabledRef.current = localStorage.getItem("aaleeyah-trail") === "true";
    const onToggle = (e: Event) => {
      enabledRef.current = (e as CustomEvent).detail === true;
    };
    window.addEventListener("aaleeyah:trail", onToggle);

    const onMove = (e: MouseEvent) => {
      if (!enabledRef.current) return;
      const now = performance.now();
      if (now - lastRef.current < 35) return; // throttle
      lastRef.current = now;

      const d = document.createElement("span");
      const size = 4 + Math.random() * 5;
      d.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:${size}px;height:${size}px;background:${COLORS[Math.floor(Math.random() * COLORS.length)]};z-index:200;pointer-events:none;image-rendering:pixelated;`;
      document.body.appendChild(d);
      anime({
        targets: d,
        translateY: 18 + Math.random() * 22,
        translateX: (Math.random() - 0.5) * 26,
        opacity: [1, 0],
        duration: 650,
        easing: "easeOutQuad",
        complete: () => d.remove(),
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("aaleeyah:trail", onToggle);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return null;
}
