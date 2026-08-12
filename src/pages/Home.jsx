import Hero from "../components/Hero";
import Problems from "../components/Problems";
import Solutions from "../components/Solutions";
import Services from "../components/Services";
import Portfolio from "../components/Portfolio";
import Reviews from "../components/Reviews";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { SectionsBackground } from "../components/SectionsBackground";

export default function Home() {
  return (
    <>
      <Hero />
      {/* Everything below the hero (through Reviews) shares one continuous
          animated backdrop; CTA breaks out with its own starfield/horizon */}
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-10">
          <Problems />
          <Solutions />
          <Services />
          <Portfolio />
          <Reviews />
        </div>
      </div>
      <CTASection />
      <Footer />
    </>
  );
}
