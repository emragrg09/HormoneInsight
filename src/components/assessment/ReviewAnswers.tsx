import type { FeatureSchema } from "@/types/api";

export function ReviewAnswers({
  schema,
  values,
}: {
  schema: FeatureSchema;
  values: Record<string, string | number | null>;
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
      {schema.sections.map((section) => (
        <section key={section.id} className="soft-card p-5">
          <h3 className="font-display text-lg font-semibold">{section.title}</h3>
          <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.name} className="flex justify-between gap-3 border-b border-border/50 py-1.5 text-sm">
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
