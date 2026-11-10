/**
 * Guestbook moderation (light, automatic).
 *
 * Real injection protection comes from architecture, not filtering:
 *  - storage is JSON (no SQL strings are ever built)
 *  - React escapes all rendered text, so stored content can't run as HTML
 * The checks below keep the guestbook friendly and spam-free. Everything is
 * re-validated server-side in the API routes: never trust the client.
 *
 * Bot protection (honeypot, signed form tokens, rate limits, duplicate
 * checks) lives in the API routes; drawings are held for admin approval.
 */

export const NAME_MAX = 30;
export const MSG_MAX = 200;
export const REPLY_MAX = 140;

// letters (any language), numbers, spaces, light punctuation
const NAME_RE = /^[\p{L}\p{N} .,'!\-_]{1,30}$/u;
// …plus emoji in messages
const MSG_RE = /^[\p{L}\p{N}\p{Extended_Pictographic}‍️ .,'"!?()&:;~*\-\n❤♥]+$/u;

// html/script/sql-ish payloads — belt and suspenders
const INJECTION_RE =
  /(<|>|&lt;|&gt;|javascript:|on\w+\s*=|<script|--|\/\*|\*\/|\bunion\b.*\bselect\b|\bdrop\s+table\b|\bdelete\s+from\b|\binsert\s+into\b|\bxp_)/i;

// links are the #1 thing spam bots post
const LINK_RE =
  /(https?:|www\.|\b[a-z0-9-]+(\.|\s*\(dot\)\s*|\s*\[dot\]\s*|\s+dot\s+)(com|net|org|io|ru|cn|xyz|top|info|biz|co|me|ly|gg|link|click|shop|site|online|app|dev|us|uk|tk|live|store|vip|cc)\b)/i;

/**
 * Words blocked anywhere inside a word (safe — they don't appear inside
 * ordinary words), e.g. "f*ckin", "bullsh1t".
 */
const BLOCK_ANYWHERE = [
  "fuck", "fuk", "shit", "cunt", "nigger", "nigga", "faggot", "whore", "asshole",
  "bitch", "dildo", "porn", "penis", "vagina", "blowjob", "handjob", "jizz",
  "pussies", "masturbat", "orgasm", "hentai", "onlyfans",
];

/**
 * Words blocked only as a whole word (+ simple endings), because they
 * appear inside innocent words: "raccoon", "spicy", "peacock", "Dickens",
 * "scrape", "cocktail", "entities"…
 */
const BLOCK_WHOLE = [
  "dick", "cock", "twat", "wank", "wanker", "fag", "retard", "kike", "spic", "chink",
  "tranny", "coon", "cum", "rape", "rapist", "tits", "titties", "boob", "nude",
  "hoe", "thot", "kys", "bastard", "pussy", "anal", "horny", "milf", "bdsm", "slut",
  "sex", "sexting", "nazi",
];
const BLOCK_PHRASES = ["kill yourself", "kill urself", "go die"];

const LEET: Record<string, string> = {
  "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a", "@": "a",
  "5": "s", "$": "s", "7": "t", "+": "t", "8": "b", "9": "g",
};

/** lowercase, undo leetspeak, strip accents + non-letters */
function baseWord(w: string): string {
  return w
    .toLowerCase()
    .split("")
    .map((c) => LEET[c] ?? c)
    .join("")
    .normalize("NFD")
    .replace(/[^a-z]/g, "");
}
const squashAll = (w: string) => w.replace(/(.)\1+/g, "$1"); // fuuuck → fuck
const squashTo2 = (w: string) => w.replace(/(.)\1{2,}/g, "$1$1"); // cooooon → coon

const ANYWHERE = BLOCK_ANYWHERE.map(squashAll);
const withEndings = (w: string) => [w, w + "s", w + "er", w + "ers", w + "ed", w + "ing"];
const WHOLE = new Set(BLOCK_WHOLE.flatMap(withEndings));
// words with no double letters can also be matched fully squashed (diiiick)
const WHOLE_SQUASHED = new Set(
  BLOCK_WHOLE.filter((w) => squashAll(w) === w).flatMap(withEndings).map(squashAll)
);

export function hasProfanity(text: string): boolean {
  const lower = text.toLowerCase().replace(/\s+/g, " ");
  if (BLOCK_PHRASES.some((p) => lower.includes(p))) return true;

  // split into words, keeping leetspeak symbols attached
  const raw = lower.split(/[\s.,'"?()&:;~*\-_\n]+/).filter(Boolean);

  // re-join runs of single letters: "f u c k" / "f.u.c.k" → "fuck"
  const words: string[] = [];
  let run = "";
  for (const w of raw) {
    if ([...w].length === 1) run += w;
    else {
      if (run) words.push(run);
      run = "";
      words.push(w);
    }
  }
  if (run) words.push(run);

  for (const w of words) {
    const b = baseWord(w);
    if (!b) continue;
    const all = squashAll(b);
    if (WHOLE.has(squashTo2(b)) || WHOLE_SQUASHED.has(all)) return true;
    if (ANYWHERE.some((x) => all.includes(x))) return true;
  }
  return false;
}

function looksLikeSpam(text: string): string | null {
  if (LINK_RE.test(text)) return "Links aren't allowed in the guestbook — just say hi!";
  if (/(.)\1{7,}/u.test(text)) return "That's a lot of the same character — try toning it down!";
  const letters = text.replace(/[^\p{L}]/gu, "");
  if (letters.length > 16 && letters.replace(/[^\p{Lu}]/gu, "").length / letters.length > 0.8)
    return "No need to shout! Try it without all caps.";
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length >= 6 && new Set(words).size / words.length < 0.35)
    return "That message is pretty repetitive — try rewording it.";
  return null;
}

type Result = { ok: true; name: string; message: string } | { ok: false; error: string };

export function validateName(nameRaw: unknown): { ok: true; name: string } | { ok: false; error: string } {
  if (typeof nameRaw !== "string") return { ok: false, error: "Invalid input." };
  const name = nameRaw.trim().replace(/\s+/g, " ");
  if (!name) return { ok: false, error: "Please enter a name." };
  if (name.length > NAME_MAX) return { ok: false, error: `Name must be ${NAME_MAX} characters or less.` };
  if (INJECTION_RE.test(name) || !NAME_RE.test(name))
    return { ok: false, error: "Name can only use letters, numbers, and basic punctuation." };
  if (LINK_RE.test(name)) return { ok: false, error: "Names can't contain links." };
  if (hasProfanity(name)) return { ok: false, error: "Let's keep the guestbook friendly! Try a different name." };
  return { ok: true, name };
}

/**
 * Validate a guestbook post or reply.
 * `allowEmptyMessage` is used when a drawing is attached.
 */
export function validateEntry(
  nameRaw: unknown,
  messageRaw: unknown,
  { max = MSG_MAX, allowEmptyMessage = false }: { max?: number; allowEmptyMessage?: boolean } = {}
): Result {
  const n = validateName(nameRaw);
  if (!n.ok) return n;
  if (messageRaw !== undefined && typeof messageRaw !== "string") return { ok: false, error: "Invalid input." };

  const message = (messageRaw ?? "")
    .trim()
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n");

  if (!message) {
    return allowEmptyMessage
      ? { ok: true, name: n.name, message: "" }
      : { ok: false, error: "Please write a little something." };
  }
  if ([...message].length > max) return { ok: false, error: `Message must be ${max} characters or less.` };
  if (INJECTION_RE.test(message))
    return { ok: false, error: "Some characters in there aren't allowed — keep it to plain text please!" };
  if (!MSG_RE.test(message))
    return { ok: false, error: "Message can only use letters, numbers, emoji, and basic punctuation." };
  const spam = looksLikeSpam(message);
  if (spam) return { ok: false, error: spam };
  if (hasProfanity(message)) return { ok: false, error: "Let's keep the guestbook friendly! Try rewording that." };

  return { ok: true, name: n.name, message };
}
