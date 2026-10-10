import { useRef } from "react";
import { Link } from "react-router-dom";
import { m, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import { PROJECTS } from "../data/projects";
import { getProjects } from "../lib/content";
import { useContent } from "../hooks/useContent";

// Fixed home-page teaser: 3 automation projects + 2 web development projects,
// in this order whatever order the data arrives in. The full set is on the
// /portfolio page.
const FEATURED_SLUGS = [
  "ai-customer-support-chatbot",
  "personalized-cold-email-outreach",
  "intelligent-content-repurposing-approval-workflow",
  "aurum-luxury-ecommerce-platform",
  "analytics-hub-saas-dashboard-platform",
];

const pickFeatured = (projects) =>
  FEATURED_SLUGS.map((slug) => projects.find((p) => p.slug === slug)).filter(Boolean);

const pad = (n) => String(n).padStart(2, "0");

// Split a title so its last two words can carry the orange highlight.
function splitTitle(title) {
  const words = title.split(" ");
  const cut = Math.max(1, words.length - 2);
  return [words.slice(0, cut).join(" "), words.slice(cut).join(" ")];
}

/**
 * One case study in the stack. Its wrapper is a full-screen sticky slot, so
 * each card pins as it arrives and the next one slides up over it. While a
 * card is covered it eases back (scales down) so the stack reads as depth.
 */
function StackCard({ project, i, total, progress }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  // Its own entry: the image settles from a slight zoom as the card arrives.
  const { scrollYProgress: entry } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const imageScale = useTransform(entry, [0, 1], reduce ? [1, 1] : [1.25, 1]);
  // Covered by later cards: shrink a little more for each one stacked on top.
  const targetScale = 1 - (total - 1 - i) * 0.05;
  const scale = useTransform(progress, [i / total, 1], reduce ? [1, 1] : [1, targetScale]);

  const [lead, highlight] = splitTitle(project.title);

  return (
    <div
      ref={ref}
      // Slots overlap by a fifth of the screen, so less scrolling between cards
      style={i > 0 ? { marginTop: "-20svh" } : undefined}
      className="sticky top-0 flex h-[100svh] items-center justify-center px-4 lg:px-[100px]"
    >
      <m.div
        style={{ scale, top: `calc(-4vh + ${i * 22}px)` }}
        className="relative w-full origin-top overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(150deg,#3a1406_0%,#140803_32%,#070707_65%)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className="grid gap-0 md:grid-cols-[1fr_1.25fr]">
          {/* Copy */}
          <div className="order-last flex flex-col p-5 pt-3 md:order-first md:p-10 lg:p-12">
            <div className="flex items-center gap-3">
              <span className="font-mono-tech text-sm font-semibold tracking-[0.2em] text-accent-from">
                {pad(i + 1)}
              </span>
              <span className="h-px w-8 bg-white/20" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                {project.service} · {project.industry}
              </span>
            </div>

            <h3 className="mt-5 font-heading text-2xl font-extrabold uppercase leading-[1.1] text-white md:mt-8 md:text-3xl lg:text-[1.9rem]">
              {lead}{" "}
              <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">
                {highlight}
              </span>
            </h3>
            <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-body-dim md:mt-4 md:line-clamp-3 md:text-base">
              {project.description}
            </p>

            <ul className="mt-4 flex flex-wrap gap-2 md:mt-5">
              {(project.tags ?? []).slice(0, 3).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/85"
                >
                  {tag}
                </li>
              ))}
            </ul>

            <Link
              to={`/portfolio/${project.slug}`}
              className="group/cta mt-5 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-accent-from to-accent-to px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-black transition duration-300 hover:brightness-110 md:mt-auto md:translate-y-0"
            >
              View Case Study
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
            </Link>
          </div>

          {/* Image */}
          <Link
            to={`/portfolio/${project.slug}`}
            aria-label={`${project.title} case study`}
            className="group/img relative m-2.5 block aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d0d] md:m-4 md:aspect-auto md:min-h-[420px] lg:min-h-[480px]"
          >
            <m.img
              src={project.photo?.url ?? project.photo}
              alt={project.photo?.altText ?? project.title}
              draggable={false}
              loading="lazy"
              decoding="async"
              width={1600}
              height={1000}
              style={{ scale: imageScale }}
              className="absolute inset-0 h-full w-full object-cover transition-[filter] duration-500 group-hover/img:brightness-110"
            />
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <span className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
              {project.service}
            </span>
          </Link>
        </div>
      </m.div>
    </div>
  );
}

export default function Portfolio() {
  const projects = useContent(getProjects, PROJECTS);
  const featured = pickFeatured(projects);
  const stackRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: stackRef, offset: ["start start", "end end"] });

  return (
    <section id="portfolio" className="relative scroll-mt-24 pt-24 lg:pt-32">
      <div className="mx-auto max-w-5xl px-4 text-center md:px-10">
        <SplitText
          as="h2"
          className="font-heading text-[2rem] leading-tight tracking-tight text-white sm:text-4xl md:whitespace-nowrap md:text-6xl"
        >
          Work That <span className="text-accent-from">Delivers.</span>
        </SplitText>
        <Reveal
          as="p"
          y={24}
          delay={0.12}
          className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-body-dim"
        >
          Real systems, built for real businesses, and the results to show for it.
        </Reveal>
      </div>

      {/* The stack: one full-screen sticky slot per case study */}
      <div ref={stackRef} className="relative -mt-10 md:-mt-24">
        {featured.map((project, i) => (
          <StackCard
            key={project.slug}
            project={project}
            i={i}
            total={featured.length}
            progress={scrollYProgress}
          />
        ))}
      </div>

      <div className="relative -mt-16 flex justify-center pb-24 md:-mt-28 lg:pb-32">
        <Link
          to="/portfolio"
          className="group inline-flex items-center gap-2 rounded-full border border-accent-from px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-accent-from transition duration-300 hover:bg-accent-from hover:text-black"
        >
          View All Projects
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
