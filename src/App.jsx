import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LazyMotion } from "framer-motion";
import Navbar from "./components/Navbar";
import Preloader from "./components/Preloader";
import ScrollProgress from "./components/ui/ScrollProgress";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";
import { IntroProvider } from "./lib/IntroContext";
import Home from "./pages/Home";
// Home is the landing route, so it stays in the main bundle. Every other page
// is split into its own chunk and fetched on navigation — previously the whole
// site (CaseStudyPage alone is ~1000 lines, AboutPage pulls in the 3D globe)
// was parsed and executed before the first paint.
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const CaseStudyPage = lazy(() => import("./pages/CaseStudyPage"));
const ReviewsPage = lazy(() => import("./pages/ReviewsPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const PrivacyPolicyPage = lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = lazy(() => import("./pages/TermsOfServicePage"));
const CookiePolicyPage = lazy(() => import("./pages/CookiePolicyPage"));
import { SiteBackground } from "./components/SiteBackground";

// Framer Motion's features load after first paint (see lib/motionFeatures.js).
const loadMotionFeatures = () => import("./lib/motionFeatures").then((mod) => mod.default);

function AppRoutes() {
  const location = useLocation();

  return (
    // Keying on pathname makes each route a fresh subtree, so every section's
    // scroll-in animation replays on navigation instead of arriving already
    // finished from the previous page.
    // fallback={null}: the page background and navbar are already on screen,
    // so a blank gap for the few ms a chunk takes beats a spinner flash.
    <Suspense fallback={null}>
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:slug" element={<CaseStudyPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/cookie-policy" element={<CookiePolicyPage />} />
    </Routes>
    </Suspense>
  );
}

export default function App() {
  // Gates the hero's entrance so it plays as the preloader hands off, rather
  // than finishing behind the plate while nobody can see it.
  const [introDone, setIntroDone] = useState(false);

  // The static HTML shell (scripts/seo-pages.mjs) carries a visually-hidden
  // block of real links for crawlers that don't run JavaScript. It lives
  // outside #root, so React never touches it — once we're here, JS is
  // running, the real app has mounted, and that block is redundant. It's
  // marked aria-hidden (so a screen reader skips it) but its links are real
  // <a> tags a keyboard can still Tab to, which is a hidden-but-focusable
  // trap for a JS-capable visitor. Removing it outright fixes that.
  useEffect(() => {
    document.querySelectorAll("[data-seo-fallback]").forEach((el) => el.remove());
  }, []);

  return (
    <BrowserRouter>
      <LazyMotion features={loadMotionFeatures} strict>
        <Preloader onComplete={() => setIntroDone(true)} />
        <ScrollProgress />
        <ScrollToTop />
        <IntroProvider value={introDone}>
          <div className="relative min-h-screen">
            <SiteBackground />
            {/* Fixed navbar is shared across every route */}
            <Navbar />
            {/* The page's one <main> landmark — every route renders inside it,
                so assistive tech and crawlers always have exactly one. */}
            <main className="relative z-10">
              <PageTransition>
                <AppRoutes />
              </PageTransition>
            </main>
          </div>
        </IntroProvider>
        {/* Film grain lives on the section backdrops, not here. A fixed
            full-viewport grain layer has to be re-composited against every
            scroll position underneath it and measured as the most expensive
            thing on the page — with mix-blend-overlay it roughly halved the
            frame rate, and even as a plain opacity layer it still cost ~12fps.
            Scrolling it with the content instead is effectively free. */}
      </LazyMotion>
    </BrowserRouter>
  );
}
