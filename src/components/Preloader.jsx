import { useEffect, useRef, useState } from "react";
import { useLenis } from "lenis/react";
import { gsap, useGSAP, ScrollTrigger } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/easing";

const WORD = "NEXORYN";

// Deliberately limited to squared, technical-looking glyphs — a scramble that
// cycles through lowercase or punctuation reads as "corrupted text" instead of
// a machine resolving a signal.
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&<>/\\";

const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

/** Resolves on window load, or after `capMs` — so a slow asset can't hang the page. */
function pageReady(capMs = 1600) {
  return new Promise((resolve) => {
    if (document.readyState === "complete") return resolve();
    const done = () => {
      window.removeEventListener("load", done);
      resolve();
    };
    window.addEventListener("load", done);
    setTimeout(done, capMs);
  });
}

/**
 * Full-screen intro: orange plate, NEXORYN decoding character by character in
 * black, then the camera "flies into" the word as a black iris floods out from
 * its centre and hands off to the (already black) page underneath.
 */
export default function Preloader({ onComplete }) {
  const rootRef = useRef(null);
  const irisRef = useRef(null);
  const wordRef = useRef(null);
  const counterRef = useRef(null);
  const [done, setDone] = useState(false);
  const lenis = useLenis();

  // Scroll stays locked for as long as the plate is up. Kept out of the GSAP
  // hook because `lenis` arrives a tick after mount, and making the animation
  // depend on it would restart the whole intro the moment it does.
  useEffect(() => {
    if (!lenis) return;
    if (done) lenis.start();
    else lenis.stop();
    return () => lenis.start();
  }, [lenis, done]);

  useGSAP(
    (_context, contextSafe) => {
      const reduced = prefersReducedMotion();

      // Belt-and-braces with lenis.stop() above: this also blocks native scroll
      // during the window before the Lenis instance exists.
      document.documentElement.classList.add("is-loading");

      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(failsafe);
        document.documentElement.classList.remove("is-loading");
        setDone(true);
        // Every trigger below the fold measured itself against a locked page;
        // re-measure now that the real scroll height is live.
        ScrollTrigger.refresh();
        onComplete?.();
      };

      // Absolute backstop. The plate covers the viewport and locks scrolling,
      // so anything that stops the timeline reaching its end — a killed
      // context, a promise that never settles — would leave the whole site
      // unusable behind it. Nothing here is worth that risk: if the intro
      // hasn't handed off by now, drop it and show the page.
      const failsafe = setTimeout(finish, 8000);

      if (reduced) {
        // Reduced motion still holds for assets, but gets no zoom and no
        // scramble — just a plain crossfade off.
        const play = contextSafe(() =>
          gsap.to(rootRef.current, {
            autoAlpha: 0,
            duration: 0.4,
            ease: "power2.out",
            onComplete: finish,
          })
        );
        pageReady(800).then(play);
        return () => clearTimeout(failsafe);
      }

      // toArray is a plain global helper — unlike tween selector strings it is
      // NOT scoped by useGSAP, so the root has to be passed explicitly.
      const letters = gsap.utils.toArray(".pl-letter", rootRef.current);
      const counter = { value: 0 };

      // ── Phase 1: the word resolves ─────────────────────────────────────
      const intro = gsap.timeline({ defaults: { ease: "power3.out" } });

      // Each letter slides up out of its own clipping mask while cycling
      // random glyphs, then locks to its real character.
      intro.from(".pl-letter-mask", {
        yPercent: 115,
        duration: 0.9,
        stagger: 0.055,
        ease: "expo.out",
      });

      letters.forEach((el, i) => {
        const final = el.dataset.char;
        const state = { t: 0 };
        intro.to(
          state,
          {
            t: 1,
            duration: 0.55,
            ease: "none",
            onUpdate: () => {
              // Lock in slightly before the tween ends so the last few frames
              // read as settled rather than still flickering.
              el.textContent = state.t < 0.72 ? randomGlyph() : final;
            },
            onComplete: () => {
              el.textContent = final;
            },
          },
          0.12 + i * 0.07
        );
      });

      // Rule + counter run underneath the word for the whole decode.
      intro
        .to(
          counter,
          {
            value: 100,
            duration: 1.5,
            ease: "power2.inOut",
            onUpdate: () => {
              if (counterRef.current) {
                counterRef.current.textContent = String(
                  Math.round(counter.value)
                ).padStart(3, "0");
              }
            },
          },
          0.1
        )
        .from(
          ".pl-rule",
          { scaleX: 0, duration: 1.5, ease: "power2.inOut" },
          0.1
        )
        .from(".pl-meta", { autoAlpha: 0, duration: 0.5 }, 0.5);

      // ── Phase 2: zoom into black ───────────────────────────────────────
      // Built only once BOTH the intro has finished and the page is ready, so
      // there is no pause to deadlock on if loading wins the race.
      const playOutro = contextSafe(() => {
        // The iris is 100px wide; to cover the screen its diameter has to beat
        // the viewport diagonal.
        const coverScale = () =>
          Math.hypot(window.innerWidth, window.innerHeight) / 100 + 0.4;

        gsap
          .timeline()
          .to(".pl-meta, .pl-rule-wrap", {
            autoAlpha: 0,
            duration: 0.3,
            ease: "power2.out",
          })
          // power2.in is right here despite the usual "never ease-in" rule:
          // this is a camera flying forward, not a UI element responding, and
          // acceleration is exactly what sells the move.
          .to(
            wordRef.current,
            { scale: 9, autoAlpha: 0, duration: 1, ease: "power2.in" },
            "<"
          )
          .fromTo(
            irisRef.current,
            { scale: 0, autoAlpha: 1 },
            { scale: coverScale, duration: 0.9, ease: "power2.inOut" },
            "<0.15"
          )
          // The page underneath is already black, so the plate just fades —
          // any wipe here would show a seam against itself.
          .to(rootRef.current, {
            autoAlpha: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: finish,
          });
      });

      const introDone = new Promise((resolve) =>
        intro.eventCallback("onComplete", resolve)
      );
      Promise.all([introDone, pageReady()]).then(playOutro);

      return () => clearTimeout(failsafe);
    },
    { scope: rootRef }
  );

  // Unmounting frees the compositor layers the iris and plate were holding.
  if (done) return null;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-accent-from"
      role="status"
      aria-label="Loading Nexoryn"
    >
      {/* CRT scanlines — the machine texture behind the wordmark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(0,0,0,0.9) 0px, rgba(0,0,0,0.9) 1px, transparent 1px, transparent 4px)",
        }}
      />
      <div
        aria-hidden="true"
        className="grain-overlay pointer-events-none absolute inset-0 opacity-[0.22] mix-blend-multiply"
      />

      {/* Black iris — the thing being zoomed into. Once it finishes it *is*
          the screen, which is what lets the plate fade without a seam. */}
      <div
        ref={irisRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black opacity-0"
      />

      <div className="relative z-10 flex flex-col items-center px-6">
        <div
          ref={wordRef}
          className="flex font-mono-tech text-[13vw] font-bold leading-none tracking-[0.06em] text-black sm:text-[11vw] lg:text-[8.5vw]"
        >
          {WORD.split("").map((char, i) => (
            // Two nested spans: the outer clips, the inner slides. One element
            // can't produce the "rising out of the baseline" mask on its own.
            <span
              key={`${char}-${i}`}
              className="block overflow-hidden pb-[0.08em]"
            >
              <span className="pl-letter-mask block">
                <span className="pl-letter block" data-char={char}>
                  {char}
                </span>
              </span>
            </span>
          ))}
        </div>

        <div className="pl-rule-wrap mt-8 w-[min(70vw,420px)]">
          <div className="pl-rule h-px w-full origin-left bg-black/40" />
        </div>

        <div className="pl-meta mt-5 flex w-[min(70vw,420px)] items-center justify-between font-mono-tech text-[11px] font-semibold uppercase tracking-[0.35em] text-black/70">
          <span>Initialising</span>
          <span ref={counterRef} className="tabular-nums">
            000
          </span>
        </div>
      </div>
    </div>
  );
}
