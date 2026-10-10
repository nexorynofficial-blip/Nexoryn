import { Link } from "react-router-dom";
import { m } from "framer-motion";
import { ArrowUpRight, CalendarDays, Users, Video } from "lucide-react";
import { useTilt3D } from "../hooks/useTilt3D";

const DETAILS = [
  { label: "15–30 Minutes", Icon: CalendarDays },
  { label: "Online Meeting", Icon: Video },
  { label: "Personalized Advice", Icon: Users },
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
        className="relative w-full max-w-[34rem] overflow-hidden rounded-3xl border border-white/15 bg-black/45 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.5)] backdrop-blur-md short:p-5"
      >
        {/* Faint top-edge sheen */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.02)_30%,transparent_55%)]"
        />

        <div className="relative">
          {/* Status pill */}
          <span className="inline-flex items-center gap-2.5 rounded-full border border-status-green/30 bg-emerald-950/70 px-3.5 py-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-green opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 animate-dot-glow rounded-full bg-status-green" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-status-green">
              FREE DISCOVERY CALL
            </span>
          </span>

          <h2 className="mt-4 text-[2rem] font-extrabold leading-[1.05] tracking-tight text-white short:mt-3 short:text-[1.75rem]">
            Let’s Discuss
            <span className="block bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">
              Your Next Project.
            </span>
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-body-light/80">
            Tell us about your goals, challenges, and ideas. We’ll discuss your
            requirements and identify the right solution for your business.
          </p>

          {/* Call details */}
          <ul className="mt-4 flex flex-wrap gap-2 short:mt-3">
            {DETAILS.map(({ label, Icon }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white"
              >
                <Icon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={1.75} />
                {label}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link
            to="/contact"
            className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-accent-from to-accent-to py-3 text-sm font-bold uppercase tracking-[0.1em] text-black transition duration-300 short:mt-4 hover:scale-[1.02] hover:brightness-110"
          >
            Schedule a Consultation
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </div>
      </m.div>
    </div>
  );
}
