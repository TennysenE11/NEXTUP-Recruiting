import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { RouterProvider, useRoute, Link } from "@/lib/router";
import { Home } from "@/pages/Home";
import { Features } from "@/pages/Features";
import { HowItWorks } from "@/pages/HowItWorks";
import { Pricing } from "@/pages/Pricing";
import { Faq } from "@/pages/Faq";
import { Privacy } from "@/pages/Privacy";
import { PageHead } from "@/components/site/PageHead";

function NotFound() {
  return (
    <>
      <PageHead kicker="404" title="That page struck out." />
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><Link to="home" className="font-semibold underline decoration-accent decoration-2 underline-offset-4">Back to home</Link></div>
    </>
  );
}
function Page() {
  const r = useRoute();
  return r === "home" ? <Home /> : r === "features" ? <Features /> : r === "how-it-works" ? <HowItWorks /> : r === "pricing" ? <Pricing /> : r === "faq" ? <Faq /> : r === "privacy" ? <Privacy /> : <NotFound />;
}
export default function App() {
  return (
    <RouterProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-background focus:px-3 focus:py-2">Skip to content</a>
      <Nav />
      <main id="main"><Page /></main>
      <Footer />
    </RouterProvider>
  );
}
