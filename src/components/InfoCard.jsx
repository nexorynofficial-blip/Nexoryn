import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useTilt3D } from "../hooks/useTilt3D";

const TAGS = ["Automation", "Web Development", "Graphic Design"];

export default function InfoCard({ className = "" }) {
  const tilt = useTilt3D();

  return (
    <div className={className} style={{ perspective: 1000 }}>
      <motion.div
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={tilt.style}
        className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-glass-border bg-black/30 p-6 backdrop-blur-[20px] backdrop-saturate-150 short:p-5 md:p-7 short:md:p-5"
      >
        {/* Liquid-glass top-edge highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0.04)_30%,transparent_55%)]"
        />

        <div className="relative">
          {/* Status pill */}
          <span className="inline-flex items-center gap-2.5 rounded-full bg-emerald-950/80 px-4 py-1.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-status-green opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 animate-dot-glow rounded-full bg-status-green" />
            </span>
            <span className="text-sm font-medium text-status-green">
              Lorem Ipsum is simply dummy
            </span>
          </span>

          <p className="mt-4 text-base font-light leading-relaxed text-body-light short:mt-3 md:text-lg short:md:text-base">
            Lorem Ipsum is simply dummy text of the printing and typesetting
            industry.
            <br />
            Lorem Ipsum has been the industry's standard dummy text ever since
            1966,
          </p>

          {/* Tag pills */}
          <div className="mt-5 flex flex-wrap gap-3 short:mt-4">
            {TAGS.map((tag) => (
              <Link
                key={tag}
                to="/services"
                className="cursor-pointer rounded-full border border-white/40 bg-black/30 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition duration-300 hover:border-white/80 hover:bg-white/10"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <Link
            to="/portfolio"
            className="mt-5 block w-full cursor-pointer rounded-full bg-gradient-to-r from-accent-from to-accent-to py-3.5 text-center text-base font-bold uppercase tracking-[0.1em] text-black transition duration-300 short:mt-4 short:py-3 hover:scale-[1.02] hover:brightness-110"
          >
            View Our Work
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
