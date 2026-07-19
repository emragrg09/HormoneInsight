import type { FeatureSchema } from "@/types/api";

export function ReviewAnswers({
  schema,
  values,
  onEditSection,
}: {
  schema: FeatureSchema;
  values: Record<string, string | number | null>;
  onEditSection?: (index: number) => void;
}) {
  function display(name: string, raw: string | number | null | undefined) {
    if (raw == null || raw === "") return "—";
    for (const s of schema.sections) {
      const f = s.fields.find((x) => x.name === name);
      if (f?.options) {
        return f.options.find((o) => o.value === String(raw))?.label ?? String(raw);
      }
    }
    return String(raw);
  }
  return (
    <div className="space-y-4">
      {schema.sections.map((section, idx) => (
        <section key={section.id} className="soft-card p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-display text-lg font-semibold">{section.title}</h3>
              {section.description && (
                <p className="mt-1 text-xs text-muted-foreground">{section.description}</p>
              )}
            </div>
            {onEditSection && (
              <button
                type="button"
                onClick={() => onEditSection(idx)}
                className="shrink-0 text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                Edit
              </button>
            )}
          </div>
          <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {section.fields.map((f) => (
              <div
                key={f.name}
                className="flex justify-between gap-3 border-b border-border/50 py-1.5 text-sm"
              >
                <dt className="text-muted-foreground">
                  {f.label}
                  {f.unit ? ` (${f.unit})` : ""}
                </dt>
                <dd className="font-medium">{display(f.name, values[f.name])}</dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
