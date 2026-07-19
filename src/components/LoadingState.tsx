import { Loader2 } from "lucide-react";

export function LoadingState({
  title = "Analyzing your responses…",
  detail = "The model is comparing the entered information with patterns found in NHANES research data.",
}: {
  title?: string;
  detail?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="soft-card mx-auto flex max-w-xl flex-col items-center gap-4 p-10 text-center"
    >
      <span className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
        <Loader2 className="size-6 animate-spin" aria-hidden />
      </span>
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{detail}</p>
    </div>
  );
}
