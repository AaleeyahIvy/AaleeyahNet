/**
 * Guestbook input validation.
 *
 * Real injection protection comes from architecture, not filtering:
 *  - storage is JSON (no SQL strings are ever built) — if you migrate to a
 *    database, use parameterized queries / an ORM, never string concatenation
 *  - React escapes all rendered text, so stored content can't run as HTML
 * The checks below are defense-in-depth + keeping the guestbook family-friendly.
 * Everything is re-validated server-side in the API route: never trust the client.
 */

const NAME_MAX = 30;
const MSG_MAX = 140;

// letters (any language), numbers, spaces, light punctuation
const NAME_RE = /^[\p{L}\p{N} .,'!\-]{1,30}$/u;
const MSG_RE = /^[\p{L}\p{N} .,'"!?()&:\-\n\u2764\u2665]{1,140}$/u;

// suspicious payload patterns (html/script/sql-ish) — belt and suspenders
const INJECTION_RE =
  /(<|>|&lt;|&gt;|javascript:|on\w+\s*=|script|--|\/\*|\*\/|\bunion\b.*\bselect\b|\bdrop\s+table\b|\bdelete\s+from\b|\binsert\s+into\b|\bexec\b|\bxp_)/i;

// modest profanity list, checked against a leetspeak-normalized string
const BANNED = [
  "fuck", "shit", "bitch", "cunt", "dick", "cock", "pussy", "asshole",
  "bastard", "slut", "whore", "twat", "wank", "nigger", "nigga", "faggot",
  "fag", "retard", "kike", "spic", "chink", "tranny", "coon",
];

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/0/g, "o").replace(/1/g, "i").replace(/3/g, "e")
    .replace(/4/g, "a").replace(/5/g, "s").replace(/7/g, "t")
    .replace(/@/g, "a").replace(/\$/g, "s").replace(/\+/g, "t")
    .replace(/[^a-z]/g, "");
}

function hasProfanity(s: string): boolean {
  const n = normalize(s);
  return BANNED.some((w) => n.includes(w));
}

export function validateEntry(nameRaw: unknown, messageRaw: unknown): { ok: true; name: string; message: string } | { ok: false; error: string } {
  if (typeof nameRaw !== "string" || typeof messageRaw !== "string")
    return { ok: false, error: "Invalid input." };

  const name = nameRaw.trim().replace(/\s+/g, " ");
  const message = messageRaw.trim().replace(/[ \t]+/g, " ");

  if (!name) return { ok: false, error: "Please enter a name." };
  if (!message) return { ok: false, error: "Please write a little something." };
  if (name.length > NAME_MAX) return { ok: false, error: `Name must be ${NAME_MAX} characters or less.` };
  if (message.length > MSG_MAX) return { ok: false, error: `Message must be ${MSG_MAX} characters or less.` };
  if (INJECTION_RE.test(name) || INJECTION_RE.test(message))
    return { ok: false, error: "Some characters in there aren't allowed — keep it to plain text please!" };
  if (!NAME_RE.test(name)) return { ok: false, error: "Name can only use letters, numbers, and basic punctuation." };
  if (!MSG_RE.test(message)) return { ok: false, error: "Message can only use letters, numbers, and basic punctuation." };
  if (hasProfanity(name) || hasProfanity(message))
    return { ok: false, error: "Let's keep the guestbook friendly! Try rewording that." };

  return { ok: true, name, message };
}
