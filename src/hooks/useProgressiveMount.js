import { useEffect, useState } from "react";

/**
 * Counts up from 0 to `steps`, one step per task, starting after the first
 * paint. Use it to mount a long page in slices: render the top immediately,
 * then `n >= 1`, `n >= 2`, ... for each section below.
 *
 * Why: everything that renders before the first paint delays the first paint.
 * On a slow phone the home page's sections below the screen were a large part
 * of that work, even though nobody can see them yet. Mounting them right after
 * the first paint, one section per task (so no single task blocks the page for
 * long), gets the first screen up sooner. They are still on screen within a
 * fraction of a second, and the intro plate is covering them anyway.
 *
 * Slices run top to bottom, so nothing already on screen moves.
 *
 * @param {number} steps
 * @param {() => void} [onDone] called once, after the last slice has mounted
 * @returns {number} how many slices have mounted so far
 */
export function useProgressiveMount(steps, onDone) {
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n >= steps) {
      onDone?.();
      return undefined;
    }
    let timer;
    // rAF first so the previous slice (and the first screen) is painted before
    // the next one starts; then a macrotask so each slice is its own task.
    const raf = requestAnimationFrame(() => {
      timer = setTimeout(() => setN((v) => v + 1), 0);
    });
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
    // onDone is deliberately not a dependency: it only matters at the end.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, steps]);

  return n;
}

export default useProgressiveMount;
