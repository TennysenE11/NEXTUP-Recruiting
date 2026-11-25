import { useEffect, useRef, useState } from "react";
import { Phone } from "@/components/site/Phone";
import { LogoMark } from "@/components/site/Logo";
import { Link } from "@/lib/router";
import { APP_URL, POSITIONS, SHOTS, STATS } from "@/lib/site";
import { cn } from "@/lib/utils";

const WEEK = [
  { n: "01", t: "Find your fits", d: "1,600 programs. Pick divisions and states.", shot: SHOTS.schools, alt: "School list with college logos" },
  { n: "02", t: "Send in two taps", d: "Every email is already written for that coach.", shot: SHOTS.send, alt: "The next email, ready to send" },
  { n: "03", t: "Follow up on time", d: "Reminders lead with your newest numbers.", shot: SHOTS.home, alt: "Home screen with this week's plan" },
  { n: "04", t: "Know where you stand", d: "A score shows what coaches still need.", shot: SHOTS.profile, alt: "Profile score checklist" },
];

function WeekScroller() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.i)); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);
  return (
    <div className="grid gap-12 md:grid-cols-[1fr_minmax(240px,310px)] md:gap-20">
      <ol className="space-y-16 md:space-y-[34vh] md:py-[18vh]">
        {WEEK.map((w, i) => (
          <li key={w.n} data-i={i} ref={(el) => { refs.current[i] = el; }} className={cn("transition-opacity duration-500 md:opacity-25", active === i && "md:opacity-100")}>
            <p className="font-mono text-[13px] text-[hsl(var(--field))]">{w.n}</p>
            <h3 className="display mt-2 text-5xl sm:text-6xl">{w.t}</h3>
            <p className="mt-3 text-[17px] text-muted-foreground">{w.d}</p>
            <div className="mt-8 w-[68%] max-w-[260px] md:hidden"><Phone src={w.shot} alt={w.alt} /></div>
          </li>
        ))}
      </ol>
      <div className="hidden md:block">
        <div className="sticky top-[12vh]">
          <div className="relative ml-auto" style={{ width: "min(100%, calc(76vh * 390 / 844))" }}>
            {WEEK.map((w, i) => (
              <div key={w.n} className={cn("screen-fade", i === 0 ? "relative" : "absolute inset-0", active === i ? "opacity-100" : "pointer-events-none translate-y-3 opacity-0")}>
                <Phone src={w.shot} alt={w.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Home() {
  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 md:pb-28 md:pt-16">
        <div className="grid items-center gap-14 md:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="eyebrow reveal">Every position. Every division.</p>
            <h1 className="display reveal mt-5 text-[52px] sm:text-[72px] lg:text-[84px]" style={{ ["--d" as string]: "80ms" }}>
              Email college coaches like you <em>already know</em> their team.
            </h1>
            <p className="reveal mt-6 text-[19px] text-muted-foreground" style={{ ["--d" as string]: "160ms" }}>
              Find programs. Send personal emails. Follow up on time.
            </p>
            <div className="reveal mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ ["--d" as string]: "240ms" }}>
              <a href={APP_URL} className="btn-ink">Start free</a>
              <Link to="how-it-works" className="link-arrow">How it works →</Link>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[420px] pb-6">
            <div className="float-in absolute right-0 top-10 w-[58%]" style={{ ["--r" as string]: "4deg", ["--d" as string]: "250ms" }}>
              <Phone src={SHOTS.schools} alt="School list with college logos" className="opacity-95" />
            </div>
            <div className="float-in relative w-[64%]" style={{ ["--r" as string]: "-3deg" }}>
              <Phone src={SHOTS.send} alt="The next email ready to send" />
            </div>
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="border-y border-foreground/10 bg-card">
        <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-5 py-14 sm:px-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} className="reveal" style={{ ["--d" as string]: `${i * 70}ms` }}>
              <dt className="display text-[56px] leading-none sm:text-[68px]">{s.value}</dt>
              <dd className="mt-2 text-[14px] text-muted-foreground">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* The first line */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
        <h2 className="display reveal max-w-2xl text-5xl sm:text-6xl">Coaches read the first line.</h2>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <figure className="reveal rounded-[1.25rem] border border-foreground/10 p-7 sm:p-9">
            <figcaption className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Most emails</figcaption>
            <blockquote className="mt-5 text-[21px] leading-snug text-muted-foreground/70 line-through decoration-foreground/20">
              "Dear Coach, I am a hard-working, dedicated athlete and very interested in your program."
            </blockquote>
          </figure>
          <figure className="reveal rounded-[1.25rem] bg-foreground p-7 text-background sm:p-9" style={{ ["--d" as string]: "120ms" }}>
            <figcaption className="text-[12px] font-medium uppercase tracking-[0.14em] text-[hsl(259_90%_78%)]">Yours</figcaption>
            <blockquote className="display mt-5 text-[30px] leading-[1.12]">
              "I saw that 5 of the 6 infielders on your 2027 roster are seniors or grad students."
            </blockquote>
          </figure>
        </div>
      </section>

      {/* A week, scroll-told */}
      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <p className="eyebrow reveal">How a week goes</p>
        <h2 className="display reveal mt-4 text-5xl sm:text-6xl">Ten minutes.</h2>
        <div className="mt-12 md:mt-0"><WeekScroller /></div>
      </section>

      {/* Every position */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-8">
        <h2 className="display reveal text-5xl sm:text-6xl">Built for every position.</h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
          {POSITIONS.map((p, i) => (
            <li key={p.pos} className="reveal rounded-[1.25rem] border border-foreground/10 bg-card p-5" style={{ ["--d" as string]: `${i * 60}ms` }}>
              <p className="display text-[30px] leading-none">{p.pos}</p>
              <p className="mt-3 text-[13px] leading-snug text-muted-foreground">{p.numbers}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <figure className="reveal max-w-3xl">
          <blockquote className="display text-[34px] leading-[1.15] sm:text-[44px]">
            "I built the tool I wanted: real coach contacts, emails that prove I read the roster, and reminders to follow up."
          </blockquote>
          <figcaption className="mt-5 text-[15px] text-muted-foreground">A 2027 pitcher from Santa Clarita, California</figcaption>
        </figure>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <div className="reveal relative overflow-hidden rounded-[1.5rem] bg-[#0b0a0e] px-8 py-14 text-white sm:px-12 sm:py-20">
          <LogoMark className="pointer-events-none absolute right-12 top-1/2 hidden w-[300px] -translate-y-1/2 text-white/10 md:block lg:w-[360px]" />
          <h2 className="display relative max-w-xl text-5xl sm:text-7xl">Your first ten emails can go out tonight.</h2>
          <div className="relative mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a href={APP_URL} className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[15px] font-medium text-[#0b0a0e] transition-transform duration-200 hover:-translate-y-0.5">Start free</a>
            <Link to="pricing" className="font-medium underline decoration-white/40 underline-offset-[5px] hover:decoration-white">See pricing →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
