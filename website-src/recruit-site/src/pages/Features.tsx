import { Intro } from "@/components/site/Intro";
import { Phone } from "@/components/site/Phone";
import { APP_URL, SHOTS } from "@/lib/site";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

const ROWS = [
  {
    label: "Find",
    pro: false,
    t: "1,600 programs, read from their own pages.",
    d: "Every D1, D2, D3, NAIA and junior college program we could find. Coach names, titles and emails are copied from each school's official athletics site. Pick divisions, states or a whole region, and see how many players at your position each team is losing.",
    points: ["Rated Reach, Target or Likely for you (Pro)", "Players leaving at your position, from the official roster (Pro)", "Programs we couldn't read are marked verify, with the link"],
    shot: SHOTS.schools,
    alt: "School list filtered by fit and position",
  },
  {
    label: "Write",
    pro: false,
    t: "A different email for every coach.",
    d: "The first line is something only that coach would recognize, like how many of their infielders are seniors. Your numbers follow: fastball and pitch mix for pitchers, exit velo, 60 time, pop time or throwing velo for everyone else.",
    points: ["Sent to the pitching coach, or the recruiting coordinator or head coach for position players", "A closing question that fits the level", "Two taps to send from your own Gmail, with Undo"],
    shot: SHOTS.send,
    alt: "The next email, written for one coach",
  },
  {
    label: "Prepare",
    pro: false,
    t: "A profile score that tells you what's missing.",
    d: "Before a coach reads past your name, they look for a few things: grad year, position, the right numbers, video, GPA, a coach who can vouch for you. The score shows what you have, what you don't, and what each one is worth.",
    points: ["Checklist built for your position", "An honest outlook for each division (Pro)", "A check that your list isn't all reaches (Pro)"],
    shot: SHOTS.profile,
    alt: "Profile score checklist",
  },
  {
    label: "Keep going",
    pro: true,
    t: "Goals that turn into this week's list.",
    d: "Set a goal like 10 replies by March. The app works backward from your own reply rate and tells you how many schools to add, which follow-ups are due and who's waiting on an answer from you.",
    points: ["Presets or your own number and date", "Each step links to the screen that does it", "One combined weekly plan on Home"],
    shot: SHOTS.goals,
    alt: "Goals tab with a step-by-step plan",
  },
];

const ALSO: [string, string, boolean][] = [
  ["Follow-ups on time", "Ten days after the first email, then every 14. Each one leads with your newest number, video or event.", false],
  ["X messages", "For coaches whose X account is linked on official pages. Copy, open, send, then mark it Seen.", true],
  ["Charts that mean something", "List to offer, reply rate by division and emails per week. Every chart has a table view.", true],
  ["Every filter", "Fit, conference, contact info, outreach stage, follow-up timing, last emailed and more. Free has status, division, state and verify.", true],
  ["My states", "Pick the states you'd live in. The list and the send queue stay inside them.", false],
  ["Works offline", "Add it to your home screen. It opens full screen and keeps your data on your phone.", false],
  ["Backup and move", "Export one file, import it on another device. Nothing is stored on our side.", false],
  ["No fake open tracking", "Opens aren't measurable without spying, so the app counts replies, calls and invites instead.", false],
];

export function Features() {
  return (
    <>
      <Intro eyebrow="Features" title="Everything a recruit needs, and nothing that fakes it." lead="Built around how coaches read email: short, specific, honest, and followed up on time." />

      <div className="mx-auto max-w-6xl space-y-24 px-5 sm:px-8 md:space-y-36">
        {ROWS.map((r, i) => (
          <section key={r.label} className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
            <div className={cn("reveal", i % 2 === 1 && "md:order-2")}>
              <p className="font-mono text-[13px] text-muted-foreground">{String(i + 1).padStart(2, "0")} · {r.label}{r.pro && <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 font-body text-[11px] font-medium text-background">Pro</span>}</p>
              <h2 className="display mt-3 text-[42px] sm:text-[54px]">{r.t}</h2>
              <p className="mt-5 text-[17px] leading-relaxed text-muted-foreground">{r.d}</p>
              <ul className="mt-7 border-t border-foreground/10">
                {r.points.map((p) => <li key={p} className="border-b border-foreground/10 py-3 text-[15px]">{p}</li>)}
              </ul>
            </div>
            <div className={cn("reveal mx-auto w-[72%] max-w-[300px]", i % 2 === 1 && "md:order-1")} style={{ ["--d" as string]: "120ms" }}>
              <Phone src={r.shot} alt={r.alt} />
            </div>
          </section>
        ))}
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 md:pt-40">
        <h2 className="display reveal text-5xl sm:text-6xl">Also in the app</h2>
        <dl className="mt-10 grid gap-x-16 sm:grid-cols-2">
          {ALSO.map(([t, d, pro], i) => (
            <div key={t} className="reveal border-t border-foreground/10 py-6" style={{ ["--d" as string]: `${(i % 2) * 80}ms` }}>
              <dt className="text-[17px] font-medium">{t}{pro && <span className="ml-2 rounded-full bg-foreground px-2 py-0.5 align-[2px] text-[11px] font-medium text-background">Pro</span>}</dt>
              <dd className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">{d}</dd>
            </div>
          ))}
        </dl>
        <div className="reveal mt-14 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-foreground/10 pt-10">
          <p className="mr-auto text-[18px]">Start free with 20 schools. Pro unlocks the rest.</p>
          <Link to="pricing" className="link-arrow">Compare plans →</Link>
          <a href={APP_URL} className="btn-ink">Start free</a>
        </div>
      </section>
    </>
  );
}
