import { Button } from "@/components/ui/button";
import { APP_URL } from "@/lib/site";
import { PageHead } from "@/components/site/PageHead";

const STEPS = [
  { n: "01", t: "Install it", d: "Open the app link on your phone. iPhone: Safari, Share, Add to Home Screen. Android: Install app. No account, no download from a store." },
  { n: "02", t: "Fill in your profile", d: "Velo, pitches, height and weight, GPA, video, club team, coach reference, upcoming events. The profile score shows what coaches still need. Aim for 85 or more." },
  { n: "03", t: "Read your outlook", d: "Each division is rated Reach, Target or Likely for you. Build a list that's mostly Target and Likely, with a few reaches." },
  { n: "04", t: "Find schools", d: "Pick divisions and states. Add the programs that fit. Schools marked verify need a look at the official link first." },
  { n: "05", t: "Send", d: "The Send tab has the next email ready. Tap Send in Gmail, press Send, come back. About 30 seconds each." },
  { n: "06", t: "Follow up and track", d: "Follow-ups come due on their own. Mark replies, calls, camp invites and offers. Goals turn into a weekly plan." },
];

export function HowItWorks() {
  return (
    <>
      <PageHead kicker="How it works" title="Ten minutes a week. Every coach gets your best email." />
      <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <ol className="relative space-y-10 border-l-2 border-dashed border-accent/50 pl-8">
          {STEPS.map((s) => (
            <li key={s.n} className="relative">
              <span className="absolute -left-[3.15rem] top-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-lg font-extrabold text-primary-foreground">{s.n}</span>
              <h2 className="text-3xl font-extrabold uppercase">{s.t}</h2>
              <p className="mt-2 text-lg text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
        <div className="mt-14 rounded-md bg-secondary p-6 sm:p-8">
          <h2 className="text-2xl font-extrabold uppercase">What the app never does</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-[16px]">
            <li>Send an email without you pressing Send (the free app).</li>
            <li>Guess a coach's email address.</li>
            <li>Claim a coach opened your email.</li>
            <li>Sell or share your information. It stays on your phone.</li>
          </ul>
        </div>
        <Button asChild size="lg" className="mt-10 h-12 rounded-sm bg-accent px-6 text-base font-semibold text-accent-foreground hover:bg-accent/90"><a href={APP_URL}>Start now</a></Button>
      </div>
    </>
  );
}
