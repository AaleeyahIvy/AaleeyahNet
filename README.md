# Aaleeyah.net 🔍

Retro search-engine themed portfolio built with **Next.js 14**, **React**, and **anime.js**.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## What's wired up

- **Search bar = nav** — click the search bar anywhere to get "search suggestions" that navigate to Projects / Art / Blog / Resume / Home
- **Like counter** — the pixel heart counts real visitor likes (one per visitor via localStorage). Likes persist to `data/likes.json` through the `/api/likes` route
- **Interactive checklist** — persists per visitor; "Heart the portfolio!" and "Search Aaleeyah.Net" auto-check when the visitor actually does those things
- **Drifting gradient blobs** — anime.js, endless gentle wander
- **Shimmer** — every card fires a rainbow border sweep ~every 20s, randomly offset per card
- **Hover glow** — the Images/Videos/Shopping/Books tabs light up on hover (decorative, as designed)
- **Expandable project cards** — the ↗ arrow reveals details + tech tags
- Entrance animations, reduced-motion support, keyboard accessible
- **Color dots** theme the search bar *and* every card (border, tint, shadow)
- **Social links** with real GitHub / LinkedIn / Instagram logos under the
  home search bar, in a "find me online" card, and at the bottom of every page
- **Resume downloads** in PDF and Word (.docx), uploaded from the admin panel
- **Guestbook** with a drawing pad, replies, and light auto-moderation
- **Admin panel** at `/admin` (password protected) for gallery photos, the
  resume, and guestbook moderation

## Deploy with Docker + nginx

Everything needed is in the repo: `Dockerfile` (multi-stage, standalone Next.js
server, non-root user), `nginx/default.conf` (reverse proxy), and
`docker-compose.yml` (both containers + a named volume so likes and guestbook
entries survive rebuilds).

On your server:

```bash
docker compose up -d --build
```

That's it — nginx listens on port 80 and proxies to the Next.js server.
Check it with `curl http://localhost/api/likes`.

Useful commands:

```bash
docker compose logs -f          # watch logs
docker compose up -d --build    # redeploy after changes
docker compose down             # stop (data volume persists)
```

### Domain + HTTPS

1. Point your DNS A record at the server; `server_name` in
   `nginx/default.conf` is already set to aaleeyah.net (use `server_name _;`
   while testing by IP).
2. For HTTPS, the smoothest route is certbot on the host or a
   traefik/nginx-proxy ACME companion; a commented 443 block in
   `nginx/default.conf` shows the manual shape. Then uncomment the `443` port
   and letsencrypt volume lines in `docker-compose.yml`.

### Data persistence

`/app/data` inside the web container (likes, views, guestbook, gallery
photos, drawings and resume uploads) is a named Docker volume (`site-data`). Back it up with:

```bash
docker run --rm -v aaleeyah-net_site-data:/d alpine tar czf - -C /d . > backup.tgz
```

## Admin panel (`/admin`)

Upload gallery photos and your resume, approve guestbook drawings, delete
entries, and reply as yourself (your replies get a "site owner" badge).

### One-time setup

1. On your computer, in this folder: `npm install`, then `npm run admin-setup`.
   Pick a password (12+ characters). It prints two lines.
2. On the server, create a file named `.env` next to `docker-compose.yml` and
   paste those two lines in. `.env` is git-ignored: **never commit it**.
   (See `.env.example`.)
3. Redeploy: `docker compose up -d --build`, then visit `https://aaleeyah.net/admin`.

Needs Docker Compose v2.24+ (for the optional `env_file`). Check with `docker compose version`.

To change the password, run `npm run admin-setup` again, replace both lines
in `.env`, and redeploy (this also signs out every session).

### How it's protected

- **HTTPS only**: sign-in is refused over plain HTTP in production, so set up
  HTTPS first (see above). If you really must test without it, add
  `ADMIN_ALLOW_HTTP=true` to `.env` temporarily.
- The password is never stored, only a salted **scrypt hash**. Sessions are
  **HMAC-signed**, `httpOnly`, `SameSite=Strict` cookies that expire after 8 hours.
- Login attempts are rate-limited (5 per 15 min per IP), and every admin
  action checks the request's origin (CSRF protection).
- **Uploaded images are never trusted**: the real file type is checked
  (SVG and anything that isn't JPEG/PNG/GIF/WebP is refused), then every image
  is decoded and re-saved as a fresh WebP. That throws away hidden scripts,
  disguised files and EXIF/GPS location data; only pixels survive. Files are
  served with `nosniff` and a locked-down Content-Security-Policy.
- Resumes must really be PDFs (`%PDF-`) or Word .docx files, whatever the
  file name says.

## Guestbook moderation

Automatic, light-touch:

- Text is filtered for explicit words and slurs (catches l33tspeak,
  "s p a c e d" letters, and "fuuuun" stretching, while letting innocent
  words like *raccoon*, *spicy*, or *peacock* through), plus links, ALL-CAPS
  shouting, and repeated spam
- Bots: a hidden honeypot field, signed form tokens (posts sent within 3 s
  of loading the page are refused), per-IP rate limits (3 posts / 10 min,
  10 / day; replies 5 / 10 min), and duplicate-message checks
- **Drawings can't be checked automatically, so they wait for your approval**
  in `/admin` before anyone else can see them

Tune the word lists in `src/lib/validate.ts`.

## Adding content

- **Gallery photos / resume**: upload them at `/admin` (stored in the
  `site-data` volume). You can also commit photos to `public/art/` and add
  `{ title, image: "/art/file.jpg" }` entries in `src/app/art/page.tsx`. The
  emoji placeholders disappear once any real photo exists.
- **Projects**: edit `src/app/projects/page.tsx` (`repo`, `live`, `status`,
  and `image: "/projects/file.png"` for screenshots in `public/projects/`).
- **Social links**: `src/components/SocialLinks.tsx`.

## Structure

```
src/
  app/            pages (/, /projects, /resume, /blog, /art, /guestbook, /admin)
  app/api/        likes, views, guestbook (+reply), gallery, media, resume, admin/*
  components/     GradientBlobs, SearchNav, ShimmerCard, LikeHeart, SocialLinks,
                  DrawingPad, Checklist, ResultsLayout, ProjectCard, …
  lib/            validate (moderation), security (auth, tokens, rate limits),
                  images (safe re-encoding), storage, guestbook, gallery, resume
scripts/          hash-password.mjs (`npm run admin-setup`)
```
