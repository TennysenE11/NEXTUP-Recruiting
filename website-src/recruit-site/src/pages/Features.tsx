import { Bell, BarChart3, CloudOff, Download, Filter, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { Intro } from "@/components/site/Intro";
import { Phone } from "@/components/site/Phone";
import { APP_URL, SHOTS } from "@/lib/site";
import { Link } from "@/lib/router";
import { cn } from "@/lib/utils";

const ROWS = [
  { label: "Find", t: "1,600 programs, with their logos.", d: "D1 to JUCO. Coach info from official pages.", tags: ["Fit ratings · Pro", "Players leaving · Pro"], shot: SHOTS.schools, alt: "School list with college logos" },
  { label: "Write", t: "A different email for every coach.", d: "Opens with their roster. Goes to the right coach.", tags: ["Two-tap send", "Undo"], shot: SHOTS.send, alt: "The next email, written for one coach" },
  { label: "Prepare", t: "A score for what's missing.", d: "Built for your position.", tags: ["Checklist", "Outlook · Pro"], shot: SHOTS.profile, alt: "Profile score checklist" },
  { label: "Keep going", t: "Goals that become a weekly list.", d: "Set 10 replies. Get this week's steps.", tags: ["Pro"], shot: SHOTS.goals, alt: "Goals tab with a step-by-step plan" },
];

const ALSO = [
  { icon: Bell, t: "Follow-up reminders", pro: false },
  { icon: MessageCircle, t: "X messages", pro: true },
  { icon: BarChart3, t: "Reply charts", pro: true },
  { icon: Filter, t: "Every filter", pro: true },
  { icon: MapPin, t: "Pick your states", pro: false },
  { icon: CloudOff, t: "Works offline", pro: false },
  { icon: Download, t: "Export anytime", pro: false },
  { icon: ShieldCheck, t: "No fake open tracking", pro: false },
];

const Tag = ({ children }: { children: React.ReactNode }) => (
  <span className="rounded-full border border-foreground/15 px-3 py-1 text-[13px]">{children}</span>
);

export function Features() {
  return (
    <>
      <Intro eyebrow="Features" title="Everything a recruit needs." />

      <div className="mx-auto max-w-6xl space-y-24 px-5 sm:px-8 md:space-y-32">
        {ROWS.map((r, i) => (
          <section key={r.label} className="grid items-center gap-10 md:grid-cols-2 md:gap-20">
            <div className={cn("reveal", i % 2 === 1 && "md:order-2")}>
              <p className="font-mono text-[13px] text-[hsl(var(--field))]">{String(i + 1).padStart(2, "0")} · {r.label}</p>
              <h2 className="display mt-3 text-[44px] sm:text-[58px]">{r.t}</h2>
              <p className="mt-4 text-[18px] text-muted-foreground">{r.d}</p>
              <div className="mt-6 flex flex-wrap gap-2">{r.tags.map((t) => <Tag key={t}>{t}</Tag>)}</div>
            </div>
            <div className={cn("reveal mx-auto w-[72%] max-w-[300px]", i % 2 === 1 && "md:order-1")} style={{ ["--d" as string]: "120ms" }}>
              <Phone src={r.shot} alt={r.alt} />
            </div>
          </section>
        ))}
      </div>

      <section className="mx-auto max-w-6xl px-5 pt-28 sm:px-8 md:pt-36">
        <h2 className="display reveal text-5xl sm:text-6xl">Also inside</h2>
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {ALSO.map(({ icon: Icon, t, pro }, i) => (
            <li key={t} className="reveal flex items-center gap-3 rounded-[1rem] border border-foreground/10 bg-card px-4 py-4" style={{ ["--d" as string]: `${(i % 4) * 60}ms` }}>
              <Icon className="h-5 w-5 shrink-0 text-[hsl(var(--field))]" aria-hidden />
              <span className="text-[15px] font-medium leading-tight">{t}</span>
              {pro && <span className="ml-auto rounded-full bg-foreground px-2 py-0.5 text-[11px] font-medium text-background">Pro</span>}
            </li>
          ))}
        </ul>
        <div className="reveal mt-14 flex flex-wrap items-center gap-x-6 gap-y-4">
          <a href={APP_URL} className="btn-ink">Start free</a>
          <Link to="pricing" className="link-arrow">Compare plans →</Link>
        </div>
      </section>
    </>
  );
}
