import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap, ScrollTrigger } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/easing";

/**
 * Binds Lenis to ScrollTrigger. Lives *inside* <ReactLenis> on purpose:
 * ReactLenis builds its instance in an effect and publishes it through state,
 * so it does not exist yet when the parent's own effect runs. Reading it from
 * context here means this effect re-runs the moment the instance appears.
 */
function ScrollTriggerBridge() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return undefined;

    // Without this ScrollTrigger keeps its own cached scroll position, which
    // drifts from Lenis's smoothed one and desyncs every pin and scrub.
    lenis.on("scroll", ScrollTrigger.update);
    ScrollTrigger.refresh();

    // Dev-only handle: Lenis owns scroll position, so `window.scrollTo` from
    // the console (or a browser-driving script) desyncs it. This gives a way
    // to drive the real thing.
    if (import.meta.env.DEV) window.__lenis = lenis;

    return () => {
      lenis.off("scroll", ScrollTrigger.update);
    };
  }, [lenis]);

  return null;
}

/**
 * App-wide smooth scroll.
 *
 * Lenis is the single source of truth for scroll position and GSAP's ticker is
 * the single RAF loop driving it — running Lenis's own `autoRaf` alongside
 * GSAP's ticker means two loops ticking out of phase, which shows up as jitter
 * on every scrubbed animation on the page.
 */
export default function SmoothScroll({ children }) {
  const lenisRef = useRef(null);

  useEffect(() => {
    // The ref is read fresh on every tick rather than captured once: the
    // instance lands a render *after* this effect runs, so a captured value
    // would be undefined forever and — with autoRaf off — nothing would ever
    // call raf(), leaving the page completely unable to scroll.
    const update = (time) => {
      // GSAP's ticker reports seconds; Lenis's raf() wants milliseconds.
      lenisRef.current?.lenis?.raf(time * 1000);
    };

    gsap.ticker.add(update);

    // GSAP's lag smoothing re-times itself around dropped frames, which fights
    // Lenis already smoothing the same input and reads as a double stutter.
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  const reduced = prefersReducedMotion();

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{
        autoRaf: false,
        // Lower lerp = longer glide. 0.085 is heavy enough to feel deliberate
        // without the "chasing the page" lag that creeps in below ~0.06.
        lerp: reduced ? 1 : 0.085,
        wheelMultiplier: 1,
        // syncTouch off: on iOS it fights the native rubber-band and costs more
        // than it buys, and touch scrolling is already smooth there.
        syncTouch: false,
        smoothWheel: !reduced,
        anchors: { offset: -80 },
      }}
    >
      <ScrollTriggerBridge />
      {children}
    </ReactLenis>
  );
}
