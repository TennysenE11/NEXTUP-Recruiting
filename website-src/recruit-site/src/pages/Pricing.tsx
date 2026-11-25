import { useState } from "react";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHead } from "@/components/site/PageHead";
import { APP_URL, CONTACT_EMAIL, FREE_FEATURES, MARKET, PRO, PRO_FEATURES, yearlySavingsPct } from "@/lib/site";
import { cn } from "@/lib/utils";

type Cycle = "monthly" | "yearly";
const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("yearly");
  const save = yearlySavingsPct();
  const perMonthYearly = PRO.yearly / 12;
  const waitlistHref = CONTACT_EMAIL
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Recruiting Tracker Pro waitlist")}&body=${encodeURIComponent(`Add me to the Pro waitlist (${cycle} plan).\n\nGrad year:\nDivision I'm targeting:\n`)}`
    : undefined;
  return (
    <>
      <PageHead kicker="Pricing" title="Free to start. Pro when you want it on autopilot." lead="No sales calls, no contracts. The free app does the whole job by hand; Pro does the weekly sending and reply checking for you." />
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* billing toggle */}
        <div role="radiogroup" aria-label="Billing period" className="inline-flex rounded-sm border-2 border-foreground p-1">
          {(["monthly", "yearly"] as Cycle[]).map((c) => (
            <button key={c} role="radio" aria-checked={cycle === c} onClick={() => setCycle(c)}
              className={cn("rounded-[3px] px-4 py-2 font-display text-lg font-bold uppercase tracking-wide", cycle === c ? "bg-foreground text-background" : "text-foreground")}>
              {c === "monthly" ? "Monthly" : "Yearly"}{c === "yearly" && <span className={cn("ml-2 text-sm", cycle === c ? "text-background/80" : "text-accent")}>save {save}%</span>}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* Free */}
          <section className="flex flex-col rounded-md border bg-card p-6 sm:p-8" aria-labelledby="plan-free">
            <h2 id="plan-free" className="text-3xl font-extrabold uppercase">Free</h2>
            <p className="mt-1 text-muted-foreground">Everything you need to recruit yourself.</p>
            <p className="mt-6 font-display text-6xl font-extrabold leading-none">$0</p>
            <p className="mt-1 text-sm text-muted-foreground">forever</p>
            <ul className="mt-6 flex-1 space-y-3">
              {FREE_FEATURES.map((f) => <li key={f} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-field" aria-hidden />{f}</li>)}
            </ul>
            <Button asChild size="lg" variant="outline" className="mt-8 h-12 rounded-sm border-2 border-foreground bg-transparent text-base font-semibold hover:bg-foreground hover:text-background">
              <a href={APP_URL}>Open the free app</a>
            </Button>
          </section>

          {/* Pro */}
          <section className="relative flex flex-col rounded-md border-2 border-accent bg-card p-6 sm:p-8" aria-labelledby="plan-pro">
            <span className="absolute -top-3.5 left-6 rounded-sm bg-accent px-2.5 py-1 font-display text-sm font-bold uppercase tracking-wider text-accent-foreground">Coming 2027</span>
            <h2 id="plan-pro" className="text-3xl font-extrabold uppercase">Pro</h2>
            <p className="mt-1 text-muted-foreground">Your outreach runs every week while you're at practice.</p>
            {cycle === "monthly" ? (
              <>
                <p className="mt-6 font-display text-6xl font-extrabold leading-none">{money(PRO.monthly)}<span className="text-2xl text-muted-foreground"> /month</span></p>
                <p className="mt-1 text-sm text-muted-foreground">billed monthly, cancel anytime</p>
              </>
            ) : (
              <>
                <p className="mt-6 font-display text-6xl font-extrabold leading-none">{money(PRO.yearly)}<span className="text-2xl text-muted-foreground"> /year</span></p>
                <p className="mt-1 text-sm text-muted-foreground">{money(Math.round(perMonthYearly * 100) / 100)} a month, billed yearly. Save {save}% vs monthly.</p>
              </>
            )}
            <ul className="mt-6 flex-1 space-y-3">
              {PRO_FEATURES.map((f) => <li key={f} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />{f}</li>)}
            </ul>
            {waitlistHref ? (
              <Button asChild size="lg" className="mt-8 h-12 rounded-sm bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90">
                <a href={waitlistHref}>Join the Pro waitlist</a>
              </Button>
            ) : (
              <Button size="lg" disabled className="mt-8 h-12 rounded-sm bg-accent text-base font-semibold text-accent-foreground">
                <Clock className="mr-2 h-4 w-4" aria-hidden /> Waitlist opens soon
              </Button>
            )}
            <p className="mt-3 text-sm text-muted-foreground">21-day free trial when Pro launches. Pro isn't for sale yet, so nothing is charged now. A parent or guardian will be the account holder.</p>
          </section>
        </div>

        {/* Market context */}
        <section className="mt-16">
          <h2 className="text-3xl font-extrabold uppercase sm:text-4xl">What families already pay</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">Reported prices for comparable products in late 2026. Ranges, not exact quotes; check each company's own site.</p>
          <div className="mt-6 overflow-hidden rounded-md border">
            <table className="w-full text-left text-[15px]">
              <thead className="bg-secondary font-display text-sm uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Typical price</th><th className="hidden px-4 py-3 sm:table-cell">Notes</th></tr>
              </thead>
              <tbody>
                {MARKET.map((m) => (
                  <tr key={m.what} className="border-t bg-card">
                    <td className="px-4 py-3 font-semibold">{m.what}<div className="text-sm font-normal text-muted-foreground sm:hidden">{m.note}</div></td>
                    <td className="px-4 py-3">{m.price}</td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">{m.note}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-accent bg-accent/[0.06]">
                  <td className="px-4 py-3 font-semibold">Recruiting Tracker Pro</td>
                  <td className="px-4 py-3 font-semibold">{money(PRO.monthly)} a month or {money(PRO.yearly)} a year</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">price published, cancel anytime, free plan always available</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Promises */}
        <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["No sales calls", "The price is on this page. That's the price."],
            ["No contracts", "Monthly means monthly. Cancel from the app in two taps."],
            ["Free stays free", "Everything in the free app today stays free."],
            ["Renewal reminder", "We email you before a yearly plan renews, so it never surprises you."],
          ].map(([t, d]) => (
            <div key={t} className="border-t-4 border-foreground pt-4">
              <h3 className="text-2xl font-extrabold uppercase">{t}</h3>
              <p className="mt-1 text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
