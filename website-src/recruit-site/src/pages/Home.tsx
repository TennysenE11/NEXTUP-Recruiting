import { ArrowRight, Check, Mail, Target, ListChecks, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmailMock } from "@/components/site/EmailMock";
import { Link } from "@/lib/router";
import { APP_URL, STATS } from "@/lib/site";

export function Home() {
  return (
    <>
      {/* Hero: left-aligned copy, real email on the right */}
      <section className="grain border-b">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-20">
          <div>
            <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accent">College baseball recruiting</p>
            <h1 className="mt-3 text-[44px] font-extrabold uppercase leading-[0.95] sm:text-6xl lg:text-7xl">
              Coaches skip mass emails.<br />
              <span className="text-accent">Send them yours.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Recruiting Tracker finds the right college programs, writes a personal email to each coach from that team's own roster, and keeps your follow-ups on time. You send every email yourself, in two taps.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-sm bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-accent/90">
                <a href={APP_URL}>Start free <ArrowRight className="ml-1 h-4 w-4" /></a>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-sm border-2 border-foreground bg-transparent px-6 text-base font-semibold hover:bg-foreground hover:text-background">
                <Link to="how-it-works">See how it works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">Free to use. No account. Works on your phone.</p>
          </div>
          <EmailMock />
        </div>
      </section>

      {/* Real numbers */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="border-l-4 border-accent pl-4">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-5xl font-extrabold leading-none">{s.value}</dd>
              <dd className="mt-2 font-semibold">{s.label}</dd>
              <dd className="text-sm text-muted-foreground">{s.note}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 max-w-2xl text-sm text-muted-foreground">
          Every coach email is copied from the school's official athletics page, never guessed. Programs we couldn't read cleanly are marked "verify" with the official link.
        </p>
      </section>

      {/* Problem / approach */}
      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-extrabold uppercase leading-none sm:text-5xl">Most recruiting sites blast the same email to hundreds of coaches.</h2>
          </div>
          <div className="space-y-5 text-lg text-primary-foreground/85">
            <p>Coaches can spot those in one line. Ours starts with something only that coach would recognize: how many pitchers are leaving their roster, or a fact about their program.</p>
            <p>Then it keeps you honest about the rest: follow-ups every 14 days, a profile score that tells you what coaches still need, and a realistic read on which levels fit you.</p>
            <Link to="features" className="inline-flex items-center gap-1 font-semibold text-background underline decoration-accent decoration-2 underline-offset-4">
              See every feature <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="text-4xl font-extrabold uppercase sm:text-5xl">Three steps a week</h2>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Target, t: "Pick your schools", d: "Filter 1,600 programs by division, state and fit. The app rates each level Reach, Target or Likely from your fastball, size and GPA." },
            { icon: Send, t: "Send in two taps", d: "Each email is already written for that coach. Tap Send in Gmail, press Send, and the next one is ready." },
            { icon: ListChecks, t: "Follow up on time", d: "Follow-ups come due on their own, carrying your newest velo, video or showcase date. Mark replies, calls and camp invites as they happen." },
          ].map((s, i) => (
            <li key={s.t} className="relative rounded-md border bg-card p-6">
              <span className="absolute -top-4 left-6 bg-background px-2 font-display text-3xl font-extrabold text-accent">{i + 1}</span>
              <s.icon className="h-6 w-6 text-field" aria-hidden />
              <h3 className="mt-3 text-2xl font-bold uppercase">{s.t}</h3>
              <p className="mt-2 text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Honest promises */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 rounded-md border-2 border-foreground p-6 sm:p-10 md:grid-cols-[1fr_1.2fr]">
          <div>
            <Mail className="h-8 w-8 text-accent" aria-hidden />
            <h2 className="mt-3 text-3xl font-extrabold uppercase sm:text-4xl">You stay in control</h2>
          </div>
          <ul className="space-y-3 text-[17px]">
            {[
              "Every email goes from your own Gmail, so replies come straight to you.",
              "No fake open tracking. Replies, X Seen, calls and offers are what count.",
              "Your profile and list stay on your phone. No account to make.",
              "Coach data from official pages only, refreshed every fall.",
            ].map((t) => (
              <li key={t} className="flex gap-3"><Check className="mt-1 h-5 w-5 shrink-0 text-field" aria-hidden />{t}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pt-16 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 border-t-4 border-accent pt-8 md:flex-row md:items-center">
          <h2 className="max-w-2xl text-4xl font-extrabold uppercase leading-none sm:text-5xl">Your first ten emails can go out tonight.</h2>
          <div className="flex gap-3">
            <Button asChild size="lg" className="h-12 rounded-sm bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-accent/90"><a href={APP_URL}>Open the app</a></Button>
            <Button asChild size="lg" variant="ghost" className="h-12 rounded-sm px-4 text-base font-semibold"><Link to="pricing">Pricing</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
