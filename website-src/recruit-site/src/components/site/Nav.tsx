import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useRoute } from "@/lib/router";
import { APP_URL, NAV } from "@/lib/site";
import { cn } from "@/lib/utils";
import icon from "@/assets/icon";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link to="home" className="flex items-center gap-2.5" aria-label="Recruiting Tracker home">
      <img src={icon} alt="" className="h-8 w-8 rounded-[7px]" />
      <span className={cn("font-display text-[22px] font-bold uppercase leading-none tracking-wide", light ? "text-background" : "text-foreground")}>
        Recruiting<span className="text-accent"> Tracker</span>
      </span>
    </Link>
  );
}

export function Nav() {
  const route = useRoute();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.route} to={n.route}
              className={cn("rounded-sm px-3 py-2 text-[15px] font-semibold text-muted-foreground hover:text-foreground",
                route === n.route && "text-foreground underline decoration-accent decoration-2 underline-offset-8")}>
              {n.label}
            </Link>
          ))}
          <Button asChild className="ml-3 rounded-sm bg-accent font-semibold text-accent-foreground hover:bg-accent/90">
            <a href={APP_URL}>Open the app</a>
          </Button>
        </nav>
        <button className="rounded-sm p-2 md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <nav className="border-t bg-background px-4 pb-5 pt-2 md:hidden" aria-label="Mobile">
          {NAV.map((n) => (
            <Link key={n.route} to={n.route} onClick={() => setOpen(false)}
              className={cn("block border-b py-3.5 font-display text-2xl font-bold uppercase", route === n.route ? "text-accent" : "text-foreground")}>
              {n.label}
            </Link>
          ))}
          <Button asChild size="lg" className="mt-5 w-full rounded-sm bg-accent text-base font-semibold text-accent-foreground hover:bg-accent/90">
            <a href={APP_URL}>Open the app, free</a>
          </Button>
        </nav>
      )}
    </header>
  );
}
