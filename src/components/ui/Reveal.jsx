import { useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/easing";
import { useIntroDone } from "../../lib/IntroContext";
import { onceInView } from "../../lib/inView";

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
  as: Tag = "div",
  // For content already in the first viewport on load (page headers): a
  // scroll trigger there fires instantly anyway, and tying it to scroll means
  // it can't be sequenced against the preloader handoff.
  animateOnMount = false,
}) {
  const ref = useRef(null);
  const introDone = useIntroDone();

  // The "not yet revealed" state is plain CSS (.reveal-hold / .reveal-hold-
  // children in index.css), applied in the markup, so no GSAP work happens
  // until the element is actually about to be seen. See lib/inView.js for why.
  const holdClass = stagger ? "reveal-hold-children" : "reveal-hold";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      // Hold until the preloader hands off, otherwise anything in the first
      // viewport finishes while it's still covered. The CSS class keeps it
      // hidden in the meantime.
      if (!introDone) return;

      // On a re-run (deps changed after an earlier reveal) the tween was just
      // reverted; re-hold so the element doesn't flash visible for the frame
      // before the observer fires.
      el.classList.add(holdClass);

      const play = () => {
        const targets = stagger ? Array.from(el.children) : el;
        // Drop the CSS hold BEFORE building the tween so GSAP reads a clean
        // transform at init instead of adopting the held offset (see
        // SplitText.jsx). The fromTo applies its start values in this same task.
        el.classList.remove(holdClass);
        if (Array.isArray(targets) && !targets.length) return;

        if (prefersReducedMotion()) {
          gsap.fromTo(
            targets,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3, delay, stagger: stagger ? 0.04 : 0 }
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
      };

      if (animateOnMount) {
        play();
        return;
      }
      return onceInView(el, play);
    },
    { scope: ref, dependencies: [introDone, animateOnMount], revertOnUpdate: true }
  );

  return (
    <Tag
      ref={ref}
      className={`${holdClass} ${className}`}
      style={{ "--reveal-y": `${y}px` }}
    >
      {children}
    </Tag>
  );
}
