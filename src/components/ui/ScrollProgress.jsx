import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";

/**
 * Hairline progress bar pinned under the navbar.
 *
 * Driven straight off the scroll position (a passive listener feeding a
 * GSAP quickSetter) rather than a ScrollTrigger, so it stays a single cheap
 * transform update per scroll event.
 */
export default function ScrollProgress() {
  const barRef = useRef(null);
  const setScale = useRef(null);

  useGSAP(() => {
    setScale.current = gsap.quickSetter(barRef.current, "scaleX");
    gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });

    const update = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      // limit is 0 on a page that does not scroll, so avoid dividing by it.
      const p = limit > 0 ? window.scrollY / limit : 0;
      if (setScale.current && Number.isFinite(p)) setScale.current(Math.min(1, Math.max(0, p)));
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

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
