import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import SmoothScroll from "./components/SmoothScroll";
import Preloader from "./components/Preloader";
import ScrollProgress from "./components/ui/ScrollProgress";
import PageTransition from "./components/PageTransition";
import ScrollToTop from "./components/ScrollToTop";
import { IntroProvider } from "./lib/IntroContext";
import Home from "./pages/Home";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import PortfolioPage from "./pages/PortfolioPage";
import CaseStudyPage from "./pages/CaseStudyPage";
import ReviewsPage from "./pages/ReviewsPage";
import ContactPage from "./pages/ContactPage";
import { SiteBackground } from "./components/SiteBackground";

function AppRoutes() {
  const location = useLocation();

  return (
    // Keying on pathname makes each route a fresh subtree, so every section's
    // scroll-in animation replays on navigation instead of arriving already
    // finished from the previous page.
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/portfolio/:slug" element={<CaseStudyPage />} />
      <Route path="/reviews" element={<ReviewsPage />} />
      <Route path="/contact" element={<ContactPage />} />
    </Routes>
  );
}

export default function App() {
  // Gates the hero's entrance so it plays as the preloader hands off, rather
  // than finishing behind the plate while nobody can see it.
  const [introDone, setIntroDone] = useState(false);

  return (
    <BrowserRouter>
      <SmoothScroll>
        <Preloader onComplete={() => setIntroDone(true)} />
        <ScrollProgress />
        <ScrollToTop />
        <IntroProvider value={introDone}>
          <div className="relative min-h-screen">
            <SiteBackground />
            {/* Fixed navbar is shared across every route */}
            <Navbar />
            <div className="relative z-10">
              <PageTransition>
                <AppRoutes />
              </PageTransition>
            </div>
          </div>
        </IntroProvider>
        {/* Film grain lives on the section backdrops, not here. A fixed
            full-viewport grain layer has to be re-composited against every
            scroll position underneath it and measured as the most expensive
            thing on the page — with mix-blend-overlay it roughly halved the
            frame rate, and even as a plain opacity layer it still cost ~12fps.
            Scrolling it with the content instead is effectively free. */}
      </SmoothScroll>
    </BrowserRouter>
  );
}
