export type SearchEntry = { label: string; sub: string; href: string; icon: string; keywords: string[] };

export const SEARCH_INDEX: SearchEntry[] = [
  { label: "Projects", sub: "aaleeyah.net › projects", href: "/projects", icon: "code",
    keywords: ["projects", "code", "coding", "discord", "bot", "react", "next", "javascript", "typescript", "portfolio", "software", "developer", "repos", "repo", "adhdo", "adhd", "yin", "yang", "moodify", "spotify", "music", "magic", "mirror", "github"] },
  { label: "Art Gallery", sub: "aaleeyah.net › art", href: "/art", icon: "brush",
    keywords: ["art", "gallery", "images", "resin", "flower", "flowers", "led", "acrylic", "sticker", "stickers", "earrings", "cricut", "madedhd", "handmade", "business", "etsy", "photos", "pictures"] },
  { label: "Blog", sub: "aaleeyah.net › blog", href: "/blog", icon: "pencil",
    keywords: ["blog", "posts", "writing", "articles"] },
  { label: "Resume", sub: "aaleeyah.net › resume", href: "/resume", icon: "doc",
    keywords: ["resume", "cv", "hire", "work", "job", "experience", "skills", "red hawk", "engineer", "download", "pdf", "docx", "word"] },
  { label: "Guestbook", sub: "aaleeyah.net › guestbook", href: "/guestbook", icon: "bookmark",
    keywords: ["guestbook", "sign", "comment", "comments", "note", "notes", "message", "hello", "hi", "draw", "drawing", "doodle", "reply"] },
  { label: "Home", sub: "aaleeyah.net", href: "/", icon: "home",
    keywords: ["home", "about", "aaleeyah", "cats", "cat", "bunni", "boba", "dahlia", "games", "overwatch", "league", "fortnite", "sims", "facts", "likes", "ohio", "socials", "social", "linkedin", "instagram", "contact"] },
];

export function searchSite(query: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return SEARCH_INDEX;
  return SEARCH_INDEX.filter(
    (e) => e.label.toLowerCase().includes(q) || e.keywords.some((k) => k.includes(q) || q.includes(k))
  );
}
