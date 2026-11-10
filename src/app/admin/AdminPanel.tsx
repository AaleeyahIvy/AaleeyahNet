"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShimmerCard from "@/components/ShimmerCard";
import type { PublicPhoto } from "@/lib/gallery";
import type { PublicEntry } from "@/lib/guestbook";

type AdminEntry = PublicEntry & { approved: boolean };
type Msg = { kind: "ok" | "err"; text: string } | null;

async function api(url: string, init: RequestInit = {}) {
  const res = await fetch(url, { cache: "no-store", ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}
const json = (method: string, body: object): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

function Note({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return <div className={`adminMsg ${msg.kind}`} role={msg.kind === "err" ? "alert" : "status"}>{msg.text}</div>;
}

/* ------------------------------------------------------------------ */

function Login({ onIn }: { onIn: () => void }) {
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api("/api/admin/auth", json("POST", { password }));
      setPassword("");
      onIn();
    } catch (err) {
      setMsg({ kind: "err", text: (err as Error).message });
    }
    setBusy(false);
  };
  return (
    <ShimmerCard className="adminSection">
      <h2>Sign in</h2>
      <form onSubmit={submit} className="adminRow">
        <input
          type="password"
          className="guestInput"
          style={{ maxWidth: 320 }}
          placeholder="admin password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-label="Admin password"
          autoFocus
        />
        <button className="btn btnPink" disabled={busy || !password}>{busy ? "checking…" : "sign in"}</button>
      </form>
      <Note msg={msg} />
    </ShimmerCard>
  );
}

/* ------------------------------------------------------------------ */

function FilePicker({
  accept, multiple, label, onFiles,
}: { accept: string; multiple?: boolean; label: string; onFiles: (f: File[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      className={`fileDrop ${over ? "over" : ""}`}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && input.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)); }}
      role="button"
      tabIndex={0}
    >
      {label}
      <input
        ref={input}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => { onFiles(Array.from(e.target.files ?? [])); e.target.value = ""; }}
      />
    </div>
  );
}

function GallerySection() {
  const [photos, setPhotos] = useState<PublicPhoto[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api("/api/gallery").then((d) => setPhotos(d.photos)).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const upload = async () => {
    setBusy(true);
    setMsg(null);
    const form = new FormData();
    files.forEach((f) => form.append("files", f));
    form.append("title", title);
    try {
      const res = await fetch("/api/admin/gallery", { method: "POST", body: form });
      const d = await res.json().catch(() => ({}));
      const errs: string[] = d.errors ?? (d.error ? [d.error] : []);
      if (d.added?.length) {
        setFiles([]);
        setTitle("");
        load();
      }
      setMsg(
        errs.length
          ? { kind: "err", text: `${d.added?.length ?? 0} uploaded. Problems: ${errs.join("; ")}` }
          : { kind: "ok", text: `${d.added.length} photo${d.added.length === 1 ? "" : "s"} added to the gallery!` }
      );
    } catch {
      setMsg({ kind: "err", text: "Upload failed — check your connection." });
    }
    setBusy(false);
  };

  const rename = async (id: string, t: string) => {
    try {
      await api("/api/admin/gallery", json("PATCH", { id, title: t }));
      setMsg({ kind: "ok", text: "Title saved." });
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    }
  };

  const remove = async (p: PublicPhoto) => {
    if (!confirm(`Delete "${p.title}" from the gallery?`)) return;
    try {
      await api(`/api/admin/gallery?id=${encodeURIComponent(p.id)}`, { method: "DELETE" });
      setPhotos((list) => list.filter((x) => x.id !== p.id));
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    }
  };

  return (
    <ShimmerCard className="adminSection">
      <h2>🖼️ Art gallery</h2>
      <p>
        JPEG, PNG, GIF or WebP, up to 15&nbsp;MB each (10 at a time). Every image is
        checked and re-saved as a clean WebP, which removes hidden data and
        location info. SVGs and other file types are refused.
      </p>
      <FilePicker
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        label={files.length ? `${files.length} selected: ${files.map((f) => f.name).join(", ")}` : "click or drop photos here"}
        onFiles={setFiles}
      />
      <div className="adminRow">
        <input
          className="guestInput"
          style={{ flex: 1, minWidth: 200 }}
          placeholder="title (optional, else the file name is used)"
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Photo title"
        />
        <button className="btn btnPink" onClick={upload} disabled={busy || files.length === 0}>
          {busy ? "uploading…" : "upload"}
        </button>
      </div>
      <Note msg={msg} />
      {photos.length > 0 && (
        <div className="adminGrid">
          {photos.map((p) => (
            <div key={p.id} className="adminPhoto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.src} alt={p.title} loading="lazy" />
              <div className="meta">
                <input
                  className="guestInput"
                  style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                  defaultValue={p.title}
                  maxLength={120}
                  aria-label="Photo title"
                  onBlur={(e) => e.target.value.trim() && e.target.value !== p.title && rename(p.id, e.target.value)}
                />
                <button className="btn btnSmall btnDanger" onClick={() => remove(p)}>delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ShimmerCard>
  );
}

/* ------------------------------------------------------------------ */

function ResumeSection() {
  const [status, setStatus] = useState<Record<string, string | null>>({});
  const [msg, setMsg] = useState<Msg>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => api("/api/admin/resume").then((d) => setStatus(d.status)).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const upload = async (files: File[]) => {
    setBusy(true);
    setMsg(null);
    const done: string[] = [];
    for (const f of files.slice(0, 2)) {
      const form = new FormData();
      form.append("file", f);
      try {
        const d = await api("/api/admin/resume", { method: "POST", body: form });
        done.push(d.format.toUpperCase());
      } catch (e) {
        setMsg({ kind: "err", text: `${f.name}: ${(e as Error).message}` });
      }
    }
    if (done.length) setMsg({ kind: "ok", text: `Resume updated (${done.join(" + ")}). It's live on /resume now.` });
    load();
    setBusy(false);
  };

  const remove = async (format: string) => {
    if (!confirm(`Remove the ${format.toUpperCase()} resume?`)) return;
    await api(`/api/admin/resume?format=${format}`, { method: "DELETE" }).catch(() => {});
    load();
  };

  return (
    <ShimmerCard className="adminSection">
      <h2>📄 Resume</h2>
      <p>
        Upload a PDF and/or a Word (.docx) file. Visitors get a download button
        for each one you&apos;ve uploaded. Uploading again replaces the old file.
      </p>
      <FilePicker
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        label={busy ? "uploading…" : "click or drop your resume (PDF and/or .docx)"}
        onFiles={upload}
      />
      <Note msg={msg} />
      <ul style={{ paddingLeft: 18 }}>
        {(["pdf", "docx"] as const).map((f) => (
          <li key={f}>
            <strong>{f.toUpperCase()}:</strong>{" "}
            {status[f] ? (
              <>
                live (updated {new Date(status[f]!).toLocaleString()}) ·{" "}
                <a href={`/api/resume/${f}`}>download</a> ·{" "}
                <button className="btn btnSmall btnDanger" onClick={() => remove(f)}>remove</button>
              </>
            ) : (
              "not uploaded"
            )}
          </li>
        ))}
      </ul>
    </ShimmerCard>
  );
}

/* ------------------------------------------------------------------ */

function GuestbookSection() {
  const [entries, setEntries] = useState<AdminEntry[]>([]);
  const [msg, setMsg] = useState<Msg>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const load = useCallback(() => api("/api/admin/guestbook").then((d) => setEntries(d.entries)).catch(() => {}), []);
  useEffect(() => { load(); }, [load]);

  const act = async (body: object, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    try {
      await api("/api/admin/guestbook", json("POST", body));
      load();
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    }
  };

  const reply = async (id: string) => {
    try {
      await api("/api/guestbook/reply", json("POST", { entryId: id, message: replyText[id] ?? "" }));
      setReplyText((r) => ({ ...r, [id]: "" }));
      load();
    } catch (e) {
      setMsg({ kind: "err", text: (e as Error).message });
    }
  };

  const pending = entries.filter((e) => !e.approved);
  const live = entries.filter((e) => e.approved);

  const render = (e: AdminEntry) => (
    <div key={e.id} className={`adminEntry ${e.approved ? "" : "pending"}`}>
      <div className="pixel" style={{ fontWeight: 700 }}>
        {e.name} <span style={{ fontWeight: 400, fontSize: "0.8rem", opacity: 0.7 }}>· {new Date(e.ts).toLocaleString()}</span>
      </div>
      {e.drawing && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="guestDrawing" src={e.drawing} alt={`Drawing by ${e.name}`} />
      )}
      {e.message && <div className="guestMsg">{e.message}</div>}
      {e.replies.map((r) => (
        <div key={r.id} className="adminRow" style={{ fontSize: "0.85rem", paddingLeft: 12 }}>
          <span>↳ <strong>{r.name}:</strong> {r.message}</span>
          <button className="btn btnSmall btnDanger" onClick={() => act({ action: "deleteReply", id: e.id, replyId: r.id }, "Delete this reply?")}>
            delete reply
          </button>
        </div>
      ))}
      <div className="adminRow">
        {!e.approved && (
          <button className="btn btnSmall btnPink" onClick={() => act({ action: "approve", id: e.id })}>✓ approve</button>
        )}
        <button className="btn btnSmall btnDanger" onClick={() => act({ action: "delete", id: e.id }, "Delete this guestbook entry?")}>
          delete
        </button>
        {e.approved && (
          <>
            <input
              className="guestInput"
              style={{ flex: 1, minWidth: 180, padding: "4px 10px", fontSize: "0.85rem" }}
              placeholder="reply as Aaleeyah…"
              maxLength={140}
              value={replyText[e.id] ?? ""}
              onChange={(ev) => setReplyText((r) => ({ ...r, [e.id]: ev.target.value }))}
              aria-label={`Reply to ${e.name}`}
            />
            <button className="btn btnSmall" onClick={() => reply(e.id)} disabled={!(replyText[e.id] ?? "").trim()}>
              reply
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <ShimmerCard className="adminSection">
      <h2>✍️ Guestbook</h2>
      <p>
        Text messages are auto-filtered and go live right away. Drawings wait
        here until you approve them. Your replies show a “site owner” badge.
      </p>
      <Note msg={msg} />
      <h3 className="pixel">Waiting for approval ({pending.length})</h3>
      {pending.length === 0 ? <p>Nothing waiting 🎉</p> : pending.map(render)}
      <h3 className="pixel">Live ({live.length})</h3>
      {live.map(render)}
    </ShimmerCard>
  );
}

/* ------------------------------------------------------------------ */

export default function AdminPanel() {
  const [state, setState] = useState<{ configured: boolean; admin: boolean } | null>(null);
  const check = useCallback(
    () => api("/api/admin/auth").then(setState).catch(() => setState({ configured: false, admin: false })),
    []
  );
  useEffect(() => { check(); }, [check]);

  const logout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    check();
  };

  return (
    <main className="adminWrap">
      <div className="adminHead">
        <h1>
          <Link href="/" style={{ textDecoration: "none" }}>Aaleeyah.net</Link> · admin
        </h1>
        {state?.admin && <button className="btn" onClick={logout}>sign out</button>}
      </div>

      {state && !state.configured && (
        <ShimmerCard className="adminSection">
          <h2>Admin panel not set up yet</h2>
          <p>
            On your computer, in the project folder, run <code>npm run admin-setup</code>,
            choose a password, and paste the two lines it prints into a <code>.env</code> file
            next to <code>docker-compose.yml</code>. Then redeploy with{" "}
            <code>docker compose up -d --build</code>. See the README for details.
          </p>
        </ShimmerCard>
      )}
      {state?.configured && !state.admin && <Login onIn={check} />}
      {state?.admin && (
        <>
          <GallerySection />
          <ResumeSection />
          <GuestbookSection />
        </>
      )}
    </main>
  );
}
