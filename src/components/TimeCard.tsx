"use client";

import { useEffect, useState } from "react";
import ShimmerCard from "./ShimmerCard";

/** Live local clock — time plus day, month, and year. */
export default function TimeCard() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <ShimmerCard style={{ textAlign: "center" }}>
      <div className="pixel timeBig">
        {now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
      </div>
      <div className="timeDate">
        {now
          ? now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric", year: "numeric" })
          : "\u00A0"}
      </div>
    </ShimmerCard>
  );
}
