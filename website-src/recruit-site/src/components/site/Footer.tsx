import { Link } from "@/lib/router";
import { APP_URL } from "@/lib/site";
import { Brand } from "./Nav";

export function Footer() {
  return (
    <footer className="mt-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="rule grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Brand />
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Built by a 2027 pitcher from Santa Clarita, California, for every high school player emailing college coaches.
            </p>
          </div>
          <div className="text-[15px]">
            <p className="font-medium">Product</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><Link to="features" className="hover:text-foreground">Features</Link></li>
              <li><Link to="how-it-works" className="hover:text-foreground">How it works</Link></li>
              <li><Link to="pricing" className="hover:text-foreground">Pricing</Link></li>
              <li><a href={APP_URL} className="hover:text-foreground">Open the app</a></li>
            </ul>
          </div>
          <div className="text-[15px]">
            <p className="font-medium">Help</p>
            <ul className="mt-3 space-y-2 text-muted-foreground">
              <li><Link to="faq" className="hover:text-foreground">Questions</Link></li>
              <li><Link to="privacy" className="hover:text-foreground">Privacy</Link></li>
            </ul>
          </div>
        </div>
        <p className="rule py-6 text-[13px] text-muted-foreground">
          Coach names and emails come from each school's official athletics website. Not affiliated with the NCAA, NAIA, NJCAA or any school.
        </p>
      </div>
    </footer>
  );
}
