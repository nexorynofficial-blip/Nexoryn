import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import { MapPin, Quote } from "lucide-react";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import { SERVICE_TABS } from "../components/ui/ServiceFilter";
import { REVIEWS } from "../data/reviews";
import { getReviews } from "../lib/content";
import { useContent } from "../hooks/useContent";

// Phone-width labels, so all three tabs fit on one line.
const SHORT_TABS = { "Web Development": "Web Dev", "Graphic Design": "Design" };


// Long reviews are clamped with a "Read more" toggle past this length.
const CLAMP_AT = 240;

const initials = (name = "") =>
  name
    .replace(/[^a-zA-Z ]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

function Reviewer({ review, large = false }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-from to-accent-to font-heading font-extrabold text-black ${
          large ? "h-12 w-12 text-base" : "h-10 w-10 text-sm"
        }`}
      >
        {initials(review.name)}
      </span>
      <div className="min-w-0">
        <p className={`truncate font-semibold text-white ${large ? "text-base" : "text-sm"}`}>{review.name}</p>
        {review.location && (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50">
            <MapPin aria-hidden="true" className="h-3 w-3 text-accent-from" />
            {review.location}
          </p>
        )}
      </div>
    </div>
  );
}

/** The spotlight quote for the selected service. */
function FeaturedReview({ review }) {
  return (
    <figure className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[linear-gradient(150deg,#3a1406_0%,#140803_35%,#070707_70%)] p-7 shadow-[0_30px_90px_-30px_rgba(255,122,26,0.35)] md:p-12">
      <Quote
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-6 h-40 w-40 rotate-180 text-accent-from/[0.08] md:h-56 md:w-56"
        strokeWidth={1.5}
      />
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-from">Featured Review</span>
      <blockquote className="relative mt-5 max-w-4xl text-lg font-light leading-relaxed text-white/90 md:text-2xl md:leading-relaxed">
        “{review.text}”
      </blockquote>
      <figcaption className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
        <Reviewer review={review} large />
        <span className="rounded-full border border-accent-from/40 bg-accent-from/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-to">
          {review.service}
        </span>
      </figcaption>
    </figure>
  );
}

function ReviewCard({ review }) {
  const [open, setOpen] = useState(false);
  const long = review.text.length > CLAMP_AT;
  return (
    <figure className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-[linear-gradient(160deg,rgba(107,37,8,0.35)_0%,rgba(20,8,3,0.88)_32%,#070707_70%)] p-6 transition duration-500 hover:-translate-y-1 hover:border-accent-from/35 hover:shadow-[0_24px_60px_-20px_rgba(255,122,26,0.3)] md:p-7">
      <Quote aria-hidden="true" className="h-7 w-7 rotate-180 text-accent-from" strokeWidth={2} />
      <blockquote className={`mt-4 text-[15px] leading-relaxed text-white/80 ${long && !open ? "line-clamp-6" : ""}`}>
        {review.text}
      </blockquote>
      {long && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="mt-3 cursor-pointer text-xs font-bold uppercase tracking-[0.12em] text-accent-from transition-colors hover:text-accent-to"
        >
          {open ? "Show less" : "Read more"}
        </button>
      )}
      <figcaption className="mt-6 border-t border-white/[0.08] pt-5">
        <Reviewer review={review} />
      </figcaption>
    </figure>
  );
}

function ServiceSwitcher({ active, onSelect, counts }) {
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
            className={`relative isolate flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors duration-300 sm:px-6 sm:text-xs ${
              on ? "text-black" : "text-white/70 hover:text-white"
            }`}
          >
            {on && (
              <m.span
                layoutId="rv-service-pill"
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
                className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-accent-from to-accent-to"
              />
            )}
            <span className="sm:hidden">{SHORT_TABS[tab] ?? tab}</span>
            <span className="hidden sm:inline">{tab}</span>
            <span className={`hidden rounded-full px-1.5 py-0.5 text-[10px] sm:inline ${on ? "bg-black/15" : "bg-white/10"}`}>
              {counts[tab] ?? 0}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function ReviewsPage() {
  const [activeService, setActiveService] = useState(SERVICE_TABS[0]);
  const reviews = useContent(getReviews, REVIEWS);

  useEffect(() => {
    document.title = "Reviews - Nexoryn";
  }, []);

  const counts = useMemo(
    () => Object.fromEntries(SERVICE_TABS.map((t) => [t, reviews.filter((r) => r.service === t).length])),
    [reviews],
  );
  const countries = useMemo(() => new Set(reviews.map((r) => r.location).filter(Boolean)).size, [reviews]);

  // The most detailed review leads; the rest fill the wall.
  const [featured, rest] = useMemo(() => {
    const list = reviews.filter((r) => r.service === activeService);
    if (!list.length) return [null, []];
    const top = list.reduce((a, b) => (b.text.length > a.text.length ? b : a));
    return [top, list.filter((r) => r !== top)];
  }, [reviews, activeService]);

  const stats = [
    [reviews.length, "Client Reviews"],
    [countries, "Countries"],
    [SERVICE_TABS.length, "Disciplines"],
  ];

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-20 w-full px-4 pb-12 pt-32 md:px-10 lg:px-[7.8vw] lg:pt-40">
          {/* Hero */}
          <div className="mx-auto max-w-4xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
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
              className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-body-dim"
            >
              Real feedback from the teams who no longer do the busywork, open
              any review to read the full story.
            </Reveal>
          </div>

          {/* Stats */}
          <Reveal
            stagger={0.1}
            y={20}
            delay={0.3}
            animateOnMount
            className="mx-auto mt-10 grid max-w-2xl grid-cols-3 divide-x divide-white/10 rounded-3xl border border-white/[0.08] bg-black/50 py-5 backdrop-blur-xl"
          >
            {stats.map(([value, label]) => (
              <div key={label} className="px-3 text-center">
                <p className="font-heading text-3xl font-extrabold text-white md:text-4xl">
                  {value}
                </p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50 md:text-[11px]">{label}</p>
              </div>
            ))}
          </Reveal>

          <Reveal y={20} delay={0.4} animateOnMount className="mt-12">
            <ServiceSwitcher active={activeService} onSelect={setActiveService} counts={counts} />
          </Reveal>

          <AnimatePresence mode="wait">
            <m.div
              key={activeService}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10"
            >
              {featured ? (
                <>
                  <FeaturedReview review={featured} />
                  {/* Masonry wall */}
                  <div className="mt-5 gap-5 md:columns-2 xl:columns-3">
                    {rest.map((review, i) => (
                      <m.div
                        key={review.id ?? review.name}
                        initial={{ opacity: 0, y: 28 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-60px" }}
                        transition={{ duration: 0.55, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                        className="mb-5 break-inside-avoid"
                      >
                        <ReviewCard review={review} />
                      </m.div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-16 text-center text-body-dim">No {activeService} reviews yet.</p>
              )}
            </m.div>
          </AnimatePresence>
        </div>

        {/* Soft blend into the CTA section below */}
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
