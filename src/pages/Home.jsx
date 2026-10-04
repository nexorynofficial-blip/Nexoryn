import Hero from "../components/Hero";
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
const SLICES = 7; // Problems, Solutions, Services, Portfolio, Reviews, CTA, Footer

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
          {n >= 1 && <Problems />}
          {n >= 2 && <Solutions />}
          {n >= 3 && <Services />}
          {n >= 4 && <Portfolio />}
          {n >= 5 && <Reviews />}
        </div>
      </div>
      {n >= 6 && <CTASection />}
      {n >= 7 && <Footer />}
    </>
  );
}
