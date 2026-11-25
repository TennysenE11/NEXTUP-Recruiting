import { Link } from "@/lib/router";
import { APP_URL } from "@/lib/site";
import { Brand } from "./Nav";

export function Footer() {
  return (
    <footer className="mt-24 bg-primary text-primary-foreground">
      <div className="stitch" aria-hidden />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Brand light />
          <p className="mt-4 max-w-sm text-[15px] text-primary-foreground/75">
            Built by a high school pitcher who wanted every email to a college coach to read like it was written for that coach.
          </p>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">Product</h3>
          <ul className="mt-3 space-y-2 text-[15px] text-primary-foreground/80">
            <li><Link to="features" className="hover:text-primary-foreground">Features</Link></li>
            <li><Link to="how-it-works" className="hover:text-primary-foreground">How it works</Link></li>
            <li><Link to="pricing" className="hover:text-primary-foreground">Pricing</Link></li>
            <li><a href={APP_URL} className="hover:text-primary-foreground">Open the app</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wide">Help</h3>
          <ul className="mt-3 space-y-2 text-[15px] text-primary-foreground/80">
            <li><Link to="faq" className="hover:text-primary-foreground">FAQ</Link></li>
            <li><Link to="privacy" className="hover:text-primary-foreground">Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-6xl px-4 py-5 text-sm text-primary-foreground/60 sm:px-6">
          Coach names and emails come from each school's official athletics website. Not affiliated with the NCAA, NAIA, NJCAA or any school.
        </p>
      </div>
    </footer>
  );
}
