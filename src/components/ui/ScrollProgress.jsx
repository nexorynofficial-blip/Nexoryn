import { useRef } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP } from "../../lib/gsap";

/**
 * Hairline progress bar pinned under the navbar.
 *
 * Driven off Lenis's own `progress` rather than a ScrollTrigger, so it tracks
 * the smoothed position the user is actually looking at instead of the raw
 * scroll offset — at this thickness the two visibly disagree during a fling.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);
  const setScale = useRef(null);

  useGSAP(() => {
    setScale.current = gsap.quickSetter(barRef.current, "scaleX");
    gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });
  }, []);

  useLenis((lenis) => {
    // progress is NaN before the first resize settles (limit is still 0).
    const p = lenis.progress;
    if (setScale.current && Number.isFinite(p)) setScale.current(p);
  });

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px"
    >
      <div
        ref={barRef}
        className="h-full w-full bg-gradient-to-r from-accent-from via-accent-to to-accent-from"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
