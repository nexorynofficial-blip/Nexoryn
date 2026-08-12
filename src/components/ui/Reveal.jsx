import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/easing";
import { useIntroDone } from "../../lib/IntroContext";

/**
 * Generic scroll-in for anything that isn't text: cards, images, widgets.
 *
 * `stagger` animates the element's own children rather than the wrapper, which
 * is what you want for grids — one Reveal around the grid beats one per cell.
 */
export default function Reveal({
  children,
  className = "",
  y = 46,
  blur = 0,
  scale,
  delay = 0,
  duration = 1,
  stagger = 0,
  start = "top 85%",
  as: Tag = "div",
  // For content already in the first viewport on load (page headers): a
  // scroll trigger there fires instantly anyway, and tying it to scroll means
  // it can't be sequenced against the preloader handoff.
  animateOnMount = false,
}) {
  const ref = useRef(null);
  const introDone = useIntroDone();

  useGSAP(
    () => {
      const targets = stagger ? Array.from(ref.current.children) : ref.current;
      if (!targets || (Array.isArray(targets) && !targets.length)) return;

      // Hold the pre-animation state until the preloader hands off, otherwise
      // anything in the first viewport finishes while it's still covered.
      if (!introDone) {
        gsap.set(targets, { autoAlpha: 0, y });
        return;
      }

      const scrollTrigger = animateOnMount
        ? undefined
        : { trigger: ref.current, start, once: true };

      if (prefersReducedMotion()) {
        gsap.fromTo(
          targets,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: 0.3,
            delay,
            stagger: stagger ? 0.04 : 0,
            scrollTrigger,
          }
        );
        return;
      }

      const from = { autoAlpha: 0, y };
      const to = {
        autoAlpha: 1,
        y: 0,
        duration,
        delay,
        stagger,
        ease: "expo.out",
        scrollTrigger,
      };

      if (blur) {
        from.filter = `blur(${blur}px)`;
        to.filter = "blur(0px)";
      }
      if (scale !== undefined) {
        // Never from scale(0) — things that appear out of literal nothing read
        // as broken. Callers pass 0.94-ish.
        from.scale = scale;
        to.scale = 1;
      }

      gsap.fromTo(targets, from, to);
    },
    { scope: ref, dependencies: [introDone, animateOnMount], revertOnUpdate: true }
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
