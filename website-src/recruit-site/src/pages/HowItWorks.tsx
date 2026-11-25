import { Intro } from "@/components/site/Intro";
import { Phone } from "@/components/site/Phone";
import { APP_URL, SHOTS } from "@/lib/site";

const STEPS = [
  { t: "Install it", d: "Open the app link on your phone and add it to your home screen. No account, no app store, no download." },
  { t: "Fill in your profile", d: "Position, grad year, height and weight, GPA, video, club team and a coach reference. Then your numbers: fastball and pitches if you pitch, exit velo, 60 time, pop time or throwing velo if you hit. Aim for a score of 85 or more." },
  { t: "Read your outlook", d: "With Pro, each division is rated Reach, Target or Likely from your numbers and GPA. Build a list that's mostly Target and Likely, with a few reaches." },
  { t: "Find schools", d: "Pick divisions and states and add the programs that fit. Free covers 20 schools; Pro has no limit and shows which teams are losing the most players at your position." },
  { t: "Send", d: "The Send tab has the next email ready. Tap Send in Gmail, press Send, come back. About 30 seconds each." },
  { t: "Follow up and track", d: "Follow-ups come due on their own. Mark replies, calls, camp invites and offers. With Pro, your goals turn into a weekly plan." },
];

const NEVER = [
  "Send an email without you pressing Send.",
  "Guess a coach's email address.",
  "Claim a coach opened your email.",
  "Sell or share your information. It stays on your phone.",
];

export function HowItWorks() {
  return (
    <>
      <Intro eyebrow="How it works" title="Ten minutes a week. Every coach gets your best email." />

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="grid gap-16 md:grid-cols-[1.3fr_1fr] md:gap-24">
          <ol className="border-t border-foreground/10">
            {STEPS.map((s, i) => (
              <li key={s.t} className="reveal grid grid-cols-[3rem_1fr] gap-2 border-b border-foreground/10 py-8 sm:grid-cols-[4.5rem_1fr]">
                <span className="display text-[34px] leading-none text-muted-foreground/70">{i + 1}</span>
                <div>
                  <h2 className="display text-[34px] leading-none sm:text-[40px]">{s.t}</h2>
                  <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="hidden md:block">
            <div className="sticky top-28 mx-auto w-full max-w-[290px]">
              <Phone src={SHOTS.home} alt="Home screen with this week's plan" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <h2 className="display reveal text-5xl sm:text-6xl">Put it on your phone</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="reveal rounded-[1.25rem] bg-card p-7 sm:p-9">
            <h3 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground">iPhone</h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[16px] leading-relaxed">
              <li>Open the app link in Safari.</li>
              <li>Tap Share, the square with the arrow.</li>
              <li>Tap Add to Home Screen, then Add.</li>
            </ol>
          </div>
          <div className="reveal rounded-[1.25rem] bg-card p-7 sm:p-9" style={{ ["--d" as string]: "100ms" }}>
            <h3 className="text-[13px] font-medium uppercase tracking-[0.12em] text-muted-foreground">Android</h3>
            <ol className="mt-4 list-decimal space-y-2 pl-5 text-[16px] leading-relaxed">
              <li>Open the app link in Chrome.</li>
              <li>Tap Install app, or the menu, then Add to Home screen.</li>
              <li>Open it from your home screen.</li>
            </ol>
          </div>
        </div>
        <p className="reveal mt-5 text-[15px] text-muted-foreground">It opens full screen and works offline. Teammates install from the same link and keep their own data.</p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-24 sm:px-8 md:pt-32">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr] md:gap-16">
          <h2 className="display reveal text-5xl sm:text-6xl">What it never does</h2>
          <ul className="reveal border-t border-foreground/10">
            {NEVER.map((n) => <li key={n} className="border-b border-foreground/10 py-4 text-[18px]">{n}</li>)}
          </ul>
        </div>
        <div className="reveal mt-14">
          <a href={APP_URL} className="btn-ink">Start free</a>
        </div>
      </section>
    </>
  );
}
