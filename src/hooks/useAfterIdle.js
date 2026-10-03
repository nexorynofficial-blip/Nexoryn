import { useEffect, useState } from "react";

// Below this width the site is treated as "mobile" (matches Tailwind's md).
const MOBILE_MAX_WIDTH = 768;

// Whether phones also wait for idle. Measured locally under 4x CPU slowdown and
// slow 4G (two alternating rounds, 3 runs each), deferring on mobile was
// slightly BETTER than mounting immediately: first paint ~3.5-3.6 s vs
// ~3.7-3.8 s, largest paint ~6.5-6.7 s vs ~6.7-6.8 s. Set to false to make
// mobile mount everything on the first render instead.
const DEFER_ON_MOBILE = true;

const isMobileViewport = () => typeof window !== "undefined" && window.innerWidth < MOBILE_MAX_WIDTH;

// Only chatty when the page was opened with ?perf=1 (see public/perf-monitor.js).
const perfLoggingOn = () => {
  // The URL check matters: the app can start before perf-monitor.js has had a
  // chance to store the session flag.
  if (/[?&]perf=1/.test(window.location.search)) return true;
  try {
    return sessionStorage.getItem("nx-perf") === "1";
  } catch {
    return false;
  }
};

/**
 * True once it is time to mount non-essential work (heavy visuals, off-screen
 * sections): when the browser goes idle (requestIdleCallback), or after
 * `timeout` ms regardless so slow devices never wait forever. Falls back to a
 * short timer where requestIdleCallback doesn't exist (Safari).
 *
 * Phones (< 768px) follow the same rule unless DEFER_ON_MOBILE is switched off,
 * in which case they are ready on the very first render.
 *
 * When `mark` is given, a performance mark of that name is recorded the moment
 * the hook becomes ready, so the timeline shows up in DevTools and in the
 * ?perf=1 console log (public/perf-monitor.js), which also states whether the
 * mobile or desktop path ran.
 *
 * @param {number} [timeout]
 * @param {string} [mark]
 */
export function useAfterIdle(timeout = 2500, mark) {
  const mobile = isMobileViewport();
  const immediate = mobile && !DEFER_ON_MOBILE;
  const [ready, setReady] = useState(immediate);

  useEffect(() => {
    const record = () => {
      if (mark && typeof performance !== "undefined" && performance.mark) performance.mark(mark);
      if (perfLoggingOn()) {
        console.log(
          `useAfterIdle(${mark ?? "?"}): ${mobile ? "MOBILE" : "DESKTOP"} (${immediate ? "immediate" : "idle defer"})`,
        );
      }
    };

    if (immediate) {
      record();
      return;
    }

    const start = () => {
      record();
      setReady(true);
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 800);
    return () => clearTimeout(id);
  }, [timeout, mark, mobile, immediate]);

  return ready;
}

export default useAfterIdle;
