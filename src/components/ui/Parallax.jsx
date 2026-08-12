import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/easing";

/**
 * Scrubbed parallax. `speed` is how far the element drifts across its own
 * scroll pass, as a fraction of the viewport height — positive lags behind the
 * scroll, negative runs ahead of it.
 *
 * Kept small on purpose (0.05–0.15): parallax stops reading as depth and
 * starts reading as a bug once elements visibly detach from their section.
 */
export default function Parallax({
  children,
  className = "",
  speed = 0.12,
  as: Tag = "div",
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.fromTo(
        ref.current,
        { yPercent: -speed * 50 },
        {
          yPercent: speed * 50,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            // A little scrub lag stops the element snapping 1:1 to the wheel,
            // which is what makes cheap parallax feel jittery.
            scrub: 0.6,
          },
        }
      );
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
