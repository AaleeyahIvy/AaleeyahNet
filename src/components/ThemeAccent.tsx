"use client";

import { useEffect } from "react";

/**
 * Sets (or clears) the accent color. `html.accented` turns on the card
 * theming in globals.css so the default look stays black-and-white.
 */
export function applyAccent(color: string | null) {
  const root = document.documentElement;
  if (color) {
    root.style.setProperty("--accent", color);
    root.classList.add("accented");
  } else {
    root.style.removeProperty("--accent");
    root.classList.remove("accented");
  }
}

/** Restores the visitor's accent color + dark mode choice on every page. */
export default function ThemeAccent() {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aaleeyah-accent");
      if (saved && /^#[0-9a-f]{6}$/i.test(saved)) applyAccent(saved);
      if (localStorage.getItem("aaleeyah-dark") === "true") {
        document.documentElement.classList.add("dark");
      }
    } catch {}
  }, []);
  return null;
}
