"use client";

import { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";
import SearchNav from "@/components/SearchNav";
import ShimmerCard from "@/components/ShimmerCard";
import LikeHeart from "@/components/LikeHeart";
import Checklist from "@/components/Checklist";
import SpotifyCard from "@/components/SpotifyCard";
import ColorDots from "@/components/ColorDots";
import DarkModeCard from "@/components/DarkModeCard";
import PixelIcon from "@/components/PixelIcon";
import TimeCard from "@/components/TimeCard";
import SparkleCard from "@/components/SparkleCard";
import ViewsCard from "@/components/ViewsCard";

export default function Home() {
  const gridRef = useRef<HTMLDivElement>(null);

  // Cards pop in staggered on load
  useEffect(() => {
    if (!gridRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    anime({
      targets: gridRef.current.querySelectorAll(".card"),
      opacity: [0, 1],
      translateY: [26, 0],
      scale: [0.96, 1],
      delay: anime.stagger(80),
      duration: 600,
      easing: "easeOutQuad",
    });
  }, []);

  return (
    <main className="landing">
      <div className="topRow">
        <div className="topIcons" aria-hidden="true">
          <PixelIcon name="heart" cell={4} />
          <PixelIcon name="monitor" cell={4} />
        </div>
        <span aria-hidden="true"><PixelIcon name="person" cell={4} /></span>
      </div>

      <div className="logoBlock">
        <h1>
          <span style={{ fontSize: "1.25em" }}>A</span>aleeyah
          <span className="net">.net</span>
        </h1>
      </div>

      <SearchNav />

      <div className="bento" ref={gridRef}>
        {/* ------- column 1 ------- */}
        <div className="bentoCol">
          <LikeHeart />

          <TimeCard />

          <ShimmerCard className="bioCard">
            <p>Hi, my name is Aaleeyah. I see you have stumbled upon my portfolio.</p>
            <p>
              I&apos;m located in Ohio. I am an associate software engineer that is currently exploring new opportunities. 
              I have a passion for programming and design. I love to create things that are both functional and visually appealing. 
              I have insane ADHD brain, so I have a hard time focusing on one thing for too long. I have a lot of hobbies and interests, 
              but I&apos;m always looking for new things to learn and explore.
            </p>
            <p>
              I got introduced to programming from discord. I was fascinated at
              people creating their own discord server bots and wanted to do the
              same.
            </p>
            <p>
              Anyways I decided to create my 3rd portfolio…to showcase both my
              programming skills and love for design.
            </p>
          </ShimmerCard>

          <SpotifyCard id="one" />

          <ColorDots />
        </div>

        {/* ------- column 2 ------- */}
        <div className="bentoCol">
          <ShimmerCard>
            <div className="catFaces" aria-hidden="true">
              <PixelIcon name="catface" cell={4} />
              <PixelIcon name="catface" cell={4} />
              <PixelIcon name="catface" cell={4} />
            </div>
            <div className="pixelBody">
              I have 3 cats.
              <br />
              Bunni
              <br />
              Boba
              <br />
              Dahlia
            </div>
          </ShimmerCard>

          <ShimmerCard style={{ textAlign: "center" }}>
            <div className="iconStrip" aria-hidden="true">
              <PixelIcon name="controller" cell={4} />
              <PixelIcon name="monitor" cell={4} />
              <PixelIcon name="brush" cell={4} />
              <PixelIcon name="star" cell={4} />
            </div>
          </ShimmerCard>

          <ShimmerCard>
            <div className="pixelBody">
              I have a small business where I sell earrings, stickers, and
              anything that comes looks cool.
            </div>
            <div className="iconStrip" style={{ marginTop: 10 }} aria-hidden="true">
              <PixelIcon name="catface" cell={3} />
              <PixelIcon name="gem" cell={3} />
              <PixelIcon name="bag" cell={3} />
            </div>
          </ShimmerCard>

          <ShimmerCard>
            <div className="pixel" style={{ fontWeight: 600, marginBottom: 8 }}>
              Weird facts about me
            </div>
            <div className="pixelBody">
              I use to bowl semi-professionally. <PixelIcon name="smiley" cell={3} inline />
              <br />
              To me dark chocolate tastes like purple. <PixelIcon name="tongue" cell={3} inline />
              <br />
              I have emetophobia. <PixelIcon name="worried" cell={3} inline />
              <br />
              I collect squishmallows &amp; figurines. <PixelIcon name="teddy" cell={3} inline />
            </div>
          </ShimmerCard>

          <DarkModeCard />
        </div>

        {/* ------- column 3 ------- */}
        <div className="bentoCol">
          <ShimmerCard>
            <div className="pixelBody" style={{ textAlign: "center" }}>
              some of my favorite games are: overwatch, league of legends,
              fortnite, sims 4 <PixelIcon name="dice" cell={3} inline />
            </div>
          </ShimmerCard>

          <ViewsCard />

          <SpotifyCard id="two" />

          <Checklist />

          <SparkleCard />

          <ShimmerCard>
            <div className="socialRow">
              <a href="https://www.linkedin.com" aria-label="LinkedIn"><PixelIcon name="briefcase" cell={4} /></a>
              <a href="https://www.instagram.com" aria-label="Instagram"><PixelIcon name="camera" cell={4} /></a>
              <a href="https://github.com" aria-label="GitHub"><PixelIcon name="paw" cell={4} /></a>
            </div>
          </ShimmerCard>
        </div>
      </div>
    </main>
  );
}
