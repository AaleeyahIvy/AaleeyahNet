"use client";

import { useEffect, useState } from "react";
import ShimmerCard from "./ShimmerCard";
import { applyAccent } from "./ThemeAccent";

const COLORS = [
  { name: "pink", value: "#f463b1" },
  { name: "yellow", value: "#f7d54b" },
  { name: "blue", value: "#4b9df5" },
  { name: "green", value: "#4bc97a" },
];
/**
 * Clicking a dot re-themes the search bar AND every card (border, tint,
 * shadow). Clicking the active dot again resets it to black. Choice persists across pages via localStorage
 * (ThemeAccent restores it on every page load).
 */
export default function ColorDots() {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    setActive(localStorage.getItem("aaleeyah-accent"));
  }, []);

  const pick = (value: string) => {
    const next = active === value ? null : value;
    setActive(next);
    applyAccent(next);
    try {
      if (next) localStorage.setItem("aaleeyah-accent", next);
      else localStorage.removeItem("aaleeyah-accent");
    } catch {}
  };

  return (
    <ShimmerCard>
      <div className="dotRow">
        {COLORS.map((c) => (
          <button
            key={c.name}
            className={`dot ${active === c.value ? "activeDot" : ""}`}
            style={{ background: c.value }}
            onClick={() => pick(c.value)}
            aria-label={`Theme the search bar and cards ${c.name}`}
            aria-pressed={active === c.value}
          />
        ))}
      </div>
      <div className="dotHint">click a color to theme the search bar + cards</div>
    </ShimmerCard>
  );
}
