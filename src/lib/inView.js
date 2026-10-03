// Runs a callback once, the first time an element comes into view.
//
// Why this exists instead of `scrollTrigger: { once: true }`: building a GSAP
// tween plus a ScrollTrigger for every Reveal/SplitText at mount means every
// one of them reads computed style and layout right after the previous one
// wrote to it. The browser has to recalculate the whole document each time —
// with ~25 reveals and ~100 split words that was ~2 s of main-thread work (8 s
// on a 4x-slowed phone profile) before the first paint. An IntersectionObserver
// costs nothing until the element is actually near the screen, and the tween is
// only built then, one at a time, spread across the scroll.
//
// "top 85%" in ScrollTrigger terms means the element's top edge crossing a line
// 85% of the way down the viewport; a bottom root-margin of -15% is the same
// line for an observer.
const ROOT_MARGIN = "0px 0px -15% 0px";

/**
 * @param {Element} el
 * @param {() => void} callback fired once, on first intersection
 * @returns {() => void} cleanup — disconnects the observer
 */
export function onceInView(el, callback) {
  if (!el) return () => {};
  if (typeof IntersectionObserver === "undefined") {
    callback();
    return () => {};
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        callback();
      }
    },
    { rootMargin: ROOT_MARGIN },
  );
  observer.observe(el);
  return () => observer.disconnect();
}
