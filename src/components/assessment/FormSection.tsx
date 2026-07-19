import type { ReactNode } from "react";

export function FormSection({
  title,
  description,
  stepNumber,
  totalSteps,
  children,
}: {
  title: string;
  description?: string;
  stepNumber?: number;
  totalSteps?: number;
  children: ReactNode;
}) {
  return (
    <section className="soft-card border-l-4 border-l-primary/25 p-6 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        {stepNumber && (
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
            {stepNumber}
          </span>
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            {stepNumber && totalSteps && (
              <span className="text-xs text-muted-foreground">
                Step {stepNumber} of {totalSteps}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
