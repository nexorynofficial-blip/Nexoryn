import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/Avatar";
import { GlowCard } from "./ui/GlowCard";
import { ShowMoreButton } from "./ui/ShowMoreButton";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { REVIEWS } from "../data/reviews";

// "Show more" pagination: start with 3 rows (9 cards) and reveal the next
// batch of 9 on each click until the whole dataset is shown.
const INITIAL_COUNT = 9;
const BATCH = 9;

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

function truncate(text, wordCount) {
  const words = text.split(" ");
  if (words.length <= wordCount) return text;
  return `${words.slice(0, wordCount).join(" ")}…`;
}

export function ReviewCardStack() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [active, setActive] = useState(null);
  const modalRef = useRef(null);

  const visible = REVIEWS.slice(0, visibleCount);
  const allShown = visibleCount >= REVIEWS.length;
  const revealMore = () =>
    setVisibleCount((c) => Math.min(c + BATCH, REVIEWS.length));

  useOutsideClick(modalRef, () => setActive(null));

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") setActive(null);
    }
    if (active) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [active]);

  return (
    <div className="w-full">
      {/* Three per row on desktop, collapsing to two then one on smaller
          breakpoints. Each card is a tight vertical stack — no forced
          equal-height. */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((review) => (
          <motion.div
            key={review.id}
            layout
            layoutId={`card-${review.id}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <GlowCard
              glowColor="orange"
              customSize
              className="w-full border-orange-500/20! bg-black! p-4! shadow-[0_0_20px_rgba(255,122,26,0.08)]!"
            >
              {/* Name/avatar, address, review snippet, and button stacked
                  with an exact 10px gap between each, so the card hugs its
                  content with no extra dead space. */}
              <div className="flex flex-col gap-[10px]">
                <div className="flex items-center gap-3">
                  <motion.div layoutId={`avatar-${review.id}`}>
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={review.avatar} alt={review.name} />
                      <AvatarFallback>{initials(review.name)}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="min-w-0">
                    <motion.h3
                      layoutId={`title-${review.id}`}
                      className="truncate font-sans text-base font-semibold text-white"
                    >
                      {review.name}
                    </motion.h3>
                  </div>
                </div>

                <p className="truncate text-sm text-white/50">{review.location}</p>

                <motion.p
                  layoutId={`text-${review.id}`}
                  className="text-sm leading-relaxed text-white/60"
                >
                  {truncate(review.text, 22)}
                </motion.p>

                <button
                  type="button"
                  onClick={() => setActive(review)}
                  className="w-fit rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-2 text-sm font-bold text-white transition duration-300 hover:scale-105 hover:brightness-110"
                >
                  Read Full Review
                </button>
              </div>
            </GlowCard>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        {allShown ? (
          <p className="text-sm font-medium text-white/40">All reviews shown</p>
        ) : (
          <ShowMoreButton onClick={revealMore} />
        )}
      </div>

      <AnimatePresence>
        {active && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div
                ref={modalRef}
                layoutId={`card-${active.id}`}
                className="relative w-full max-w-lg rounded-3xl border border-orange-500/20 bg-black/50 p-8 shadow-[0_0_30px_rgba(255,122,26,0.12)] backdrop-blur-xl"
              >
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="Close review"
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition duration-300 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-4">
                  <motion.div layoutId={`avatar-${active.id}`}>
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={active.avatar} alt={active.name} />
                      <AvatarFallback>{initials(active.name)}</AvatarFallback>
                    </Avatar>
                  </motion.div>
                  <div className="min-w-0">
                    <motion.h3
                      layoutId={`title-${active.id}`}
                      className="font-heading text-2xl text-white"
                    >
                      {active.name}
                    </motion.h3>
                    <p className="mt-0.5 truncate text-sm text-white/50">
                      {active.role}
                    </p>
                  </div>
                </div>

                <motion.p
                  layoutId={`text-${active.id}`}
                  className="mt-5 text-base font-light leading-relaxed text-body-dim"
                >
                  {active.text}
                </motion.p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
