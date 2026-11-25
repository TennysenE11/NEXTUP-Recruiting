import { Database, EyeOff, Lock, Send, UserRound } from "lucide-react";
import { Intro } from "@/components/site/Intro";

const SECTIONS = [
  { icon: Database, t: "Stored on your phone", d: "Your profile, list and history stay on your device. No account, no server." },
  { icon: Send, t: "You choose what's sent", d: "Emails open in your own Gmail. You press Send." },
  { icon: Lock, t: "Public coach info only", d: "Copied from official athletics pages. Coaches can ask for a fix." },
  { icon: EyeOff, t: "No tracking", d: "No ads, no analytics, no open tracking." },
  { icon: UserRound, t: "Under 18", d: "A parent or guardian will hold any paid account." },
];

export function Privacy() {
  return (
    <>
      <Intro eyebrow="Privacy" title="Your data stays on your phone." lead="Last updated November 2026." />
      <section className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {SECTIONS.map(({ icon: Icon, t, d }, i) => (
          <article key={t} className="reveal lift rounded-[1.25rem] border border-foreground/10 bg-card p-7" style={{ ["--d" as string]: `${(i % 3) * 70}ms` }}>
            <Icon className="h-6 w-6 text-[hsl(var(--field))]" aria-hidden />
            <h2 className="display mt-5 text-[30px] leading-none">{t}</h2>
            <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">{d}</p>
          </article>
        ))}
      </section>
    </>
  );
}
