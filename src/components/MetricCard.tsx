export function MetricCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number | null;
  description?: string;
}) {
  const display = value == null ? "Available from backend" : (value * 100).toFixed(1) + "%";
  return (
    <div className="soft-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-primary">
        {display}
      </p>
      {description && (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
