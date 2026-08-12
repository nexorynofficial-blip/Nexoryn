import { useEffect, useRef, useState } from "react";

/**
 * Animates from `start` to `target` (ease-out cubic) while `trigger` is true;
 * snaps back to `start` when `trigger` is false.
 */
export function useCountUp(target, start, durationMs = 1200, trigger = true) {
  const [value, setValue] = useState(start);
  const raf = useRef(null);

  useEffect(() => {
    if (!trigger) {
      setValue(start);
      return;
    }
    const startTime = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startTime) / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [trigger, target, start, durationMs]);

  return value;
}
