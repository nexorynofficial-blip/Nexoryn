import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import {
  ChevronDown,
  CheckCircle2,
  X,
  Monitor,
  RefreshCw,
  Maximize2,
  ExternalLink,
} from "lucide-react";
import { staggerContainer, blurFadeIn } from "../lib/motion";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/easing";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { SectionsBackground } from "../components/SectionsBackground";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import Reveal from "../components/ui/Reveal";
import { getProjectBySlug } from "../data/projects";

const BASE_TABS = ["Overview", "Results", "Tech Stack", "Scalability & Flexibility"];

// Graphic-design case studies (identified by the presence of `designProcess`)
// use a fixed 6-tab structure instead — no technical breakdown, no tech
// stack, and the visual gallery is its own tab rather than living inside
// Overview.
const DESIGN_TABS = [
  "Overview",
  "Design Process",
  "Key Features",
  "Use Cases",
  "Customization & Scalability",
  "Gallery",
];

// The final tab depends on what a project actually has to show — automation
// projects get real workflow screenshots, but a web-dev project with no
// deployment yet has nothing to screenshot, so it gets an (empty-for-now)
// Live Preview tab instead. Computed per-project rather than a fixed global
// list so each case study only shows the tab it can actually back with data.
function tabsForCaseStudy(caseStudy) {
  if (caseStudy.designProcess) return DESIGN_TABS;
  if (caseStudy.gallery) return [...BASE_TABS, "Gallery"];
  if (caseStudy.screenshots) return [...BASE_TABS, "Screenshots"];
  if (caseStudy.livePreview) return [...BASE_TABS, "Live Preview"];
  return BASE_TABS;
}

/* ── Small shared pieces ─────────────────────────────────────────────── */

// Outer panel — glass, but deliberately less transparent than the
// decorative cards elsewhere (60% dark fill, not ~5%). Used only for the two
// big boxes the whole page is built from: the sidebar and the box wrapping
// the tab bar + tab content. The nested `inner` cards below are already
// translucent themselves; if this were as sheer as a typical glass card too,
// the shader backdrop would bleed through both layers and wash them out.
const OUTER = "rounded-3xl glass-panel backdrop-blur-xl";

// Inner panel — the cards nested inside an OUTER box (problem/solution,
// workflow, stat tiles, tool cards, etc). A thin orange-tinted outline all
// the way around plus a slightly-lighter-than-black fill is what reads as
// "a box sitting inside a box" rather than everything fusing into one flat
// surface. Border color is a parameter so "The Problem" can stay red-tinted
// while everything else uses the brand orange.
//
// Deliberately excludes `rounded-*`: callers need both rounded-2xl (cards)
// and rounded-full (icon tiles), and two rounded-* utilities on one element
// have equal specificity — whichever Tailwind happens to emit last in the
// stylesheet would silently win. Each call site adds its own.
const inner = (borderClass = "border-accent-from/30") =>
  `border ${borderClass} bg-white/[0.045]`;

/* ── Sidebar ──────────────────────────────────────────────────────────── */

function Sidebar({ project }) {
  const { caseStudy } = project;
  return (
    <motion.aside
      initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`${OUTER} hover-lift p-6 lg:sticky lg:top-28`}
    >
      <img
        src={project.photo}
        alt={project.title}
        className="aspect-[4/3] w-full rounded-2xl object-cover"
      />

      <h1 className="mt-5 font-heading text-2xl leading-tight text-white">
        {project.title}
      </h1>

      <span className="mt-3 inline-flex items-center rounded-full border border-accent-from/40 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-accent-to">
        {caseStudy.category}
      </span>

      {/* Icon alone doesn't say "n8n" vs "Ollama" to anyone unfamiliar with
          the tools — the name has to be on the tile itself, not just in a
          hover title that a touch device can never trigger. */}
      <div className="mt-5 grid grid-cols-2 gap-2.5">
        {caseStudy.techIcons.map(({ name, icon: Icon }) => (
          <div
            key={name}
            className={`${inner()} flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:border-orange-400/60`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-orange-400/25 bg-orange-500/10 text-accent-to">
              <Icon className="h-4 w-4" />
            </div>
            <span className="truncate text-xs font-semibold text-white/80">
              {name}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-body-dim">
        {caseStudy.summary}
      </p>
    </motion.aside>
  );
}

/* ── Tab bar ──────────────────────────────────────────────────────────── */

function TabBar({ tabs, active, onSelect }) {
  return (
    <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onSelect(tab)}
            className={`shrink-0 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-semibold transition duration-300 ${
              isActive
                ? "border-transparent bg-gradient-to-r from-accent-from to-accent-to text-white shadow-[0_0_24px_-4px_rgba(255,122,26,0.55)]"
                : "border-white/10 bg-white/[0.045] text-white/60 hover:border-orange-400/40 hover:text-white hover:brightness-110"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

/* ── Tab 1: Overview ──────────────────────────────────────────────────── */

function ProblemSolution({ problem, solution }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className={`${inner("border-red-500/40")} rounded-2xl p-6 md:p-7`}>
        <h3 className="font-heading text-lg text-red-400">The Problem</h3>
        <ul className="mt-4 flex flex-col gap-3">
          {problem.map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-body-dim">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500/70" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className={`${inner()} rounded-2xl p-6 md:p-7`}>
        <h3 className="font-heading text-lg text-accent-to">The Solution</h3>
        <ul className="mt-4 flex flex-col gap-3">
          {solution.map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-body-dim">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-from" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Sequential "current" animation: each node lights up in turn, then a glow
// travels the connector into the next one — a small self-contained story
// ("work is done here, now it moves on") rather than everything fading in
// together. Plays once per mount, which in practice means once per time this
// tab is opened, since AnimatePresence remounts the tab content on switch.
function SolutionWorkflow({ steps }) {
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const nodes = gsap.utils.toArray(".wf-node", containerRef.current);
      const rings = gsap.utils.toArray(".wf-ring", containerRef.current);
      const connectors = gsap.utils.toArray(".wf-connector", containerRef.current);

      if (prefersReducedMotion()) {
        // The sequence itself is the point of this diagram, but "sequence" is
        // motion — reduced motion gets the finished state directly instead.
        gsap.set(nodes, { opacity: 1, scale: 1 });
        gsap.set(".wf-fill", { scaleX: 1 });
        return;
      }

      // Everything starts dim/pending; the timeline "activates" each piece
      // as the current reaches it.
      gsap.set(nodes, { opacity: 0.35, scale: 0.92 });
      gsap.set(rings, { opacity: 0, scale: 0.8 });
      gsap.set(connectors, { "--spark": "0%" });
      gsap.set(".wf-fill", { scaleX: 0 });
      gsap.set(".wf-spark", { opacity: 0 });

      const tl = gsap.timeline({ delay: 0.3 });

      nodes.forEach((node, i) => {
        // Node activates: a quick overshoot scale plus an expanding ring that
        // fades out — the "work done here" beat.
        tl.to(node, { opacity: 1, scale: 1.14, duration: 0.25, ease: "back.out(2.5)" })
          .to(node, { scale: 1, duration: 0.22, ease: "power2.out" }, ">-0.05")
          .fromTo(
            rings[i],
            { scale: 0.8, opacity: 0.7 },
            { scale: 1.7, opacity: 0, duration: 0.55, ease: "power2.out" },
            "<"
          );

        const connector = connectors[i]; // undefined after the last node
        if (!connector) return;

        const fill = connector.querySelector(".wf-fill");
        const spark = connector.querySelector(".wf-spark");

        // The glow travels via a CSS custom property (--spark: 0%→100%) that
        // the spark's `left` reads, animated alongside the fill bar growing
        // behind it — together they read as current flowing down the wire.
        tl.to(spark, { opacity: 1, duration: 0.1 }, ">0.05")
          .to(connector, { "--spark": "100%", duration: 0.5, ease: "none" }, "<")
          .to(fill, { scaleX: 1, duration: 0.5, ease: "power1.inOut" }, "<")
          .to(spark, { opacity: 0, duration: 0.15 }, ">-0.15");
      });
    },
    { scope: containerRef, dependencies: [steps] }
  );

  // Node columns are a FIXED 56px (the circle's own diameter) rather than
  // `auto` — `auto` sizes each column to fit its widest content, and since
  // the labels are different lengths ("CHAT" vs "CLASSIFY"), that gave every
  // node column a different width, which threw the connectors' visual
  // spacing off even though the connector tracks themselves were equal `1fr`.
  // A fixed width means every node column is identical, so the connectors —
  // still equal `1fr` — end up visually equal too. Labels wider than 56px
  // simply center-overflow their column (safe: nothing else occupies that
  // horizontal space at label-row height).
  const columns = steps
    .map((_, i) => (i < steps.length - 1 ? "56px minmax(20px, 1fr)" : "56px"))
    .join(" ");

  return (
    <div className={`${inner()} rounded-2xl p-6 md:p-8`}>
      <h3 className="font-heading text-lg text-white">Solution Workflow</h3>
      {/* A CSS grid rather than a flex row: putting nodes and connectors in
          the *same* grid row means `align-items: center` centers each of
          them against that row's shared height (set by the tallest item —
          the node circle), so the thin connector bar lands exactly on the
          circle's vertical center instead of the center of "circle + label"
          as a flex column would give it. Labels sit in an explicit second
          row, placed under their own node's column only. overflow-x-auto is
          just a safety net for very narrow screens where the minimum content
          width can't shrink any further — at normal widths the 1fr columns
          fill the box exactly and no scrolling happens. */}
      <div className="no-scrollbar mt-6 overflow-x-auto">
        <div
          ref={containerRef}
          className="grid items-center justify-items-center gap-y-3 px-4"
          style={{ gridTemplateColumns: columns }}
        >
          {steps.map(({ icon: Icon }, i) => {
            const nodeCol = i * 2 + 1;
            return (
              <div
                key={`node-${i}`}
                style={{ gridRow: 1, gridColumn: nodeCol }}
                className="wf-node relative flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/25 bg-orange-500/10 text-orange-400"
              >
                <span className="wf-ring pointer-events-none absolute inset-0 rounded-full border-2 border-accent-from" />
                <Icon className="relative z-10 h-5 w-5" />
              </div>
            );
          })}

          {steps.slice(0, -1).map((_, i) => (
            <div
              key={`conn-${i}`}
              style={{ gridRow: 1, gridColumn: i * 2 + 2, "--spark": "0%" }}
              className="wf-connector relative h-0.5 w-full overflow-visible rounded-full bg-white/10"
            >
              <span className="wf-fill absolute inset-y-0 left-0 w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-accent-from to-accent-to" />
              <span
                className="wf-spark absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 shadow-[0_0_10px_3px_rgba(255,178,60,0.85)]"
                style={{ left: "var(--spark)" }}
              />
            </div>
          ))}

          {steps.map(({ label }, i) => (
            <span
              key={`label-${i}`}
              style={{ gridRow: 2, gridColumn: i * 2 + 1 }}
              className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.15em] text-white/70"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function TechnicalBreakdown({ sections }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`${inner()} rounded-2xl`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-6 text-left md:p-7"
      >
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-accent-to transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
        <span className="font-heading text-lg text-white">
          Full Technical Breakdown
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 md:px-7 md:pb-7">
              {sections.map((section) => (
                <div
                  key={section.title}
                  className="grid grid-cols-1 gap-2 border-t border-white/10 py-4 first:border-t-0 first:pt-0 md:grid-cols-[280px_1fr] md:gap-6"
                >
                  <h4 className="font-heading text-sm text-accent-to md:text-base">
                    {section.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-body-dim">
                    {section.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OverviewTab({ overview }) {
  return (
    <div className="flex flex-col gap-6">
      <ProblemSolution problem={overview.problem} solution={overview.solution} />
      <SolutionWorkflow steps={overview.workflow} />
      <TechnicalBreakdown sections={overview.breakdown} />
    </div>
  );
}

/* ── Design tab 1: Overview (Problem, Solution) ──────────────────────────── */

function DesignOverviewTab({ overview }) {
  return (
    <div className="flex flex-col gap-6">
      <ProblemSolution problem={overview.problem} solution={overview.solution} />
    </div>
  );
}

/* ── Design tab 1b: Gallery ───────────────────────────────────────────────
   Its own tab rather than inline on Overview, laid out in a large single-
   or two-column grid (not the 3-column masonry) so each design is shown
   big enough to actually read the work. */

function DesignGalleryTab({ gallery }) {
  const [active, setActive] = useState(null);

  return (
    <>
      <div
        className={`grid grid-cols-1 gap-6 ${
          gallery.length > 1 ? "md:grid-cols-2" : ""
        }`}
      >
        {gallery.map((shot) => (
          <button
            key={shot.src}
            type="button"
            onClick={() => setActive(shot)}
            className={`${inner()} block w-full overflow-hidden rounded-2xl transition duration-300 hover:border-orange-400/60`}
          >
            <img
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              className="h-auto w-full"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <ScreenshotLightbox shot={active} onClose={() => setActive(null)} />
    </>
  );
}

/* ── Design tab 2: Design Process ────────────────────────────────────────
   Input requirements → workflow → design engine processing → refinements
   & QA. No numbered technical breakdown — that's automation-project only. */

function DesignProcessTab({ designProcess }) {
  return (
    <div className="flex flex-col gap-6">
      <div className={`${inner()} rounded-2xl p-6 md:p-7`}>
        <h3 className="font-heading text-lg text-accent-to">
          Input Requirements
        </h3>
        <ul className="mt-4 flex flex-col gap-3">
          {designProcess.input.map((line) => (
            <li key={line} className="flex gap-3 text-sm leading-relaxed text-body-dim">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-from" />
              {line}
            </li>
          ))}
        </ul>
      </div>

      <SolutionWorkflow steps={designProcess.workflow} />

      <div className={`${inner()} rounded-2xl p-6 md:p-8`}>
        <h3 className="font-heading text-lg text-accent-to">
          Design Engine Processing
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-body-dim md:text-base">
          {designProcess.engine}
        </p>
      </div>

      <div className={`${inner()} rounded-2xl p-6 md:p-8`}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:divide-x md:divide-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-to">
              Refinements
            </span>
            <p className="mt-3 text-sm leading-relaxed text-body-dim">
              {designProcess.refinements}
            </p>
          </div>
          <div className="md:pl-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-to">
              Quality Assurance
            </span>
            <p className="mt-3 text-sm leading-relaxed text-body-dim">
              {designProcess.qa}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Design tab 3: Key Features ──────────────────────────────────────────
   Same card grid as the automation Results tab's feature grid, just
   standalone since design case studies have no before/after/proof. */

function KeyFeaturesTab({ items }) {
  return (
    <Reveal
      stagger={0.08}
      y={24}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((feature) => (
        <div key={feature.title} className={`${inner()} rounded-2xl p-5`}>
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-from" />
            <div>
              <p className="font-heading text-sm text-white">
                {feature.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-body-dim">
                {feature.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </Reveal>
  );
}

/* ── Design tab 4: Use Cases ──────────────────────────────────────────────
   Same card grid as Key Features but numbered instead of check-marked, so
   the two tabs read as distinct even though the layout is shared. */

function UseCasesTab({ items }) {
  return (
    <Reveal
      stagger={0.08}
      y={24}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((useCase, i) => (
        <div key={useCase.title} className={`${inner()} rounded-2xl p-5`}>
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-orange-400/25 bg-orange-500/10 text-[10px] font-bold text-accent-to">
              {i + 1}
            </span>
            <div>
              <p className="font-heading text-sm text-white">
                {useCase.title}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-body-dim">
                {useCase.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </Reveal>
  );
}

/* ── Tab 2: Results ───────────────────────────────────────────────────── */

function ResultsTab({ results }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-left font-heading text-lg text-white">
          Key Features
        </h3>
        <Reveal
          stagger={0.08}
          y={24}
          className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {results.keyFeatures.map((feature) => (
            <div key={feature.title} className={`${inner()} rounded-2xl p-5`}>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-from" />
                <div>
                  <p className="font-heading text-sm text-white">
                    {feature.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-body-dim">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>

      <div className={`${inner()} rounded-2xl p-6 md:p-8`}>
        {/* The BEFORE/AFTER labels already head their own column — a third
            "Before vs After" title above both was saying the same thing
            twice. */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:divide-x md:divide-white/10">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-400">
              Before
            </span>
            <p className="mt-3 text-sm leading-relaxed text-body-dim">
              {results.before}
            </p>
          </div>
          <div className="md:pl-6">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent-to">
              After
            </span>
            <p className="mt-3 text-sm leading-relaxed text-body-dim">
              {results.after}
            </p>
          </div>
        </div>
      </div>

      <div className={`${inner()} rounded-2xl p-6 md:p-8`}>
        <h3 className="font-heading text-lg text-accent-to">What This Proves</h3>
        <p className="mt-3 text-sm leading-relaxed text-body-dim md:text-base">
          {results.proof}
        </p>
      </div>
    </div>
  );
}

/* ── Tab 3: Tech Stack ────────────────────────────────────────────────── */

function TechStackTab({ techStack }) {
  return (
    <div className="flex flex-col gap-8">
      {Object.entries(techStack).map(([group, tools]) => (
        <div key={group}>
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/40">
            {group}
          </span>
          <Reveal
            stagger={0.08}
            y={20}
            className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {tools.map(({ name, role, icon: Icon }) => (
              <div
                key={name}
                className={`${inner()} hover-lift rounded-2xl flex items-center gap-4 p-5`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/15 text-orange-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-heading text-sm text-white">
                    {name}
                  </p>
                  <p className="mt-0.5 text-sm text-body-dim">{role}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </div>
      ))}
    </div>
  );
}

/* ── Tab 4: Scalability & Flexibility ─────────────────────────────────── */

function ScalabilityTab({ items, heading = "Scalability & Flexibility" }) {
  return (
    <div className={`${inner()} rounded-2xl p-6 md:p-8`}>
      <h3 className="font-heading text-lg text-accent-to">{heading}</h3>
      <Reveal
        as="ul"
        stagger={0.05}
        y={14}
        className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-2"
      >
        {items.map((item) => (
          <li
            key={item.title}
            className="flex gap-3 text-sm leading-relaxed text-body-dim"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-from" />
            <span>
              <span className="font-heading text-sm text-white">
                {item.title}
              </span>
              {": "}
              {item.description}
            </span>
          </li>
        ))}
      </Reveal>
    </div>
  );
}

/* ── Tab 5: Screenshots ───────────────────────────────────────────────── */

// A rigid grid leaves dead space next to any tile shorter than its row's
// tallest neighbor — mixed portrait/landscape screenshots guarantee that.
// CSS multi-column layout is real masonry instead: each tile just flows into
// the next open spot in its column at its own natural (unmodified) aspect
// ratio, so tiles pack tightly with no forced row-matching gaps.
function ScreenshotsTab({ screenshots }) {
  const [active, setActive] = useState(null);

  return (
    <>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {screenshots.map((shot) => (
          <button
            key={shot.src}
            type="button"
            onClick={() => setActive(shot)}
            className={`${inner()} mb-4 block w-full break-inside-avoid overflow-hidden rounded-2xl transition duration-300 hover:border-orange-400/60`}
          >
            <img
              src={shot.src}
              alt={shot.alt}
              width={shot.width}
              height={shot.height}
              className="h-auto w-full"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      <ScreenshotLightbox shot={active} onClose={() => setActive(null)} />
    </>
  );
}

// Portal straight onto <body>: this tab sits inside several ancestor
// motion.div's that animate in with a filter/transform, and Framer leaves
// that transform on the element (even at rest) once the animation settles —
// any non-"none" transform on an ancestor turns a descendant's
// `position: fixed` into "fixed relative to that ancestor" instead of the
// real viewport. Escaping to <body> sidesteps that regardless of where this
// tab is scrolled to.
function ScreenshotLightbox({ shot, onClose }) {
  const panelRef = useRef(null);
  useOutsideClick(panelRef, onClose);

  useEffect(() => {
    if (!shot) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [shot, onClose]);

  return createPortal(
    <AnimatePresence>
      {shot && (
        <motion.div
          key="lightbox-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6 md:p-12"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-md transition duration-300 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
            Close
          </button>

          <motion.img
            ref={panelRef}
            key={shot.src}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            src={shot.src}
            alt={shot.alt}
            className="max-h-full max-w-full rounded-2xl object-contain shadow-[0_0_60px_rgba(0,0,0,0.6)]"
          />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/* ── Tab 6: Live Preview ──────────────────────────────────────────────── */

// `livePreview` on a caseStudy is either `true` (no deployment yet — shows
// the "coming soon" placeholder) or the deployed site's URL (renders the
// browser-chrome iframe embed below).
function LivePreviewComingSoon() {
  return (
    <div
      className={`${inner()} flex min-h-[420px] flex-col items-center justify-center gap-4 rounded-2xl p-10 text-center`}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/25 bg-orange-500/10 text-orange-400">
        <Monitor className="h-6 w-6" />
      </div>
      <div>
        <h3 className="font-heading text-lg text-white">
          Live Preview Coming Soon
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-body-dim">
          This project is still in development. Once it's deployed, an
          interactive preview of the live site will appear here.
        </p>
      </div>
    </div>
  );
}

// Browser-chrome window embedding the live deployed site. `key`-remounting
// the iframe (via reloadCount) is the reload mechanism — iframes have no
// imperative reload() API, and reassigning .src to itself is a no-op in most
// browsers for same-URL loads.
function LivePreviewEmbed({ url, siteName = "Live Site" }) {
  const [reloadCount, setReloadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const frameWrapRef = useRef(null);

  const displayUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const handleReload = () => {
    setLoaded(false);
    setReloadCount((count) => count + 1);
  };

  const handleFullscreen = () => {
    const el = frameWrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen?.();
    }
  };

  return (
    <div className={`${inner()} overflow-hidden rounded-2xl`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-accent-from/20 bg-white/[0.03] px-4 py-3 sm:px-5">
        {/* Traffic-light dots — purely decorative browser-chrome flourish */}
        <div className="flex items-center gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green-500/70" />
        </div>

        {/* URL bar */}
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-accent-from/25 bg-black/30 px-3.5 py-1.5">
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-status-green"
            aria-hidden="true"
          />
          <span className="truncate font-mono-tech text-xs text-body-dim sm:text-sm">
            {displayUrl}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReload}
            title="Reload preview"
            aria-label="Reload preview"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-from/25 text-body-dim transition-colors duration-200 hover:border-orange-400/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-to"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={handleFullscreen}
            title="View fullscreen"
            aria-label="View preview fullscreen"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-accent-from/25 text-body-dim transition-colors duration-200 hover:border-orange-400/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-to"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-accent-from to-accent-to px-3.5 py-1.5 text-xs font-bold uppercase tracking-wide text-black transition duration-300 hover:scale-105 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-to"
          >
            Visit Live Site
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Frame */}
      <div
        ref={frameWrapRef}
        className="relative aspect-[16/10] w-full bg-night sm:aspect-[16/9]"
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 text-sm text-body-dim">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Loading {siteName}…
          </div>
        )}
        <iframe
          key={reloadCount}
          src={url}
          title={`${siteName} — live preview`}
          onLoad={() => setLoaded(true)}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>

      {/* Some sites send X-Frame-Options / CSP headers that block embedding
          entirely — JS can't detect that reliably across origins, so this
          stays visible as a permanent escape hatch rather than trying to
          guess when the frame failed. */}
      <p className="border-t border-accent-from/20 bg-white/[0.02] px-4 py-2.5 text-center text-xs text-body-dim sm:px-5">
        Preview not loading? The site may block embedded previews for
        security —{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-accent-to underline underline-offset-2 hover:text-white"
        >
          open it directly
        </a>
        .
      </p>
    </div>
  );
}

function LivePreviewTab({ livePreview, siteName }) {
  if (typeof livePreview === "string") {
    return <LivePreviewEmbed url={livePreview} siteName={siteName} />;
  }
  return <LivePreviewComingSoon />;
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function CaseStudyPage() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);
  const [activeTab, setActiveTab] = useState(BASE_TABS[0]);

  useEffect(() => {
    document.title = project
      ? `${project.title} Case Study - Nexoryn`
      : "Case Study - Nexoryn";
    // Different projects can offer different trailing tabs (Screenshots vs
    // Live Preview) — reset to Overview on navigation so switching projects
    // never leaves activeTab pointing at a tab the new project doesn't have.
    setActiveTab(BASE_TABS[0]);
  }, [project]);

  if (!project) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-night px-6 text-center">
        <h1 className="font-heading text-3xl text-white">
          Project not found
        </h1>
        <Link
          to="/portfolio"
          className="rounded-full bg-gradient-to-r from-accent-from to-accent-to px-7 py-3 text-sm font-bold uppercase tracking-wide text-black transition duration-300 hover:scale-105 hover:brightness-110"
        >
          Back to Portfolio
        </Link>
      </div>
    );
  }

  const { caseStudy } = project;
  const tabs = tabsForCaseStudy(caseStudy);
  const isDesignCaseStudy = Boolean(caseStudy.designProcess);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-20 w-full px-4 pb-12 pt-32 md:px-10 lg:pt-40">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="mb-10"
          >
            <motion.span
              variants={blurFadeIn}
              className="text-xs font-bold uppercase tracking-[0.25em] text-accent-to"
            >
              Case Study
            </motion.span>
          </motion.div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[340px_1fr] lg:items-start lg:gap-10">
            <Sidebar project={project} />

            {/* Right side is one continuous outer box (mirroring the sidebar's),
                so the tab bar and every tab panel sit on solid charcoal with no
                gaps exposing the aurora backdrop between them — the individual
                cards then nest inside it as their own bordered panels. */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className={`${OUTER} min-w-0 p-6 md:p-8`}
            >
              <TabBar tabs={tabs} active={activeTab} onSelect={setActiveTab} />

              <div className="relative mt-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    {isDesignCaseStudy ? (
                      <>
                        {activeTab === "Overview" && (
                          <DesignOverviewTab overview={caseStudy.overview} />
                        )}
                        {activeTab === "Gallery" && (
                          <DesignGalleryTab gallery={caseStudy.gallery} />
                        )}
                        {activeTab === "Design Process" && (
                          <DesignProcessTab designProcess={caseStudy.designProcess} />
                        )}
                        {activeTab === "Key Features" && (
                          <KeyFeaturesTab items={caseStudy.keyFeatures} />
                        )}
                        {activeTab === "Use Cases" && (
                          <UseCasesTab items={caseStudy.useCases} />
                        )}
                        {activeTab === "Customization & Scalability" && (
                          <ScalabilityTab
                            items={caseStudy.scalability}
                            heading="Customization & Scalability"
                          />
                        )}
                      </>
                    ) : (
                      <>
                        {activeTab === "Overview" && (
                          <OverviewTab overview={caseStudy.overview} />
                        )}
                        {activeTab === "Results" && (
                          <ResultsTab results={caseStudy.results} />
                        )}
                        {activeTab === "Tech Stack" && (
                          <TechStackTab techStack={caseStudy.techStack} />
                        )}
                        {activeTab === "Scalability & Flexibility" && (
                          <ScalabilityTab items={caseStudy.scalability} />
                        )}
                        {activeTab === "Screenshots" && (
                          <ScreenshotsTab screenshots={caseStudy.screenshots} />
                        )}
                        {activeTab === "Gallery" && (
                          <ScreenshotsTab screenshots={caseStudy.gallery} />
                        )}
                        {activeTab === "Live Preview" && (
                          <LivePreviewTab
                            livePreview={caseStudy.livePreview}
                            siteName={project.title}
                          />
                        )}
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Soft blend into the CTA section below, no dead gap before it */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-b from-transparent to-black md:h-40"
        />
      </div>

      <CTASection compact />
      <Footer />
    </>
  );
}
