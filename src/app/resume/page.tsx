import ResultsLayout from "@/components/ResultsLayout";
import ShimmerCard from "@/components/ShimmerCard";
import PixelIcon from "@/components/PixelIcon";

export default function ResumePage() {
  return (
    <ResultsLayout placeholder="Aaleeyah's Resume" resultsCount={1}>
      <ShimmerCard className="resumeCard">
        <a
          className="downloadBtn"
          href="/Aaleeyah-Ivy-Kilgore-Resume.pdf"
          download
          aria-label="Download resume as PDF"
        >
          <PixelIcon name="download" cell={3} />
        </a>
        <h1 className="resumeName">Aaleeyah Ivy-Kilgore</h1>
        <div className="resumeRole">Software Developer/Engineer</div>
        <hr className="resumeRule" />

        <p>
          Summary of skills: Front-end development with React and Next.js,
          WordPress site building and customization, UI/UX design in Figma,
          Discord bot development with Node.js, and a maker&apos;s eye for
          detail from running a handmade product business.
        </p>

        <h2 className="resumeH2">Work Experience</h2>
        <hr className="resumeRule" />
        <p>
          <strong>Red Hawk Technologies</strong> · February 2024 – July 2025
        </p>
        <p>
          Associate Software Engineer. Built and maintained client WordPress
          sites, implemented designs from Figma, and managed client workflow
          and communications.
        </p>

        <h2 className="resumeH2">Education / Certificates</h2>
        <hr className="resumeRule" />
        <p>
          Add your education history and any certificates here — this card is
          ready for the real details whenever you are.
        </p>
      </ShimmerCard>
    </ResultsLayout>
  );
}
