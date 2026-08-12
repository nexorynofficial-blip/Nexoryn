import { useEffect } from "react";
import { motion } from "framer-motion";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import { ServiceBox } from "../components/ServiceBox";
import { SERVICE_CATEGORIES } from "../data/services";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

export default function ServicesPage() {
  useEffect(() => {
    document.title = "Services — Nexoryn";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-10 w-full px-4 pb-12 pt-32 md:px-10 lg:pt-40">
          {/* Header */}
          <div className="mx-auto max-w-5xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="mt-6 font-heading text-lg leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            >
              Services built to <span className="text-accent-from">scale</span>.
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.2}
              animateOnMount
              className="mt-5 text-lg font-light leading-relaxed text-body-dim"
            >
              Three disciplines, one goal: take the manual work off your
              plate. Open a service below to see exactly what's included.
            </Reveal>
          </div>

          {/* Three independent service boxes, each with its own tab state */}
          <div className="mt-16 flex flex-col gap-10 md:mt-20 md:gap-14">
            {SERVICE_CATEGORIES.map((category, i) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 * i, ease: "easeOut" }}
              >
                <ServiceBox
                  gooeyId={category.gooeyId}
                  serviceName={category.serviceName}
                  overviewIcon={category.overviewIcon}
                  overview={category.overview}
                  subServices={category.subServices}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Soft blend into the CTA section below, no dead gap before it */}
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
