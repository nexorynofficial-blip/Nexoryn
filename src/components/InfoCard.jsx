import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { useTilt3D } from "../hooks/useTilt3D";

// `slug` must match a SERVICE_CATEGORIES id in data/services.js — the
// Services page reads this from the URL to scroll straight to that category.
const TAGS = [
  { label: "Automation", slug: "automation" },
  { label: "Web Development", slug: "web-development" },
  { label: "Graphic Design", slug: "graphic-design" },
];

export default function InfoCard({ className = "" }) {
  const tilt = useTilt3D();

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <m.div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={tilt.style}
        className="relative w-full max-w-md overflow-hidden rounded-3xl glass-panel p-5 short:p-4"
      >
        {/* Liquid-glass top-edge highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.04)_30%,transparent_55%)]"
        />

        <div className="relative">
          {/* Status pill */}
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-950/80 px-3 py-1">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-green opacity-60" />
              <span className="relative inline-flex h-2 w-2 animate-dot-glow rounded-full bg-status-green" />
            </span>
            <span className="text-[11px] font-medium tracking-wide text-status-green">
              SYSTEM OPTIMIZATION ACTIVE
            </span>
          </span>

          <p className="mt-3 text-sm font-light leading-relaxed text-body-light">
            We build high-performing websites, automate time-consuming tasks,
            and create smart systems tailored to your business. Our goal is
            simple: help you increase conversions, improve efficiency, and
            scale with confidence.
          </p>

          {/* Tag pills */}
          <div className="mt-4 flex flex-wrap gap-2 short:mt-3">
            {TAGS.map((tag) => (
              <Link
                key={tag.slug}
                to={`/services?category=${tag.slug}`}
                className="cursor-pointer rounded-full border border-white/40 bg-black/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white transition duration-300 hover:border-white/80 hover:bg-white/10"
              >
                {tag.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/portfolio"
            className="mt-4 block w-full cursor-pointer rounded-full bg-gradient-to-r from-accent-from to-accent-to py-2.5 text-center text-sm font-bold uppercase tracking-[0.1em] text-black transition duration-300 short:mt-3 hover:scale-[1.02] hover:brightness-110"
          >
            View Our Work
          </Link>
        </div>
      </m.div>
    </div>
  );
}
