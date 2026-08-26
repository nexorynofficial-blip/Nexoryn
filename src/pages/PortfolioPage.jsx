import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Workflow,
  Code2,
  Palette,
} from "lucide-react";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import { ShowMoreButton } from "../components/ui/ShowMoreButton";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { PROJECTS } from "../data/projects";

// "Show more" pagination: start with 6 cards and reveal the next batch of 6
// on each click until the whole filtered list is shown.
const INITIAL_COUNT = 6;
const BATCH = 6;

const INDUSTRIES = [
  "All Projects",
  "Fintech",
  "E-Commerce",
  "Healthcare",
  "Real Estate",
  "Hospitality",
  "SaaS & Tech",
  "Logistics",
  "Education",
  "Retail",
  "Manufacturing",
  "Sports & Recruitment",
  "Nonprofit & Advocacy",
];

// Icon shown in each card's header tile, chosen by the project's service type
const SERVICE_ICON = {
  Automation: Workflow,
  "Web Development": Code2,
  "Brand & Graphic Design": Palette,
};

function ProjectCard({ project }) {
  const Icon = SERVICE_ICON[project.service] ?? Workflow;
  return (
    <article className="glass-panel relative overflow-hidden rounded-3xl backdrop-blur-xl">
      {/* Soft orange inner glow from the left edge (opposite the image),
          reading as an ambient light behind the text content */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(circle at 0% 50%, rgba(255,122,26,0.15), transparent 60%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col lg:flex-row lg:items-stretch">
        {/* Content side (left on desktop, below the image on mobile) —
            title/description are clamped and tags/button are fixed-size, so
            every card lands at the same height regardless of copy length. */}
        <div className="order-2 flex flex-1 flex-col p-6 md:p-8 lg:order-1 lg:min-w-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/15">
              <Icon className="h-5 w-5 text-orange-400" />
            </div>
            <h3 className="line-clamp-1 font-heading text-xl leading-tight text-white">
              {project.title}
            </h3>
          </div>

          <p className="mt-4 line-clamp-3 min-h-[68px] text-sm font-light leading-relaxed text-body-dim">
            {project.description}
          </p>

          <div className="mt-5 flex h-[26px] flex-nowrap gap-2 overflow-hidden">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="shrink-0 whitespace-nowrap rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/70"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-6">
            <Link
              to={`/portfolio/${project.slug}`}
              className="inline-block rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition duration-300 hover:bg-orange-600"
            >
              Open Case Study
            </Link>
          </div>
        </div>

        {/* Image side (right on desktop, on top on mobile) */}
        <div className="order-1 shrink-0 p-4 lg:order-2 lg:w-[45%]">
          <img
            src={project.photo}
            alt={project.title}
            loading="lazy"
            className="h-52 w-full rounded-2xl object-cover lg:h-full"
          />
        </div>
      </div>
    </article>
  );
}

function ChipScroller({ active, onSelect }) {
  const scrollerRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, []);

  const scrollByDir = (dir) =>
    scrollerRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });

  const arrowClasses =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-accent-to backdrop-blur-xl transition duration-300 enabled:hover:border-orange-400/40 enabled:hover:bg-white/10 disabled:cursor-default disabled:opacity-30";

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <button
        type="button"
        onClick={() => scrollByDir(-1)}
        disabled={!canLeft}
        aria-label="Scroll filters left"
        className={arrowClasses}
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex min-w-0 flex-1 gap-2.5 overflow-x-auto scroll-smooth"
      >
        {INDUSTRIES.map((industry) => {
          const isActive = active === industry;
          return (
            <button
              key={industry}
              type="button"
              onClick={() => onSelect(industry)}
              className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition duration-300 ${
                isActive
                  ? "border-transparent bg-gradient-to-r from-accent-from to-accent-to text-black"
                  : "border-white/10 bg-white/[0.05] text-white/70 backdrop-blur-xl hover:border-orange-400/40 hover:text-white"
              }`}
            >
              {industry}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scrollByDir(1)}
        disabled={!canRight}
        aria-label="Scroll filters right"
        className={arrowClasses}
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

export default function PortfolioPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [industry, setIndustry] = useState("All Projects");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  useEffect(() => {
    document.title = "Portfolio - Nexoryn";
    // No local scroll reset — the global ScrollToTop already resets on every
    // route change via lenis.scrollTo, which Lenis needs to stay in sync;
    // a raw window.scrollTo call here fights that (see ScrollToTop.jsx).
  }, []);

  // Deep-link support: /portfolio?industry=Fintech sets the initial filter
  useEffect(() => {
    const param = searchParams.get("industry");
    if (!param) return;
    const match = INDUSTRIES.find(
      (i) => i.toLowerCase() === param.toLowerCase()
    );
    if (match) setIndustry(match);
  }, [searchParams]);

  const visible = useMemo(() => {
    let list = PROJECTS.filter(
      (p) => industry === "All Projects" || p.industry === industry
    );
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.industry.toLowerCase().includes(q) ||
          p.service.toLowerCase().includes(q)
      );
    }
    return list;
  }, [industry, query]);

  // Reset pagination whenever the filtered/searched list changes
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [industry, query]);

  const visiblePage = visible.slice(0, visibleCount);
  const allShown = visibleCount >= visible.length;
  const revealMore = () =>
    setVisibleCount((c) => Math.min(c + BATCH, visible.length));

  return (
    <>
      {/* Shared section backdrop overlays (shader is site-wide in SiteBackground) */}
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-20 w-full px-4 pb-12 pt-32 md:px-10 lg:pt-40">
          {/* Header */}
          <div className="mx-auto max-w-5xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="mt-6 font-heading text-lg leading-tight tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl"
            >
              Work that gets <span className="text-accent-from">results</span>.
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.2}
              animateOnMount
              className="mt-5 text-lg font-light leading-relaxed text-body-dim"
            >
              A showcase of automation, web, and design projects we've delivered
              for clients across industries.
            </Reveal>
          </div>

          {/* Toolbar — filter chips and search share one row on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-12 flex flex-col gap-4 lg:flex-row lg:items-center"
          >
            <ChipScroller active={industry} onSelect={setIndustry} />

            <div className="relative w-full shrink-0 lg:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-full border border-white/10 bg-white/[0.05] py-3 pl-11 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-xl transition duration-300 focus:border-orange-400/40 focus:outline-none"
              />
            </div>
          </motion.div>

          {/* Grid — 2 wide split-layout cards per row on desktop */}
          {visible.length > 0 ? (
            <>
              <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {visiblePage.map((project) => (
                  <motion.div
                    key={project.slug}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <ProjectCard project={project} />
                  </motion.div>
                ))}
              </div>

              <div className="mt-10 flex justify-center">
                {allShown ? (
                  <p className="text-sm font-medium text-white/40">
                    All projects shown
                  </p>
                ) : (
                  <ShowMoreButton onClick={revealMore} />
                )}
              </div>
            </>
          ) : (
            <p className="mt-16 text-center text-body-dim">
              No projects match your search. Try a different industry or term.
            </p>
          )}
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
