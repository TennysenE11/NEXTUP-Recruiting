import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { RouterProvider, useRoute, Link } from "@/lib/router";
import { useReveal } from "@/lib/reveal";
import { Home } from "@/pages/Home";
import { Features } from "@/pages/Features";
import { HowItWorks } from "@/pages/HowItWorks";
import { Pricing } from "@/pages/Pricing";
import { Faq } from "@/pages/Faq";
import { Privacy } from "@/pages/Privacy";

function NotFound() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-10 pt-20 sm:px-8">
      <h1 className="display text-6xl sm:text-7xl">That one went foul.</h1>
      <p className="mt-5 text-lg text-muted-foreground">The page you're looking for isn't here.</p>
      <Link to="home" className="link-arrow mt-6">Back to the home page →</Link>
    </section>
  );
}
function Page() {
  const r = useRoute();
  useReveal(r);
  const el = r === "home" ? <Home /> : r === "features" ? <Features /> : r === "how-it-works" ? <HowItWorks /> : r === "pricing" ? <Pricing /> : r === "faq" ? <Faq /> : r === "privacy" ? <Privacy /> : <NotFound />;
  return <div key={r} className="page-enter">{el}</div>;
}
export default function App() {
  return (
    <RouterProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2">Skip to content</a>
      <Nav />
      <main id="main"><Page /></main>
      <Footer />
    </RouterProvider>
  );
}
