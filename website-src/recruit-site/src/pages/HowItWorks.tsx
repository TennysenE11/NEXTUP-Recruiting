import { Apple, Smartphone } from "lucide-react";
import { Intro } from "@/components/site/Intro";
import { Phone } from "@/components/site/Phone";
import { APP_URL, SHOTS } from "@/lib/site";
import { Tilt } from "@/components/site/Motion";

const STEPS = [
  { t: "Install it", d: "Add it to your home screen. No account." },
  { t: "Fill in your profile", d: "Position, numbers, video, GPA." },
  { t: "Find schools", d: "Pick divisions and states." },
  { t: "Send", d: "Two taps per coach." },
  { t: "Follow up", d: "Reminders come due on their own." },
];

const NEVER = ["Sends without you", "Guesses an email", "Fakes an open", "Sells your data"];

export function HowItWorks() {
  return (
    <>
      <Intro eyebrow="How it works" title="Ten minutes a week." />

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-16 md:grid-cols-[1.3fr_1fr] md:gap-24">
          <ol className="border-t border-foreground/10">
            {STEPS.map((s, i) => (
              <li key={s.t} className="reveal grid grid-cols-[3rem_1fr] items-baseline gap-2 border-b border-foreground/10 py-7 sm:grid-cols-[4.5rem_1fr]">
                <span className="display text-[34px] leading-none text-[hsl(var(--field))]">{i + 1}</span>
                <div>
                  <h2 className="display text-[36px] leading-none sm:text-[44px]">{s.t}</h2>
                  <p className="mt-2 text-[16px] text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="hidden md:block">
            <div className="sticky top-28 mx-auto w-full max-w-[290px]">
              <Tilt><Phone src={SHOTS.home} alt="Home screen with this week's plan" /></Tilt>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <h2 className="display reveal text-5xl sm:text-6xl">Put it on your phone</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            { icon: Apple, name: "iPhone", steps: ["Open the app link in Safari", "Tap Share", "Add to Home Screen"] },
            { icon: Smartphone, name: "Android", steps: ["Open the app link in Chrome", "Tap Install app", "Open from your home screen"] },
          ].map(({ icon: Icon, name, steps }, i) => (
            <div key={name} className="reveal rounded-[1.25rem] bg-card p-7 sm:p-9" style={{ ["--d" as string]: `${i * 100}ms` }}>
              <div className="flex items-center gap-3">
                <Icon className="h-6 w-6" aria-hidden />
                <h3 className="text-[17px] font-medium">{name}</h3>
              </div>
              <ol className="mt-5 space-y-3">
                {steps.map((s, j) => (
                  <li key={s} className="flex items-center gap-3 text-[16px]">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-foreground text-[13px] font-medium text-background">{j + 1}</span>{s}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <h2 className="display reveal text-5xl sm:text-6xl">What it never does</h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {NEVER.map((n, i) => (
            <li key={n} className="reveal lift rounded-[1.25rem] border border-foreground/10 p-5 text-[18px] font-medium" style={{ ["--d" as string]: `${i * 60}ms` }}>
              <span className="mb-3 block text-[22px] leading-none text-[hsl(var(--field))]" aria-hidden>✕</span>{n}
            </li>
          ))}
        </ul>
        <div className="reveal mt-14">
          <a href={APP_URL} className="btn-ink">Start free</a>
        </div>
      </section>
    </>
  );
}
