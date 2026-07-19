export function ExplanationCard({
  explanation,
  disclaimer,
}: {
  explanation: string;
  disclaimer: string;
}) {
  return (
    <section className="soft-card p-5" aria-label="Plain-language explanation">
      <h2 className="font-display text-lg font-semibold">What this means</h2>
      <p className="mt-2 text-sm text-foreground/90">{explanation}</p>
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
