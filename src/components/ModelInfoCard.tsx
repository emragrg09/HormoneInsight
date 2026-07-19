import type { ModelInfo } from "@/types/api";

export function ModelInfoCard({ info }: { info: ModelInfo }) {
  return (
    <section className="soft-card p-6" aria-labelledby="model-info-heading">
      <h2 id="model-info-heading" className="font-display text-xl font-semibold">
        Model overview
      </h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Task</dt>
          <dd className="mt-1 text-sm">{info.task}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Algorithm</dt>
          <dd className="mt-1 text-sm">{info.algorithm}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Dataset</dt>
          <dd className="mt-1 text-sm">{info.dataset}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Target</dt>
          <dd className="mt-1 text-sm">{info.target_description}</dd>
        </div>
      </dl>
    </section>
  );
}
