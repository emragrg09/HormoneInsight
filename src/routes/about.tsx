import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { ModelInfoCard } from "@/components/ModelInfoCard";
import { MetricCard } from "@/components/MetricCard";
import { LoadingState } from "@/components/LoadingState";
import { APIErrorState } from "@/components/APIErrorState";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About the Model — Hormone Insight" },
      {
        name: "description",
        content:
          "How the Hormone Insight prototype was built: NHANES 2021–2023 dataset, class-balanced logistic regression, explainability, and limitations.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  const infoQ = useQuery({ queryKey: ["model-info"], queryFn: () => api.getModelInfo() });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">About the Model</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Transparency about what this prototype does and — importantly — what
          it does not do.
        </p>
      </header>

      {infoQ.isLoading && <LoadingState title="Loading model details…" detail="Fetching model metadata." />}
      {infoQ.isError && (
        <APIErrorState
          title="Could not load model details"
          message="Please try again in a moment."
          onRetry={() => infoQ.refetch()}
        />
      )}

      {infoQ.data && (
        <>
          <ModelInfoCard info={infoQ.data} />

          <section className="soft-card p-6">
            <h2 className="font-display text-xl font-semibold">Prediction task</h2>
            <p className="mt-2 text-sm text-foreground/85">
              The model predicts whether a female NHANES participant reported
              <span className="font-medium"> menopause / change of life </span>
              as the reason for not having regular periods. This is a
              self-reported label from the NHANES reproductive health
              questionnaire — not clinically confirmed menopause.
            </p>
          </section>

          <section className="soft-card p-6">
            <h2 className="font-display text-xl font-semibold">Dataset</h2>
            <p className="mt-2 text-sm">{infoQ.data.dataset}</p>
            <p className="mt-2 text-sm text-muted-foreground">Merged NHANES modules:</p>
            <ul className="mt-2 grid list-disc gap-1 pl-6 text-sm sm:grid-cols-2">
              {infoQ.data.modules.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </section>

          <section className="soft-card p-6">
            <h2 className="font-display text-xl font-semibold">Model</h2>
            <p className="mt-2 text-sm">{infoQ.data.algorithm}</p>
          </section>

          <section className="soft-card p-6">
            <h2 className="font-display text-xl font-semibold">Explainability</h2>
            <p className="mt-2 text-sm text-foreground/85">
              Each result shows how transformed feature values and learned
              coefficients contributed to the model score, split into factors
              that increased and decreased the estimate. Contributions describe
              the model's math — they should not be interpreted as causes.
            </p>
          </section>

          <section aria-labelledby="metrics-heading">
            <h2 id="metrics-heading" className="font-display text-xl font-semibold">
              Reported performance
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Metrics will be filled in from the backend once available.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <MetricCard label="Accuracy" value={infoQ.data.metrics.accuracy} />
              <MetricCard label="Precision" value={infoQ.data.metrics.precision} />
              <MetricCard label="Recall" value={infoQ.data.metrics.recall} />
              <MetricCard label="F1 score" value={infoQ.data.metrics.f1} />
              <MetricCard label="ROC AUC" value={infoQ.data.metrics.roc_auc} />
            </div>
          </section>

          <section className="soft-card p-6">
            <h2 className="font-display text-xl font-semibold">Limitations</h2>
            <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm text-foreground/85">
              <li>The target is self-reported by NHANES participants.</li>
              <li>It is not clinically confirmed menopause.</li>
              <li>The model may not generalize equally across all groups.</li>
              <li>Missing data and NHANES survey design can affect predictions.</li>
              <li>The tool is intended for research and educational use only.</li>
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
