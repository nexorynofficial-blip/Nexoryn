import { lazy, Suspense, useEffect, useState } from "react";

// The shader pulls in all of three.js (~half a megabyte). Loading it lazily
// and only once the browser is idle keeps it off the critical path: the page
// paints on the plain black base below, and the shader fades in afterwards.
const ColorBends = lazy(() => import("./ui/ColorBends"));

/** True once the main thread has gone idle (or after `timeout` ms regardless). */
function useAfterIdle(timeout = 2500) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const start = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 800);
    return () => clearTimeout(id);
  }, [timeout]);
  return ready;
}

/** Nexoryn brand palette — black and orange only. */
export const SITE_COLOR_BENDS = {
  colors: ["#000000", "#150c05", "#f96f16", "#ff7a1a"],
  rotation: -125,
  speed: 0.31,
  scale: 0.9,
  frequency: 1,
  warpStrength: 0.95,
  mouseInfluence: 0.95,
  noise: 0,
  parallax: 1.15,
  iterations: 1,
  intensity: 1,
  bandWidth: 6,
  transparent: true,
};

/**
 * Fixed site-wide ColorBends backdrop. Sits behind every route so the
 * orange/black shader reads as one continuous environment rather than
 * restarting per section.
 */
export function SiteBackground() {
  const ready = useAfterIdle();
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 bg-black"
      aria-hidden="true"
      // Forces this fixed layer onto its own GPU compositing layer instead of
      // being repainted in place. Mobile Safari/Chrome periodically decompose
      // position:fixed layers (especially ones holding a WebGL canvas) during
      // native scroll and repaint them in software for a frame or two — that
      // repaint briefly shows the plain bg-black underneath before the canvas
      // catches up, which is exactly what reads as "blinking black". Desktop
      // never hits that repaint path, so this is a no-op there visually.
      style={{
        transform: "translateZ(0)",
        WebkitTransform: "translateZ(0)",
        backfaceVisibility: "hidden",
        WebkitBackfaceVisibility: "hidden",
        willChange: "transform",
      }}
    >
      {ready && (
        <Suspense fallback={null}>
          <ColorBends {...SITE_COLOR_BENDS} />
        </Suspense>
      )}
    </div>
  );
}
