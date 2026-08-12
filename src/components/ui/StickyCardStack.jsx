import { useRef } from "react";
import { motion, useScroll, useTransform, useMotionValue } from "framer-motion";
import { prefersReducedMotion } from "../../lib/easing";

const FAN_STEP = 40;

/**
 * One card in the fanned stack. Deliberately no wrapper height of its own —
 * its sticky box is exactly as tall as the card, so at any given scroll
 * position several cards are stuck on screen simultaneously, offset by the
 * `top` ladder below and receding via `scale`. That simultaneity (not a
 * one-in-one-out handoff) is what makes it read as a fanned deck rather than
 * a slideshow, matching the reference this was built from.
 *
 * Base stick offset centers each card in the viewport; per-index steps fan
 * the stack and margin-bottom on the wrapper adds scroll gap between cards.
 */
function StickyCard({ project, i, total, progress, isLast }) {
  const targetScale = Math.max(0.5, 1 - (total - i - 1) * 0.1);
  const scale = useTransform(progress, [i / total, 1], [1, targetScale]);
  const stickTop = `calc(50vh - clamp(110px, 28vw, 250px) + ${i * FAN_STEP}px)`;

  return (
    <div
      className={`sticky flex justify-center px-4 md:px-10 ${isLast ? "" : "mb-12 md:mb-16"}`}
      style={{ top: stickTop }}
    >
      <motion.div
        style={{ scale }}
        className="relative h-[220px] w-[85vw] origin-top overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/50 sm:h-[300px] sm:w-[90vw] md:h-[380px] lg:h-[500px] lg:w-[min(1000px,88vw)]"
      >
        <img
          src={project.photo.url}
          alt={project.photo.text}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"
        />

        <div className="absolute bottom-4 right-4 max-w-[70%] rounded-xl border border-white/10 bg-black/45 px-4 py-3 text-right backdrop-blur-sm sm:bottom-6 sm:right-6">
          <p className="font-heading text-sm text-white sm:text-base">
            {project.common}
          </p>
          <p className="mt-1 text-xs font-light text-body-dim">
            {project.binomial}
          </p>
        </div>

        <span className="absolute left-4 top-4 font-mono-tech text-xs text-white/60 sm:left-6 sm:top-6">
          {String(i + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </motion.div>
    </div>
  );
}

/**
 * Fanned sticky-card stack: one continuous scroll progress (0→1 across this
 * whole block) drives every card's scale at once — each card's own range
 * starts later than the last (`i/total` → 1) so they shrink and recede in
 * sequence rather than each getting an isolated handoff window.
 */
export default function StickyCardStack({ projects }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const staticProgress = useMotionValue(0);

  const reduced = prefersReducedMotion();

  return (
    <div
      ref={containerRef}
      className="relative flex w-full flex-col items-center justify-center pt-12 md:pt-16"
    >
      {projects.map((project, i) => (
        <StickyCard
          key={project.common}
          project={project}
          i={i}
          total={projects.length}
          isLast={i === projects.length - 1}
          progress={reduced ? staticProgress : scrollYProgress}
        />
      ))}
    </div>
  );
}
