// Every program on one map. Pick a division, tap a state. Real counts from OpenSpot's national list.
import { useEffect, useState } from "react";
import { STATE_POINTS, US_BORDERS, US_OUTLINE, US_VIEWBOX, type StatePoint } from "@/lib/mapData";
import { prefersReduced } from "@/components/site/Motion";
import { cn } from "@/lib/utils";

type DivKey = "all" | "NCAA_D1" | "NCAA_D2" | "NCAA_D3" | "NAIA" | "JUCO";
const DIVS: { k: DivKey; label: string; hsl: string }[] = [
  { k: "all", label: "All", hsl: "259 92% 72%" },
  { k: "NCAA_D1", label: "D1", hsl: "217 91% 64%" },
  { k: "NCAA_D2", label: "D2", hsl: "152 69% 50%" },
  { k: "NCAA_D3", label: "D3", hsl: "186 80% 55%" },
  { k: "NAIA", label: "NAIA", hsl: "24 95% 60%" },
  { k: "JUCO", label: "JUCO", hsl: "330 85% 68%" },
];
const NAMES: Record<string, string> = { AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "Washington, D.C.", FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming" };
const HOME = "CA";
const ROUTES = ["OR", "AZ", "TX", "WA", "CO", "UT", "NV", "ID", "OK", "KS"];

export function USMap() {
  const [div, setDiv] = useState<DivKey>("all");
  const [sel, setSel] = useState<StatePoint | null>(null);
  const [route, setRoute] = useState(0);
  useEffect(() => {
    if (prefersReduced()) return;
    const id = window.setInterval(() => setRoute((r) => (r + 1) % ROUTES.length), 2200);
    return () => window.clearInterval(id);
  }, []);
  const d = DIVS.find((x) => x.k === div)!;
  const val = (p: StatePoint) => (div === "all" ? p.all : p[div]);
  const total = STATE_POINTS.reduce((a, p) => a + val(p), 0);
  const ranked = [...STATE_POINTS].filter((p) => val(p) > 0).sort((a, b) => val(b) - val(a));
  const top = new Set(ranked.slice(0, 8).map((p) => p.s));
  const home = STATE_POINTS.find((p) => p.s === HOME)!;
  const arcs = [0, 1, 2].map((k) => STATE_POINTS.find((p) => p.s === ROUTES[(route + k * 3) % ROUTES.length])).filter(Boolean) as StatePoint[];
  const color = `hsl(${d.hsl})`;
  return (
    <div className="panel p-4 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div role="radiogroup" aria-label="Division" className="flex flex-wrap gap-1.5">
          {DIVS.map((x) => (
            <button key={x.k} role="radio" aria-checked={div === x.k} onClick={() => setDiv(x.k)}
              className={cn("inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
                div === x.k ? "border-white/25 bg-white/10 text-white" : "border-white/[.08] text-muted-foreground hover:text-white")}>
              <span className="h-2 w-2 rounded-full" style={{ background: `hsl(${x.hsl})`, boxShadow: `0 0 10px hsl(${x.hsl})` }} />{x.label}
            </button>
          ))}
        </div>
        <p className="text-[13px] text-muted-foreground"><span className="font-semibold text-white">{total.toLocaleString("en-US")}</span> programs</p>
      </div>

      <div className="relative mt-4">
        <svg viewBox={US_VIEWBOX} className="block h-auto w-full" role="img" aria-label={`Map of ${total} ${d.label === "All" ? "" : d.label + " "}college baseball programs by state`}>
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12" /></filter>
          </defs>
          <path d={US_OUTLINE} fill="rgba(255,255,255,.025)" stroke="rgba(255,255,255,.18)" strokeWidth="1.2" />
          <path d={US_BORDERS} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="1" />
          {/* outreach going out from the player's home state */}
          {arcs.map((p) => {
            const mx = (home.x + p.x) / 2, my = Math.min(home.y, p.y) - Math.hypot(p.x - home.x, p.y - home.y) * 0.35;
            return <path key={p.s + route} className="arc" d={`M${home.x},${home.y} Q${mx},${my} ${p.x},${p.y}`} fill="none" stroke={color} strokeOpacity=".7" strokeWidth="1.6" />;
          })}
          {ranked.map((p) => {
            const v = val(p), r = 3 + Math.sqrt(v) * 2.2;
            return <circle key={"g" + p.s} cx={p.x} cy={p.y} r={r * 2.2} fill={color} opacity={0.22} filter="url(#glow)" />;
          })}
          {ranked.map((p, i) => {
            const v = val(p), r = 3 + Math.sqrt(v) * 1.2, on = sel?.s === p.s;
            return (
              <g key={p.s} className="cursor-pointer" onMouseEnter={() => setSel(p)} onClick={() => setSel(p)}>
                {top.has(p.s) && <circle className="ping" style={{ ["--d" as string]: `${i * 300}ms` }} cx={p.x} cy={p.y} r={r} fill="none" stroke={color} strokeWidth="1.5" />}
                <circle cx={p.x} cy={p.y} r={Math.max(14, r + 6)} fill="transparent" />
                <circle cx={p.x} cy={p.y} r={r} fill={on ? "#fff" : "rgba(255,255,255,.9)"} stroke={color} strokeWidth={on ? 4 : 2.5} />
                {top.has(p.s) && (
                  <text x={p.x + r + 6} y={p.y + 4} className="mono" fontSize="13" fill="rgba(255,255,255,.75)">{p.s} {v}</text>
                )}
              </g>
            );
          })}
        </svg>
        <div className="pointer-events-none absolute bottom-0 left-0 sm:bottom-2 sm:left-2">
          {sel ? (
            <div key={sel.s + div} className="pop-in panel-soft bg-black/40 px-4 py-3 backdrop-blur">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{NAMES[sel.s] || sel.s}</p>
              <p className="mt-1 text-[22px] font-semibold leading-none">{val(sel)} <span className="text-[13px] font-normal text-muted-foreground">{d.label === "All" ? "programs" : d.label + " programs"}</span></p>
              {div === "all" && (
                <p className="mt-2 text-[12px] text-muted-foreground">D1 {sel.NCAA_D1} · D2 {sel.NCAA_D2} · D3 {sel.NCAA_D3} · NAIA {sel.NAIA} · JUCO {sel.JUCO}</p>
              )}
            </div>
          ) : (
            <p className="text-[12px] uppercase tracking-[0.18em] text-muted-foreground">Tap a state</p>
          )}
        </div>
      </div>
    </div>
  );
}
