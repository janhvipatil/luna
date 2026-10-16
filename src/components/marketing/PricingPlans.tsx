"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { buttonClass } from "@/components/ui/button-class";
import { PLANS, type Plan } from "@/lib/pricing";
import { cn } from "@/lib/utils";

function price(plan: Plan, yearly: boolean): string {
  const value = yearly ? plan.yearly : plan.monthly;
  if (value === null) return "Custom";
  return value === 0 ? "$0" : `$${value}`;
}

/** Plan cards with a monthly / yearly toggle. */
export function PricingPlans() {
  const [yearly, setYearly] = useState(true);

  return (
    <div>
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full border border-border bg-surface p-1 text-xs">
          {[
            { id: false, label: "Monthly" },
            { id: true, label: "Yearly · save ~17%" },
          ].map((opt) => (
            <button
              key={opt.label}
              onClick={() => setYearly(opt.id)}
              className={cn(
                "rounded-full px-3 py-1.5 transition-colors",
                yearly === opt.id ? "bg-accent text-accent-foreground" : "text-muted-strong hover:text-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              "relative flex flex-col rounded-2xl border bg-surface p-5",
              plan.highlighted ? "border-accent shadow-lg shadow-accent/10" : "border-border",
            )}
          >
            {plan.highlighted && (
              <span className="absolute -top-2.5 left-5 rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
                Most popular
              </span>
            )}
            <h3 className="text-sm font-medium text-foreground">{plan.name}</h3>
            <p className="mt-1 min-h-[2.5rem] text-xs leading-relaxed text-muted">{plan.tagline}</p>

            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-semibold tracking-tight text-foreground">
                {price(plan, yearly)}
              </span>
              {plan.monthly !== null && plan.monthly > 0 && (
                <span className="text-xs text-muted">/ month{yearly ? ", billed yearly" : ""}</span>
              )}
            </div>

            <div className="mt-3 rounded-lg bg-matcha-soft px-3 py-2 text-xs text-matcha-strong">
              AI on your own Gemini key · pay Google per use
            </div>

            <ul className="mt-4 flex-1 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex gap-2 text-xs text-muted-strong">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-matcha-strong" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href={`/signup?plan=${plan.id}`}
              className={buttonClass({
                variant: plan.highlighted ? "primary" : "secondary",
                className: "mt-5 w-full",
              })}
            >
              {plan.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
