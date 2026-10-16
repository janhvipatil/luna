import type { Metadata } from "next";
import { PricingPlans } from "@/components/marketing/PricingPlans";
import { PRICING_FAQ } from "@/lib/pricing";

export const metadata: Metadata = {
  title: "Pricing — Luna",
  description: "Simple plans for cafés and restaurants. Start free, upgrade when you post every week.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Simple pricing for busy kitchens
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Plan, draft and preview as much as you like on every plan. AI runs on your own Gemini
          key, so Google bills generation directly with no markup — a typical reel costs about
          $0.80 in video.
        </p>
      </div>

      <div className="mt-10">
        <PricingPlans />
      </div>

      <p className="mt-6 text-center text-xs text-muted">
        Luna prices in USD, excluding tax. Google&apos;s Gemini usage is billed separately by Google.
      </p>

      <section className="mx-auto mt-16 max-w-2xl">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Questions</h2>
        <div className="mt-4 divide-y divide-border rounded-xl border border-border bg-surface">
          {PRICING_FAQ.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden">
                <span className="flex items-center justify-between gap-4">
                  {item.q}
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
