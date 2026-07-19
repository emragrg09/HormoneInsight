import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepProgressProps {
  steps: { id: string; title: string }[];
  current: number; // 0-based index; last index = review
}

export function StepProgress({ steps, current }: StepProgressProps) {
  return (
    <ol
      aria-label="Assessment progress"
      className="flex flex-wrap items-center gap-2 text-sm"
    >
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "active" : "upcoming";
        return (
          <li key={s.id} className="flex items-center gap-2">
            <span
              aria-current={state === "active" ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 transition-colors",
                state === "active" &&
                  "border-primary/40 bg-primary/10 text-primary",
                state === "done" &&
                  "border-secondary bg-secondary text-secondary-foreground",
                state === "upcoming" &&
                  "border-border bg-background text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-5 place-items-center rounded-full text-xs font-medium",
                  state === "done"
                    ? "bg-primary text-primary-foreground"
                    : state === "active"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                )}
                aria-hidden
              >
                {state === "done" ? <Check className="size-3" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </span>
            {i < steps.length - 1 && (
              <span className="h-px w-4 bg-border" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
