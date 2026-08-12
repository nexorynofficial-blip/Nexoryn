import { useEffect } from "react";
import { motion } from "framer-motion";
import { Target, Eye } from "lucide-react";
import { staggerContainer, blurFadeIn, viewportOnce } from "../lib/motion";
import SplitText from "../components/ui/SplitText";
import { SectionsBackground } from "../components/SectionsBackground";
import { AboutGlobe } from "../components/AboutGlobe";
import { useTilt3D } from "../hooks/useTilt3D";
import CTASection from "../components/CTASection";
import Footer from "../components/Footer";
import nexorynLogo from "../assets/nexoryn-logo.png";

const INTRO_PARAGRAPH =
  "Nexoryn brings automation, web development, and graphic design together under one roof, building systems custom-fit to how your business actually runs instead of generic templates. The result: less manual work, faster-moving operations, and a brand that looks as sharp as it performs.";

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
    name: "Alex Rivera",
    role: "Founder & Automation Lead",
    photo: face("photo-1560250097-0b93528c311a"),
    bio: "Oversees workflow automation and AI agent strategy across every engagement. Translates the day-to-day chaos of running a business into systems that run themselves, from lead intake to reporting. Focused on finding the highest-leverage process to automate first, then building outward from there.",
  },
  {
    name: "Jordan Blake",
    role: "Lead Web Developer",
    photo: face("photo-1519244703995-f4e0f30006d5"),
    bio: "Designs and builds every website and web application Nexoryn ships, from marketing sites to full custom platforms. Prioritizes performance, scalability, and clean architecture over shortcuts that break under real traffic. Works closely with clients so the finished build actually fits how their business runs.",
  },
  {
    name: "Morgan Ellis",
    role: "Creative Director",
    photo: face("photo-1573496359142-b8d87734a5a2"),
    bio: "Leads brand identity and visual design work across every client touchpoint — logos, web design, and marketing assets. Focused on making sure a brand looks as sharp and considered as the systems running behind it. Keeps every visual choice tied back to how clients want to be perceived by their customers.",
  },
];

function MissionVisionBox({ icon: Icon, heading, body }) {
  return (
    <motion.div
      variants={blurFadeIn}
      className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl md:p-8"
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

function TeamCard({ photo, name, role, bio }) {
  const tilt = useTilt3D();

  return (
    <div style={{ perspective: 1000 }}>
      <motion.div
        variants={blurFadeIn}
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        style={tilt.style}
        className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl"
      >
        <div className="overflow-hidden rounded-2xl">
          <img src={photo} alt={name} className="aspect-[2/3] w-full object-cover" />
        </div>
        <h3 className="mt-5 font-heading text-lg tracking-tight text-white">
          {name}
        </h3>
        <p className="mt-1 text-sm font-light text-white/50">{role}</p>
        <p className="mt-3 text-sm font-light leading-relaxed text-body-dim">
          {bio}
        </p>
      </motion.div>
    </div>
  );
}

export default function AboutPage() {
  useEffect(() => {
    document.title = "About — Nexoryn";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-10 w-full px-4 pb-12 pt-32 md:px-10 lg:pt-40">
          {/* Section 1 — Agency Intro */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20"
          >
            <motion.div
              variants={blurFadeIn}
              className="mx-auto w-full max-w-[300px] sm:max-w-[420px] lg:mx-0 lg:max-w-[540px]"
            >
              <img src={nexorynLogo} alt="Nexoryn logo" className="h-auto w-full" />
            </motion.div>

            <motion.div variants={blurFadeIn}>
              <SplitText
                animateOnMount
                delay={0.15}
                className="mt-6 font-heading text-3xl leading-tight tracking-tight text-white md:text-4xl"
              >
                WHAT NEXORYN IS ABOUT
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
                Our Mission & Our Vision
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
                Our Team
              </SplitText>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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
                Global Reach
              </SplitText>
              <motion.p
                variants={blurFadeIn}
                className="mt-5 text-lg font-light leading-relaxed text-body-dim"
              >
                Nexoryn works with clients across multiple countries and time
                zones — automation and design don't stop at a border.
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
