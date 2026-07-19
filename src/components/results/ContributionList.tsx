import type { Contribution } from "@/types/api";

export function ContributionList({
  title,
  description,
  items,
  direction,
}: {
  title: string;
  description?: string;
  items: Contribution[];
  direction: "positive" | "negative";
}) {
  const max = Math.max(1e-6, ...items.map((i) => Math.abs(i.contribution)));
  return (
    <section className="soft-card p-5" aria-label={title}>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          No prominent factors in this direction.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {items.map((c) => {
            const pct = Math.min(100, (Math.abs(c.contribution) / max) * 100);
            return (
              <li key={c.feature_name}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="font-medium">{c.label}</span>
                  <span className="text-muted-foreground">
                    {c.original_value == null || c.original_value === ""
                      ? "—"
                      : String(c.original_value)}
                  </span>
                </div>
                <div
                  className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-muted"
                  aria-hidden
                >
                  <div
                    className={
                      direction === "positive"
                        ? "h-full rounded-full bg-primary/70"
                        : "h-full rounded-full bg-chart-2"
                    }
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                  Contribution: {c.contribution > 0 ? "+" : ""}
                  {c.contribution.toFixed(2)}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
