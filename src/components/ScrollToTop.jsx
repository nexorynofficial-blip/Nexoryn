import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLenis } from "lenis/react";
import { ScrollTrigger } from "../lib/gsap";

/**
 * Resets scroll on route change. Lenis keeps its own smoothed scroll position,
 * so `window.scrollTo` alone leaves it convinced the page is still where it
 * was — the next wheel event then snaps back down the page.
 *
 * `immediate` skips the easing: animating a route change back to the top makes
 * the new page appear to fly past before it settles.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);

    // The new route's sections were measured against the previous page's
    // height; without this their triggers fire at the wrong offsets.
    ScrollTrigger.refresh();
  }, [pathname, lenis]);

  return null;
}
