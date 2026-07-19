import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";
import { LoadingState } from "@/components/LoadingState";
import { APIErrorState } from "@/components/APIErrorState";

export const Route = createFileRoute("/assessment")({
  head: () => ({
    meta: [
      { title: "Assessment — Hormone Insight" },
      {
        name: "description",
        content:
          "Enter menstrual and reproductive health, body measurements, and hormone or lab values to receive an explainable model estimate.",
      },
    ],
  }),
  component: AssessmentPage,
});

function AssessmentPage() {
  const schemaQ = useQuery({
    queryKey: ["feature-schema"],
    queryFn: () => api.getFeatureSchema(),
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold">Assessment</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Please answer what you can. Optional fields may be left blank — the
          model handles missing values on the backend. Please do not enter zero
          for values you don't know.
        </p>
      </header>

      {schemaQ.isLoading && (
        <LoadingState
          title="Loading assessment…"
          detail="Fetching the current model's feature schema."
        />
      )}
      {schemaQ.isError && (
        <APIErrorState
          title="Backend unavailable"
          message="We could not load the assessment questions. Please try again in a moment."
          onRetry={() => schemaQ.refetch()}
        />
      )}
      {schemaQ.data && <AssessmentForm schema={schemaQ.data} />}
    </div>
  );
}
