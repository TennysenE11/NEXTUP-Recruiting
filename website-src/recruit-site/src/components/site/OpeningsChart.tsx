// Players leaving each program before a 2027 grad arrives, by position and division.
// Real numbers from the official 2026 and 2027 rosters in OpenSpot's national list.
import { useEffect, useRef, useState } from "react";
import { LEAVING } from "@/lib/mapData";
import { prefersReduced, useInView } from "@/components/site/Motion";
import { cn } from "@/lib/utils";

const POS = [
  { k: "P", label: "Pitchers", one: "pitchers" },
  { k: "C", label: "Catchers", one: "catchers" },
  { k: "IF", label: "Infielders", one: "infielders" },
  { k: "OF", label: "Outfielders", one: "outfielders" },
] as const;
const DIVS = [
  { k: "NCAA D1", hsl: "217 91% 64%" },
  { k: "NCAA D2", hsl: "152 69% 50%" },
  { k: "NCAA D3", hsl: "186 80% 55%" },
  { k: "NAIA", hsl: "24 95% 60%" },
  { k: "JUCO", hsl: "330 85% 68%" },
];

// eases from the old value to the new one
function Tween({ value, digits = 1 }: { value: number; digits?: number }) {
  const [v, setV] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    if (prefersReduced()) { setV(value); from.current = value; return; }
    const a = from.current, t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / 700), e = 1 - Math.pow(1 - k, 3);
      setV(a + (value - a) * e);
      if (k < 1) raf = requestAnimationFrame(step); else from.current = value;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value]);
  return <>{v.toFixed(digits)}</>;
}

export function OpeningsChart() {
  const [pos, setPos] = useState<(typeof POS)[number]["k"]>("P");
  const [ref, inView] = useInView<HTMLDivElement>(0.3);
  const p = POS.find((x) => x.k === pos)!;
  const rows = DIVS.map((d) => {
    const [t, l, r] = LEAVING[d.k][pos];
    return { ...d, avg: l / r, pct: (100 * l) / t, rosters: r };
  });
  const max = Math.max(...rows.map((r) => r.avg));
  let T = 0, L = 0, R = 0;
  DIVS.forEach((d) => { const [t, l, r] = LEAVING[d.k][pos]; T += t; L += l; R += r; });
  const idx = POS.findIndex((x) => x.k === pos);
  return (
    <div ref={ref} className="panel p-5 text-left sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Leaving per program</p>
          <p className="mt-3 flex items-baseline gap-3">
            <span className="text-[64px] font-semibold leading-none tracking-tight sm:text-[76px]"><Tween value={inView ? L / R : 0} /></span>
            <span className="text-[15px] text-[hsl(var(--field))]"><Tween value={inView ? (100 * L) / T : 0} digits={0} />% of {p.one}</span>
          </p>
          <p className="mt-2 text-[14px] text-muted-foreground">{p.label} · 2026 and 2027 rosters · {R} programs</p>
        </div>
        <div role="radiogroup" aria-label="Position" className="relative grid w-full grid-cols-4 rounded-full border border-white/[.08] bg-white/[.03] p-1 sm:w-auto">
          <span aria-hidden className="absolute bottom-1 top-1 rounded-full border border-[hsl(var(--field)/.5)] bg-[hsl(var(--brand)/.35)] transition-transform duration-300 ease-[cubic-bezier(.2,.65,.2,1)]"
            style={{ left: 4, width: "calc((100% - 8px) / 4)", transform: `translateX(${idx * 100}%)` }} />
          {POS.map((x) => (
            <button key={x.k} role="radio" aria-checked={pos === x.k} onClick={() => setPos(x.k)}
              className={cn("relative z-10 h-10 rounded-full px-3 text-[13px] font-medium transition-colors sm:px-5", pos === x.k ? "text-white" : "text-muted-foreground hover:text-white")}>
              {x.k}
            </button>
          ))}
        </div>
      </div>
      <ul className="mt-8 space-y-4">
        {rows.map((r, i) => (
          <li key={r.k} className="grid grid-cols-[4.2rem_1fr_3.2rem] items-center gap-3 sm:grid-cols-[5rem_1fr_4rem]">
            <span className="text-[13px] font-medium text-white/80">{r.k.replace("NCAA ", "")}</span>
            <span className="relative h-3 overflow-hidden rounded-full bg-white/[.06]">
              <span className="bar-grow absolute inset-y-0 left-0 w-full rounded-full"
                style={{ transform: `scaleX(${inView ? r.avg / max : 0})`, transitionDelay: `${i * 70}ms`, background: `linear-gradient(90deg, hsl(${r.hsl} / .5), hsl(${r.hsl}))`, boxShadow: `0 0 16px hsl(${r.hsl} / .5)` }} />
            </span>
            <span className="text-right text-[14px] font-semibold tabular-nums"><Tween value={inView ? r.avg : 0} /></span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[12px] text-muted-foreground">Average players at this position who will be gone before a 2027 grad arrives, from each program's official roster.</p>
    </div>
  );
}
