import type { LikelihoodBand } from "@/types/api";

const BAND_WORDING: Record<LikelihoodBand, string> = {
  lower: "low",
  moderate: "moderate",
  higher: "high",
};

export function ExplanationCard({
  probability,
  band,
  disclaimer,
}: {
  probability: number;
  band: LikelihoodBand;
  disclaimer: string;
}) {
  const percentage = (probability * 100).toFixed(1);
  const level = BAND_WORDING[band] ?? "moderate";

  return (
    <section className="soft-card p-5" aria-label="Plain-language explanation">
      <h2 className="font-display text-lg font-semibold">What this means</h2>
      <p className="mt-2 text-sm text-foreground/90">
        Your health profile shows a {level} similarity ({percentage}%) to women
        in the NHANES research dataset who reported menopause-related menstrual
        changes.
      </p>
      <p className="mt-3 text-xs text-muted-foreground">
        These factors contributed to the model score. They should not be
        interpreted as causes.
      </p>
      <p className="mt-4 rounded-lg border border-border bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
        {disclaimer}
      </p>
    </section>
  );
}
