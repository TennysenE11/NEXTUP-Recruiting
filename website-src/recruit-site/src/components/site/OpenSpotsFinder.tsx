// Pick a position and a state, see how many programs are losing players there, then start the app with
// both already filled in. Real counts from official 2026 and 2027 rosters.
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { SPOTS, STATE_POINTS } from "@/lib/mapData";
import { APP_START } from "@/lib/site";
import { Tween } from "@/components/site/Motion";
import { cn } from "@/lib/utils";

const POS = [
  { k: "P", label: "Pitcher", start: "RHP", plural: "pitchers" },
  { k: "C", label: "Catcher", start: "C", plural: "catchers" },
  { k: "IF", label: "Infielder", start: "IF", plural: "infielders" },
  { k: "OF", label: "Outfielder", start: "OF", plural: "outfielders" },
] as const;
const NAMES: Record<string, string> = { AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington, D.C.", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming" };
const STATES = STATE_POINTS.map((p) => p.s).filter((s) => SPOTS[s]).sort((a, b) => (NAMES[a] || a).localeCompare(NAMES[b] || b));

export function OpenSpotsFinder() {
  const [pos, setPos] = useState<(typeof POS)[number]["k"]>("IF");
  const [st, setSt] = useState("ALL");
  const p = POS.find((x) => x.k === pos)!;
  const [rosters, big, leaving] = SPOTS[st]?.[pos] || [0, 0, 0];
  const where = st === "ALL" ? "nationwide" : `in ${NAMES[st] || st}`;
  const href = `${APP_START}?pos=${p.start}${st === "ALL" ? "" : "&st=" + st}`;
  const idx = POS.findIndex((x) => x.k === pos);
  return (
    <div className="panel mx-auto max-w-xl p-5 text-left sm:p-7">
      <p className="text-[12px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--field))]">Find your open spots</p>
      <div role="radiogroup" aria-label="Your position" className="relative mt-4 grid grid-cols-4 rounded-full border border-white/[.08] bg-white/[.04] p-1">
        <span aria-hidden className="absolute bottom-1 top-1 rounded-full bg-[hsl(var(--brand))] shadow-[0_6px_20px_-6px_hsl(var(--brand))] transition-transform duration-300 ease-[cubic-bezier(.2,.65,.2,1)]"
          style={{ left: 4, width: "calc((100% - 8px) / 4)", transform: `translateX(${idx * 100}%)` }} />
        {POS.map((x) => (
          <button key={x.k} role="radio" aria-checked={pos === x.k} onClick={() => setPos(x.k)}
            className={cn("relative z-10 h-11 rounded-full text-[13px] font-semibold transition-colors sm:text-[14px]", pos === x.k ? "text-white" : "text-muted-foreground hover:text-white")}>
            {x.label}
          </button>
        ))}
      </div>
      <label className="mt-3 block">
        <span className="sr-only">State</span>
        <select value={st} onChange={(e) => setSt(e.target.value)}
          className="h-12 w-full rounded-xl border border-white/[.1] bg-white/[.04] px-4 text-[16px] text-white outline-none focus:border-[hsl(var(--field))]">
          <option value="ALL">Anywhere in the U.S.</option>
          {STATES.map((s) => <option key={s} value={s}>{NAMES[s] || s}</option>)}
        </select>
      </label>
      <div className="mt-5 flex items-end gap-4">
        <span className="text-[64px] font-semibold leading-none tracking-tight tabular-nums sm:text-[76px]"><Tween value={big} digits={0} /></span>
        <p className="pb-2 text-[16px] leading-snug text-white/85">programs {where} are losing <b className="text-white">3 or more {p.plural}</b></p>
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground">{leaving.toLocaleString("en-US")} {p.plural} leaving across {rosters} official rosters</p>
      <a href={href} className="btn-ink mt-5 h-14 w-full text-[17px]">See my open spots, free <ArrowRight className="h-5 w-5" aria-hidden /></a>
      <p className="mt-3 text-center text-[12px] text-muted-foreground">No account. No credit card. About 60 seconds.</p>
    </div>
  );
}
