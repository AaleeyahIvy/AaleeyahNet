"use client";

import { useEffect, useState } from "react";
import ShimmerCard from "./ShimmerCard";
import PixelIcon from "./PixelIcon";

/** Toggle for the cursor sparkle trail (off by default — courtesy first). */
export default function SparkleCard() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(localStorage.getItem("aaleeyah-trail") === "true");
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    localStorage.setItem("aaleeyah-trail", String(next));
    window.dispatchEvent(new CustomEvent("aaleeyah:trail", { detail: next }));
  };

  return (
    <ShimmerCard>
      <div className="darkRow">
        <span className="pixel" style={{ fontWeight: 600 }}>
          cursor sparkles? <PixelIcon name="star" cell={3} inline />
        </span>
        <button
          className={`toggle ${on ? "on" : ""}`}
          onClick={toggle}
          role="switch"
          aria-checked={on}
          aria-label="Toggle cursor sparkle trail"
        >
          <span className="toggleKnob" />
        </button>
      </div>
    </ShimmerCard>
  );
}
