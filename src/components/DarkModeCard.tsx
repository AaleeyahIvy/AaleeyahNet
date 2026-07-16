"use client";

import { useEffect, useState } from "react";
import ShimmerCard from "./ShimmerCard";
import PixelIcon from "./PixelIcon";

/** "is this too bright for you?" — a toggle that flips the whole site dark. */
export default function DarkModeCard() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("aaleeyah-dark") === "true");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("aaleeyah-dark", String(next));
  };

  return (
    <ShimmerCard>
      <div className="darkRow">
        <span className="pixel" style={{ fontWeight: 600 }}>
          is this too bright for you? <PixelIcon name={dark ? "moon" : "sun"} cell={3} inline />
        </span>
        <button
          className={`toggle ${dark ? "on" : ""}`}
          onClick={toggle}
          role="switch"
          aria-checked={dark}
          aria-label="Toggle dark mode"
        >
          <span className="toggleKnob" />
        </button>
      </div>
    </ShimmerCard>
  );
}
