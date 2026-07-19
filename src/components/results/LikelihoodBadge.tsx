import type { LikelihoodBand } from "@/types/api";
import { cn } from "@/lib/utils";

const config: Record<LikelihoodBand, { label: string; className: string; symbol: string }> = {
  lower: {
    label: "Lower similarity",
    className: "bg-secondary text-secondary-foreground border-secondary",
    symbol: "◔",
  },
  moderate: {
    label: "Moderate similarity",
    className: "bg-accent/60 text-accent-foreground border-accent",
    symbol: "◑",
  },
  higher: {
    label: "Higher similarity",
    className: "bg-primary/15 text-primary border-primary/30",
    symbol: "●",
  },
};

export function LikelihoodBadge({ band }: { band: LikelihoodBand }) {
  const c = config[band];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        c.className,
      )}
      aria-label={c.label}
    >
      <span aria-hidden className="text-base leading-none">{c.symbol}</span>
      {c.label}
    </span>
  );
}
