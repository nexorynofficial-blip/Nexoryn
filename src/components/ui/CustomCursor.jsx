import { useRef, useState } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { hasFinePointer, prefersReducedMotion } from "../../lib/easing";

// Anything the ring should widen over. Kept as a selector list so no existing
// markup has to be tagged — links and buttons already qualify.
const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor]';

/**
 * Two-part cursor: a dot that tracks the pointer exactly and a ring that
 * trails it. The lag between them is the whole effect — a ring locked to the
 * pointer just looks like a bigger cursor.
 *
 * Rendered only on devices with a real hovering pointer; on touch there is no
 * cursor to augment and the native one must not be hidden.
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [enabled] = useState(
    () => hasFinePointer() && !prefersReducedMotion()
  );

  useGSAP(
    (_context, contextSafe) => {
      if (!enabled) return undefined;

      const dot = dotRef.current;
      const ring = ringRef.current;

      // Centering lives in GSAP's own transform rather than a Tailwind
      // translate utility: GSAP owns the `transform` property outright once it
      // starts tweening x/y, and would otherwise wipe the -50% offset, leaving
      // both elements hanging below-right of the actual pointer.
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

      // quickTo reuses one tween per property instead of allocating a new one
      // on every pointermove — at 120Hz that difference is the whole budget.
      const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
      const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
      const ringX = gsap.quickTo(ring, "x", { duration: 0.5, ease: "power3.out" });
      const ringY = gsap.quickTo(ring, "y", { duration: 0.5, ease: "power3.out" });

      let shown = false;

      const onMove = contextSafe((e) => {
        if (!shown) {
          shown = true;
          gsap.to([dot, ring], { autoAlpha: 1, duration: 0.25 });
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
      });

      const onOver = contextSafe((e) => {
        if (!e.target.closest?.(INTERACTIVE)) return;
        gsap.to(ring, { scale: 1.9, borderColor: "rgba(255,122,26,0.9)", duration: 0.3, ease: "power3.out" });
        gsap.to(dot, { scale: 0.4, duration: 0.3, ease: "power3.out" });
      });

      const onOut = contextSafe((e) => {
        if (!e.target.closest?.(INTERACTIVE)) return;
        gsap.to(ring, { scale: 1, borderColor: "rgba(255,255,255,0.55)", duration: 0.3, ease: "power3.out" });
        gsap.to(dot, { scale: 1, duration: 0.3, ease: "power3.out" });
      });

      const onDown = contextSafe(() =>
        gsap.to(ring, { scale: 0.75, duration: 0.18, ease: "power3.out" })
      );
      const onUp = contextSafe(() =>
        gsap.to(ring, { scale: 1, duration: 0.25, ease: "power3.out" })
      );

      // Hide when the pointer leaves the window so the ring doesn't sit frozen
      // at the last known position.
      const onLeaveWindow = contextSafe(() => {
        shown = false;
        gsap.to([dot, ring], { autoAlpha: 0, duration: 0.2 });
      });

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerover", onOver, { passive: true });
      window.addEventListener("pointerout", onOut, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      document.addEventListener("pointerleave", onLeaveWindow);

      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerover", onOver);
        window.removeEventListener("pointerout", onOut);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointerup", onUp);
        document.removeEventListener("pointerleave", onLeaveWindow);
      };
    },
    { dependencies: [enabled] }
  );

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[150] h-1.5 w-1.5 rounded-full bg-accent-from opacity-0 mix-blend-screen"
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[150] h-9 w-9 rounded-full border opacity-0"
        style={{ borderColor: "rgba(255,255,255,0.55)" }}
      />
    </>
  );
}
