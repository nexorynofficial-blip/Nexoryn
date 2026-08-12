import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/easing";

/**
 * A single centered heading that fades in, holds, then fades back out as the
 * user scrolls through it — nothing else in view during this segment. The
 * wrapper is taller than the viewport and the heading sticks centered inside
 * it, so the fade is driven purely by scroll position (scrub), not a
 * one-shot "reveal and stay" trigger — scrolling back up reverses it exactly.
 */
export default function ScrollFadeHeading({ children }) {
  const wrapRef = useRef(null);
  const headingRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set(headingRef.current, { autoAlpha: 1 });
        return;
      }

      gsap.set(headingRef.current, { autoAlpha: 0, y: 24 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: wrapRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        })
        // Fade in over the first third, hold, fade out over the last third —
        // the hold in the middle is what makes it read as "arrived" rather
        // than a continuous crossfade with no resting point.
        .to(headingRef.current, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power1.out" }, 0)
        .to(headingRef.current, { autoAlpha: 1, y: 0, duration: 0.36 }, 0.32)
        .to(headingRef.current, { autoAlpha: 0, y: -24, duration: 0.32, ease: "power1.in" }, 0.68);
    },
    { scope: wrapRef, revertOnUpdate: true }
  );

  return (
    // Was 170vh, then 120vh, then 90vh — still too much scroll between the
    // Services section ending and the heading fully appearing, and between
    // the heading and the first card. 60vh keeps the same proportional
    // in/hold/out split but shrinks every phase further.
    <div ref={wrapRef} className="relative h-[60vh]">
      <div className="sticky top-0 flex h-screen items-center justify-center px-4 md:px-10">
        <h2
          ref={headingRef}
          className="max-w-4xl text-center font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          {children}
        </h2>
      </div>
    </div>
  );
}
