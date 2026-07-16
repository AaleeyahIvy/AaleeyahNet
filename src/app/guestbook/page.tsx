"use client";

import { useEffect, useState } from "react";
import ResultsLayout from "@/components/ResultsLayout";
import ShimmerCard from "@/components/ShimmerCard";
import PixelIcon from "@/components/PixelIcon";
import { validateEntry } from "@/lib/validate";

type Entry = { name: string; message: string; ts: number };

export default function GuestbookPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/guestbook")
      .then((r) => r.json())
      .then((d) => setEntries(d.entries ?? []))
      .catch(() => {});
  }, []);

  const submit = async () => {
    // client-side check for instant feedback — the API re-validates everything
    const check = validateEntry(name, message);
    if (!check.ok) {
      setError(check.error);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: check.name, message: check.message, website: "" }),
      });
      const d = await res.json();
      if (!res.ok) {
        setError(d.error ?? "Something went wrong.");
      } else {
        setEntries((e) => [d.entry, ...e]);
        setName("");
        setMessage("");
        setSent(true);
        setTimeout(() => setSent(false), 3000);
      }
    } catch {
      setError("Couldn't reach the guestbook, try again!");
    }
    setBusy(false);
  };

  return (
    <ResultsLayout placeholder="Aaleeyah's Guestbook" resultsCount={entries.length}>
      <ShimmerCard className="guestForm">
        <div className="pixel" style={{ fontWeight: 700, fontSize: "1.3rem", marginBottom: 12 }}>
          sign the guestbook! <PixelIcon name="pencil" cell={3} inline />
        </div>
        <input
          className="guestInput"
          placeholder="your name"
          maxLength={30}
          value={name}
          onChange={(e) => { setName(e.target.value); setError(null); }}
          aria-label="Your name"
        />
        <textarea
          className="guestInput"
          placeholder="leave a little note… (140 chars)"
          maxLength={140}
          rows={3}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setError(null); }}
          aria-label="Your message"
        />
        {/* honeypot for bots — hidden from real visitors */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} aria-hidden="true" />
        {error && <div className="guestError">{error}</div>}
        {sent && <div className="guestSent pixel">thanks for signing! <PixelIcon name="heart" cell={2} inline /></div>}
        <button className="guestSubmit pixel" onClick={submit} disabled={busy}>
          {busy ? "sending…" : "sign it"}
        </button>
      </ShimmerCard>

      {entries.map((e) => (
        <ShimmerCard key={e.ts} className="guestEntry">
          <div className="pixel guestName">{e.name}</div>
          <p className="guestMsg">{e.message}</p>
          <div className="guestDate">
            {new Date(e.ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </ShimmerCard>
      ))}
      {entries.length === 0 && (
        <ShimmerCard className="emptyState">
          <div className="big">No signatures yet…</div>
          <p>Be the first to sign!</p>
        </ShimmerCard>
      )}
    </ResultsLayout>
  );
}
