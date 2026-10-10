import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import { SERVICE_TABS } from "../components/ui/ServiceFilter";
import { ShowMoreButton } from "../components/ui/ShowMoreButton";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { PROJECTS } from "../data/projects";
import { getProjects } from "../lib/content";
import { useContent } from "../hooks/useContent";

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

// Tab label -> the service value projects are stored under. The tabs read
// the same as the Reviews page, but design projects are saved (by the admin
// panel and the seed data) as "Brand & Graphic Design".
const SERVICE_VALUE = {
  Automation: "Automation",
  "Web Development": "Web Development",
  "Graphic Design": "Brand & Graphic Design",
};

// Split a title so its last two words can carry the orange highlight.
function splitTitle(title) {
  const words = title.split(" ");
  const cut = Math.max(1, words.length - 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

const pad = (n) => String(n).padStart(2, "0");

function ProjectCard({ project, index }) {
  const [lead, highlight] = splitTitle(project.title);
  return (
    <Link
      to={`/portfolio/${project.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[linear-gradient(160deg,rgba(107,37,8,0.4)_0%,rgba(20,8,3,0.88)_35%,#050505_70%)] p-3 transition duration-500 hover:-translate-y-1.5 hover:border-accent-from/40 hover:shadow-[0_24px_60px_-18px_rgba(255,122,26,0.35)]"
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d0d]">
        <img
          src={project.photo}
          alt={project.title}
          width={800}
          height={500}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/60 px-3 py-1 font-mono-tech text-[11px] font-semibold tracking-[0.15em] text-accent-from backdrop-blur-md">
          {pad(index + 1)}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
          {project.industry}
        </span>
        <span className="absolute bottom-3 right-3 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-gradient-to-r from-accent-from to-accent-to text-black opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>

      {/* Copy */}
      <div className="flex flex-1 flex-col px-3 pb-3 pt-5">
        <h3 className="font-heading text-lg font-extrabold uppercase leading-tight text-white md:text-xl">
          {lead}{" "}
          <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">{highlight}</span>
        </h3>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-body-dim">{project.description}</p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.tags.slice(0, 3).map((tag) => (
            <li
              key={tag}
              className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80"
            >
              {tag}
            </li>
          ))}
        </ul>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-bold uppercase tracking-[0.12em] text-accent-from">
          View Case Study
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}

// Phone-width labels, so all three tabs fit on one line.
const SHORT_TABS = { "Web Development": "Web Dev", "Graphic Design": "Design" };

/** Service switcher: a pill bar with a sliding orange indicator. */
function ServiceSwitcher({ active, onSelect }) {
  return (
    <div className="mx-auto flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/70 p-1 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl [scrollbar-width:none]">
      {SERVICE_TABS.map((tab) => {
        const on = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            aria-pressed={on}
            className={`relative isolate shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 sm:px-6 sm:text-xs ${
              on ? "text-black" : "text-white/70 hover:text-white"
            }`}
          >
            {on && (
              <m.span
                layoutId="pf-service-pill"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-accent-from to-accent-to"
              />
            )}
            <span className="sm:hidden">{SHORT_TABS[tab] ?? tab}</span>
            <span className="hidden sm:inline">{tab}</span>
          </button>
        );
      })}
    </div>
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
                  : "border-white/10 bg-black/50 text-white/70 backdrop-blur-xl hover:border-accent-from/40 hover:text-white"
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
  const [service, setService] = useState(SERVICE_TABS[0]);
  const [industry, setIndustry] = useState("All Projects");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);

  useEffect(() => {
    document.title = "Portfolio - Nexoryn";
    // No local scroll reset — the global ScrollToTop already resets on every
    // route change (see ScrollToTop.jsx), so there is nothing to reset here.
  }, []);

  // Deep-link support: /portfolio?service=Web%20Development&industry=Fintech
  // sets the initial filters
  useEffect(() => {
    const serviceParam = searchParams.get("service")?.toLowerCase();
    const serviceMatch = SERVICE_TABS.find(
      (s) =>
        s.toLowerCase() === serviceParam ||
        SERVICE_VALUE[s].toLowerCase() === serviceParam
    );
    if (serviceMatch) setService(serviceMatch);

    const param = searchParams.get("industry");
    if (!param) return;
    const match = INDUSTRIES.find(
      (i) => i.toLowerCase() === param.toLowerCase()
    );
    if (match) setIndustry(match);
  }, [searchParams]);

  const projects = useContent(getProjects, PROJECTS);

  const visible = useMemo(() => {
    let list = projects.filter(
      (p) =>
        p.service === SERVICE_VALUE[service] &&
        (industry === "All Projects" || p.industry === industry)
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
  }, [projects, service, industry, query]);

  // Reset pagination whenever the filtered/searched list changes
  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [service, industry, query]);

  const visiblePage = visible.slice(0, visibleCount);
  const allShown = visibleCount >= visible.length;
  const revealMore = () =>
    setVisibleCount((c) => Math.min(c + BATCH, visible.length));

  return (
    <>
      {/* Shared section backdrop overlays (shader is site-wide in SiteBackground) */}
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-20 w-full px-4 pb-12 pt-32 md:px-10 lg:px-[7.8vw] lg:pt-40">
          {/* Header */}
          <div className="mx-auto max-w-5xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
            >
              Work that gets <span className="text-accent-from">results</span>.
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.2}
              animateOnMount
              className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-body-dim"
            >
              A showcase of automation, web, and design projects we've delivered
              for clients across industries.
            </Reveal>
          </div>

          {/* Service tabs — same control as the Reviews page, defaults to
              Automation */}
          <Reveal y={20} delay={0.26} animateOnMount className="mt-12">
            <ServiceSwitcher active={service} onSelect={setService} />
          </Reveal>

          {/* Toolbar — filter chips and search share one row on desktop */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center"
          >
            <ChipScroller active={industry} onSelect={setIndustry} />

            <div className="relative w-full shrink-0 lg:w-72">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search projects..."
                className="w-full rounded-full border border-white/10 bg-black/50 py-3 pl-11 pr-4 text-sm text-white placeholder-white/40 backdrop-blur-xl transition duration-300 focus:border-accent-from/50 focus:outline-none"
              />
            </div>
          </m.div>

          {/* Grid — 2 wide split-layout cards per row on desktop */}
          {visible.length > 0 ? (
            <>
              <m.div layout className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence mode="popLayout" initial={false}>
                  {visiblePage.map((project, i) => (
                    <m.div
                      key={`${service}-${project.slug}`}
                      layout
                      initial={{ opacity: 0, y: 24, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.45, delay: Math.min(i, 5) * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <ProjectCard project={project} index={i} />
                    </m.div>
                  ))}
                </AnimatePresence>
              </m.div>

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
              No {service} projects match your filters. Try a different industry or term.
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
