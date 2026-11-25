import { createContext, useContext, useEffect, useState, type ReactNode, type AnchorHTMLAttributes } from "react";
import { TITLES, type Route } from "./site";

// Hash routing keeps every page working from one static file on GitHub Pages (#/pricing, #/faq, ...).
const ROUTES: Route[] = ["home", "features", "how-it-works", "pricing", "faq", "privacy"];
function parse(): Route {
  const h = window.location.hash.replace(/^#\/?/, "").split("?")[0];
  if (!h) return "home";
  return (ROUTES as string[]).includes(h) ? (h as Route) : "not-found";
}
const Ctx = createContext<Route>("home");
export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(parse());
  useEffect(() => {
    const on = () => { setRoute(parse()); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { document.title = TITLES[route]; }, [route]);
  return <Ctx.Provider value={route}>{children}</Ctx.Provider>;
}
export const useRoute = () => useContext(Ctx);
export const href = (r: Route) => (r === "home" ? "#/" : `#/${r}`);
export function Link({ to, ...rest }: { to: Route } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={href(to)} {...rest} />;
}
