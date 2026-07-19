import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="font-display text-lg font-semibold">Hormone Insight</p>
            <p className="mt-2 text-sm text-muted-foreground">
              A research and educational prototype exploring menopause-related
              menstrual-change patterns in NHANES 2021–2023 data.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Learn</p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-foreground">About the Model</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground">Privacy & Limitations</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-medium">Reminder</p>
            <p className="mt-2 text-sm text-muted-foreground">
              This tool does not provide a medical diagnosis. Please consult a
              qualified healthcare professional for medical advice.
            </p>
          </div>
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hormone Insight — Research prototype.
        </p>
      </div>
    </footer>
  );
}
