import { useEffect, useMemo, useState } from "react";
import { m } from "framer-motion";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import { ReviewCardStack } from "../components/ReviewCardStack";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { SERVICE_TABS, ServiceFilter } from "../components/ui/ServiceFilter";
import { REVIEWS } from "../data/reviews";
import { getReviews } from "../lib/content";
import { useContent } from "../hooks/useContent";

export default function ReviewsPage() {
  const [activeService, setActiveService] = useState(SERVICE_TABS[0]);
  const reviews = useContent(getReviews, REVIEWS);

  const filteredReviews = useMemo(
    () => reviews.filter((review) => review.service === activeService),
    [reviews, activeService],
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
          <m.div
            key={activeService}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-10"
          >
            <ReviewCardStack reviews={filteredReviews} />
          </m.div>
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
