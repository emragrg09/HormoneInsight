import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepProgress } from "@/components/StepProgress";
import { FormSection } from "./FormSection";
import { HealthField } from "./HealthField";
import { ReviewAnswers } from "./ReviewAnswers";
import { APIErrorState } from "@/components/APIErrorState";
import { LoadingState } from "@/components/LoadingState";
import type { FeatureSchema } from "@/types/api";
import { api, ApiRequestError } from "@/services/api";
import { sessionStore } from "@/lib/session-store";

interface AssessmentFormProps {
  schema: FeatureSchema;
}

type FormValues = Record<string, string | number | null>;

function buildResolver(schema: FeatureSchema) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const section of schema.sections) {
    for (const f of section.fields) {
      let base: z.ZodTypeAny;
      if (f.type === "number") {
        base = z
          .union([z.number(), z.null()])
          .refine((v) => !(f.required && (v === null || v === undefined)), {
            message: `${f.label} is required.`,
          });
      } else {
        base = z
          .union([z.string(), z.null()])
          .refine((v) => !(f.required && (v === null || v === "")), {
            message: `${f.label} is required.`,
          });
      }
      shape[f.name] = base;
    }
  }
  return zodResolver(z.object(shape));
}

export function AssessmentForm({ schema }: AssessmentFormProps) {
  const navigate = useNavigate();
  const steps = useMemo(
    () => [
      ...schema.sections.map((s) => ({ id: s.id, title: s.title })),
      { id: "review", title: "Review" },
    ],
    [schema],
  );
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaults: FormValues = useMemo(() => {
    const d: FormValues = {};
    for (const s of schema.sections) for (const f of s.fields) d[f.name] = null;
    return d;
  }, [schema]);

  const form = useForm<FormValues>({
    defaultValues: defaults,
    resolver: buildResolver(schema),
    mode: "onBlur",
  });

  const isReview = step === schema.sections.length;
  const currentSection = schema.sections[step];

  async function goNext() {
    if (isReview) return;
    const names = currentSection.fields.map((f) => f.name);
    const ok = await form.trigger(names);
    if (!ok) {
      toast.error("Please review the highlighted fields.");
      return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goPrev() {
    setStep((s) => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(values: FormValues) {
    setError(null);
    setSubmitting(true);
    try {
      // Strip empty values — never default missing to zero.
      const features: FormValues = {};
      for (const k of Object.keys(values)) {
        const v = values[k];
        if (v !== null && v !== "" && v !== undefined) features[k] = v;
      }
      sessionStore.setAnswers(features);
      const result = await api.predict({ features });
      sessionStore.setResult(result);
      navigate({ to: "/results" });
    } catch (e) {
      const msg =
        e instanceof ApiRequestError
          ? e.message
          : "We could not generate the estimate right now. Please check your entries or try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function loadSample() {
    try {
      const sample = await api.getSampleParticipant();
      for (const [k, v] of Object.entries(sample.features)) {
        form.setValue(k, v as never, { shouldDirty: true });
      }
      toast.success("Sample profile loaded.");
    } catch {
      toast.error("Could not load sample profile.");
    }
  }

  function clearForm() {
    form.reset(defaults);
    setStep(0);
    toast.info("Form cleared.");
  }

  if (submitting) return <LoadingState />;
  if (error)
    return (
      <APIErrorState
        message={error}
        onRetry={() => {
          setError(null);
          form.handleSubmit(onSubmit)();
        }}
      />
    );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <StepProgress steps={steps} current={step} />
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={loadSample}>
            Load sample profile
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={clearForm}>
            Clear form
          </Button>
        </div>
      </div>

      <div className="soft-card border-primary/15 bg-primary/5 p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold">
          A few questions about your health
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-foreground/85">
          This questionnaire takes about 3–5 minutes. Answer what you can —
          optional fields may be left blank and the model will handle missing
          values on the backend. Please do not enter zero for values you don't
          know.
        </p>
      </div>

      {!isReview ? (
        <FormSection
          title={currentSection.title}
          description={currentSection.description}
        >
          {currentSection.fields.map((f) => (
            <HealthField
              key={f.name}
              field={f}
              control={form.control}
              error={form.formState.errors[f.name]?.message as string | undefined}
            />
          ))}
        </FormSection>
      ) : (
        <div className="space-y-4">
          <div className="soft-card p-5">
            <h2 className="font-display text-xl font-semibold">Review your answers</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Please confirm the entries below before generating the estimate.
              You can go back to any step to make edits.
            </p>
          </div>
          <ReviewAnswers schema={schema} values={form.getValues()} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={goPrev}
          disabled={step === 0}
        >
          Previous
        </Button>
        {!isReview ? (
          <div className="flex gap-2">
            <Button type="button" onClick={goNext}>
              Next
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={async () => {
                const ok = await form.trigger();
                if (ok) setStep(schema.sections.length);
              }}
            >
              Review
            </Button>
          </div>
        ) : (
          <Button type="submit">Submit for estimate</Button>
        )}
      </div>
    </form>
  );
}
