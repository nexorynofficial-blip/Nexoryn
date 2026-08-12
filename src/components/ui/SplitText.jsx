import { Children, Fragment, isValidElement, useMemo, useRef } from "react";
import { gsap, useGSAP } from "../../lib/gsap";
import { prefersReducedMotion } from "../../lib/easing";
import { useIntroDone } from "../../lib/IntroContext";

/**
 * Flattens a React subtree into a list of whitespace-delimited words, where
 * each word is a list of styled segments.
 *
 * Words are the animation unit, but a single word can span several elements —
 * `<span>clockwork</span>.` is one word made of two differently-styled pieces.
 * Splitting purely on element boundaries would push that full stop into a word
 * of its own and open a visible gap before it, so segments only start a new
 * word when actual whitespace separates them.
 *
 * Splitting the DOM after mount (the usual TreeWalker approach) is faster to
 * write but puts React and the animation in conflict — React still believes it
 * owns those text nodes, and any re-render throws "the node to be removed is
 * not a child". Doing the split in React instead keeps the tree React's.
 */
function tokenize(children) {
  const out = [];
  let current = null;

  const flush = () => {
    if (current?.segments.length) out.push({ type: "word", segments: current.segments });
    current = null;
  };

  const pushSegment = (text, className) => {
    if (!current) current = { segments: [] };
    current.segments.push({ text, className });
  };

  const walk = (node, inheritedClass) => {
    Children.forEach(node, (child) => {
      if (child === null || child === undefined || child === false) return;

      if (typeof child === "string" || typeof child === "number") {
        // Capturing group keeps the whitespace runs, which are the word
        // boundaries — without them we can't tell `a <b>c</b>` from `a<b>c</b>`.
        String(child)
          .split(/(\s+)/)
          .forEach((part) => {
            if (part === "") return;
            if (/^\s+$/.test(part)) flush();
            else pushSegment(part, inheritedClass);
          });
        return;
      }

      if (isValidElement(child)) {
        if (child.type === "br") {
          flush();
          out.push({ type: "break" });
          return;
        }
        // Merge this element's className into what its words inherit, so a
        // <span className="text-accent-from"> keeps colouring its own words.
        const merged = [inheritedClass, child.props?.className]
          .filter(Boolean)
          .join(" ");
        walk(child.props?.children, merged);
        return;
      }

      if (Array.isArray(child)) walk(child, inheritedClass);
    });
  };

  walk(children, "");
  flush();
  return out;
}

/**
 * Heading reveal: every word sits in its own clipping mask and rises out of it
 * on a stagger. The mask is what separates this from a plain fade — the words
 * read as being typeset onto the page.
 *
 * `as` picks the rendered tag so headings stay real headings for screen
 * readers; the original text is preserved verbatim in the markup.
 */
export default function SplitText({
  children,
  as: Tag = "h2",
  className = "",
  delay = 0,
  stagger = 0.045,
  duration = 0.95,
  start = "top 85%",
  animateOnMount = false,
}) {
  const ref = useRef(null);
  const introDone = useIntroDone();
  const tokens = useMemo(() => tokenize(children), [children]);

  useGSAP(
    () => {
      const words = gsap.utils.toArray(".split-word", ref.current);
      if (!words.length) return;

      // Above-the-fold headings sit inside a viewport-height trigger zone, so
      // without this gate they'd play out and finish behind the preloader
      // plate — the user would only ever see the finished state.
      if (!introDone) {
        gsap.set(words, { yPercent: 118, autoAlpha: 0 });
        return;
      }

      const scrollTrigger = animateOnMount
        ? undefined
        : { trigger: ref.current, start, once: true };

      if (prefersReducedMotion()) {
        // Movement is what causes trouble; a short fade still communicates
        // "this just arrived" without any travel.
        gsap.fromTo(
          words,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: 0.3, delay, scrollTrigger }
        );
        return;
      }

      gsap.fromTo(
        words,
        { yPercent: 118, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration,
          delay,
          stagger,
          ease: "expo.out",
          scrollTrigger,
        }
      );
    },
    { scope: ref, dependencies: [tokens, introDone], revertOnUpdate: true }
  );

  return (
    <Tag ref={ref} className={className}>
      {tokens.map((token, i) =>
        token.type === "break" ? (
          <br key={`br-${i}`} />
        ) : (
          <Fragment key={i}>
            <span className="split-line">
              <span className="split-word">
                {token.segments.map((segment, j) => (
                  <span key={j} className={segment.className}>
                    {segment.text}
                  </span>
                ))}
              </span>
            </span>
            {/* The space has to sit outside the mask: a trailing space inside
                an overflow:hidden inline-block is collapsed away, and the
                words would run together. */}{" "}
          </Fragment>
        )
      )}
    </Tag>
  );
}
