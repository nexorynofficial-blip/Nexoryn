import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import { ReviewCardStack } from "../components/ReviewCardStack";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { REVIEWS } from "../data/reviews";

const SERVICES = ["Automation", "Web Development", "Graphic Design"];

// Segmented pill control, same visual language as the site's other tab/pill
// selectors (Services page's TabBar, Contact's form tabs) — active pill gets
// the brand gradient, inactive ones sit dim on the shared glass surface.
function ServiceFilter({ active, onSelect }) {
  return (
    <div className="mx-auto flex w-fit flex-wrap justify-center gap-3">
      {SERVICES.map((service) => (
        <button
          key={service}
          type="button"
          onClick={() => onSelect(service)}
          aria-pressed={active === service}
          className={`glass-panel rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-300 sm:px-6 sm:py-3 sm:text-sm ${
            active === service
              ? "border-transparent bg-gradient-to-r from-accent-from to-accent-to text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          {service}
        </button>
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const [activeService, setActiveService] = useState(SERVICES[0]);

  const filteredReviews = useMemo(
    () => REVIEWS.filter((review) => review.service === activeService),
    [activeService],
  );

  useEffect(() => {
    document.title = "Reviews - Nexoryn";
  }, []);

  return (
    <>
      {/* Shared section backdrop overlays (shader is site-wide in SiteBackground) */}
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-20 w-full px-4 pb-12 pt-32 md:px-10 lg:pt-40">
          {/* Header */}
          <div className="mx-auto max-w-4xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="mt-6 font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
            >
              Loved by <span className="text-accent-from">businesses</span>
              <br />
              we've automated.
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.22}
              animateOnMount
              className="mt-5 text-lg font-light leading-relaxed text-body-dim"
            >
              Real feedback from the teams who no longer do the busywork, open
              any review to read the full story.
            </Reveal>
          </div>

          {/* Service filter — which discipline's reviews to read, defaults
              to Automation */}
          <Reveal y={20} delay={0.26} animateOnMount className="mt-10">
            <ServiceFilter active={activeService} onSelect={setActiveService} />
          </Reveal>

          {/* Expandable review card stack */}
          <motion.div
            key={activeService}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-10"
          >
            <ReviewCardStack reviews={filteredReviews} />
          </motion.div>
        </div>

        {/* Soft blend into the CTA section below, mirroring the Hero's own
            bottom-edge fade into the section beneath it */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-black md:h-40"
        />
      </div>

      <CTASection compact />
      <Footer />
    </>
  );
}
