// Pick a position and watch the email's first line rewrite itself. Sample numbers, real template.
import { useState } from "react";
import { Typewriter } from "@/components/site/Motion";
import { cn } from "@/lib/utils";

const DEMO = {
  Pitcher: { n: 4, t: 11, pl: "pitchers", play: "innings", to: "Pitching coach", nums: "87 mph · curve, change" },
  Catcher: { n: 2, t: 3, pl: "catchers", play: "playing time", to: "Recruiting coordinator", nums: "1.95 pop · 90 exit velo" },
  Infielder: { n: 5, t: 6, pl: "infielders", play: "playing time", to: "Recruiting coordinator", nums: "92 exit velo · 6.85 sixty" },
  Outfielder: { n: 3, t: 5, pl: "outfielders", play: "playing time", to: "Recruiting coordinator", nums: "88 OF velo · 6.7 sixty" },
} as const;
type Pos = keyof typeof DEMO;

export function PositionDemo() {
  const [pos, setPos] = useState<Pos>("Infielder");
  const d = DEMO[pos];
  const keys = Object.keys(DEMO) as Pos[];
  const idx = keys.indexOf(pos);
  const line = `I saw that ${d.n} of the ${d.t} ${d.pl} on your 2027 roster are seniors or grad students, and I want to be ready to compete for ${d.play} in 2028.`;
  return (
    <div className="panel p-6 text-left sm:p-9">
      <div role="radiogroup" aria-label="Position" className="relative grid grid-cols-4 rounded-full border border-white/[.08] bg-white/[.04] p-1">
        <span aria-hidden className="absolute bottom-1 top-1 rounded-full bg-[hsl(var(--brand))] shadow-[0_6px_20px_-6px_hsl(var(--brand))] transition-transform duration-300 ease-[cubic-bezier(.2,.65,.2,1)]"
          style={{ left: 4, width: "calc((100% - 8px) / 4)", transform: `translateX(${idx * 100}%)` }} />
        {keys.map((k) => (
          <button key={k} role="radio" aria-checked={pos === k} onClick={() => setPos(k)}
            className={cn("relative z-10 h-10 rounded-full text-[13px] font-medium transition-colors sm:text-[14px]", pos === k ? "text-white" : "text-white/60 hover:text-white")}>
            {k}
          </button>
        ))}
      </div>
      <p className="mt-7 text-[12px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--field))]">Your first line</p>
      <blockquote className="mt-3 min-h-[5.6em] text-[22px] font-semibold leading-snug tracking-tight sm:min-h-[4.4em] sm:text-[27px]">
        "<Typewriter text={line} />"
      </blockquote>
      <div className="mt-6 flex flex-wrap gap-2 text-[13px]">
        <span key={pos + "to"} className="pop-in rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5">To: {d.to}</span>
        <span key={pos + "n"} className="pop-in rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5" style={{ animationDelay: "120ms" }}>{d.nums}</span>
      </div>
    </div>
  );
}
