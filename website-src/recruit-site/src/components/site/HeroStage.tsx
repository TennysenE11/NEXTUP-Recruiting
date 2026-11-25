// The hero's moving phone: screens change on their own, notifications pop in around it,
// and a ring with a travelling dot (from the logo) turns slowly behind it.
import { useEffect, useState } from "react";
import { Bell, CheckCircle2, MailCheck, Users } from "lucide-react";
import { Phone } from "@/components/site/Phone";
import { Tilt, prefersReduced } from "@/components/site/Motion";
import { SHOTS } from "@/lib/site";
import { cn } from "@/lib/utils";

const SCREENS = [
  { src: SHOTS.send, alt: "The next email, ready to send" },
  { src: SHOTS.schools, alt: "School list with college logos" },
  { src: SHOTS.home, alt: "This week's plan" },
  { src: SHOTS.profile, alt: "Profile score" },
];

const CHIPS = [
  { icon: MailCheck, t: "Email sent", s: "First email · 2 taps", pos: "-left-4 top-[14%] sm:-left-14" },
  { icon: Users, t: "5 of 6 infielders leaving", s: "From the official roster", pos: "-right-3 top-[36%] sm:-right-16" },
  { icon: CheckCircle2, t: "Coach replied", s: "Marked in one tap", pos: "-left-6 top-[60%] sm:-left-20" },
  { icon: Bell, t: "Follow-up due", s: "Leads with your newest numbers", pos: "-right-2 top-[80%] sm:-right-12" },
];

export function HeroStage() {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (prefersReduced()) return;
    const id = window.setInterval(() => setI((x) => (x + 1) % SCREENS.length), 3200);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[320px]">
      {/* turning rings */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[175%] -translate-x-1/2 -translate-y-1/2" aria-hidden>
        <div className="orbit absolute inset-0 rounded-full border border-foreground/10">
          <span className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--field))] shadow-[0_0_0_6px_hsl(var(--field)/0.15)]" />
        </div>
        <div className="orbit-rev absolute inset-[14%] rounded-full border border-dashed border-foreground/10" />
      </div>

      <div className="float-in relative">
      <Tilt max={10} className="relative">
        <div className="relative">
          {SCREENS.map((s, k) => (
            <div key={s.src} className={cn("screen-swap", k === 0 ? "relative" : "absolute inset-0", k === i ? "is-on" : "")}>
              <Phone src={s.src} alt={s.alt} className={k === i ? "" : "pointer-events-none"} />
            </div>
          ))}
        </div>
        {/* screen dots */}
        <div className="mt-5 flex justify-center gap-1.5" aria-hidden>
          {SCREENS.map((s, k) => <span key={s.src} className={cn("h-1.5 rounded-full bg-foreground/20 transition-all duration-500", k === i ? "w-6 bg-[hsl(var(--field))]" : "w-1.5")} />)}
        </div>
      </Tilt>
      </div>

      {/* notifications */}
      {CHIPS.map(({ icon: Icon, t, s, pos }, k) => (
        <div key={t} className={cn("chip-cycle absolute z-10", pos)} style={{ ["--d" as string]: `${k * 2.4}s` }} aria-hidden>
          <div className="chip-float flex items-center gap-3 rounded-2xl border border-foreground/10 bg-card/95 px-3.5 py-2.5 shadow-[0_18px_40px_-18px_rgba(17,16,20,0.45)] backdrop-blur">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[hsl(var(--field))] text-white"><Icon className="h-4 w-4" /></span>
            <span className="leading-tight">
              <span className="block text-[13px] font-semibold">{t}</span>
              <span className="block text-[11px] text-muted-foreground">{s}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
