import { TestimonialsSection } from "./TestimonialsSection";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import { REVIEWS } from "../data/reviews";
import { getReviews } from "../lib/content";
import { useContent } from "../hooks/useContent";

const toTestimonials = (reviews) =>
  reviews.map((review) => ({
    author: { name: review.name, location: review.location },
    text: review.text,
  }));

export default function Reviews() {
  const reviews = useContent(getReviews, REVIEWS);
  const testimonials = toTestimonials(reviews);

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
        <TestimonialsSection testimonials={testimonials} className="mt-12" />
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
