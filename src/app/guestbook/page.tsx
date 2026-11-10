"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ResultsLayout from "@/components/ResultsLayout";
import ShimmerCard from "@/components/ShimmerCard";
import PixelIcon from "@/components/PixelIcon";
import DrawingPad, { DrawingPadHandle } from "@/components/DrawingPad";
import { MSG_MAX, REPLY_MAX, validateEntry } from "@/lib/validate";
import type { PublicEntry } from "@/lib/guestbook";

type Reply = PublicEntry["replies"][number];

const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

/** Hidden field real people never fill in — bots usually do. */
function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="text"
      name="website"
      tabIndex={-1}
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ position: "absolute", left: "-9999px", width: 1, height: 1 }}
      aria-hidden="true"
    />
  );
}

async function post(url: string, body: object) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, data };
}

function ReplyForm({
  entryId,
  token,
  onDone,
  onCancel,
}: {
  entryId: string;
  token: string;
  onDone: (r: Reply) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateEntry(name, message, { max: REPLY_MAX });
    if (!check.ok) return setError(check.error);
    setBusy(true);
    setError(null);
    try {
      const { ok, data } = await post("/api/guestbook/reply", {
        entryId, name: check.name, message: check.message, token, website: trap,
      });
      if (ok) onDone(data.reply);
      else setError(data.error ?? "Something went wrong.");
    } catch {
      setError("Couldn't reach the guestbook, try again!");
    }
    setBusy(false);
  };

  return (
    <form className="replyForm" onSubmit={submit}>
      <input
        className="guestInput"
        placeholder="your name"
        maxLength={30}
        value={name}
        onChange={(e) => { setName(e.target.value); setError(null); }}
        aria-label="Your name"
        autoFocus
      />
      <textarea
        className="guestInput"
        placeholder={`write a reply… (${REPLY_MAX} chars)`}
        maxLength={REPLY_MAX}
        rows={2}
        value={message}
        onChange={(e) => { setMessage(e.target.value); setError(null); }}
        aria-label="Your reply"
      />
      <Honeypot value={trap} onChange={setTrap} />
      {error && <div className="guestError" role="alert">{error}</div>}
      <div className="replyActions">
        <button className="btn btnPink btnSmall" type="submit" disabled={busy}>
          {busy ? "sending…" : "reply"}
        </button>
        <button className="btn btnSmall" type="button" onClick={onCancel}>cancel</button>
      </div>
    </form>
  );
}

export default function GuestbookPage() {
  const [entries, setEntries] = useState<PublicEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [token, setToken] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState("");
  const [withDrawing, setWithDrawing] = useState(false);
  const [hasDrawing, setHasDrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<null | "live" | "pending">(null);
  const [busy, setBusy] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const padRef = useRef<DrawingPadHandle>(null);

  const load = useCallback(() => {
    fetch("/api/guestbook", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setEntries(d.entries ?? []);
        setToken(d.token ?? "");
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(load, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const drawing = withDrawing ? padRef.current?.toDataURL() ?? null : null;
    // client-side check for instant feedback — the API re-validates everything
    const check = validateEntry(name, message, { allowEmptyMessage: !!drawing });
    if (!check.ok) return setError(check.error);
    if (withDrawing && !drawing && !check.message) return setError("Draw something or write a note!");

    setBusy(true);
    setError(null);
    try {
      const { ok, data } = await post("/api/guestbook", {
        name: check.name, message: check.message, drawing, token, website: trap,
      });
      if (!ok) {
        setError(data.error ?? "Something went wrong.");
      } else {
        if (!data.pending) setEntries((list) => [data.entry, ...list]);
        setName("");
        setMessage("");
        padRef.current?.clear();
        setSent(data.pending ? "pending" : "live");
        setTimeout(() => setSent(null), data.pending ? 8000 : 3500);
      }
    } catch {
      setError("Couldn't reach the guestbook, try again!");
    }
    setBusy(false);
  };

  const addReply = (entryId: string, reply: Reply) => {
    setEntries((list) => list.map((e) => (e.id === entryId ? { ...e, replies: [...e.replies, reply] } : e)));
    setReplyingTo(null);
  };

  return (
    <ResultsLayout placeholder="Aaleeyah's Guestbook" resultsCount={entries.length}>
      <ShimmerCard className="guestForm">
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div className="pixel" style={{ fontWeight: 700, fontSize: "1.3rem" }}>
            sign the guestbook! <PixelIcon name="pencil" cell={3} inline />
          </div>

          <div className="guestModeRow" role="group" aria-label="What do you want to leave?">
            <button type="button" className="btn btnSmall" aria-pressed={!withDrawing} onClick={() => setWithDrawing(false)}>
              ✍️ write a note
            </button>
            <button type="button" className="btn btnSmall" aria-pressed={withDrawing} onClick={() => setWithDrawing(true)}>
              🎨 draw something
            </button>
          </div>

          <input
            className="guestInput"
            placeholder="your name"
            maxLength={30}
            value={name}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            aria-label="Your name"
          />

          {withDrawing && <DrawingPad ref={padRef} onChange={setHasDrawing} />}

          <textarea
            className="guestInput"
            placeholder={withDrawing ? "add a caption (optional)" : `leave a little note… (${MSG_MAX} chars)`}
            maxLength={MSG_MAX}
            rows={withDrawing ? 2 : 3}
            value={message}
            onChange={(e) => { setMessage(e.target.value); setError(null); }}
            aria-label="Your message"
          />
          <div className="charCount" aria-hidden="true">{[...message].length}/{MSG_MAX}</div>

          <Honeypot value={trap} onChange={setTrap} />
          {error && <div className="guestError" role="alert">{error}</div>}
          {sent === "live" && (
            <div className="guestSent pixel" role="status">thanks for signing! <PixelIcon name="heart" cell={2} inline /></div>
          )}
          {sent === "pending" && (
            <div className="guestPending pixel" role="status">
              thanks! your drawing will show up once Aaleeyah gives it a look ✨
            </div>
          )}
          <button className="guestSubmit pixel" type="submit" disabled={busy || !token || (withDrawing && !hasDrawing && !message.trim())}>
            {busy ? "sending…" : "sign it"}
          </button>
          <p style={{ fontSize: "0.75rem", fontStyle: "italic", opacity: 0.65 }}>
            Be kind! Links and explicit language are filtered, and drawings are reviewed before they appear.
          </p>
        </form>
      </ShimmerCard>

      {entries.map((e) => (
        <ShimmerCard key={e.id} className="guestEntry">
          <div className="pixel guestName">
            {e.name}
            {e.admin && <span className="adminBadge">✦ site owner</span>}
          </div>
          {e.drawing && (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="guestDrawing" src={e.drawing} alt={`Drawing by ${e.name}`} loading="lazy" width={640} height={400} />
          )}
          {e.message && <p className="guestMsg">{e.message}</p>}
          <div className="guestDate">{fmtDate(e.ts)}</div>

          {e.replies.length > 0 && (
            <div className="replies">
              {e.replies.map((r) => (
                <div key={r.id} className="reply">
                  <div className="pixel guestName">
                    {r.name}
                    {r.admin && <span className="adminBadge">✦ site owner</span>}
                  </div>
                  <p className="guestMsg">{r.message}</p>
                  <div className="guestDate">{fmtDate(r.ts)}</div>
                </div>
              ))}
            </div>
          )}

          {replyingTo === e.id ? (
            <ReplyForm entryId={e.id} token={token} onDone={(r) => addReply(e.id, r)} onCancel={() => setReplyingTo(null)} />
          ) : (
            <div className="replyActions">
              <button className="btn btnSmall" onClick={() => setReplyingTo(e.id)} disabled={!token}>
                ↩ reply
              </button>
            </div>
          )}
        </ShimmerCard>
      ))}
      {loaded && entries.length === 0 && (
        <ShimmerCard className="emptyState">
          <div className="big">No signatures yet…</div>
          <p>Be the first to sign!</p>
        </ShimmerCard>
      )}
    </ResultsLayout>
  );
}
