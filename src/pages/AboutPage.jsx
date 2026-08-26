import { useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Eye } from "lucide-react";
import { staggerContainer, blurFadeIn, viewportOnce } from "../lib/motion";
import SplitText from "../components/ui/SplitText";
import { SectionsBackground } from "../components/SectionsBackground";
import { AboutGlobe } from "../components/AboutGlobe";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import nexorynLogo from "../assets/nexoryn-logo.png";

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

const face = (id) =>
  `https://images.unsplash.com/${id}?w=400&h=500&fit=crop&crop=faces`;

const TEAM = [
  {
    name: "Waseem Farooq",
    role: "Co Founder",
    photo: face("photo-1560250097-0b93528c311a"),
  },
  {
    name: "Abdul Ahad Khan",
    role: "Co Founder",
    photo: face("photo-1519244703995-f4e0f30006d5"),
  },
  {
    name: "Akbar Khan",
    role: "Co Founder",
    photo: face("photo-1573496359142-b8d87734a5a2"),
  },
];

function TeamCard({ photo, name, role }) {
  return (
    <motion.div
      variants={blurFadeIn}
      className="mx-auto flex w-full max-w-[380px] flex-col overflow-hidden rounded-2xl glass-panel p-6"
    >
      <div className="overflow-hidden rounded-xl">
        <img src={photo} alt={name} className="aspect-[3/4] w-full object-cover" />
      </div>
      <h3 className="mt-4 font-heading text-lg tracking-tight text-white">
        {name}
      </h3>
      <p className="mt-1 text-sm font-light text-white/50">{role}</p>
    </motion.div>
  );
}

function MissionVisionBox({ icon: Icon, heading, body }) {
  return (
    <motion.div
      variants={blurFadeIn}
      className="rounded-3xl glass-panel p-6 backdrop-blur-xl md:p-8"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-500/10">
        <Icon className="h-5 w-5 text-orange-400" />
      </div>
      <h3 className="mt-5 font-heading text-xl tracking-tight text-white md:text-2xl">
        {heading}
      </h3>
      <p className="mt-3 text-sm font-light leading-relaxed text-body-dim md:text-base">
        {body}
      </p>
    </motion.div>
  );
}

export default function AboutPage() {
  useEffect(() => {
    document.title = "About - Nexoryn";
    // No local scroll reset — the global ScrollToTop already resets on every
    // route change via lenis.scrollTo, which Lenis needs to stay in sync;
    // a raw window.scrollTo call here fights that (see ScrollToTop.jsx).
  }, []);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-10 w-full px-4 pb-12 pt-32 md:px-10 lg:px-[300px] lg:pt-40">
          {/* Section 1 — Agency Intro */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            <motion.div
              variants={blurFadeIn}
              className="mx-auto w-full max-w-[300px] sm:max-w-[420px] lg:mx-0 lg:ml-[-40px] lg:max-w-[540px]"
            >
              <img src={nexorynLogo} alt="Nexoryn logo" className="h-auto w-full" />
            </motion.div>

            <motion.div variants={blurFadeIn}>
              <SplitText
                animateOnMount
                delay={0.15}
                className="mt-6 font-heading text-3xl leading-tight tracking-tight text-white md:text-4xl"
              >
                WHAT <span className="text-accent-from">NEXORYN</span> IS ABOUT
              </SplitText>
              <p className="mt-5 text-lg font-light leading-relaxed text-body-dim">
                {INTRO_PARAGRAPH}
              </p>
            </motion.div>
          </motion.div>

          {/* Section 2 — Our Mission & Our Vision */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-28 lg:mt-36"
          >
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <SplitText className="mt-6 font-heading text-3xl leading-tight tracking-tight text-white md:text-5xl">
                Our <span className="text-accent-from">Mission</span> & Our{" "}
                <span className="text-accent-from">Vision</span>
              </SplitText>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
              {MISSION_VISION.map((item) => (
                <MissionVisionBox key={item.heading} {...item} />
              ))}
            </div>
          </motion.div>

          {/* Section 3 — Our Team */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={viewportOnce}
            className="mt-28 lg:mt-36"
          >
            <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
              <SplitText className="mt-6 font-heading text-3xl leading-tight tracking-tight text-white md:text-5xl">
                Our <span className="text-accent-from">Team</span>
              </SplitText>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
              {TEAM.map((member) => (
                <TeamCard key={member.name} {...member} />
              ))}
            </div>
          </motion.div>

          {/* Section 4 — Global Presence */}
          <div className="mt-28 grid grid-cols-1 items-center gap-12 lg:mt-36 lg:grid-cols-2 lg:gap-20">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={viewportOnce}
              className="order-2 lg:order-1"
            >
              <SplitText className="mt-6 font-heading text-3xl leading-tight tracking-tight text-white md:text-5xl">
                Global <span className="text-accent-from">Reach</span>
              </SplitText>
              <motion.p
                variants={blurFadeIn}
                className="mt-5 text-lg font-light leading-relaxed text-body-dim"
              >
                Nexoryn works with clients across multiple countries and time
                zones, automation and design don't stop at a border.
              </motion.p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewportOnce}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-1 h-[340px] w-full sm:h-[400px] lg:order-2 lg:h-[460px]"
            >
              <AboutGlobe />
            </motion.div>
          </div>
        </div>

        {/* Soft blend into the CTA section below, mirroring the Hero's own
            bottom-edge fade into the section beneath it */}
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
