import ResultsLayout from "@/components/ResultsLayout";
import ShimmerCard from "@/components/ShimmerCard";
import PixelIcon from "@/components/PixelIcon";

export default function BlogPage() {
  return (
    <ResultsLayout placeholder="Aaleeyah's Blog" resultsCount={0}>
      <ShimmerCard className="emptyState">
        <div className="big">Your search returned 0 posts… yet.</div>
        <p>The blog is under construction. Check back soon! <PixelIcon name="pencil" cell={3} inline /></p>
      </ShimmerCard>
    </ResultsLayout>
  );
}
