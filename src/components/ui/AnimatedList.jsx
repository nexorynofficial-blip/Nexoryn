import { AnimatePresence, m } from "framer-motion";
import { useEffect, useState } from "react";

const SOFT_SPRING = { type: "spring", stiffness: 110, damping: 20, mass: 1 };

/**
 * Feed that cycles through `items` forever: a new item drops in at the top
 * every `delay` ms, older ones slide down and exit past `maxVisible`.
 */
export function AnimatedList({
  items,
  delay = 1800,
  maxVisible = 5,
  initialCount = 4,
}) {
  // AnimatePresence's initial={false} below means items present at mount
  // (i.e. up to initialCount) render already settled, no entrance animation —
  // only items added afterward via the interval animate in.
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    const interval = setInterval(() => setCount((c) => c + 1), delay);
    return () => clearInterval(interval);
  }, [delay]);

  const visible = [];
  for (let i = Math.max(0, count - maxVisible); i < count; i++) {
    visible.push({ id: i, item: items[i % items.length] });
  }
  visible.reverse(); // newest first (top of the feed)

  return (
    <div className="flex flex-col gap-3">
      {/* popLayout lifts exiting items out of the flow so the remaining rows
          shift smoothly while the old item fades out — no two-phase stutter */}
      <AnimatePresence initial={false} mode="popLayout">
        {visible.map(({ id, item }) => (
          <m.div
            key={id}
            layout
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.45, ease: "easeOut" } }}
            // Soft springs for the slide and the reflow of the rows below, a
            // slower fade in: each new row eases into place rather than snapping.
            transition={{
              layout: SOFT_SPRING,
              y: SOFT_SPRING,
              scale: SOFT_SPRING,
              opacity: { duration: 0.6, ease: "easeOut" },
            }}
          >
            {item}
          </m.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
