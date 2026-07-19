import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList, Sparkles, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hormone Insight — Explainable menopause-related menstrual-change model" },
      {
        name: "description",
        content:
          "Research prototype estimating how closely entered information matches NHANES participants who reported menopause-related menstrual changes.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="space-y-16">
      <section className="grid gap-10 pt-4 md:grid-cols-[1.15fr_.85fr] md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" aria-hidden /> Research prototype · NHANES 2021–2023
          </span>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
            Hormone Insight
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            An explainable AI research prototype for understanding
            menopause-related menstrual changes.
          </p>
          <p className="mt-4 max-w-xl text-sm text-foreground/85">
            This tool uses patterns found in NHANES women's health data to
            estimate how closely entered information matches participants who
            reported <span className="font-medium">menopause or change of life</span>{" "}
            as the reason for not having regular periods.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/assessment">
                Start Assessment <ArrowRight className="ml-1 size-4" aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/about">Learn About the Model</Link>
            </Button>
          </div>
        </div>

        <div className="soft-card relative overflow-hidden p-6 sm:p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-primary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 -left-10 size-52 rounded-full bg-accent/40 blur-3xl"
          />
          <div className="relative">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">
              Example estimate
            </p>
            <p className="mt-2 font-display text-4xl font-semibold text-primary">
              72%
            </p>
            <p className="text-sm text-muted-foreground">
              similarity — <span className="text-foreground">higher band</span>
            </p>
            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-secondary via-accent to-primary" />
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex justify-between border-b border-border/60 py-1.5">
                <span className="text-muted-foreground">Age</span>
                <span className="font-medium">+1.21</span>
              </li>
              <li className="flex justify-between border-b border-border/60 py-1.5">
                <span className="text-muted-foreground">Estradiol</span>
                <span className="font-medium">+0.68</span>
              </li>
              <li className="flex justify-between py-1.5">
                <span className="text-muted-foreground">Pregnancy test</span>
                <span className="font-medium">−0.42</span>
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Illustrative only. Not a diagnosis.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="how-heading">
        <h2 id="how-heading" className="font-display text-2xl font-semibold">
          How it works
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ClipboardList,
              title: "Enter information",
              body: "Answer questions about menstrual and reproductive health, body measurements, and lab values you have available.",
            },
            {
              icon: Sparkles,
              title: "Review the model estimate",
              body: "See an estimated similarity to the modeled NHANES group, shown as a percentage with a neutral category.",
            },
            {
              icon: LineChart,
              title: "Understand contributing factors",
              body: "Explore which of your entered values most influenced the model score — pushing it up or pulling it down.",
            },
          ].map((s, i) => (
            <div key={s.title} className="soft-card p-6">
              <div className="flex items-center gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <s.icon className="size-4" aria-hidden />
                </span>
                <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  Step {i + 1}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="soft-card border-primary/15 bg-primary/5 p-6 sm:p-8">
        <p className="font-display text-lg font-semibold">A note before you begin</p>
        <p className="mt-2 max-w-3xl text-sm text-foreground/85">
          This application is a research and educational prototype. It does not
          provide a medical diagnosis and should not replace advice from a
          qualified healthcare professional. Results are based on patterns in a
          self-reported NHANES response and are not clinically validated.
        </p>
      </section>
    </div>
  );
}
