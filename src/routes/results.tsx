import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Printer, RotateCcw, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sessionStore } from "@/lib/session-store";
import { ProbabilityCard } from "@/components/results/ProbabilityCard";
import { ContributionList } from "@/components/results/ContributionList";
import { ExplanationCard } from "@/components/results/ExplanationCard";
import { APIErrorState } from "@/components/APIErrorState";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Results — Hormone Insight" },
      {
        name: "description",
        content:
          "Explainable model estimate with likelihood band and top contributing factors from your entered information.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const navigate = useNavigate();
  const result = sessionStore.getResult();

  if (!result) {
    return (
      <APIErrorState
        title="No result to display"
        message="Please complete the assessment to see a model estimate."
        onRetry={() => navigate({ to: "/assessment" })}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ProbabilityCard
        probability={result.probability}
        band={result.likelihood_band}
        threshold={result.threshold}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <ContributionList
          title="Top factors increasing the model score"
          description="Entries most associated with the modeled group."
          items={result.top_positive_contributions}
          direction="positive"
        />
        <ContributionList
          title="Top factors decreasing the model score"
          description="Entries that pulled the score down."
          items={result.top_negative_contributions}
          direction="negative"
        />
      </div>

      <ExplanationCard
        explanation={result.explanation}
        disclaimer={result.disclaimer}
      />

      <div className="flex flex-wrap gap-2 print:hidden">
        <Button asChild>
          <Link to="/assessment" onClick={() => sessionStore.clear()}>
            <RotateCcw className="mr-1 size-4" aria-hidden /> Start new assessment
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/assessment">
            <Undo2 className="mr-1 size-4" aria-hidden /> Review my answers
          </Link>
        </Button>
        <Button variant="ghost" onClick={() => window.print()}>
          <Printer className="mr-1 size-4" aria-hidden /> Print results
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Reminder: This tool does not provide treatment or medication
        recommendations. Please consult a qualified healthcare professional for
        medical advice.
      </p>
    </div>
  );
}
