import Hero from "../components/Hero";
import AutomationShowcase from "../components/AutomationShowcase";
import Problems from "../components/Problems";
import Solutions from "../components/Solutions";
import Services from "../components/Services";
import Portfolio from "../components/Portfolio";
import Reviews from "../components/Reviews";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { SectionsBackground } from "../components/SectionsBackground";
import { ScrollTrigger } from "../lib/gsap";
import { useProgressiveMount } from "../hooks/useProgressiveMount";

// The sections below the hero, in page order. The hero (and navbar and intro
// plate) render immediately; these mount one per task right after the first
// paint (see useProgressiveMount), so the first paint doesn't have to wait for
// the whole page to be built.
const SLICES = 8; // Automation, Problems, Solutions, Services, Portfolio, Reviews, CTA, Footer

export default function Home() {
  const n = useProgressiveMount(SLICES, () => ScrollTrigger.refresh());

  return (
    <>
      <Hero />
      {/* Everything below the hero (through Reviews) shares one continuous
          animated backdrop; CTA breaks out with its own starfield/horizon */}
      <div className="relative">
        <SectionsBackground hideTopFadeOnMobile />
        <div className="relative z-10">
          {n >= 1 && <AutomationShowcase />}
          {n >= 2 && <Problems />}
          {n >= 3 && <Solutions />}
          {n >= 4 && <Services />}
          {n >= 5 && <Portfolio />}
          {n >= 6 && <Reviews />}
        </div>
      </div>
      {n >= 7 && <CTASection />}
      {n >= 8 && <Footer />}
    </>
  );
}
