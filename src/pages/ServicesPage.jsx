import { useEffect, useState } from "react";
import { m } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import ServiceCategory from "../components/services/ServiceCategory";
import { SERVICE_CATEGORIES } from "../data/services";
import { getServices } from "../lib/content";
import { useContent } from "../hooks/useContent";
import { prefersReducedMotion } from "../lib/easing";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";

// Room for the navbar and the sticky discipline switcher when jumping to a
// category.
const JUMP_OFFSET = 150;

// Phone-width labels for the switcher, so all three fit on one line.
const SHORT_NAMES = { automation: "Automation", "web-development": "Web Dev", "graphic-design": "Design" };

const jumpTo = (id) => {
  const el = document.getElementById(`service-${id}`);
  if (!el) return;
  window.scrollTo({
    top: el.getBoundingClientRect().top + window.scrollY - JUMP_OFFSET,
    behavior: prefersReducedMotion() ? "instant" : "smooth",
  });
};

/** Which category the reader is in: the last one whose top has passed the
 *  middle of the screen (the first one while still above them all). */
function useActiveCategory(ids) {
  const [active, setActive] = useState(ids[0]);
  const key = ids.join("|");
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(`service-${id}`);
        if (el && el.getBoundingClientRect().top <= mid) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return active;
}

/** Pill bar that sticks under the navbar and follows the reader down the page. */
function DisciplineNav({ categories, active }) {
  return (
    <div className="pointer-events-none sticky top-20 z-30 flex justify-center px-4 py-3">
      <div className="pointer-events-auto flex max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/75 p-1 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl [scrollbar-width:none]">
        {categories.map((c) => {
          const on = c.id === active;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => jumpTo(c.id)}
              className={`relative isolate shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 md:px-5 md:text-xs ${
                on ? "text-black" : "text-white/70 hover:text-white"
              }`}
            >
              {on && (
                <m.span
                  layoutId="svc-nav-pill"
                  transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-accent-from to-accent-to"
                />
              )}
              <span className="sm:hidden">{SHORT_NAMES[c.id] ?? c.serviceName}</span>
              <span className="hidden sm:inline">{c.serviceName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const [searchParams] = useSearchParams();
  const categories = useContent(getServices, SERVICE_CATEGORIES);
  const active = useActiveCategory(categories.map((c) => c.id));
  // Set by the Hero card's service tags and the home Services section's
  // cards — links straight into a single category instead of always landing
  // on the top of the page.
  const targetCategory = searchParams.get("category");

  useEffect(() => {
    document.title = "Services - Nexoryn";

    // No plain scroll-to-top branch here: the global ScrollToTop already
    // resets to 0 on every route change. This only scrolls further down to a
    // specific category.
    // Waits until the page's sections (and their reveal animations) have laid
    // out, otherwise the jump lands short or gets undone by the route's
    // scroll reset.
    if (!targetCategory) return undefined;
    const first = setTimeout(() => jumpTo(targetCategory), 400);
    // Sections above can still grow while the first scroll runs (their
    // illustrations and reveals settle); land precisely once they have.
    const settle = setTimeout(() => {
      const el = document.getElementById(`service-${targetCategory}`);
      if (el && Math.abs(el.getBoundingClientRect().top - JUMP_OFFSET) > 24) jumpTo(targetCategory);
    }, 1500);
    return () => {
      clearTimeout(first);
      clearTimeout(settle);
    };
  }, [targetCategory]);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-20 w-full pb-12 pt-32 lg:pt-40">
          {/* Hero */}
          <div className="mx-auto max-w-5xl px-4 text-center md:px-10">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
            >
              Services built to <span className="text-accent-from">scale</span>.
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.2}
              animateOnMount
              className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-body-dim"
            >
              Three disciplines, one goal: take the manual work off your
              plate. Open a service below to see exactly what's included.
            </Reveal>
          </div>


          {/* Disciplines, with the switcher pinned while you read them */}
          <div className="relative mt-10 md:mt-14">
            <DisciplineNav categories={categories} active={active} />
            <div className="px-4 md:px-10 lg:px-[7.8vw]">
              {categories.map((category, i) => (
                <ServiceCategory
                  key={category.id}
                  category={category}
                  index={i}
                  highlighted={targetCategory === category.id}
                />
              ))}
            </div>
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
