import { useRef } from "react";
import { Link } from "react-router-dom";
import ctaBg from "../assets/cta-bg.png";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import MagneticButton from "./ui/MagneticButton";
import { gsap, useGSAP } from "../lib/gsap";
import { prefersReducedMotion } from "../lib/easing";

export default function CTASection({ compact = false }) {
  const sectionRef = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Slow push-in on the horizon photo as the section crosses the screen.
      // The scale is what gives the closing frame a sense of arrival — the
      // copy is static, so all the motion has to come from behind it.
      gsap.fromTo(
        ".cta-bg",
        { scale: 1.18, yPercent: -4 },
        {
          scale: 1,
          yPercent: 4,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="cta"
      className={`relative flex flex-col items-center justify-center overflow-hidden px-4 text-center md:px-10 ${
        compact ? "min-h-[45vh] py-16" : "min-h-[80vh] py-24"
      }`}
    >
      {/* Real horizon photo replaces the earlier CSS starfield/arc — it
          already has the glow + stars built in, so only one horizon effect
          renders instead of stacking both */}
      <img
        src={ctaBg}
        alt="Glowing amber horizon curving over a starlit dark sky"
        className="cta-bg absolute inset-0 h-full w-full object-cover will-change-transform"
      />

      {/* Subtle dark overlay for text legibility over the photo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-black/35"
      />

      {/* Soft seam blend from the shared aurora backdrop above, mirroring
          the hero's own bottom-edge blend into the section below it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-40 bg-gradient-to-b from-black to-transparent"
      />

      <div className="relative z-10 flex flex-col items-center">
        <SplitText
          stagger={0.05}
          duration={1.1}
          className="max-w-3xl font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
        >
          Ready to <span className="text-accent-from">automate</span> your
          growth?
        </SplitText>
        <Reveal
          as="p"
          y={24}
          delay={0.14}
          className="mt-5 max-w-lg text-lg font-light leading-relaxed text-body-dim"
        >
          Let's build the systems that give your team its time back.
        </Reveal>
        <Reveal y={24} delay={0.24} className="mt-10">
          <MagneticButton strength={0.4}>
            <Link
              to="/contact"
              className="pressable block rounded-full bg-gradient-to-r from-accent-from to-accent-to px-10 py-4 text-base font-bold uppercase tracking-wide text-black shadow-[0_0_0_0_rgba(255,122,26,0.5)] transition-[box-shadow,filter] duration-300 hover:shadow-[0_0_44px_0_rgba(255,122,26,0.45)] hover:brightness-110"
            >
              Book a Call
            </Link>
          </MagneticButton>
        </Reveal>
      </div>
    </section>
  );
}
