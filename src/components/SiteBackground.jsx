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
    >
      <ColorBends {...SITE_COLOR_BENDS} />
    </div>
  );
}
