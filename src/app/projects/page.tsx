import ResultsLayout from "@/components/ResultsLayout";
import ProjectCard, { Project } from "@/components/ProjectCard";
import ShimmerCard from "@/components/ShimmerCard";
import { BrandIcon, SOCIALS } from "@/components/SocialLinks";

const GH = "https://github.com/AaleeyahIvy";

// Newest first. Add `image: "/projects/file.png"` once screenshots are in public/projects/.
const PROJECTS: Project[] = [
  {
    title: "adhdo",
    status: "in progress",
    description:
      "“I can adhdo whatever I want and actually get it done!” An app built to help people with ADHD or executive dysfunction get things done.",
    details:
      "A TypeScript app designed to support people with ADHD or executive dysfunction. Currently in active development.",
    tags: ["TypeScript", "Productivity", "Accessibility"],
    emoji: "🧠",
    gradient: "linear-gradient(135deg,#eadcff,#a66cf2)",
    repo: `${GH}/adhdo`,
  },
  {
    title: "Yin Yang",
    status: "in progress",
    description:
      "A group-chat app for staying in touch with friends near and far: messaging, sharing pictures, playing group games, and planning get-togethers around everyone's schedules.",
    details:
      "Started as a long-distance couples app after Meta's Tuned shut down, then grew into a friend-group app. The first version was a LAMP + Docker build with sign-up/sign-in, encrypted user data in MySQL/MariaDB, friend relationships, and an email system; a newer TypeScript version is in the works.",
    tags: ["TypeScript", "PHP", "MySQL", "Docker"],
    emoji: "☯️",
    gradient: "linear-gradient(135deg,#f0f0f0,#9a9a9a)",
    repo: `${GH}/aayinyang`,
    live: "https://yinyangapp.com/",
  },
  {
    title: "Moodify",
    description:
      "Shuffling your 1000+ liked songs and nothing's hitting? Moodify finds music based on how you feel: click a color/mood block or type a vibe like “neon sunset”.",
    details:
      "An LLM maps your prompt to Spotify audio features (energy, valence, tempo), then matches tracks and explains why each one fits. React + TypeScript + Tailwind front end with TanStack Query and Zustand; Fastify + Prisma + PostgreSQL back end with Spotify OAuth (PKCE).",
    tags: ["TypeScript", "React", "Fastify", "Prisma", "Spotify API", "LLM"],
    emoji: "🎧",
    gradient: "linear-gradient(135deg,#d9f7e5,#1db954)",
    repo: `${GH}/Moodify`,
  },
  {
    title: "Aaleeyah.net",
    description:
      "This very site: a retro search-engine themed portfolio built with Next.js, React, and anime.js, designed from scratch in Figma.",
    details:
      "A search bar that doubles as navigation, live like and view counters, a guestbook with a drawing pad and replies, an admin panel with safe image uploads, and shimmer effects on every card. Third portfolio's the charm.",
    tags: ["Next.js", "React", "TypeScript", "anime.js", "Docker", "Figma"],
    emoji: "🔍",
    gradient: "linear-gradient(135deg,#fbd3e9,#f463b1)",
    repo: `${GH}/AaleeyahNet`,
    live: "https://aaleeyah.net",
  },
  {
    title: "MagicMirror Modules",
    description:
      "My smart-mirror setup, plus custom MagicMirror² modules I wrote for it: Govee smart-light control, and a responsive task list with timers and overdue alarms.",
    details:
      "MMM-GoveeLightControl controls Govee lights from the mirror. MMM_ResponsiveTaskList lets you create tasks, check them off, set times, and sounds an alarm when one is overdue.",
    tags: ["JavaScript", "Node.js", "MagicMirror²", "IoT"],
    emoji: "🪞",
    gradient: "linear-gradient(135deg,#d4e8ff,#7db8f7)",
    repo: `${GH}/MMM-GoveeLightControl`,
  },
  {
    title: "Discord Category Decorator",
    description:
      "A Discord bot and companion CLI script that decorates server category names with Unicode symbols to keep servers organized and cute.",
    details:
      "Built as both a persistent bot and a standalone script so server owners can pick between always-on styling or one-off runs.",
    tags: ["JavaScript", "discord.js", "Node.js"],
    emoji: "🤖",
    gradient: "linear-gradient(135deg,#d4e8ff,#4b9df5)",
  },
  {
    title: "Member Relationship Mapper",
    description:
      "A React tool that tracks Discord server members and visualizes how everyone is connected to each other.",
    details:
      "Interactive relationship mapping for community management: see friend groups, activity, and connections at a glance.",
    tags: ["React", "Data Viz", "Discord"],
    emoji: "🕸️",
    gradient: "linear-gradient(135deg,#d9f7e5,#4bc97a)",
  },
  {
    title: "MadeDHD",
    description:
      "My handmade keepsake shop: LED-engraved acrylic pieces, resin flower preservation, and Cricut customization, plus all the branding and product design behind it.",
    details:
      "Everything from logo and banner design to SVG cut files, product photography, and an SEO-driven Etsy strategy.",
    tags: ["Etsy", "Design", "Cricut", "Resin"],
    emoji: "🌹",
    gradient: "linear-gradient(135deg,#fff3c9,#f7d54b)",
  },
];

export default function ProjectsPage() {
  return (
    <ResultsLayout placeholder="Aaleeyah's Projects" resultsCount={PROJECTS.length}>
      {PROJECTS.map((p) => (
        <ProjectCard key={p.title} project={p} />
      ))}
      <ShimmerCard className="emptyState" style={{ padding: "28px 20px" }}>
        <div className="big" style={{ fontSize: "1.25rem" }}>Looking for more?</div>
        <p style={{ marginBottom: 14 }}>School projects, experiments, and everything else lives on my GitHub.</p>
        <a className="btn btnPink" href={GH} target="_blank" rel="noopener noreferrer">
          <BrandIcon path={SOCIALS[0].path} size={18} /> see all repos on GitHub
        </a>
      </ShimmerCard>
    </ResultsLayout>
  );
}
