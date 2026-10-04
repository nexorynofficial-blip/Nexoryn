import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ScrollTrigger } from "../lib/gsap";

const SITE_URL = "https://www.nexoryn.tech";

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

    // Keep the canonical URL in step with the route (index.html carries the
    // home page's), so every page names itself rather than the home page.
    const link = document.querySelector('link[rel="canonical"]');
    if (link) {
      const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : "";
      link.setAttribute("href", `${SITE_URL}${path || "/"}`);
    }
  }, [pathname]);

  return null;
}
