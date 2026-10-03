import { useEffect, useState } from "react";

/**
 * True once the browser has gone idle (requestIdleCallback), or after
 * `timeout` ms regardless so slow devices never wait forever. Falls back to a
 * short timer where requestIdleCallback doesn't exist (Safari).
 *
 * Use it to keep non-essential work (heavy visuals, off-screen sections) out of
 * the startup path. When `mark` is given, a performance mark of that name is
 * recorded the moment the hook flips to true, so the timeline shows up in
 * DevTools and in the ?perf=1 console log (public/perf-monitor.js).
 *
 * @param {number} [timeout]
 * @param {string} [mark]
 */
export function useAfterIdle(timeout = 2500, mark) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const start = () => {
      if (mark && typeof performance !== "undefined" && performance.mark) performance.mark(mark);
      setReady(true);
    };
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 800);
    return () => clearTimeout(id);
  }, [timeout, mark]);

  return ready;
}

export default useAfterIdle;
