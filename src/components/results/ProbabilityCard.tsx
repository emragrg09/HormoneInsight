import type { LikelihoodBand } from "@/types/api";
import { LikelihoodBadge } from "./LikelihoodBadge";

export function ProbabilityCard({
  probability,
  band,
  threshold,
}: {
  probability: number;
  band: LikelihoodBand;
  threshold: number;
}) {
  const pct = Math.round(probability * 1000) / 10;
  return (
    <section
      className="soft-card p-6 sm:p-8"
      aria-labelledby="probability-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Model estimate
          </p>
          <h1
            id="probability-heading"
            className="mt-1 font-display text-2xl font-semibold sm:text-3xl"
          >
            Menopause-related menstrual-change model estimate
          </h1>
        </div>
        <LikelihoodBadge band={band} />
      </div>

      <div className="mt-6 flex items-baseline gap-3">
        <span className="font-display text-5xl font-semibold tabular-nums text-primary sm:text-6xl">
          {pct}%
        </span>
        <span className="text-sm text-muted-foreground">
          estimated similarity to the modeled NHANES group
        </span>
      </div>

      <div
        role="img"
        aria-label={`Estimated similarity ${pct} percent, ${band} band. Model decision threshold ${Math.round(
          threshold * 100,
        )} percent.`}
        className="mt-6"
      >
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-secondary via-accent to-primary"
            style={{ width: `${Math.max(2, pct)}%` }}
          />
          <div
            className="absolute inset-y-[-4px] w-px bg-foreground/50"
            style={{ left: `${threshold * 100}%` }}
            aria-hidden
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[11px] uppercase tracking-wide text-muted-foreground">
          <span>Lower</span>
          <span>Moderate</span>
          <span>Higher</span>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        The model estimates how closely the entered information matches NHANES
        participants who reported <span className="font-medium text-foreground">menopause or change of life</span>{" "}
        as the reason for not having regular periods. This is not a diagnosis
        and not clinically validated.
      </p>
    </section>
  );
}
