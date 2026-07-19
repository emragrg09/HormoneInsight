import { Info } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div
      role="note"
      aria-label="Research prototype disclaimer"
      className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/25 px-4 py-3 text-sm text-accent-foreground"
    >
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p>
        <span className="font-medium">Research prototype.</span>{" "}
        This application is a research and educational tool. It does not provide
        a medical diagnosis and should not replace advice from a qualified
        healthcare professional.
      </p>
    </div>
  );
}
