"use client";

import { useEffect, useState } from "react";
import ShimmerCard from "./ShimmerCard";

const ITEMS = [
  { id: "heart", label: "Heart the portfolio!" },
  { id: "search", label: "Search Aaleeyah.Net" },
  { id: "projects", label: "Peek at a project" },
  { id: "vibes", label: "Enjoy the vibes" },
];

export default function Checklist() {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      setDone(JSON.parse(localStorage.getItem("aaleeyah-checklist") || "{}"));
    } catch {}

    const check = (id: string) => () =>
      setDone((d) => {
        const next = { ...d, [id]: true };
        localStorage.setItem("aaleeyah-checklist", JSON.stringify(next));
        return next;
      });

    const onHeart = check("heart");
    const onSearch = check("search");
    window.addEventListener("aaleeyah:hearted", onHeart);
    window.addEventListener("aaleeyah:searched", onSearch);
    return () => {
      window.removeEventListener("aaleeyah:hearted", onHeart);
      window.removeEventListener("aaleeyah:searched", onSearch);
    };
  }, []);

  const toggle = (id: string) =>
    setDone((d) => {
      const next = { ...d, [id]: !d[id] };
      localStorage.setItem("aaleeyah-checklist", JSON.stringify(next));
      return next;
    });

  return (
    <ShimmerCard>
      <div className="checklist">
        {ITEMS.map((it) => (
          <label key={it.id} className={`checkItem ${done[it.id] ? "done" : ""}`}>
            <input
              type="checkbox"
              checked={!!done[it.id]}
              onChange={() => toggle(it.id)}
            />
            {it.label}
          </label>
        ))}
      </div>
    </ShimmerCard>
  );
}
