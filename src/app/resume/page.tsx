import ResultsLayout from "@/components/ResultsLayout";
import ShimmerCard from "@/components/ShimmerCard";
import PixelIcon from "@/components/PixelIcon";
import { findResume } from "@/lib/resume";

// check for freshly uploaded resume files on every request
export const dynamic = "force-dynamic";

export default async function ResumePage() {
  const [pdf, docx] = await Promise.all([findResume("pdf"), findResume("docx")]);
  const updated = [pdf?.mtime, docx?.mtime].filter(Boolean).sort((a, b) => +b! - +a!)[0];

  return (
    <ResultsLayout placeholder="Aaleeyah's Resume" resultsCount={1}>
      <ShimmerCard className="resumeCard">
        <h1 className="resumeName">Aaleeyah Ivy-Kilgore</h1>
        <div className="resumeRole">Software Developer/Engineer</div>

        <div className="resumeActions">
          {pdf && (
            <a className="btn btnPink" href="/api/resume/pdf" download>
              <PixelIcon name="download" cell={3} /> Download PDF
            </a>
          )}
          {docx && (
            <a className="btn" href="/api/resume/docx" download>
              <PixelIcon name="download" cell={3} /> Download Word (.docx)
            </a>
          )}
          {pdf && (
            <a className="btn" href="/api/resume/pdf?view=1" target="_blank" rel="noopener">
              <PixelIcon name="eye" cell={3} /> View in browser
            </a>
          )}
          {!pdf && !docx && (
            <span className="note">Downloadable resume coming soon — reach out on LinkedIn in the meantime!</span>
          )}
          {updated && (
            <span className="note">
              updated {updated.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          )}
        </div>
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
