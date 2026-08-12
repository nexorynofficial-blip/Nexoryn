/**
 * One source of truth for motion curves, so CSS transitions, Framer Motion
 * variants and GSAP tweens all share the same personality. These mirror the
 * `--ease-*` custom properties in index.css — change them in both places.
 */

// Framer Motion takes the four control points as an array.
export const easeOutExpo = [0.16, 1, 0.3, 1];
export const easeOutStrong = [0.23, 1, 0.32, 1];
export const easeInOutStrong = [0.77, 0, 0.175, 1];

// GSAP parses the same curve from a string.
export const GSAP_EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";
export const GSAP_EASE_OUT_STRONG = "cubic-bezier(0.23, 1, 0.32, 1)";
export const GSAP_EASE_IN_OUT_STRONG = "cubic-bezier(0.77, 0, 0.175, 1)";

/** True when the OS asks for reduced motion. Safe to call during render. */
export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** True on devices with a real hovering pointer (excludes touch). */
export function hasFinePointer() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );
}
