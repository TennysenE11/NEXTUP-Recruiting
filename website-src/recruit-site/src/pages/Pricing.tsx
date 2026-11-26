import { useState } from "react";
import { Intro } from "@/components/site/Intro";
import { APP_URL, CONTACT_EMAIL, FREE_FEATURES, MARKET, PRO, PRO_FEATURES, yearlySavingsPct } from "@/lib/site";
import { cn } from "@/lib/utils";

type Cycle = "monthly" | "yearly";
const money = (n: number) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`);

const PROMISES = [
  ["No sales calls", "The price is right here."],
  ["No contracts", "Cancel in two taps."],
  ["Your data is yours", "Export any time."],
  ["Renewal reminder", "Before any yearly renewal."],
];

function Toggle({ cycle, setCycle, save }: { cycle: Cycle; setCycle: (c: Cycle) => void; save: number }) {
  return (
    <div role="radiogroup" aria-label="Billing period" className="relative inline-grid grid-cols-2 rounded-full border border-white/[.08] bg-white/[.04] p-1">
      <span aria-hidden className={cn("absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-[hsl(var(--brand))] shadow-[0_6px_20px_-6px_hsl(var(--brand))] transition-transform duration-300 ease-[cubic-bezier(.2,.65,.2,1)]", cycle === "yearly" ? "translate-x-full" : "translate-x-0")} style={{ left: 4 }} />
      {(["monthly", "yearly"] as Cycle[]).map((c) => (
        <button key={c} role="radio" aria-checked={cycle === c} onClick={() => setCycle(c)}
          className={cn("relative z-10 h-10 rounded-full px-5 text-[14px] font-medium transition-colors", cycle === c ? "text-foreground" : "text-muted-foreground hover:text-foreground")}>
          {c === "monthly" ? "Monthly" : <>Yearly <span className="text-[hsl(var(--field))]">−{save}%</span></>}
        </button>
      ))}
    </div>
  );
}

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("yearly");
  const save = yearlySavingsPct();
  const perMonthYearly = Math.round((PRO.yearly / 12) * 100) / 100;
  const waitlistHref = CONTACT_EMAIL
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("OpenSpot Pro waitlist")}&body=${encodeURIComponent(`Add me to the Pro waitlist (${cycle} plan).\n\nGrad year:\nPosition:\nDivision I'm targeting:\n`)}`
    : undefined;

  return (
    <>
      <Intro eyebrow="Pricing" title="Free to start. Pro when you want it on autopilot." lead="No sales calls. No contracts.">
        <Toggle cycle={cycle} setCycle={setCycle} save={save} />
      </Intro>

      <section className="mx-auto grid max-w-6xl gap-6 px-5 sm:px-8 md:grid-cols-2">
        {/* Free */}
        <article className="reveal panel-soft flex flex-col p-8 sm:p-10" aria-labelledby="plan-free">
          <h2 id="plan-free" className="text-[15px] font-medium">Free</h2>
          <p className="display grad mt-6 text-[72px] leading-none">$0</p>
          <p className="mt-2 text-[15px] text-muted-foreground">Forever.</p>
          <ul className="mt-8 flex-1 border-t border-foreground/10">
            {FREE_FEATURES.map((f) => <li key={f} className="border-b border-foreground/10 py-3 text-[15px]">{f}</li>)}
          </ul>
          <a href={APP_URL} className="btn-line mt-8 w-full">Open the free app</a>
        </article>

        {/* Pro */}
        <article className="reveal panel relative flex flex-col overflow-hidden border-[hsl(var(--field)/.45)] p-8 sm:p-10" style={{ ["--d" as string]: "100ms" }} aria-labelledby="plan-pro">
          <div className="flex items-center justify-between gap-4">
            <h2 id="plan-pro" className="text-[15px] font-medium">Pro</h2>
            <span className="rounded-full border border-[hsl(var(--field)/.5)] text-[hsl(var(--field))] px-3 py-1 text-[12px] font-medium">Coming 2027</span>
          </div>
          <div className="mt-6 flex items-baseline gap-2">
            <p key={cycle} className="display grad page-enter text-[72px] leading-none">{cycle === "monthly" ? money(PRO.monthly) : money(PRO.yearly)}</p>
            <span className="text-[17px] text-muted-foreground">{cycle === "monthly" ? "a month" : "a year"}</span>
          </div>
          <p className="mt-2 text-[15px] text-muted-foreground">
            {cycle === "monthly" ? "Billed monthly. Cancel anytime." : `${money(perMonthYearly)} a month, billed yearly. Save ${save}% vs monthly.`}
          </p>
          <ul className="mt-8 flex-1 border-t border-white/10">
            {PRO_FEATURES.map((f) => <li key={f} className="border-b border-white/10 py-3 text-[15px]">{f}</li>)}
          </ul>
          {waitlistHref ? (
            <a href={waitlistHref} className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-white text-[15px] font-medium text-[#07090f] transition-transform hover:-translate-y-0.5">Join the Pro waitlist</a>
          ) : (
            <button disabled className="mt-8 inline-flex h-12 w-full cursor-not-allowed items-center justify-center rounded-full border border-white/15 bg-white/[.05] text-[15px] font-medium text-white/75">Waitlist opens soon</button>
          )}
          <p className="mt-4 text-[13px] leading-relaxed text-muted-foreground">21-day free trial at launch. Nothing is charged now.</p>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <div className="grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
          <div>
            <h2 className="display grad reveal text-5xl sm:text-6xl">What families already pay</h2>
            <p className="reveal mt-5 text-[14px] text-muted-foreground">Reported ranges, late 2026.</p>
          </div>
          <div className="reveal">
            <table className="w-full text-left text-[15px]">
              <thead className="sr-only"><tr><th>Product</th><th>Typical price</th></tr></thead>
              <tbody className="border-t border-foreground/10">
                {MARKET.map((m) => (
                  <tr key={m.what} className="border-b border-foreground/10 align-top">
                    <td className="py-5 pr-6">
                      <span className="font-medium">{m.what}</span>
                    </td>
                    <td className="py-5 text-right sm:whitespace-nowrap">{m.price}</td>
                  </tr>
                ))}
                <tr className="border-b-2 border-foreground align-top">
                  <td className="py-5 pr-6">
                    <span className="font-medium">OpenSpot Pro</span>
                  </td>
                  <td className="py-5 text-right font-medium sm:whitespace-nowrap">{money(PRO.monthly)} a month or {money(PRO.yearly)} a year</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <dl className="grid gap-x-10 sm:grid-cols-2 lg:grid-cols-4">
          {PROMISES.map(([t, d], i) => (
            <div key={t} className="reveal border-t border-foreground py-5" style={{ ["--d" as string]: `${i * 70}ms` }}>
              <dt className="display grad text-[30px] leading-none">{t}</dt>
              <dd className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
