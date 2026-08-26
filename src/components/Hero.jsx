import { useRef } from "react";
import heroBg from "../assets/hero-bg.png";
import nexorynLogo from "../assets/nexoryn-logo.png";
import StatsColumn from "./StatsColumn";
import InfoCard from "./InfoCard";
import SplitText from "./ui/SplitText";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/easing";
import { useIntroDone } from "../lib/IntroContext";

export default function Hero() {
  const sectionRef = useRef(null);
  const introDone = useIntroDone();

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      // ── Entrance, held until the preloader lifts ───────────────────────
      if (!introDone) {
        gsap.set([".hero-sub", ".hero-body", ".hero-stats", ".hero-card", ".hero-mark"], {
          autoAlpha: 0,
          y: 24,
        });
      } else {
        gsap
          .timeline({ defaults: { ease: "expo.out", duration: 1.1 } })
          .to(".hero-sub", { autoAlpha: 1, y: 0 }, 0.35)
          .to(".hero-body", { autoAlpha: 1, y: 0 }, 0.5)
          .to(".hero-stats", { autoAlpha: 1, y: 0 }, 0.6)
          .to(".hero-card", { autoAlpha: 1, y: 0 }, 0.72)
          .to(".hero-mark", { autoAlpha: 1, y: 0 }, 0.8);
      }

      if (reduced) return;

      // ── Scroll-out ─────────────────────────────────────────────────────
      // The video drifts down slower than the page and the copy lifts away
      // faster, so the hero separates into layers as it leaves rather than
      // sliding off as one flat sheet.
      gsap.to(".hero-media", {
        yPercent: 18,
        scale: 1.12,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      gsap.to(".hero-content", {
        yPercent: -12,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          // Fully faded by 70% of the way out, so the copy is gone before it
          // would collide with the section beneath.
          end: "70% top",
          scrub: 0.5,
        },
      });
    },
    { scope: sectionRef, dependencies: [introDone], revertOnUpdate: true }
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-0 overflow-hidden bg-black/50 md:min-h-screen md:bg-night"
    >
      {/* Background video — same framing/crop the static photo used, now looping.
          Oversized so the parallax drift never exposes an edge. Hidden below
          md: the shared ColorBends shader (SiteBackground, fixed behind every
          route) shows through instead, since the section itself is
          transparent on mobile rather than painted over with bg-night. */}
      <div className="hero-media absolute inset-0 hidden h-[115%] w-full will-change-transform md:block">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster={heroBg}
          aria-label="Man wearing futuristic glowing AR glasses"
          className="absolute inset-0 h-full w-full object-cover object-[center_top]"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Near-zero contrast overlay: photo stays vivid, cards carry their own
          contrast. Desktop-only — there's no video on mobile to protect
          contrast for, and stacking these on top of the section's own
          bg-black/50 made mobile Hero read noticeably darker than every
          other section's identical bg-black/50 scrim. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 hidden bg-gradient-to-r from-black/20 via-black/5 to-transparent md:block"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 hidden h-1/3 bg-gradient-to-b from-black/15 to-transparent md:block"
      />
      {/* Soft blend into the black of the sections below — only needed to
          smooth the video's bright bottom edge into solid black. There's no
          video on mobile (just the shared shader, already dim/section-toned),
          and with min-h-screen dropped there too the section is short enough
          that a 380px fade would dominate it, so this is desktop-only now. A
          plain 2-stop gradient still reads as a hard seam against the bright
          video — the eye is far more sensitive to gradient curvature than
          opacity math suggests, and a short 2-stop fade looks "done" well
          before it's visually flat. Five stops approximate an eased curve,
          the zone is tall enough to fully resolve even after the video's
          scroll-driven scale/translate shifts brighter content into it, and
          a faint grain layer breaks up 8-bit banding across the near-black
          stops. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[380px] md:block md:h-[520px]"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.22) 22%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.78) 68%, rgba(0,0,0,0.95) 86%, rgba(0,0,0,1) 100%)",
        }}
      />
      <div
        aria-hidden="true"
        className="grain-overlay pointer-events-none absolute inset-x-0 bottom-0 hidden h-[380px] opacity-[0.04] md:block md:h-[520px]"
      />

      {/* Content — min-h-0 (not min-h-screen) below md: no video/InfoCard/
          stats there anymore, so forcing full viewport height just left a
          large dead gap under the copy. pt-32 clears the fixed navbar with
          real breathing room instead of pt-24's tighter desktop spacing. */}
      <div className="hero-content relative z-10 flex min-h-0 w-full flex-col px-4 pb-8 pt-32 text-center short:pb-6 short:pt-20 md:min-h-screen md:px-10 md:pt-24 lg:pt-28 lg:text-left short:lg:pt-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: headline block. No items-center on the row above: with
              flex-direction:column, align-items:center switches this child
              to shrink-to-fit sizing, and "NEXORYN" is one unbreakable word —
              its min-content width could exceed the viewport and get clipped
              by the section's overflow-hidden. Letting the row stretch (the
              flex default) keeps this a full-width block that text-center +
              mx-auto center properly instead. */}
          <div className="mx-auto w-full max-w-3xl lg:mx-0 lg:w-auto">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.1}
              stagger={0.08}
              duration={1.3}
              className="font-heading-hero text-5xl leading-none tracking-tight text-accent-from sm:text-7xl md:text-8xl md:text-white xl:text-[clamp(6rem,13vh,9rem)]"
            >
              NEXORYN
            </SplitText>
            <p className="hero-sub mt-3 text-xl font-light text-body-light sm:text-2xl md:text-3xl">
              Where Automation Meets Ambition.
            </p>
            <p className="hero-body mx-auto mt-10 max-w-md text-lg font-light leading-relaxed text-body-dim short:mt-5 lg:mx-0 lg:mt-[6vh] short:lg:mt-5">
              At Nexoryn, we build websites that convert and automation
              systems that eliminate the repetitive work slowing businesses
              down. We don't rely on templates or one-size-fits-all
              solutions.
            </p>
          </div>

          {/* Right: stats — dropped on mobile per the "projects delivered /
              client retention / countries served" card being cut there */}
          <StatsColumn className="hero-stats hidden lg:mt-2 lg:block lg:shrink-0" />
        </div>

        {/* Bottom row: corner mark + info card — both desktop-only now, the
            "System Optimization Active" card is dropped from mobile entirely */}
        <div className="mt-10 flex flex-1 flex-col justify-end gap-10 short:mt-6 lg:flex-row lg:items-end lg:justify-between">
          <img
            src={nexorynLogo}
            alt="Nexoryn"
            className="hero-mark hidden h-16 w-16 opacity-50 lg:block"
          />
          <div className="hero-card hidden lg:block">
            <InfoCard />
          </div>
        </div>
      </div>

      {/* Scroll cue — the one piece of chrome that tells the user this page
          has scroll-driven content worth reaching. */}
      <div
        aria-hidden="true"
        className="hero-card pointer-events-none absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
      >
        <span className="font-mono-tech text-[10px] font-semibold uppercase tracking-[0.4em] text-white/50">
          Scroll
        </span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/20">
          <span className="absolute inset-x-0 top-0 block h-1/2 animate-scroll-cue bg-gradient-to-b from-accent-from to-transparent" />
        </span>
      </div>
    </section>
  );
}
