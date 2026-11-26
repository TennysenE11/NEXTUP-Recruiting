// The top-of-page dashboard: a sample week of activity that keeps adding rows,
// three real numbers that count up, and an emails-per-week line that draws itself.
import { useEffect, useRef, useState } from "react";
import { CountUp, prefersReduced } from "@/components/site/Motion";

type Row = { id: number; k: string; c: "green" | "blue" | "orange" | "purple"; b: string; t: string };
const POOL: Omit<Row, "id">[] = [
  { k: "Opening", c: "green", b: "NCAA D2", t: "7 of 13 infielders leaving" },
  { k: "Sent", c: "blue", b: "First email", t: "NAIA program · pitching coach" },
  { k: "Reply", c: "purple", b: "Coach replied", t: "D3 · recruiting coordinator" },
  { k: "Follow-up", c: "orange", b: "Due today", t: "JUCO · leads with your new 60 time" },
  { k: "Opening", c: "green", b: "NCAA D1", t: "4 of 11 pitchers leaving" },
  { k: "Sent", c: "blue", b: "Follow-up", t: "D2 program · new video" },
  { k: "Camp", c: "orange", b: "Camp invite", t: "NAIA · December showcase" },
  { k: "Reply", c: "purple", b: "Coach replied", t: "NCAA D1 · asked for your schedule" },
];
const AGO = ["now", "2m", "9m", "21m"];

export function HeroPanel() {
  const [rows, setRows] = useState<Row[]>(() => POOL.slice(0, 4).map((r, i) => ({ ...r, id: i })));
  const next = useRef(4);
  useEffect(() => {
    if (prefersReduced()) return;
    const id = window.setInterval(() => {
      const r = POOL[next.current % POOL.length];
      setRows((old) => [{ ...r, id: next.current++ }, ...old].slice(0, 4));
    }, 2600);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="panel overflow-hidden text-left">
      <div className="flex items-center justify-between border-b border-white/[.07] px-5 py-4 sm:px-6">
        <div className="flex gap-1.5" aria-hidden>{[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/15" />)}</div>
        <p className="text-[14px] text-muted-foreground">Your week</p>
        <span className="pill-live">Sample</span>
      </div>
      <ul className="divide-y divide-white/[.06]" aria-label="Sample activity">
        {rows.map((r, i) => (
          <li key={r.id} className={"grid grid-cols-[auto_5.6rem_1fr_auto] items-center gap-3 px-5 py-3.5 sm:px-6 " + (i === 0 && r.id >= 4 ? "feed-in" : "")}>
            <span className={"dot " + r.c} />
            <span className={"text-[11px] font-semibold uppercase tracking-[0.14em] k-" + r.c}>{r.k}</span>
            <span className="truncate text-[14px] text-white/85 sm:text-[15px]"><b className="font-semibold text-white">{r.b}</b> · {r.t}</span>
            <span className="text-[12px] text-muted-foreground">{AGO[i]}</span>
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-3 gap-3 border-t border-white/[.07] p-4 sm:gap-4 sm:p-6">
        {[
          { v: "1,600", l: "Programs", c: "green" },
          { v: "890", l: "Coach emails", c: "blue" },
          { v: "829", l: "College logos", c: "orange" },
        ].map((s) => (
          <div key={s.l} className="panel-soft relative overflow-hidden px-3 py-4 text-center sm:py-5">
            <span className={"absolute inset-x-6 top-0 h-px k-" + s.c} style={{ background: "currentColor", boxShadow: "0 0 18px 2px currentColor" }} aria-hidden />
            <p className="flex items-center justify-center gap-2 text-[30px] font-semibold leading-none tracking-tight sm:text-[40px]">
              <span className={"dot " + s.c} /><CountUp value={s.v} />
            </p>
            <p className="mt-2 text-[12px] text-muted-foreground sm:text-[13px]">{s.l}</p>
          </div>
        ))}
      </div>
      <div className="relative mx-4 mb-4 overflow-hidden rounded-[1rem] border border-white/[.07] sm:mx-6 sm:mb-6">
        <svg viewBox="0 0 600 120" className="block h-[92px] w-full" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="sparkFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="hsl(259 92% 72%)" stopOpacity=".35" /><stop offset="1" stopColor="hsl(259 92% 72%)" stopOpacity="0" /></linearGradient>
          </defs>
          <path d="M0,104 C60,100 90,92 140,86 S230,70 280,64 S370,50 420,40 S520,26 600,18 L600,120 L0,120 Z" fill="url(#sparkFill)" />
          <path className="draw" style={{ ["--len" as string]: 700 }} d="M0,104 C60,100 90,92 140,86 S230,70 280,64 S370,50 420,40 S520,26 600,18" fill="none" stroke="hsl(259 92% 72%)" strokeWidth="2.5" />
        </svg>
        <span className="absolute bottom-3 right-3 rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Emails per week</span>
      </div>
    </div>
  );
}
