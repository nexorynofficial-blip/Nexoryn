import { TestimonialsSection } from "./TestimonialsSection";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import { REVIEWS } from "../data/reviews";
import { getReviews } from "../lib/content";
import { useContent } from "../hooks/useContent";
import { useAfterIdle } from "../hooks/useAfterIdle";

const toTestimonials = (reviews) =>
  reviews.map((review) => ({
    author: { name: review.name, location: review.location },
    text: review.text,
  }));

export default function Reviews() {
  const reviews = useContent(getReviews, REVIEWS);
  const testimonials = toTestimonials(reviews);
  // The marquee is ~40 glass cards, far below the fold. Mount it once the
  // browser is idle so it isn't part of the first layout; the placeholder
  // matches the strip's height (card + 8px padding each side) so nothing shifts.
  const stripReady = useAfterIdle(3000, "reviews-ready");

  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 pb-12 pt-24 lg:pb-16 lg:pt-32"
    >
      <div className="relative z-20 flex w-full flex-col items-center px-4 text-center md:px-10">
        <SplitText className="mt-6 max-w-2xl font-heading text-4xl leading-tight tracking-tight text-white md:text-5xl">
          Loved by <span className="text-accent-from">businesses</span> we've
          automated.
        </SplitText>
        <Reveal
          as="p"
          y={24}
          delay={0.12}
          className="mt-5 max-w-xl text-lg font-light leading-relaxed text-body-dim"
        >
          Real feedback from teams who no longer do the busywork.
        </Reveal>
      </div>

      <Reveal y={40} duration={1.1} className="relative z-20">
        {stripReady ? (
          <TestimonialsSection testimonials={testimonials} className="mt-12" />
        ) : (
          <div aria-hidden="true" className="mt-12 h-[186px] sm:h-[236px]" />
        )}
      </Reveal>

      {/* Soft blend into the CTA section below, mirroring the Hero's own
          bottom-edge fade into the section beneath it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-black md:h-40"
      />
    </section>
  );
}
