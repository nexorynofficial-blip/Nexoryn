import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import SplitText from "./ui/SplitText";
import { Eyebrow } from "./ui/Eyebrow";
import laptopFrame from "../assets/laptop-frame.webp";
import { PROJECTS } from "../data/projects";
import { getProjects } from "../lib/content";
import { useContent } from "../hooks/useContent";
import { easeInOutStrong, easeOutExpo, easeOutStrong } from "../lib/easing";

// Fixed home-page teaser: always exactly 3 automation projects + 2 web
// development projects, regardless of how many more get added to PROJECTS
// later. The full set is always available on the /portfolio grid page.
const FEATURED_SLUGS = [
  "ai-customer-support-chatbot",
  "personalized-cold-email-outreach",
  "intelligent-content-repurposing-approval-workflow",
  "aurum-luxury-ecommerce-platform",
  "analytics-hub-saas-dashboard-platform",
];

// Ordered by FEATURED_SLUGS rather than by the source list, so the teaser
// keeps its deliberate automation/web-dev mix whatever order the data
// arrives in.
const pickFeatured = (projects) =>
  FEATURED_SLUGS.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean);

const AUTOPLAY_MS = 6000;
const SWIPE_PX = 40;

// Transparent screen of laptop-frame.webp, found by flood-filling its alpha
// channel from the screen's centre (10.70% / 2.13% / 78.60% / 86.32%), then
// widened ~0.25% per side so the thumbnail tucks under the bezel and no
// sub-pixel hairline can open at any width. The laptop is drawn over this box.
const SCREEN_BOX = { left: "10.45%", top: "1.88%", width: "79.1%", height: "86.82%" };
const FRAME_RATIO = "1600 / 929";
// Vertical centre of the screen, for placing the side arrows.
const SCREEN_MID = "45.3%";

const pad = (n) => String(n).padStart(2, "0");

// Every thumbnail spans the screen's full width, edge to edge, and is never
// cropped. The featured thumbnails are all wider than the ~1.56:1 screen, so
// that leaves a band above and below, filled with a blurred copy of the same
// image rather than flat black.
function ScreenImage({ project }) {
  return (
    <>
      <img
        src={project.photo}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-50 blur-xl"
      />
      <img
        src={project.photo}
        alt={project.title}
        draggable={false}
        className="relative h-auto w-full"
      />
    </>
  );
}

// Plain utilities rather than the shared .glass-panel/.pressable classes:
// those live outside Tailwind's layers, so they'd override the hover border
// and the colour transition here. Tailwind v4's translate/scale utilities use
// the separate `translate`/`scale` properties, so the press-scale composes
// with the side buttons' vertical centring instead of replacing it.
function NavButton({ direction, onClick, className = "", style }) {
  const Icon = direction < 0 ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      aria-label={direction < 0 ? "Previous project" : "Next project"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white/80 backdrop-blur-xl transition-[color,border-color,scale] duration-300 hover:border-accent-from/60 hover:text-accent-to focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-from/70 active:scale-95 lg:h-11 lg:w-11 ${className}`}
    >
      <Icon className="h-5 w-5" strokeWidth={1.75} />
    </button>
  );
}

function Counter({ index, total, running, className = "" }) {
  return (
    <div className={`flex items-center gap-3 font-mono-tech text-xs tracking-[0.2em] text-white/50 ${className}`}>
      <span className="text-white/90">{pad(index + 1)}</span>
      <span className="relative h-px w-16 overflow-hidden bg-white/15">
        {running && (
          // Remounts per slide, so it always tracks the live autoplay timer.
          <motion.span
            key={index}
            className="absolute inset-0 origin-left bg-gradient-to-r from-accent-from to-accent-to"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
          />
        )}
      </span>
      <span>{pad(total)}</span>
    </div>
  );
}

export default function Portfolio() {
  const projects = useContent(getProjects, PROJECTS);
  const featured = pickFeatured(projects);
  const total = featured.length;

  const reduceMotion = useReducedMotion();
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.35 });

  const [{ index, dir }, setSlide] = useState({ index: 0, dir: 1 });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const pointerStart = useRef(null);

  const current = featured[Math.min(index, total - 1)];

  const go = useCallback(
    (delta) =>
      setSlide(({ index: i }) => ({ index: (i + delta + total) % total, dir: delta })),
    [total],
  );

  useEffect(() => {
    const onVisibility = () => setTabVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Autoplay only runs while the section is on screen and nobody is reading
  // or interacting with it. Keyed on `index`, so any manual step restarts the
  // full interval rather than jumping again moments later.
  const autoplay = !reduceMotion && total > 1 && inView && tabVisible && !hovered && !focused;
  useEffect(() => {
    if (!autoplay) return undefined;
    const t = setTimeout(() => go(1), AUTOPLAY_MS);
    return () => clearTimeout(t);
  }, [autoplay, index, go]);

  // Preload every thumbnail up front so a slide never opens on a blank screen.
  const photosKey = featured.map((p) => p.photo).join("|");
  useEffect(() => {
    photosKey.split("|").forEach((src) => {
      new Image().src = src;
    });
  }, [photosKey]);

  const onKeyDown = (e) => {
    if (e.key === "ArrowLeft") go(-1);
    else if (e.key === "ArrowRight") go(1);
  };

  const onPointerDown = (e) => {
    pointerStart.current = e.clientX;
    // Keeps pointerup coming here even if the swipe ends off the laptop.
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerUp = (e) => {
    if (pointerStart.current === null) return;
    const dx = e.clientX - pointerStart.current;
    pointerStart.current = null;
    if (Math.abs(dx) >= SWIPE_PX) go(dx < 0 ? 1 : -1);
  };

  const slideVariants = reduceMotion
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        enter: (d) => ({ x: `${d * 100}%` }),
        center: { x: "0%" },
        exit: (d) => ({ x: `${d * -100}%` }),
      };

  const textVariants = {
    shown: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: 0.2, ease: easeOutExpo },
    },
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : -8,
      transition: { duration: 0.22, ease: easeOutStrong },
    },
  };

  if (!current) return null;

  return (
    <section id="portfolio" ref={sectionRef} className="relative scroll-mt-24 pb-16 lg:pb-24">
      <div className="px-4 pt-8 text-center md:px-10 lg:pt-12">
        {/* One line at every width: nowrap, with the size scaling down with
            the viewport instead of wrapping on narrow screens. */}
        <SplitText
          as="h2"
          className="font-heading whitespace-nowrap text-[clamp(1.05rem,5.2vw,3.75rem)] leading-tight tracking-tight text-white"
        >
          Work that speaks for <span className="text-accent-from">itself</span>.
        </SplitText>
      </div>

      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Featured projects"
        onKeyDown={onKeyDown}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
        // Only keyboard focus pauses autoplay. A mouse click also leaves the
        // clicked arrow focused, and pausing on that would stop autoplay
        // for good after the first click.
        onFocus={(e) => e.target.matches?.(":focus-visible") && setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setFocused(false);
        }}
        className="mx-auto mt-8 grid max-w-[1400px] items-center gap-8 px-4 md:mt-10 md:px-10 lg:mt-14 xl:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] xl:gap-12"
      >
        {/* Laptop — first on mobile, right column on desktop. */}
        <div className="order-1 mx-auto w-full max-w-[680px] xl:order-2 xl:max-w-none">
          <div className="relative xl:px-12">
            <NavButton
              direction={-1}
              onClick={() => go(-1)}
              style={{ top: SCREEN_MID }}
              className="absolute left-0 z-20 hidden -translate-y-1/2 xl:flex"
            />
            <div
              className="relative w-full select-none"
              style={{ aspectRatio: FRAME_RATIO, touchAction: "pan-y" }}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (pointerStart.current = null)}
            >
              <div className="absolute overflow-hidden bg-[#0a0a0a]" style={SCREEN_BOX}>
                <AnimatePresence initial={false} custom={dir}>
                  <motion.div
                    key={current.slug}
                    custom={dir}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    // In-out rather than the site's usual expo-out: expo
                    // covers ~90% of the distance in the first fifth, which
                    // reads as a cut, not a slide.
                    transition={{ duration: reduceMotion ? 0.3 : 0.85, ease: easeInOutStrong }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <ScreenImage project={current} />
                  </motion.div>
                </AnimatePresence>
              </div>
              {/* Drawn over the screen box: its opaque bezel is what frames
                  and hides the thumbnail's edges. */}
              <img
                src={laptopFrame}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none absolute inset-0 z-10 h-full w-full"
              />
            </div>
            <NavButton
              direction={1}
              onClick={() => go(1)}
              style={{ top: SCREEN_MID }}
              className="absolute right-0 z-20 hidden -translate-y-1/2 xl:flex"
            />
          </div>

          <div className="mt-5 flex items-center justify-center gap-6 xl:hidden">
            <NavButton direction={-1} onClick={() => go(-1)} />
            <Counter index={index} total={total} running={autoplay} />
            <NavButton direction={1} onClick={() => go(1)} />
          </div>
        </div>

        {/* Text — all projects stacked in one grid cell, so the column is
            always as tall as the longest entry and nothing shifts between
            slides; only the active one is visible and reachable. */}
        <div className="order-2 mx-auto w-full max-w-[680px] xl:order-1 xl:mx-0 xl:max-w-md">
          <div className="grid">
            {featured.map((project, i) => {
              const active = i === index;
              return (
                <motion.div
                  key={project.slug}
                  className={`col-start-1 row-start-1 ${active ? "" : "pointer-events-none"}`}
                  initial={false}
                  animate={active ? "shown" : "hidden"}
                  variants={textVariants}
                  aria-hidden={!active}
                  inert={!active}
                >
                  <Eyebrow>{project.service}</Eyebrow>
                  <h3 className="font-heading mt-5 text-2xl leading-tight tracking-tight text-accent-from md:text-3xl lg:text-4xl">
                    {project.title}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-body-dim md:text-base">
                    {project.description}
                  </p>
                  <Link
                    to={`/portfolio/${project.slug}`}
                    className="group/case mt-6 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-accent-from"
                  >
                    <span className="relative pb-1">
                      View case study
                      <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-accent-from to-accent-to transition-transform duration-300 ease-out group-hover/case:scale-x-100" />
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/case:-translate-y-0.5 group-hover/case:translate-x-0.5" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
          <Counter index={index} total={total} running={autoplay} className="mt-10 hidden xl:flex" />
          <span className="sr-only" aria-live={autoplay ? "off" : "polite"}>
            Project {index + 1} of {total}: {current.title}
          </span>
        </div>
      </div>

      <div className="relative z-10 mt-12 flex justify-center lg:mt-16">
        <Link
          to="/portfolio"
          className="group/link inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-accent-from"
        >
          <span className="relative pb-1">
            View All Projects
            <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-accent-from to-accent-to transition-transform duration-300 ease-out group-hover/link:scale-x-100" />
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
