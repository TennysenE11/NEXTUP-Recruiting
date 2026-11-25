import { useEffect, useRef, useState } from "react";
import { Phone } from "@/components/site/Phone";
import { LogoMark } from "@/components/site/Logo";
import { Link } from "@/lib/router";
import { APP_URL, POSITIONS, SHOTS } from "@/lib/site";
import { cn } from "@/lib/utils";

const WEEK = [
  { n: "01", t: "Find programs that fit", d: "Pick divisions and states from 1,600 programs. With Pro, each one is rated Reach, Target or Likely for you and shows how many players at your position are leaving.", shot: SHOTS.schools, alt: "School list with fit ratings and players leaving at your position" },
  { n: "02", t: "Send, two taps each", d: "Every email is already written for that coach. Tap Send in Gmail, press Send, and the next one is waiting.", shot: SHOTS.send, alt: "Send screen with the next email ready" },
  { n: "03", t: "Follow up with news", d: "Follow-ups come due on their own and lead with your newest number, video or showcase date. Pro's weekly plan tells you what's left.", shot: SHOTS.home, alt: "Home screen with this week's plan" },
  { n: "04", t: "Know where you stand", d: "A profile score shows what coaches still need from you. Replies, calls and camp invites are the numbers that count.", shot: SHOTS.profile, alt: "Profile score checklist" },
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
      <ol className="space-y-16 md:space-y-[38vh] md:py-[18vh]">
        {WEEK.map((w, i) => (
          <li key={w.n} data-i={i} ref={(el) => { refs.current[i] = el; }} className={cn("transition-opacity duration-500 md:opacity-30", active === i && "md:opacity-100")}>
            <p className="font-mono text-[13px] text-muted-foreground">{w.n}</p>
            <h3 className="display mt-2 text-4xl sm:text-5xl">{w.t}</h3>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-muted-foreground">{w.d}</p>
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
            <p className="eyebrow reveal">For high school baseball players, every position</p>
            <h1 className="display reveal mt-5 text-[52px] sm:text-[72px] lg:text-[84px]" style={{ ["--d" as string]: "80ms" }}>
              Email college coaches like you <em>already know</em> their team.
            </h1>
            <p className="reveal mt-6 max-w-[34rem] text-[18px] leading-relaxed text-muted-foreground" style={{ ["--d" as string]: "160ms" }}>
              NEXTUP finds programs that fit you, writes each coach an email from their own roster, and keeps your follow-ups on time. You press Send.
            </p>
            <div className="reveal mt-9 flex flex-wrap items-center gap-x-6 gap-y-4" style={{ ["--d" as string]: "240ms" }}>
              <a href={APP_URL} className="btn-ink">Start free</a>
              <Link to="how-it-works" className="link-arrow">See how it works →</Link>
            </div>
            <p className="reveal mt-5 text-[14px] text-muted-foreground" style={{ ["--d" as string]: "300ms" }}>Free for your first 20 schools. No account. Works on your phone, even offline.</p>
          </div>
          <div className="relative mx-auto w-full max-w-[420px] pb-6">
            <div className="float-in absolute right-0 top-10 w-[58%]" style={{ ["--r" as string]: "4deg", ["--d" as string]: "250ms" }}>
              <Phone src={SHOTS.schools} alt="School list in the app" className="opacity-95" />
            </div>
            <div className="float-in relative w-[64%]" style={{ ["--r" as string]: "-3deg" }}>
              <Phone src={SHOTS.send} alt="The next email ready to send" />
            </div>
          </div>
        </div>
      </section>

      {/* The first line */}
      <section className="bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:py-28">
          <h2 className="display reveal max-w-3xl text-5xl sm:text-6xl">Coaches read the first line. Then they decide.</h2>
          <div className="mt-14 grid gap-10 md:grid-cols-2 md:gap-16">
            <figure className="reveal">
              <figcaption className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground">What most coaches get</figcaption>
              <blockquote className="mt-5 border-l border-foreground/15 pl-6 text-[22px] leading-snug text-muted-foreground/80">
                "Dear Coach, I am a hard-working, dedicated athlete and I am very interested in your program. I believe I would be a great fit..."
              </blockquote>
              <p className="mt-4 pl-6 text-[14px] text-muted-foreground">Sent to 300 schools. Reads like it.</p>
            </figure>
            <figure className="reveal" style={{ ["--d" as string]: "120ms" }}>
              <figcaption className="text-[13px] font-medium uppercase tracking-[0.12em] text-[hsl(var(--field))]">What yours says</figcaption>
              <blockquote className="display mt-5 border-l-2 border-[hsl(var(--field))] pl-6 text-[30px] leading-[1.15]">
                "I saw that 5 of the 6 infielders on your 2027 roster are seniors or grad students, and I want to be ready to compete for playing time in 2028."
              </blockquote>
              <p className="mt-4 pl-6 text-[14px] text-muted-foreground">Written from that team's official roster, for that coach.</p>
            </figure>
          </div>
        </div>
      </section>

      {/* A week, scroll-told */}
      <section className="mx-auto max-w-6xl px-5 pt-20 sm:px-8 md:pt-28">
        <p className="eyebrow reveal">How a week goes</p>
        <h2 className="display reveal mt-4 max-w-2xl text-5xl sm:text-6xl">About ten minutes, start to finish.</h2>
        <div className="mt-12 md:mt-0"><WeekScroller /></div>
      </section>

      {/* Every position */}
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 md:pt-8">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <div>
            <h2 className="display reveal text-5xl sm:text-6xl">Built for every position.</h2>
            <p className="reveal mt-5 max-w-sm text-[17px] leading-relaxed text-muted-foreground">Tell it where you play. The numbers in your email, the coach it goes to and the roster it reads all change with you.</p>
          </div>
          <dl className="reveal divide-y divide-foreground/10 border-y border-foreground/10">
            {POSITIONS.map((p) => (
              <div key={p.pos} className="grid gap-1 py-5 sm:grid-cols-[150px_1fr] sm:gap-6">
                <dt className="display text-[28px] leading-none">{p.pos}</dt>
                <dd className="text-[15px] leading-relaxed text-muted-foreground">
                  <span className="text-foreground">{p.numbers}.</span> Email goes to the {p.coach.toLowerCase()}. Reads {p.roster} from the official roster.
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Honest numbers */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <p className="display reveal max-w-4xl text-[40px] leading-[1.08] sm:text-[56px]">
          1,600 programs. 890 coach emails copied from official athletics pages. <span className="italic text-[hsl(var(--field))]">None guessed.</span>
        </p>
        <p className="reveal mt-6 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
          When a school's site wouldn't let us read it, the program is marked "verify" with its official link instead of a made-up address. Opens aren't tracked either: replies, calls and camp invites are what count.
        </p>
      </section>

      {/* Why */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <div className="reveal grid gap-8 rounded-[1.5rem] bg-card p-8 sm:p-12 md:grid-cols-[1fr_1.6fr]">
          <h2 className="display text-4xl sm:text-5xl">Why this exists</h2>
          <div className="space-y-4 text-[17px] leading-relaxed">
            <p>I'm a 2027 pitcher. When I started emailing coaches, every tool I found either sent the same message to hundreds of schools or wanted thousands of dollars on a sales call.</p>
            <p>So I built the thing I wanted: real coach contacts, an email that proves I looked at their roster, and a reminder when it's time to follow up. Then I made it work for every position.</p>
            <p className="text-muted-foreground">A 2027 pitcher from Santa Clarita, California</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <div className="reveal relative overflow-hidden rounded-[1.5rem] bg-[#0b0a0e] px-8 py-14 text-white sm:px-12 sm:py-20">
          <LogoMark className="pointer-events-none absolute right-12 top-1/2 hidden w-[300px] -translate-y-1/2 text-white/10 md:block lg:w-[360px]" />
          <h2 className="display relative max-w-3xl text-5xl sm:text-7xl">Your first ten emails can go out tonight.</h2>
          <div className="relative mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <a href={APP_URL} className="inline-flex h-12 items-center rounded-full bg-white px-6 text-[15px] font-medium text-[#0b0a0e] transition-transform duration-200 hover:-translate-y-0.5">Start free</a>
            <Link to="pricing" className="font-medium underline decoration-white/40 underline-offset-[5px] hover:decoration-white">See pricing →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
