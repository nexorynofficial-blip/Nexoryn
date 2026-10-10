import { useEffect } from "react";
import { m } from "framer-motion";
import { Target, Eye, BadgeCheck, MapPin } from "lucide-react";
import { staggerContainer, blurFadeIn, viewportOnce } from "../lib/motion";
import SplitText from "../components/ui/SplitText";
import { SectionsBackground } from "../components/SectionsBackground";
import { AboutGlobe } from "../components/AboutGlobe";
import { LogoShowcase } from "../components/LogoShowcase";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import nexorynLogo from "../assets/nexoryn-logo.webp";
import waseemPhoto from "../assets/team-waseem-farooq.webp";
import abdulPhoto from "../assets/team-abdul-ahad.webp";
import akbarPhoto from "../assets/team-akbar-khan.webp";
import { getTeam } from "../lib/content";
import { useContent } from "../hooks/useContent";
import { REVIEWS } from "../data/reviews";

const INTRO_PARAGRAPH =
  "At Nexoryn, we build websites that convert and automation systems that eliminate the repetitive work slowing businesses down. We don't rely on templates or one-size-fits-all solutions. Instead, we analyze how your business operates, identify inefficiencies, and create custom systems designed specifically for your workflow. Our goal is simple: help businesses save time, improve efficiency, and focus on growth by replacing manual processes with smarter, scalable solutions.";

const MISSION_VISION = [
  {
    icon: Target,
    heading: "Our Mission",
    body: "Our mission is to eliminate the manual, repetitive work that slows businesses down. We build automation, AI, and digital systems tailored to how each client actually operates, not generic, off-the-shelf software forced into place. Every system we ship is designed to run quietly in the background, handling the busywork so your team can focus on what actually needs a human. Technology should feel like a dependable operator on your team, not another tool you have to manage.",
  },
  {
    icon: Eye,
    heading: "Our Vision",
    body: "We envision a future where every business, regardless of size, has access to the kind of intelligent automation and design once reserved for large enterprises. Nexoryn is building toward that future by acting as a long-term technology partner, not a one-off vendor, for every client we take on. As your business grows, our systems grow with it, so you can scale revenue and reach without scaling headcount or overhead. Our goal is to become the quiet infrastructure behind ambitious, lean-running businesses everywhere.",
  },
];

const TEAM = [
  {
    name: "Waseem Farooq",
    role: "Co Founder",
    photo: waseemPhoto,
    linkedin: "https://www.linkedin.com/in/waseem-farooq-758a74251/",
    quote:
      "Don't measure your day by how busy you were. Measure it by the one thing that moved you closer to where you want to be.",
  },
  {
    name: "Abdul Ahad",
    role: "Co Founder",
    photo: abdulPhoto,
    linkedin: "https://www.linkedin.com/in/abdul-ahad-khan-a63002432/",
    quote: "Vision takes shape when ideas are willing to adapt, grow, and lead the way.",
  },
  {
    name: "Akbar Khan",
    role: "Co Founder",
    photo: akbarPhoto,
    linkedin: "https://www.linkedin.com/in/akbar-khan-37ba43360/",
    quote:
      "Our first client was us. We were drowning in the same busywork you are, until we automated our way out. Now we do it for you.",
  },
];

// The team can also come from the admin panel, which doesn't store LinkedIn
// links or quotes; fill those in from the list above by name.
const withExtras = (member) => {
  const local = TEAM.find((t) => t.name.toLowerCase() === member.name?.toLowerCase());
  return { ...local, ...member, linkedin: member.linkedin ?? local?.linkedin, quote: member.quote ?? local?.quote };
};

// lucide no longer ships brand logos, so the LinkedIn mark is drawn here.
function LinkedInIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

/** Portrait card: full-bleed photo, details and quote over a dark fade. */
function TeamCard({ photo, name, role, linkedin, quote }) {
  return (
    <m.div
      variants={blurFadeIn}
      className="group mx-auto w-full max-w-[400px] rounded-[2.25rem] border border-white/10 bg-[#161616] p-2.5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] transition duration-500 hover:-translate-y-1.5 hover:border-accent-from/40 hover:shadow-[0_30px_80px_-25px_rgba(255,122,26,0.35)]"
    >
      <div className="relative aspect-[3/4.3] overflow-hidden rounded-[1.75rem] bg-black">
        <img
          src={photo}
          alt={name}
          width={900}
          height={1200}
          loading="lazy"
          decoding="async"
          // Shorter than the card and pinned to the top, so the face sits
          // well above the name and quote rather than behind them.
          className="absolute inset-x-0 -top-[12%] h-[84%] w-full object-cover object-top transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
        />
        {/* Fade the bottom of the photo to near-black for the text */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top,#000_0%,#000_30%,rgba(0,0,0,0.75)_42%,rgba(0,0,0,0.15)_60%,transparent_72%)]"
        />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
          <h3 className="flex items-center gap-2 font-heading text-2xl font-extrabold leading-tight text-white">
            {name}
            <BadgeCheck className="h-6 w-6 shrink-0 fill-accent-from text-black" strokeWidth={2} aria-label="Verified" />
          </h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-accent-to">{role}</p>

          {quote && (
            <blockquote className="mt-4 border-l-2 border-accent-from/70 pl-3 text-sm leading-relaxed text-white/80">
              “{quote}”
            </blockquote>
          )}

          {linkedin && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow ${name} on LinkedIn`}
              className="mt-5 flex w-full items-center justify-center gap-2.5 rounded-full bg-white py-3.5 text-sm font-bold text-black transition duration-300 hover:bg-gradient-to-r hover:from-accent-from hover:to-accent-to"
            >
              <LinkedInIcon className="h-4 w-4 text-[#0A66C2] transition-colors duration-300 group-hover:text-current" />
              Follow on LinkedIn
            </a>
          )}
        </div>
      </div>
    </m.div>
  );
}

const CARD_BG = "bg-[linear-gradient(150deg,#3a1406_0%,#140803_35%,#070707_70%)]";

const DISCIPLINES = ["Automation", "Web Development", "Graphic Design"];

// Every country a client review comes from.
const COUNTRIES = [...new Set(REVIEWS.map((r) => r.location).filter(Boolean))];

function SectionHeading({ lead, highlight, className = "" }) {
  return (
    <SplitText className={`font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl ${className}`}>
      {lead} <span className="text-accent-from">{highlight}</span>
    </SplitText>
  );
}

function MissionVisionBox({ icon: Icon, heading, body, index }) {
  const [lead, last] = heading.split(" ");
  return (
    <m.div
      variants={blurFadeIn}
      className={`group relative overflow-hidden rounded-[2rem] border border-white/[0.08] p-7 transition duration-500 hover:border-accent-from/35 md:p-10 ${CARD_BG}`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-6 font-heading text-[8rem] font-extrabold leading-none text-white/[0.04] md:text-[10rem]"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-accent-from/30 bg-gradient-to-b from-[#2a1608] to-[#0d0703] text-accent-from shadow-[0_0_24px_-6px_rgba(255,122,26,0.45)]">
        <Icon className="h-6 w-6" strokeWidth={1.75} />
      </span>
      <h3 className="relative mt-6 font-heading text-2xl font-extrabold uppercase tracking-tight text-white md:text-3xl">
        {lead}{" "}
        <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">{last}</span>
      </h3>
      <p className="relative mt-4 text-[15px] font-light leading-relaxed text-body-dim md:text-base">{body}</p>
    </m.div>
  );
}

export default function AboutPage() {
  // Falls back to the bundled TEAM list whenever the API has nothing to say.
  const team = (useContent(getTeam, TEAM) ?? TEAM).map(withExtras);

  useEffect(() => {
    document.title = "About - Nexoryn";
    // No local scroll reset — the global ScrollToTop already resets on every
    // route change (see ScrollToTop.jsx), so there is nothing to reset here.
  }, []);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-10 w-full px-4 pb-12 pt-32 md:px-10 lg:px-[7.8vw] lg:pt-40">
          {/* ── Hero ─────────────────────────────────────────────── */}
          <m.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16"
          >
            <m.div variants={blurFadeIn}>
              <div className="flex items-center gap-3">
                <span className="h-px w-10 bg-accent-from" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-from">About Nexoryn</span>
              </div>
              <SplitText
                animateOnMount
                delay={0.15}
                className="mt-6 font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
              >
                What <span className="text-accent-from">Nexoryn</span> is about
              </SplitText>
              <p className="mt-6 max-w-2xl text-lg font-light leading-relaxed text-body-dim">{INTRO_PARAGRAPH}</p>
              <ul className="mt-8 flex flex-wrap gap-2">
                {DISCIPLINES.map((d) => (
                  <li
                    key={d}
                    className="rounded-full border border-white/15 bg-white/[0.03] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white/85"
                  >
                    {d}
                  </li>
                ))}
              </ul>
            </m.div>

            <m.div variants={blurFadeIn} className="mx-auto w-full max-w-[460px] lg:max-w-none">
              <div className={`relative rounded-[2.25rem] border border-white/[0.08] p-3 shadow-[0_30px_100px_-30px_rgba(255,122,26,0.45)] ${CARD_BG}`}>
                <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-[radial-gradient(circle_at_50%_45%,rgba(255,122,26,0.18),#0b0b0b_65%)]">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[radial-gradient(circle,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:22px_22px]"
                  />
                  <LogoShowcase src={nexorynLogo} />
                </div>
              </div>
            </m.div>
          </m.div>

          {/* ── Mission & Vision ─────────────────────────────────── */}
          <m.section
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-28 lg:mt-40"
          >
            <div className="text-center">
              <SplitText className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl">
                Our <span className="text-accent-from">Mission</span> & Our{" "}
                <span className="text-accent-from">Vision</span>
              </SplitText>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-5 md:mt-16 lg:grid-cols-2 lg:gap-6">
              {MISSION_VISION.map((item, i) => (
                <MissionVisionBox key={item.heading} index={i} {...item} />
              ))}
            </div>
          </m.section>

          {/* ── Team ─────────────────────────────────────────────── */}
          <m.section
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-28 lg:mt-40"
          >
            <div className="text-center">
              <SectionHeading lead="Our" highlight="Team" />
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 md:mt-16 lg:grid-cols-3 lg:gap-8">
              {team.map((member) => (
                <TeamCard key={member.name} {...member} />
              ))}
            </div>
          </m.section>

          {/* ── Global reach ─────────────────────────────────────── */}
          <section className="mt-28 lg:mt-40">
            <div className="grid grid-cols-1 items-center gap-10 rounded-[2rem] border border-white/[0.08] bg-[#111111]/95 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] md:p-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
              <m.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="show"
                viewport={viewportOnce}
                className="order-2 lg:order-1"
              >
                <SectionHeading lead="Global" highlight="Reach" />
                <m.p variants={blurFadeIn} className="mt-6 text-lg font-light leading-relaxed text-body-dim">
                  Nexoryn works with clients across multiple countries and time
                  zones, automation and design don't stop at a border.
                </m.p>
                {COUNTRIES.length > 0 && (
                  <m.ul variants={blurFadeIn} className="mt-8 flex flex-wrap gap-2">
                    {COUNTRIES.map((c) => (
                      <li
                        key={c}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.03] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/85"
                      >
                        <MapPin className="h-3 w-3 text-accent-from" />
                        {c}
                      </li>
                    ))}
                  </m.ul>
                )}
              </m.div>

              <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={viewportOnce}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative order-1 h-[320px] w-full sm:h-[400px] lg:order-2 lg:h-[460px]"
              >
                <AboutGlobe />
              </m.div>
            </div>
          </section>
        </div>

        {/* Soft blend into the CTA section below */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-b from-transparent to-black md:h-40"
        />
      </div>

      <CTASection />
      <Footer />
    </>
  );
}
