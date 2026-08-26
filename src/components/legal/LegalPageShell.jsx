import { useEffect } from "react";
import SplitText from "../ui/SplitText";
import Reveal from "../ui/Reveal";
import { SectionsBackground } from "../SectionsBackground";
import Footer from "../Footer";

// Shared chrome for the three legal pages — same header/background/footer
// pattern every other page uses (see ReviewsPage, AboutPage), just without
// the closing CTASection since a document page reads better ending on its
// own content than a sales pitch.
export default function LegalPageShell({ title, description, updated, children }) {
  useEffect(() => {
    document.title = `${title} - Nexoryn`;
    // No local scroll reset — the global ScrollToTop already resets on every
    // route change via lenis.scrollTo, which Lenis needs to stay in sync;
    // a raw window.scrollTo call here fights that (see ScrollToTop.jsx).
  }, [title]);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-20 w-full px-4 pb-24 pt-32 md:px-10 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="mt-6 font-heading text-3xl leading-tight tracking-tight text-white sm:text-4xl md:text-5xl"
            >
              {title}
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.2}
              animateOnMount
              className="mt-5 text-base font-light leading-relaxed text-body-dim md:text-lg"
            >
              {description}
            </Reveal>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Last updated: {updated}
            </p>
          </div>

          <div className="glass-panel mx-auto mt-14 max-w-4xl rounded-3xl p-6 backdrop-blur-xl md:p-10 lg:p-12">
            <div className="flex flex-col divide-y divide-white/10">
              {children}
            </div>
          </div>
        </div>

        {/* Soft blend into the footer below, mirroring every other page */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-black md:h-40"
        />
      </div>

      <Footer />
    </>
  );
}

export function LegalSection({ heading, children }) {
  return (
    <section className="pt-8 first:pt-0">
      <h2 className="font-heading text-lg tracking-tight text-white md:text-xl">
        {heading}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-sm font-light leading-relaxed text-body-dim md:text-base">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }) {
  return (
    <ul className="list-disc space-y-2 pl-5 marker:text-accent-from">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
