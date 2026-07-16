"use client";

import { useEffect, useRef, useState } from "react";
import anime from "animejs/lib/anime.es.js";
import PixelIcon from "./PixelIcon";

/**
 * A pixel cat that lives in the bottom-right corner and evolves through
 * 4 stages — one growth per visit. Visits are counted in a single
 * first-party cookie, set only after the visitor accepts the cookie ask.
 * Declining keeps the cat forever a sleepy stage-1 loaf (no cookie set).
 */

const PAL: Record<string, string> = {
  K: "#111111", O: "#f5a34b", W: "#ffffff", P: "#f463b1", Y: "#f7d54b",
};

const STAGES: string[][] = [
  [ // 1 — sleeping loaf
    "............","..K......K..","..KK....KK..","..KOK..KOK..","..KOOOOOOK..",
    ".KOOOOOOOOK.",".KOKKOOKKOK.",".KOOOPPOOOK.","..KKKKKKKK..",
  ],
  [ // 2 — kitten
    "..K......K..","..KK....KK..","..KOK..KOK..","..KOOOOOOK..",".KOKOOOOKOK.",
    ".KOOOOOOOOK.",".KOOPOOPOOK.","..KOOPPOOK..","..KOOOOOOK..",".KOOOOOOOOK.",
    ".KOKKOOKKOK.","..KK.KK.KK..",
  ],
  [ // 3 — cat with tail
    "..K......K.....","..KK....KK.....","..KOK..KOK.....","..KOOOOOOK.....",
    ".KOKOOOOKOK....",".KOOOOOOOOK....",".KOOPOOPOOK..K.","..KOOPPOOK..KOK",
    "..KOOOOOOK..KOK",".KOOOOOOOOK.KOK",".KOOOOOOOOKKOK.",".KOKKOOKKOKOOK.",
    "..KK.KK.KK.KK..",
  ],
  [ // 4 — crowned sparkle cat
    "...Y.Y.Y.......","...YYYYY.......","..K......K.....","..KK....KK.....",
    "..KOK..KOK...Y.","..KOOOOOOK.....",".KOKOOOOKOK....",".KOOOOOOOOK..Y.",
    ".KOOPOOPOOK..K.","..KOOPPOOK..KOK","..KWOOOOWK..KOK",".KOOOOOOOOK.KOK",
    ".KOOOOOOOOKKOK.",".KOKKOOKKOKOOK.","..KK.KK.KK.KK..",
  ],
];

const MEOWS = ["mew!", "purrrr~", "=^.^=", "mrrp?", "thanks for visiting!"];
const CELL = 5;
const COOKIE = "aaleeyah_pet_visits";
const CONSENT = "aaleeyah_pet_consent";

function getCookie(name: string): string | null {
  const m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return m ? decodeURIComponent(m[1]) : null;
}
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; max-age=${60 * 60 * 24 * 365}; path=/; SameSite=Lax`;
}

// Which pixels belong to the tail (so it can wag) — stages 3 and 4 have tails
function isTail(stage: number, x: number, y: number): boolean {
  if (stage === 3) return x >= 12 && y >= 6;
  if (stage === 4) return x >= 12 && y >= 8;
  return false;
}

export default function CatPet() {
  const [stage, setStage] = useState(1);
  const [banner, setBanner] = useState(false);
  const [bubble, setBubble] = useState<string | null>(null);
  const [wag, setWag] = useState(false);
  const [happy, setHappy] = useState(0);
  const [showMeter, setShowMeter] = useState(false);
  const catRef = useRef<HTMLButtonElement>(null);
  const clicksRef = useRef<number[]>([]);
  const meterTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // tail wags every 400ms once the cat has a tail
  useEffect(() => {
    if (stage < 3) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setWag((w) => !w), 400);
    return () => clearInterval(t);
  }, [stage]);

  const countVisit = () => {
    let visits = parseInt(getCookie(COOKIE) || "0", 10);
    // one growth per browser session, so refreshes don't fast-forward the cat
    if (!sessionStorage.getItem("aaleeyah-pet-session")) {
      visits += 1;
      setCookie(COOKIE, String(visits));
      sessionStorage.setItem("aaleeyah-pet-session", "true");
      const newStage = Math.min(visits, STAGES.length);
      setStage(newStage);
      if (visits > 1 && visits <= STAGES.length) {
        // evolve pop!
        setTimeout(() => {
          anime({
            targets: catRef.current,
            scale: [1, 1.5, 1],
            rotate: [0, -8, 8, 0],
            duration: 900,
            easing: "easeInOutBack",
          });
          setBubble("✨ evolved! ✨");
          setTimeout(() => setBubble(null), 2600);
        }, 600);
      }
    } else {
      setStage(Math.min(Math.max(visits, 1), STAGES.length));
    }
  };

  // load happiness, decayed by 2 points per hour away
  useEffect(() => {
    const stored = parseInt(localStorage.getItem("aaleeyah-pet-happy") || "40", 10);
    const last = parseInt(localStorage.getItem("aaleeyah-pet-lastpet") || String(Date.now()), 10);
    const hoursAway = (Date.now() - last) / 3600000;
    setHappy(Math.max(0, Math.min(100, Math.round(stored - hoursAway * 2))));
  }, []);

  useEffect(() => {
    const consent = getCookie(CONSENT) || localStorage.getItem(CONSENT);
    if (consent === "yes") countVisit();
    else if (consent === "no") setStage(1);
    else setBanner(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accept = () => {
    setCookie(CONSENT, "yes");
    setBanner(false);
    countVisit();
  };
  const decline = () => {
    localStorage.setItem(CONSENT, "no"); // remember the "no" without a cookie
    setBanner(false);
    setStage(1);
  };

  const spawnHearts = (count: number) => {
    if (!catRef.current) return;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      const size = 5 + Math.random() * 5;
      s.style.cssText = `position:absolute;left:${20 + Math.random() * 50}%;top:20%;width:${size}px;height:${size}px;background:#f463b1;pointer-events:none;`;
      catRef.current.appendChild(s);
      anime({
        targets: s,
        translateY: -(30 + Math.random() * 40),
        translateX: (Math.random() - 0.5) * 40,
        opacity: [1, 0],
        duration: 800 + Math.random() * 500,
        easing: "easeOutQuad",
        complete: () => s.remove(),
      });
    }
  };

  const meow = () => {
    // petting: +happiness, floaty hearts, meter peeks out
    const next = Math.min(100, happy + 6);
    setHappy(next);
    localStorage.setItem("aaleeyah-pet-happy", String(next));
    localStorage.setItem("aaleeyah-pet-lastpet", String(Date.now()));
    spawnHearts(2);
    setShowMeter(true);
    if (meterTimer.current) clearTimeout(meterTimer.current);
    meterTimer.current = setTimeout(() => setShowMeter(false), 2200);

    // secret: 10 pets within 6 seconds
    const now = Date.now();
    clicksRef.current = [...clicksRef.current.filter((t) => now - t < 6000), now];
    if (clicksRef.current.length >= 10) {
      clicksRef.current = [];
      setHappy(100);
      localStorage.setItem("aaleeyah-pet-happy", "100");
      spawnHearts(14);
      setBubble("SECRET: MEGA PURR UNLOCKED ✨");
      anime({
        targets: catRef.current,
        scale: [1, 1.4, 0.9, 1.2, 1],
        rotate: [0, -12, 12, -6, 0],
        duration: 1200,
        easing: "easeInOutBack",
      });
      setTimeout(() => setBubble(null), 3000);
      return;
    }

    setBubble(next >= 100 ? "purrfectly happy!" : MEOWS[Math.floor(Math.random() * MEOWS.length)]);
    anime({ targets: catRef.current, translateY: [0, -10, 0], duration: 420, easing: "easeOutQuad" });
    setTimeout(() => setBubble(null), 1800);
  };

  const grid = STAGES[stage - 1];
  const w = Math.max(...grid.map((r) => r.length)) * CELL;
  const h = grid.length * CELL;
  const toGo = STAGES.length - stage;

  return (
    <>
      <button
        ref={catRef}
        className="catPet"
        onClick={meow}
        title={
          (toGo > 0 ? `visit ${toGo} more time${toGo > 1 ? "s" : ""} to evolve! ` : "fully evolved ✨ ") +
          `· happiness ${happy}/100 — click to pet`
        }
        aria-label="Pet cat"
      >
        {bubble && <span className="catBubble">{bubble}</span>}
        {showMeter && (
          <span className="catMeter" aria-hidden="true">
            <span className="catMeterFill" style={{ width: `${happy}%` }} />
          </span>
        )}
        <svg className="pixelSvg" width={w} height={h} aria-hidden="true">
          {grid.flatMap((row, y) =>
            row.split("").map((ch, x) =>
              PAL[ch] && !isTail(stage, x, y) ? (
                <rect key={`${x}-${y}`} x={x * CELL} y={y * CELL}
                  width={CELL} height={CELL} fill={PAL[ch]} />
              ) : null
            )
          )}
          <g
            style={{
              transform: `rotate(${wag ? 10 : -6}deg)`,
              transformOrigin: `${12 * CELL}px ${(grid.length - 2) * CELL}px`,
              transition: "transform 0.32s ease-in-out",
            }}
          >
            {grid.flatMap((row, y) =>
              row.split("").map((ch, x) =>
                PAL[ch] && isTail(stage, x, y) ? (
                  <rect key={`t${x}-${y}`} x={x * CELL} y={y * CELL}
                    width={CELL} height={CELL} fill={PAL[ch]} />
                ) : null
              )
            )}
          </g>
        </svg>
      </button>

      {banner && (
        <div className="cookieBanner" role="dialog" aria-label="Cookie consent">
          <span className="pixel" style={{ fontWeight: 600 }}><PixelIcon name="cookie" cell={3} inline /> one tiny cookie?</span>
          <p>
            This site uses a single cookie so your pixel cat can remember you
            and grow each time you visit. No tracking, just cat.
          </p>
          <div className="cookieBtns">
            <button className="cookieYes" onClick={accept}>accept <PixelIcon name="catface" cell={2} inline /></button>
            <button className="cookieNo" onClick={decline}>no thanks</button>
          </div>
        </div>
      )}
    </>
  );
}
