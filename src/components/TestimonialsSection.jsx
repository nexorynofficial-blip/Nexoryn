import { TestimonialCard } from "./ui/TestimonialCard";

// The loop translates by exactly one copy's width, so the track only needs to
// be (viewport + one copy) wide to repeat seamlessly. It used to render a fixed
// 6 copies — 120 cards, each with a 28px backdrop blur — which was ~60% of the
// whole page's DOM. Size the copy count from the review count instead: a
// card (+ gap) is at least 256px wide, and the widest viewport we plan for is
// 2560px, so copies = 1 + 2560 / copyWidth, clamped to 2..6.
const MIN_CARD_PX = 256;
const MAX_VIEWPORT_PX = 2560;
const setsFor = (count) =>
  Math.min(6, Math.max(2, Math.ceil(1 + MAX_VIEWPORT_PX / (Math.max(count, 1) * MIN_CARD_PX))));

export function TestimonialsSection({ testimonials, className = "" }) {
  const SETS = setsFor(testimonials.length);
  return (
    <div
      className={`relative flex w-full flex-col items-center justify-center overflow-hidden ${className}`}
    >
      <div className="flex flex-row overflow-hidden p-2 [--duration:40s] [--gap:1rem] [gap:var(--gap)]">
        <div
          style={{ "--sets": SETS }}
          className="animate-marquee flex shrink-0 flex-row [gap:var(--gap)]"
        >
          {[...Array(SETS)].map((_, setIndex) =>
            testimonials.map((testimonial, i) => (
              <TestimonialCard key={`${setIndex}-${i}`} {...testimonial} />
            ))
          )}
        </div>
      </div>

      {/* fade edges into the shared black backdrop (kept narrow — at full
          page width w-1/3 would black out entire cards) */}
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-32 bg-gradient-to-r from-black sm:block lg:w-56" />
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-32 bg-gradient-to-l from-black sm:block lg:w-56" />
    </div>
  );
}
