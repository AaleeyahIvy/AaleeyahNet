"use client";

import { useEffect, useState } from "react";
import ShimmerCard from "./ShimmerCard";
import PixelIcon from "./PixelIcon";

/**
 * Paste any Spotify track/album/playlist link and it renders Spotify's
 * official embed player right in the card — with real play/pause.
 * The chosen song persists in localStorage per card.
 */
function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url.trim());
    if (u.hostname !== "open.spotify.com") return null;
    const parts = u.pathname.split("/").filter(Boolean); // e.g. ["track","ID"] or ["intl-x","track","ID"]
    const kindIdx = parts.findIndex((p) => ["track", "album", "playlist", "episode"].includes(p));
    if (kindIdx === -1 || !parts[kindIdx + 1]) return null;
    return `https://open.spotify.com/embed/${parts[kindIdx]}/${parts[kindIdx + 1]}`;
  } catch {
    return null;
  }
}

export default function SpotifyCard({ id }: { id: string }) {
  const [embed, setEmbed] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setEmbed(localStorage.getItem(`aaleeyah-spotify-${id}`));
  }, [id]);

  const save = () => {
    const url = toEmbedUrl(value);
    if (!url) {
      setError(true);
      return;
    }
    localStorage.setItem(`aaleeyah-spotify-${id}`, url);
    setEmbed(url);
    setEditing(false);
    setError(false);
    setValue("");
  };

  return (
    <ShimmerCard className="spotify">
      <div className="pixel" style={{ fontWeight: 600 }}><PixelIcon name="headphones" cell={3} inline /> Spotify song</div>

      {embed && !editing ? (
        <>
          <iframe
            className="spotifyFrame"
            src={embed}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Spotify player"
          />
          <button className="spotifyEdit" onClick={() => setEditing(true)}>
            change song
          </button>
        </>
      ) : (
        <>
          <div className="spotifyInputRow">
            <input
              placeholder="Paste a Spotify link…"
              value={value}
              onChange={(e) => { setValue(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && save()}
              aria-label="Spotify link"
            />
            <button onClick={save}>Set</button>
          </div>
          {error && <div className="spotifyError">Hmm, that doesn&apos;t look like a Spotify link.</div>}
          {embed && (
            <button className="spotifyEdit" onClick={() => { setEditing(false); setError(false); }}>
              cancel
            </button>
          )}
        </>
      )}
    </ShimmerCard>
  );
}
