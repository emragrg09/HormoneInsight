import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/assessment", label: "Assessment" },
  { to: "/results", label: "Results" },
  { to: "/about", label: "About the Model" },
  { to: "/privacy", label: "Privacy & Limitations" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">
            Hormone Insight
          </span>
        </Link>
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1 text-sm">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  activeProps={{ className: "text-foreground bg-muted" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <details className="md:hidden relative">
          <summary className="list-none rounded-md border border-border px-3 py-2 text-sm cursor-pointer">
            Menu
          </summary>
          <ul className="absolute right-0 mt-2 w-56 rounded-lg border border-border bg-popover p-2 shadow-lg">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="block rounded-md px-3 py-2 text-sm hover:bg-muted"
                  activeProps={{ className: "bg-muted text-foreground" }}
                  activeOptions={{ exact: l.to === "/" }}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </header>
  );
}
