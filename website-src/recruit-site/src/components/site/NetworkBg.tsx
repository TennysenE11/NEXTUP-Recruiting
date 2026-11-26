// A slow, drifting web of dots and lines behind every page. Stands still for reduced motion
// and pauses while the tab is hidden.
import { useEffect, useRef } from "react";
import { prefersReduced } from "@/components/site/Motion";

export function NetworkBg() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const still = prefersReduced();
    const n = window.innerWidth < 640 ? 34 : 72;
    const pts = Array.from({ length: n }, () => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.00009, vy: (Math.random() - 0.5) * 0.00009 }));
    let w = 0, h = 0, raf = 0, last = performance.now();
    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      c.width = w * dpr; c.height = h * dpr; c.style.width = w + "px"; c.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (still) draw(last);
    };
    const draw = (t: number) => {
      const dt = Math.min(64, t - last); last = t;
      ctx.clearRect(0, 0, w, h);
      const reach = Math.min(w, h) * 0.24;
      for (const p of pts) {
        if (!still) { p.x += p.vx * dt; p.y += p.vy * dt; }
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      }
      for (let i = 0; i < n; i++) {
        const ax = pts[i].x * w, ay = pts[i].y * h;
        for (let j = i + 1; j < n; j++) {
          const bx = pts[j].x * w, by = pts[j].y * h, d = Math.hypot(ax - bx, ay - by);
          if (d < reach) {
            ctx.strokeStyle = `rgba(130,115,255,${((1 - d / reach) * 0.2).toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          }
        }
        ctx.fillStyle = "rgba(160,150,255,.6)";
        ctx.beginPath(); ctx.arc(ax, ay, 1.5, 0, Math.PI * 2); ctx.fill();
      }
      if (!still && !document.hidden) raf = requestAnimationFrame(draw);
    };
    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    const onVis = () => { cancelAnimationFrame(raf); if (!document.hidden && !still) { last = performance.now(); raf = requestAnimationFrame(draw); } };
    document.addEventListener("visibilitychange", onVis);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); document.removeEventListener("visibilitychange", onVis); };
  }, []);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 -z-10 opacity-80" aria-hidden />;
}
