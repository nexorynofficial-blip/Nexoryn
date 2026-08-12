import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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
          <motion.div
            key={id}
            layout
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
