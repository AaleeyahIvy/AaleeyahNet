import ResultsLayout from "@/components/ResultsLayout";
import ProjectCard, { Project } from "@/components/ProjectCard";

const PROJECTS: Project[] = [
  {
    title: "Aaleeyah.net",
    description:
      "This very site — a retro search-engine themed portfolio built with Next.js, React, and anime.js, designed from scratch in Figma.",
    details:
      "Features a search bar that doubles as navigation, a live visitor like-counter, drifting gradient blobs, and shimmer effects on every card. Third portfolio's the charm.",
    tags: ["Next.js", "React", "anime.js", "Figma"],
    emoji: "🔍",
    gradient: "linear-gradient(135deg,#fbd3e9,#f463b1)",
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
      "Interactive relationship mapping for community management — see friend groups, activity, and connections at a glance.",
    tags: ["React", "Data Viz", "Discord"],
    emoji: "🕸️",
    gradient: "linear-gradient(135deg,#d9f7e5,#4bc97a)",
  },
  {
    title: "MadeDHD",
    description:
      "My handmade keepsake shop — LED-engraved acrylic pieces, resin flower preservation, and Cricut customization, plus all the branding and product design behind it.",
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
    </ResultsLayout>
  );
}
