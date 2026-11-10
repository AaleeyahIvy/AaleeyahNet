"use client";

import { useState } from "react";
import ShimmerCard from "./ShimmerCard";
import { BrandIcon, SOCIALS } from "./SocialLinks";

export type Project = {
  title: string;
  description: string;
  details: string;
  tags: string[];
  emoji: string;      // placeholder shown until a real screenshot is added
  gradient: string;   // placeholder background, matching the art gallery tiles
  image?: string;     // e.g. "/projects/site.png" once screenshots are in public/
  repo?: string;      // GitHub link
  live?: string;      // live site / demo link
  status?: string;    // e.g. "in progress"
};

export default function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false);

  return (
    <ShimmerCard className="projectCard">
      <button
        className="expandBtn"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? `Collapse ${project.title}` : `Expand ${project.title}`}
      >
        {open ? "↙" : "↗"}
      </button>

      <div className="projectTop">
        <div className="projectText">
          <h2 className="projectTitle">
            {project.title}
            {project.status && <span className="tag" style={{ marginLeft: 10, letterSpacing: 0, textTransform: "none", verticalAlign: "middle" }}>{project.status}</span>}
          </h2>
          <p className="projectDesc">{project.description}</p>
          {(project.repo || project.live) && (
            <div className="projectLinks">
              {project.live && (
                <a className="btn btnSmall btnPink" href={project.live} target="_blank" rel="noopener noreferrer">
                  ↗ visit site
                </a>
              )}
              {project.repo && (
                <a className="btn btnSmall" href={project.repo} target="_blank" rel="noopener noreferrer">
                  <BrandIcon path={SOCIALS[0].path} size={14} /> view code
                </a>
              )}
            </div>
          )}
        </div>
        <div
          className="projectImg"
          aria-hidden="true"
          style={{ background: project.image ? undefined : project.gradient }}
        >
          {project.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={project.image}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span>{project.emoji}</span>
          )}
        </div>
      </div>

      <div className={`projectMore ${open ? "open" : ""}`}>
        <div className="inner">
          <p>{project.details}</p>
          <div className="tagRow">
            {project.tags.map((t) => (
              <span key={t} className="tag">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </ShimmerCard>
  );
}
