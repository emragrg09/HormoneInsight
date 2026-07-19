import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main id="main" className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6">
          <DisclaimerBanner />
          <div className="mt-6">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
