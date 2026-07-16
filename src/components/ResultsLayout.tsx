"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import anime from "animejs/lib/anime.es.js";
import SearchNav from "./SearchNav";

const TABS = ["All", "Images", "Videos", "Shopping", "Books"];

export default function ResultsLayout({
  placeholder,
  activeTab = "All",
  resultsCount,
  children,
}: {
  placeholder: string;
  activeTab?: string;
  resultsCount?: number;
  children: ReactNode;
}) {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [secs, setSecs] = useState<string | null>(null);

  useEffect(() => {
    setSecs((Math.random() * 0.6 + 0.12).toFixed(2));
  }, []);

  // Results "load in" like a search page rendering
  useEffect(() => {
    if (!bodyRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    anime({
      targets: bodyRef.current.children,
      opacity: [0, 1],
      translateY: [24, 0],
      delay: anime.stagger(110),
      duration: 550,
      easing: "easeOutQuad",
    });
  }, []);

  return (
    <main>
      <header className="resultsHeader">
        <Link href="/" className="miniLogo">
          <span style={{ fontSize: "1.7rem" }}>A</span>aleeyah<span style={{ fontWeight: 400 }}>.net</span>
        </Link>
        <SearchNav placeholder={placeholder} />
      </header>

      <div className="tabs" aria-hidden="true">
        {TABS.map((t) => (
          <span key={t} className={`tab ${t === activeTab ? "active" : ""}`}>
            {t}
          </span>
        ))}
      </div>

      {resultsCount !== undefined && secs && (
        <div className="resultsMeta">
          About {resultsCount} result{resultsCount === 1 ? "" : "s"} ({secs} seconds)
        </div>
      )}

      <div className="resultsBody" ref={bodyRef}>
        {children}
      </div>
    </main>
  );
}
