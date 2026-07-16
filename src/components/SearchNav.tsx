"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PixelIcon from "./PixelIcon";
import { searchSite, SEARCH_INDEX } from "@/lib/searchIndex";

const LOADING_LINES = [
  "fetching results…", "asking the cats…", "searching the pixelverse…",
  "warming up the gradients…", "consulting the guestbook…",
];

/**
 * The search bar IS the navigation — and now it's a real search.
 * Type to filter the site; Enter opens the top result. Navigation shows a
 * fake search-engine loading state because the retro web deserves drama.
 */
export default function SearchNav({ placeholder = "Search Aaleeyah.net" }: { placeholder?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const results = searchSite(query);

  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new CustomEvent("aaleeyah:searched"));
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const navigate = (href: string) => {
    setOpen(false);
    const line = LOADING_LINES[Math.floor(Math.random() * LOADING_LINES.length)];
    const secs = (Math.random() * 0.6 + 0.15).toFixed(2);
    setLoading(`${line} (${secs} seconds)`);
    setTimeout(() => {
      router.push(href);
      setTimeout(() => setLoading(null), 400);
    }, 550);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (results.length > 0) navigate(results[0].href);
    }
  };

  return (
    <div className="searchWrap" ref={wrapRef}>
      <div className="searchBar">
        <PixelIcon name="bookmark" cell={3} />
        <input
          className="searchInput"
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          aria-label="Search the site"
        />
        <PixelIcon name="magnifier" cell={3} />
      </div>

      {open && (
        <nav className="searchMenu" role="menu">
          {results.map((r) => (
            <a
              key={r.href}
              role="menuitem"
              href={r.href}
              onClick={(e) => { e.preventDefault(); navigate(r.href); }}
            >
              <span className="menuIco"><PixelIcon name={r.icon} cell={3} /></span>
              <span className="resultLabel">
                {r.label}
                <span className="resultSub">{r.sub}</span>
              </span>
            </a>
          ))}
          {results.length === 0 && (
            <div className="noResults">
              <div className="pixel" style={{ fontWeight: 600 }}>0 results for &ldquo;{query}&rdquo;</div>
              <a href="/resume" onClick={(e) => { e.preventDefault(); navigate("/resume"); }}>
                did you mean: <em>hire Aaleeyah</em>? →
              </a>
            </div>
          )}
          {query.trim() === "" && (
            <div className="hint">I&apos;m feeling lucky? Every page is a good result.</div>
          )}
        </nav>
      )}

      {loading && (
        <div className="loadingOverlay" aria-live="polite">
          <div className="loadingBox">
            <PixelIcon name="magnifier" cell={4} />
            <span className="pixel">{loading}</span>
            <span className="loadingDots"><i /><i /><i /></span>
          </div>
        </div>
      )}
    </div>
  );
}

export { SEARCH_INDEX };
