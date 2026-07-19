import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy & Limitations — Hormone Insight" },
      {
        name: "description",
        content:
          "How Hormone Insight handles the information you enter, what it does not store, and the limits of this research prototype.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold">Privacy & Limitations</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          A plain-language summary of how this prototype treats your entries and
          where its usefulness ends.
        </p>
      </header>

      <section className="soft-card p-6">
        <h2 className="font-display text-xl font-semibold">How we handle your entries</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm text-foreground/85">
          <li>The frontend does not store your health information in the browser's localStorage.</li>
          <li>Form values are only sent to the configured backend to generate an estimate.</li>
          <li>Analytics does not capture the contents of the health form.</li>
          <li>Sensitive information is not written to console logs.</li>
          <li>You can clear the form at any time using the "Clear form" button.</li>
        </ul>
      </section>

      <section className="soft-card p-6">
        <h2 className="font-display text-xl font-semibold">What this tool is not</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-6 text-sm text-foreground/85">
          <li>Not a medical diagnosis or clinical test.</li>
          <li>Not a substitute for professional medical advice.</li>
          <li>Not a source of treatment or medication recommendations.</li>
          <li>Not clinically validated — the modeled target is a self-reported NHANES response.</li>
        </ul>
      </section>

      <section className="soft-card p-6">
        <h2 className="font-display text-xl font-semibold">Please talk to a professional</h2>
        <p className="mt-2 text-sm text-foreground/85">
          If you have questions about menstrual changes, hormones, or your
          health more broadly, please consult a qualified healthcare provider
          who can consider your full history and examine you in person.
        </p>
      </section>
    </div>
  );
}
