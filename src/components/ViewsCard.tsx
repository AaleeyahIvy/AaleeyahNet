"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";
import ShimmerCard from "./ShimmerCard";
import PixelIcon from "./PixelIcon";

type Day = { date: string; count: number };

/**
 * Live daily views chart. Counts one view per visitor session per day,
 * shows the last 7 days as animated bars (today in pink), and computes
 * the average views/day underneath.
 */
export default function ViewsCard() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [total, setTotal] = useState(0);
  const barsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counted = sessionStorage.getItem("aaleeyah-view-counted");
    fetch("/api/views", { method: counted ? "GET" : "POST" })
      .then((r) => r.json())
      .then((d) => {
        setDays(d.days);
        setTotal(d.total);
        if (!counted) sessionStorage.setItem("aaleeyah-view-counted", "true");
      })
      .catch(() => setDays([]));
  }, []);

  useEffect(() => {
    if (!days || !barsRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    anime({
      targets: barsRef.current.querySelectorAll(".barFill"),
      scaleY: [0, 1],
      delay: anime.stagger(70),
      duration: 600,
      easing: "easeOutQuad",
    });
  }, [days]);

  const max = Math.max(1, ...(days ?? []).map((d) => d.count));
  const avg = days && days.length ? (days.reduce((a, d) => a + d.count, 0) / days.length) : 0;
  const todayKey = new Date().toISOString().slice(0, 10);

  return (
    <ShimmerCard>
      <div className="pixel" style={{ fontWeight: 700, fontSize: "1.6rem" }}>
        Total <span style={{ fontSize: "0.9rem", fontWeight: 400 }}>
          views <PixelIcon name="eye" cell={3} inline />
        </span>
        {total > 0 && <span className="chartTotal">{total.toLocaleString()}</span>}
      </div>

      <div className="chartBars" ref={barsRef} aria-label="Views over the last 7 days">
        {(days ?? Array.from({ length: 7 }, (_, i) => ({ date: String(i), count: 0 }))).map((d) => {
          const isToday = d.date === todayKey;
          const pct = Math.max(6, Math.round((d.count / max) * 100));
          const weekday = /^\d{4}/.test(d.date)
            ? "SMTWTFS"[new Date(d.date + "T12:00:00Z").getUTCDay()]
            : "·";
          return (
            <div key={d.date} className="chartCol" title={`${d.count} view${d.count === 1 ? "" : "s"}`}>
              <span
                className={`barFill ${isToday ? "barToday" : ""}`}
                style={{ height: `${pct}%` }}
              />
              <span className="dayLbl pixel">{weekday}</span>
            </div>
          );
        })}
      </div>

      <div className="chartAvg pixel">
        avg {avg >= 10 ? Math.round(avg) : avg.toFixed(1)} views/day
      </div>
    </ShimmerCard>
  );
}
