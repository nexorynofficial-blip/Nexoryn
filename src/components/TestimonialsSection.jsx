import { TestimonialCard } from "./ui/TestimonialCard";

// More copies than the previous 4 so there's always a deep buffer of content
// flowing across wide viewports before the loop needs to repeat.
const SETS = 6;

export function TestimonialsSection({ testimonials, className = "" }) {
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
