import { Fragment, useEffect, useRef, useState } from "react";
import { Phone } from "@/components/site/Phone";
import { LogoMark } from "@/components/site/Logo";
import { HeroPanel } from "@/components/site/HeroPanel";
import { USMap } from "@/components/site/USMap";
import { OpeningsChart } from "@/components/site/OpeningsChart";
import { PositionDemo } from "@/components/site/PositionDemo";
import { OpenSpotsFinder } from "@/components/site/OpenSpotsFinder";
import { SectionHead } from "@/components/site/SectionHead";
import { Marquee, Tilt } from "@/components/site/Motion";
import { Link } from "@/lib/router";
import { APP_START, POSITIONS, SHOTS } from "@/lib/site";
import { cn } from "@/lib/utils";

// Headline words rise in one at a time.
function Words({ parts, start = 100 }: { parts: { t: string; em?: boolean }[]; start?: number }) {
  let i = 0;
  return (
    <>
      {parts.map((p, k) => {
        const words = p.t.trim().split(/\s+/).map((w) => (
          <Fragment key={i}><span className="word" style={{ ["--d" as string]: `${start + i++ * 70}ms` }}>{w}</span>{" "}</Fragment>
        ));
        return p.em ? <em key={k}>{words}</em> : <span key={k}>{words}</span>;
      })}
    </>
  );
}

const STRIP = ["NCAA D1 · 309", "NCAA D2 · 252", "NCAA D3 · 379", "NAIA · 182", "JUCO · 478", "49 states", "Pitchers", "Catchers", "Infielders", "Outfielders", "Two-way"];

const WEEK = [
  { n: "01", t: "Find your fits", d: "Pick divisions and states.", c: "green", shot: SHOTS.schools, alt: "School list with college logos" },
  { n: "02", t: "Send in two taps", d: "Every email is already written for that coach.", c: "blue", shot: SHOTS.send, alt: "The next email, ready to send" },
  { n: "03", t: "Follow up on time", d: "Reminders lead with your newest numbers.", c: "orange", shot: SHOTS.home, alt: "This week's plan" },
  { n: "04", t: "Know where you stand", d: "A score shows what coaches still need.", c: "purple", shot: SHOTS.profile, alt: "Profile score" },
] as const;
const HSL: Record<string, string> = { green: "var(--c-green)", blue: "var(--c-blue)", orange: "var(--c-orange)", purple: "var(--field)" };

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
      <ol className="relative space-y-16 md:space-y-[34vh] md:py-[18vh]">
        <span aria-hidden className="absolute left-[11px] top-2 hidden h-[calc(100%-1rem)] w-px bg-white/10 md:block" />
        <span aria-hidden className="absolute left-[11px] top-2 hidden w-px transition-[height] duration-700 ease-out md:block"
          style={{ height: `calc(${((active + 1) / WEEK.length) * 100}% - 1rem)`, background: "linear-gradient(180deg, hsl(var(--c-green)), hsl(var(--c-blue)), hsl(var(--c-orange)), hsl(var(--field)))" }} />
        {WEEK.map((w, i) => (
          <li key={w.n} data-i={i} ref={(el) => { refs.current[i] = el; }} className={cn("relative transition-opacity duration-500 md:pl-12 md:opacity-30", active >= i && "md:opacity-100")}>
            <span aria-hidden className="absolute left-0 top-1 hidden h-6 w-6 place-items-center rounded-full border border-white/20 bg-background md:grid">
              <span className="h-2.5 w-2.5 rounded-full transition-transform duration-500" style={{ background: `hsl(${HSL[w.c]})`, boxShadow: `0 0 14px hsl(${HSL[w.c]})`, transform: active >= i ? "scale(1)" : "scale(.4)" }} />
            </span>
            <p className="text-[12px] font-semibold uppercase tracking-[0.3em]" style={{ color: `hsl(${HSL[w.c]})` }}>Step {w.n}</p>
            <h3 className="display grad mt-3 text-[44px] sm:text-[56px]">{w.t}</h3>
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
                <Tilt><Phone src={w.shot} alt={w.alt} /></Tilt>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// On phones, a start button stays at the bottom once you scroll past the top.
function StickyStart() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 900);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <div className={cn("fixed inset-x-3 bottom-3 z-30 transition-[transform,opacity] duration-300 md:hidden", show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0")}>
      <a href={APP_START} tabIndex={show ? 0 : -1} className="btn-ink h-14 w-full text-[16px]">Find my open spots, free</a>
    </div>
  );
}

export function Home() {
  return (
    <>
      <StickyStart />
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-5 text-center sm:px-8 sm:pt-12 md:pb-24 md:pt-20">
        <p className="eyebrow reveal justify-center"><span>College baseball</span><span className="sep">·</span><span>Every position</span></p>
        <h1 className="display grad mx-auto mt-4 max-w-5xl text-[46px] sm:mt-6 sm:text-[88px] lg:text-[112px]">
          <Words parts={[{ t: "Every roster has an" }, { t: "open spot.", em: true }]} />
        </h1>
        <p className="reveal mx-auto mt-4 max-w-xl text-[17px] leading-relaxed text-muted-foreground sm:mt-6 sm:text-[20px]" style={{ ["--d" as string]: "500ms" }}>
          Find the programs losing players at your position. Email their coaches in two taps.
        </p>
        <div className="reveal mt-6 sm:mt-9" style={{ ["--d" as string]: "620ms" }}>
          <OpenSpotsFinder />
        </div>
        <div className="reveal mx-auto mt-14 max-w-3xl" style={{ ["--d" as string]: "760ms" }}>
          <HeroPanel />
        </div>
      </section>

      {/* Moving strip */}
      <section className="border-y border-white/[.07] py-5" aria-label="Divisions and positions covered">
        <Marquee items={STRIP.map((t) => (
          <span key={t} className="display flex items-center px-6 text-[30px] leading-none text-white/80 sm:text-[38px]">{t}<span className="ml-12 text-[16px] text-[hsl(var(--field))]" aria-hidden>✦</span></span>
        ))} />
      </section>

      {/* 01 Map */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <SectionHead n="01" label="The map" title={<>1,600 programs. <em>Every</em> division.</>} lead="D1 to JUCO in 49 states. Pick a division. Tap a state." />
        <div className="reveal mx-auto mt-12 max-w-5xl"><USMap /></div>
      </section>

      {/* 02 Openings */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <SectionHead n="02" label="The openings" title={<>Find the gap at <em>your</em> position.</>} lead="Counted from 646 official rosters." />
        <div className="reveal mx-auto mt-12 max-w-4xl"><OpeningsChart /></div>
      </section>

      {/* 03 First line */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <SectionHead n="03" label="The first line" title={<>Coaches read <em>one</em> line.</>} lead="Tap a position." />
        <div className="mt-12 grid items-start gap-5 md:grid-cols-[0.8fr_1.2fr]">
          <figure className="reveal panel-soft p-7 sm:p-9">
            <figcaption className="text-[12px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Most emails</figcaption>
            <blockquote className="mt-5 text-[21px] leading-snug text-white/40 line-through decoration-white/25">
              "Dear Coach, I am a hard-working, dedicated athlete and very interested in your program."
            </blockquote>
          </figure>
          <div className="reveal" style={{ ["--d" as string]: "120ms" }}><PositionDemo /></div>
        </div>
      </section>

      {/* 04 Week */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <SectionHead n="04" label="Your week" title={<>Ten <em>minutes.</em></>} />
        <div className="mt-12 md:mt-0"><WeekScroller /></div>
      </section>

      {/* 05 Positions */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-10">
        <SectionHead n="05" label="Every position" title={<>Built for <em>you.</em></>} />
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
          {POSITIONS.map((p, i) => (
            <li key={p.pos} className="reveal lift panel-soft p-5" style={{ ["--d" as string]: `${i * 60}ms` }}>
              <span className={"dot " + (["purple", "green", "blue", "orange", "purple"][i])} />
              <p className="display mt-4 text-[30px] leading-none">{p.pos}</p>
              <p className="mt-2 text-[13px] leading-snug text-muted-foreground">{p.numbers}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-4xl px-5 pt-24 text-center sm:px-8 md:pt-32">
        <figure className="reveal">
          <blockquote className="text-[26px] font-semibold leading-snug tracking-tight sm:text-[34px]">
            "I built the tool I wanted: real coach contacts, emails that prove I read the roster, and reminders to follow up."
          </blockquote>
          <figcaption className="mt-5 text-[14px] uppercase tracking-[0.2em] text-muted-foreground">A 2027 pitcher from Santa Clarita, California</figcaption>
        </figure>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <div className="reveal panel relative overflow-hidden px-8 py-14 text-center sm:px-12 sm:py-20">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(600px 260px at 50% 0%, hsl(var(--brand) / .45), transparent 70%)" }} />
          <LogoMark arrowClassName="arrow-loop" className="relative mx-auto w-[150px] text-white sm:w-[190px]" />
          <h2 className="display grad relative mx-auto mt-8 max-w-3xl text-[48px] sm:text-[76px]">Your first ten emails can go out <em>tonight.</em></h2>
          <div className="relative mt-9 flex flex-wrap items-center justify-center gap-3">
            <a href={APP_START} className="btn-ink">Find my open spots, free</a>
            <Link to="pricing" className="btn-line">See pricing</Link>
          </div>
        </div>
      </section>
      <div className="h-16 md:hidden" aria-hidden />
    </>
  );
}
