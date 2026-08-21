import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { GlowCard } from "./ui/GlowCard";
import { DefaultAvatar } from "./ui/DefaultAvatar";
import { ShowMoreButton } from "./ui/ShowMoreButton";
import { useOutsideClick } from "../hooks/useOutsideClick";
import { REVIEWS } from "../data/reviews";
import { truncate } from "../lib/truncate";

const INITIAL_COUNT = 9;
const BATCH = 9;

export function ReviewCardStack() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [active, setActive] = useState(null);
  const [anchorRect, setAnchorRect] = useState(null);
  const modalRef = useRef(null);
  const cardRefs = useRef({});

  const visible = REVIEWS.slice(0, visibleCount);
  const allShown = visibleCount >= REVIEWS.length;
  const revealMore = () =>
    setVisibleCount((c) => Math.min(c + BATCH, REVIEWS.length));

  useOutsideClick(modalRef, () => {
    setActive(null);
    setAnchorRect(null);
  });

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setActive(null);
        setAnchorRect(null);
      }
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

  const openReview = (review) => {
    const el = cardRefs.current[review.id];
    if (el) {
      const rect = el.getBoundingClientRect();
      // Anchor the expanded box to the card's own top-left corner — it should
      // grow outward from exactly where it already sits, never jump to a
      // recalculated position.
      const maxWidth = Math.min(512, window.innerWidth - rect.left - 16);
      const maxHeight = window.innerHeight - rect.top - 24;

      setAnchorRect({
        top: rect.top,
        left: rect.left,
        width: Math.max(rect.width, Math.min(320, maxWidth)),
        maxWidth,
        maxHeight,
      });
    }
    setActive(review);
  };

  const closeReview = () => {
    setActive(null);
    setAnchorRect(null);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((review) => {
          // While this review's modal is open, its grid card is hidden (kept
          // in the grid so nothing reflows, just invisible) so the box the
          // user sees expanding is unambiguous — there's exactly one on
          // screen at a time, at exactly one position.
          const isOpen = active?.id === review.id;
          return (
            <motion.div
              key={review.id}
              ref={(el) => {
                cardRefs.current[review.id] = el;
              }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: isOpen ? 0 : 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={isOpen ? { visibility: "hidden" } : undefined}
            >
              <GlowCard glowColor="orange" customSize className="w-full p-4!">
                <div className="flex flex-col gap-[10px]">
                  <div className="flex items-center gap-3">
                    <DefaultAvatar className="h-11 w-11" />
                    <div className="min-w-0">
                      <h3 className="truncate font-sans text-base font-semibold text-white">
                        {review.name}
                      </h3>
                    </div>
                  </div>

                  <p className="truncate text-sm text-white/50">{review.location}</p>

                  <p className="text-sm leading-relaxed text-white/60">
                    {truncate(review.text, 22)}
                  </p>

                  <button
                    type="button"
                    onClick={() => openReview(review)}
                    className="w-fit rounded-full bg-gradient-to-r from-orange-500 to-amber-400 px-5 py-2 text-sm font-bold text-white transition duration-300 hover:scale-105 hover:brightness-110"
                  >
                    Read Full Review
                  </button>
                </div>
              </GlowCard>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        {allShown ? (
          <p className="text-sm font-medium text-white/40">All reviews shown</p>
        ) : (
          <ShowMoreButton onClick={revealMore} />
        )}
      </div>

      {createPortal(
        <AnimatePresence>
          {active && anchorRect && (
            <>
              <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm"
                onClick={closeReview}
              />
              <motion.div
                ref={modalRef}
                // Rendered via a portal straight onto <body> on purpose: any
                // transformed ancestor (Framer Motion leaves a lingering
                // `transform: translateY(0px)` on the entrance wrapper even
                // at rest) creates a new CSS containing block, which silently
                // turns `position: fixed` into "fixed relative to that
                // ancestor" instead of the real viewport — and the resulting
                // offset grows with scroll depth. Escaping to <body> makes
                // this immune to that regardless of where this component is
                // mounted.
                initial={{ opacity: 0, scale: 0.55 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.55 }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="glass-panel fixed z-[100] overflow-y-auto rounded-3xl p-6 shadow-[0_0_30px_rgba(255,122,26,0.12)] md:p-8"
                style={{
                  top: anchorRect.top,
                  left: anchorRect.left,
                  width: anchorRect.width,
                  maxWidth: anchorRect.maxWidth,
                  maxHeight: anchorRect.maxHeight,
                  transformOrigin: "top left",
                }}
              >
                <button
                  type="button"
                  onClick={closeReview}
                  aria-label="Close review"
                  className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white transition duration-300 hover:bg-white/20"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-4">
                  <DefaultAvatar className="h-14 w-14" />
                  <div className="min-w-0">
                    <h3 className="font-heading text-2xl text-white">
                      {active.name}
                    </h3>
                    <p className="mt-0.5 truncate text-sm text-white/50">
                      {active.location}
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-base font-light leading-relaxed text-body-dim">
                  {active.text}
                </p>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
