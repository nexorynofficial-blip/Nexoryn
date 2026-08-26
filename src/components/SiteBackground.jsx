import ColorBends from "./ui/ColorBends";

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
      <ColorBends {...SITE_COLOR_BENDS} />
    </div>
  );
}
