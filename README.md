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

`/app/data` inside the web container (likes.json + guestbook.json) is a named
Docker volume (`site-data`). Back it up with:

```bash
docker run --rm -v aaleeyah-net_site-data:/d alpine tar czf - -C /d . > backup.tgz
```

## Before you go live

1. **Resume PDF**: drop your real resume at `public/Aaleeyah-Ivy-Kilgore-Resume.pdf`
   so the download button works.
2. **Real photos**: art photos → `public/art/`, project screenshots →
   `public/projects/`, then add `image: "/art/file.jpg"` entries in
   `src/app/art/page.tsx` and `src/app/projects/page.tsx`.
3. **Social links**: update the URLs in `src/app/page.tsx` (socialRow section).
4. **Guestbook moderation**: entries live in the `site-data` volume; to remove
   one, edit `data/guestbook.json` via
   `docker compose exec web sh` (or add an admin route later).

## Structure

```
src/
  app/            pages (/, /projects, /resume, /blog, /art) + /api/likes
  components/     GradientBlobs, SearchNav, ShimmerCard, LikeHeart,
                  Checklist, ResultsLayout, ProjectCard
```
