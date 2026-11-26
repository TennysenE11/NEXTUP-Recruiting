// Small motion helpers: count-ups, a moving strip, hover tilt and a typewriter.
// Everything stands still for visitors who ask for reduced motion.
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const prefersReduced = () =>
  typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useInView<T extends Element>(threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { setInView(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); io.disconnect(); } }, { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView] as const;
}

// Counts from 0 up to the number in `value` ("1,600") once it scrolls into view.
export function CountUp({ value, className }: { value: string; className?: string }) {
  const target = Number(value.replace(/[^0-9.]/g, "")) || 0;
  const [ref, inView] = useInView<HTMLSpanElement>(0.4);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (prefersReduced()) { setN(target); return; }
    let raf = 0;
    const t0 = performance.now(), dur = 1500;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target]);
  return <span ref={ref} className={className}>{n.toLocaleString("en-US")}</span>;
}

// An endless strip that slides sideways. Pauses on hover.
export function Marquee({ items, className, speed = 40 }: { items: React.ReactNode[]; className?: string; speed?: number }) {
  return (
    <div className={cn("marquee", className)}>
      <div className="marquee-track" style={{ animationDuration: `${speed}s` }}>
        {[0, 1].map((k) => (
          <div key={k} className="marquee-group" aria-hidden={k === 1}>
            {items.map((it, i) => <span key={i} className="marquee-item">{it}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Leans toward the mouse pointer (desktop only).
export function Tilt({ children, className, max = 8 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const set = (rx: number, ry: number) => {
    ref.current?.style.setProperty("--rx", `${rx.toFixed(2)}deg`);
    ref.current?.style.setProperty("--ry", `${ry.toFixed(2)}deg`);
  };
  return (
    <div
      ref={ref}
      className={cn("tilt", className)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || prefersReduced() || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        set(-((e.clientY - r.top) / r.height - 0.5) * max, ((e.clientX - r.left) / r.width - 0.5) * max);
      }}
      onPointerLeave={() => set(0, 0)}
    >
      {children}
    </div>
  );
}

// Types `text` out letter by letter whenever it changes.
export function Typewriter({ text, className, speed = 16 }: { text: string; className?: string; speed?: number }) {
  const [shown, setShown] = useState(text);
  const first = useRef(true);
  useEffect(() => {
    if (first.current || prefersReduced()) { first.current = false; setShown(text); return; }
    let i = 0;
    setShown("");
    const id = window.setInterval(() => {
      i += 2;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [text, speed]);
  return (
    <span className={className}>
      <span aria-hidden>{shown}<span className="caret" /></span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

// eases from the old value to the new one
export function Tween({ value, digits = 1 }: { value: number; digits?: number }) {
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
