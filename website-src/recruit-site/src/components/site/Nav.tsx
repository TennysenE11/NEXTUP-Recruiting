import { useEffect, useState } from "react";
import { Link, useRoute } from "@/lib/router";
import { APP_URL, NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

export function Brand() {
  return (
    <Link to="home" className="group flex items-center" aria-label="NEXTUP home">
      <Logo className="h-[22px] transition-transform duration-300 group-hover:-translate-y-px sm:h-6" />
    </Link>
  );
}

export function Nav() {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setOpen(false); }, [route]);
  useEffect(() => { document.body.style.overflow = open ? "hidden" : ""; }, [open]);
  return (
    <>
    <header className={cn("sticky top-0 z-40 transition-[background-color,box-shadow] duration-300", scrolled || open ? "bg-background/85 shadow-[0_1px_0_hsl(var(--foreground)/0.08)] backdrop-blur-md" : "bg-transparent")}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Brand />
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.route} to={n.route} className="group relative py-1 text-[15px] text-foreground/75 transition-colors hover:text-foreground">
              {n.label}
              <span className={cn("absolute -bottom-0.5 left-0 h-px w-full origin-left bg-foreground transition-transform duration-300", route === n.route ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100")} />
            </Link>
          ))}
          <a href={APP_URL} className="btn-ink h-10 px-5 text-[14px]">Open the app</a>
        </nav>
        <button className="relative -mr-2 h-10 w-10 md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <span className={cn("absolute left-2 right-2 h-[1.5px] bg-foreground transition-transform duration-300", open ? "top-1/2 rotate-45" : "top-[15px]")} />
          <span className={cn("absolute left-2 right-2 h-[1.5px] bg-foreground transition-transform duration-300", open ? "top-1/2 -rotate-45" : "top-[24px]")} />
        </button>
      </div>
    </header>
      {/* Kept outside the header: its backdrop blur would otherwise trap this fixed panel inside the header's 64px. */}
      <div className={cn("fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto bg-background px-5 transition-[opacity,transform] duration-300 md:hidden", open ? "opacity-100" : "pointer-events-none -translate-y-2 opacity-0")} aria-hidden={!open}>
        <nav className="flex flex-col pt-4" aria-label="Mobile">
          {NAV.map((n, i) => (
            <Link key={n.route} to={n.route} tabIndex={open ? 0 : -1}
              className={cn("display border-b border-foreground/10 py-4 text-[40px] transition-[opacity,transform] duration-500", open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0", route === n.route && "italic")}
              style={{ transitionDelay: open ? `${60 + i * 50}ms` : "0ms" }}>
              {n.label}
            </Link>
          ))}
          <a href={APP_URL} tabIndex={open ? 0 : -1} className="btn-ink mt-8">Start free</a>
        </nav>
      </div>
    </>
  );
}
