import { useRef } from "react";
import { useLocation } from "react-router-dom";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/easing";

/**
 * Route change transition.
 *
 * Deliberately an enter-only fade rather than a full exit/enter crossfade:
 * holding the old page on screen while the new one loads means every
 * navigation costs the user the exit duration before anything happens. This
 * way the new page is already committed and just resolves into place.
 */
export default function PageTransition({ children }) {
  const ref = useRef(null);
  const { pathname } = useLocation();

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.fromTo(ref.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 });
        return;
      }

      gsap.fromTo(
        ref.current,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.55, ease: "power3.out" }
      );
    },
    { dependencies: [pathname] }
  );

  return <div ref={ref}>{children}</div>;
}
