import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function APIErrorState({
  title = "Something went wrong",
  message = "We could not generate the estimate right now. Please check your entries or try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="soft-card mx-auto flex max-w-xl flex-col items-center gap-3 p-8 text-center"
    >
      <span className="grid size-12 place-items-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="size-5" aria-hidden />
      </span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-2">
          Try again
        </Button>
      )}
    </div>
  );
}
