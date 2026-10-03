import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "../lib/gsap";

/**
 * Resets scroll on route change.
 *
 * `behavior: "instant"` skips any easing: animating a route change back to the
 * top makes the new page appear to fly past before it settles.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });

    // The new route's sections were measured against the previous page's
    // height; without this their triggers fire at the wrong offsets.
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
