import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Code2,
  PenTool,
  Workflow,
  PhoneCall,
  Bot,
  Layout,
  AppWindow,
  ShoppingCart,
  Database,
  Gauge,
  Plug,
  Palette,
  Megaphone,
  LayoutTemplate,
  Package,
  Film,
  Check,
} from "lucide-react";
import { GooeyFilter } from "./ui/GooeyFilter";
import { blurFadeIn, viewportOnce } from "../lib/motion";

const ICONS = {
  Zap,
  Code2,
  PenTool,
  Workflow,
  PhoneCall,
  Bot,
  Layout,
  AppWindow,
  ShoppingCart,
  Database,
  Gauge,
  Plug,
  Palette,
  Megaphone,
  LayoutTemplate,
  Package,
  Film,
};

function SectionLabel({ children }) {
  return (
    <span className="font-heading text-xs font-bold uppercase tracking-[0.25em] text-accent-to">
      {children}
    </span>
  );
}

// Sliding pill behind the active tab. The filter is applied directly to the
// animating shape, so as it stretches between tab widths/positions its edges
// blur and re-threshold into a single soft blob instead of a hard cut.
function TabBar({ tabs, activeIndex, onSelect, gooeyId }) {
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  const measure = () => {
    const el = tabRefs.current[activeIndex];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  };

  useLayoutEffect(measure, [activeIndex, tabs.length]);
  useEffect(() => {
    window.addEventListener("resize", measure);
    // Tab labels use the custom font-heading webfont, loaded with
    // font-display: swap — the fallback font measures narrower, so the
    // indicator needs a re-measure once the real font has swapped in.
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <div className="no-scrollbar relative flex gap-2 overflow-x-auto">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-from to-accent-to"
        style={{ filter: `url(#${gooeyId})` }}
        animate={{ x: indicator.left, width: indicator.width }}
        transition={{ type: "spring", stiffness: 300, damping: 22, mass: 0.9 }}
      />
      {tabs.map((tab, i) => {
        const Icon = tab.iconComp;
        const isActive = i === activeIndex;
        return (
          <button
            key={tab.id}
            ref={(el) => (tabRefs.current[i] = el)}
            type="button"
            onClick={() => onSelect(i)}
            className="relative z-10 flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-300"
          >
            <Icon
              className={`h-4 w-4 transition-colors duration-300 ${
                isActive ? "text-black" : "text-neutral-400"
              }`}
            />
            <span
              className={`font-heading tracking-tight transition-colors duration-300 ${
                isActive ? "text-black" : "text-neutral-300"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Static left-hand panel: service heading, short summary, and the category
// photo/graphic — stays fixed while the tabbed detail area on the right
// switches between sub-services. The three pieces render as separate,
// clearly divided blocks rather than one continuous chunk of content.
function InfoPanel({ icon: OverviewIcon, heading, body }) {
  return (
    <div className="flex flex-col lg:w-64 lg:shrink-0 xl:w-72">
      {/* Block 1: service name */}
      <div>
        <h2 className="font-heading text-2xl tracking-tight text-white md:text-3xl">
          {heading}
        </h2>
      </div>

      {/* Block 2: short summary */}
      <div className="mt-5 border-t border-white/10 pt-5">
        <p className="text-sm font-light leading-relaxed text-body-dim">
          {body}
        </p>
      </div>

      {/* Block 3: category photo/graphic — expands to fill whatever
          vertical space the heading + summary blocks leave behind. */}
      <motion.div
        variants={blurFadeIn}
        initial="hidden"
        whileInView="show"
        viewport={viewportOnce}
        className="relative mt-5 min-h-[240px] w-full flex-1 overflow-hidden rounded-2xl glass-panel backdrop-blur-xl"
      >
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, rgba(255,122,26,0.18), transparent 65%)",
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border border-orange-400/20 bg-gradient-to-br from-orange-500/20 to-amber-400/10">
            <OverviewIcon className="h-9 w-9 text-accent-to" strokeWidth={1.5} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Single top-to-bottom, left-aligned flow: icon + name, then description,
// then How We Work / What You Get / Platforms — no left-column/right-column
// split.
function SubServicePanel({ sub }) {
  const Icon = ICONS[sub.icon];

  return (
    <div className="flex flex-col gap-7 text-left">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10">
            <Icon className="h-5 w-5 text-orange-400" />
          </div>
          <h4 className="font-heading text-xl tracking-tight text-white">
            {sub.name}
          </h4>
        </div>
        <p className="mt-3 text-sm font-light leading-relaxed text-body-dim">
          {sub.description}
        </p>
      </div>

      <div>
        <SectionLabel>How We Work</SectionLabel>
        <div className="mt-3 flex flex-col gap-2.5">
          {sub.howWeWork.map((step) => (
            <div
              key={step}
              className="border-l-2 border-orange-400/40 pl-3 text-sm font-light leading-relaxed text-body-dim"
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>What You Get</SectionLabel>
        <div className="mt-3 grid gap-x-8 gap-y-2.5 sm:grid-cols-2">
          {sub.whatYouGet.map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-body-dim">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-to" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Platforms We Work On</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {sub.platforms.map((platform) => (
            <span
              key={platform}
              className="rounded-full border border-orange-400/20 bg-orange-500/5 px-3 py-1 font-mono text-xs text-accent-to"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mobile-only replacement for the InfoPanel + TabBar + SubServicePanel trio:
// one consolidated summary instead of per-sub-service tabs, so there's no
// tab bar eating vertical space and no switching required to see everything
// this category covers. `mobileSummary` (data/services.js) names each of
// the desktop tabs' specialties directly in its description, so nothing
// covered by the tabs goes missing, it's just presented without tab nav.
function MobileServicePanel({ icon: OverviewIcon, heading, mobileSummary }) {
  return (
    <div className="flex flex-col gap-7 text-left">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10">
            <OverviewIcon className="h-5 w-5 text-orange-400" />
          </div>
          <h2 className="font-heading text-xl tracking-tight text-white">
            {heading}
          </h2>
        </div>
        <p className="mt-3 text-sm font-light leading-relaxed text-body-dim">
          {mobileSummary.description}
        </p>
      </div>

      <div>
        <SectionLabel>How We Work</SectionLabel>
        <div className="mt-3 flex flex-col gap-2.5">
          {mobileSummary.howWeWork.map((step) => (
            <div
              key={step}
              className="border-l-2 border-orange-400/40 pl-3 text-sm font-light leading-relaxed text-body-dim"
            >
              {step}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>What You Get</SectionLabel>
        <div className="mt-3 flex flex-col gap-2.5">
          {mobileSummary.whatYouGet.map((item) => (
            <div key={item} className="flex items-start gap-2 text-sm text-body-dim">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-to" />
              {item}
            </div>
          ))}
        </div>
      </div>

      <div>
        <SectionLabel>Platforms We Work On</SectionLabel>
        <div className="mt-3 flex flex-wrap gap-2">
          {mobileSummary.platforms.map((platform) => (
            <span
              key={platform}
              className="rounded-full border border-orange-400/20 bg-orange-500/5 px-3 py-1 font-mono text-xs text-accent-to"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ServiceBox({
  gooeyId,
  serviceName,
  overviewIcon,
  overview,
  subServices,
  mobileSummary,
}) {
  const tabs = subServices.map((s) => ({ id: s.id, label: s.name, iconComp: ICONS[s.icon] }));
  const [activeIndex, setActiveIndex] = useState(0);
  const activeId = tabs[activeIndex].id;

  return (
    <div className="rounded-3xl glass-panel p-6 backdrop-blur-xl md:p-8">
      <GooeyFilter id={gooeyId} strength={9} />

      {/* Mobile: one consolidated panel, no tabs */}
      <div className="md:hidden">
        <MobileServicePanel
          icon={ICONS[overviewIcon]}
          heading={serviceName}
          mobileSummary={mobileSummary}
        />
      </div>

      {/* Desktop: original InfoPanel + tabbed sub-services, unchanged */}
      <motion.div
        layout
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="hidden md:flex md:flex-col md:gap-8 lg:flex-row lg:items-stretch lg:gap-10"
      >
        <InfoPanel icon={ICONS[overviewIcon]} heading={serviceName} body={overview.body} />

        <div className="min-w-0 flex-1">
          <TabBar tabs={tabs} activeIndex={activeIndex} onSelect={setActiveIndex} gooeyId={gooeyId} />

          <motion.div layout transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="mt-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <SubServicePanel sub={subServices[activeIndex]} />
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
