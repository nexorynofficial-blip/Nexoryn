import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "../../lib/easing";

/**
 * Wraps any element so it leans toward the cursor while hovered and springs
 * back on leave. Purely decorative — it exists to make the primary CTAs feel
 * physical, so it's disabled outright on touch and under reduced motion.
 *
 * The inner span moves further than the outer one: the label leading the box
 * by a few pixels is what sells it as a soft body rather than a sliding block.
 */
export default function MagneticButton({
  children,
  className = "",
  strength = 0.35,
  as: Tag = "div",
}) {
  const ref = useRef(null);
  const innerRef = useRef(null);

  useGSAP(
    (_context, contextSafe) => {
      const el = ref.current;
      if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined;

      const xTo = gsap.quickTo(el, "x", { duration: 0.55, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.55, ease: "power3.out" });
      const xToInner = gsap.quickTo(innerRef.current, "x", {
        duration: 0.7,
        ease: "power3.out",
      });
      const yToInner = gsap.quickTo(innerRef.current, "y", {
        duration: 0.7,
        ease: "power3.out",
      });

      const onMove = contextSafe((e) => {
        const rect = el.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        xTo(dx * strength);
        yTo(dy * strength);
        xToInner(dx * strength * 0.45);
        yToInner(dy * strength * 0.45);
      });

      const onLeave = contextSafe(() => {
        xTo(0);
        yTo(0);
        xToInner(0);
        yToInner(0);
      });

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);

      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={`inline-block will-change-transform ${className}`}>
      <span ref={innerRef} className="block will-change-transform">
        {children}
      </span>
    </Tag>
  );
}
