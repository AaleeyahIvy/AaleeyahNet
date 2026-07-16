"use client";

import { useEffect } from "react";

/** Restores the visitor's accent color + dark mode choice on every page. */
export default function ThemeAccent() {
  useEffect(() => {
    const saved = localStorage.getItem("aaleeyah-accent");
    if (saved) document.documentElement.style.setProperty("--accent", saved);
    if (localStorage.getItem("aaleeyah-dark") === "true") {
      document.documentElement.classList.add("dark");
    }
  }, []);
  return null;
}
