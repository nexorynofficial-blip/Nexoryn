import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";

// Copy is unchanged from the previous photo-panel design — only the
// presentation (cards instead of full-bleed panels) changed.
const SERVICES = [
  {
    id: "automation",
    title: "AI AUTOMATION",
    description:
      "Custom pipelines that move data, qualify leads, and handle follow-ups automatically, day or night.",
    pills: ["Workflow Automation", "Voice AI Agents", "LLM Workflows & AI Agents"],
  },
  {
    id: "web-development",
    title: "WEB DEVELOPMENT",
    description:
      "Fast, modern sites and web apps built to convert, production-ready, fully responsive, and wired straight into your automations from day one.",
    pills: ["Website Design & Development", "Web Applications", "E-Commerce Development"],
  },
  {
    id: "graphic-design",
    title: "GRAPHIC DESIGN",
    description:
      "Brand identities, interfaces, and campaign assets that make your business look as sharp as it runs, designed to be used, not just admired once.",
    pills: ["Brand Identity & Logo Design", "UI/UX & Product Design", "Marketing & Social Media Design"],
  },
];

function ServiceCard({ service }) {
  return (
    <div className="hover-lift relative flex h-full flex-col overflow-hidden rounded-3xl border border-accent-from/40 bg-black/25 p-8 text-left backdrop-blur-xl md:p-10">
      {/* Subtle orange wash from the top-left corner */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 0% 0%, rgba(255,122,26,0.14), transparent 58%)",
        }}
      />
      <div className="relative flex h-full flex-col">
        <h3 className="font-heading text-2xl leading-tight tracking-tight text-white md:text-3xl">
          {service.title}
        </h3>
        <p className="mt-4 text-base font-light leading-relaxed text-body-dim">
          {service.description}
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {service.pills.map((pill) => (
            <li key={pill} className="flex items-start gap-3 text-sm text-body-light">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-from" />
              <span>{pill}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex justify-center pt-8">
          <Link
            to={`/services?category=${service.id}`}
            className="group/link inline-flex items-center justify-center gap-1.5 rounded-full border border-accent-from px-4 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-accent-from transition duration-300 hover:bg-accent-from hover:text-black"
          >
            Explore This Service in Detail
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover/link:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Services() {
  return (
    <section id="services" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-4 text-center md:px-10">
        <SplitText
          as="h2"
          className="mt-6 font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
        >
          Solutions that drive <span className="text-accent-from">real</span> results.
        </SplitText>
        <Reveal
          as="p"
          y={24}
          delay={0.12}
          className="mt-5 text-lg font-light leading-relaxed text-body-dim"
        >
          Automation that saves time. Web experiences that convert. Designs
          that leave a lasting impression.
        </Reveal>
      </div>

      <Reveal
        stagger={0.12}
        y={40}
        blur={8}
        className="mx-auto mt-16 grid max-w-[1400px] grid-cols-1 gap-8 px-4 md:mt-20 md:grid-cols-3 md:px-10"
      >
        {SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </Reveal>
    </section>
  );
}
