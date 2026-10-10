import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import { AutomationVisual, DesignVisual, WebVisual } from "./ServiceVisuals";

const SERVICES = [
  {
    id: "automation",
    title: "AI",
    highlight: "Automation",
    description: "Pipelines and AI agents that do your busywork for you.",
    pills: ["Workflows", "Voice AI", "AI Agents"],
    Visual: AutomationVisual,
  },
  {
    id: "web-development",
    title: "Web",
    highlight: "Development",
    description: "Fast, high-converting sites and apps, wired to your systems.",
    pills: ["Websites", "Web Apps", "E-Commerce"],
    Visual: WebVisual,
  },
  {
    id: "graphic-design",
    title: "Graphic",
    highlight: "Design",
    description: "Brands and interfaces as sharp as the way you run.",
    pills: ["Branding", "UI/UX", "Social Media"],
    Visual: DesignVisual,
  },
];

function ServiceCard({ service }) {
  const { Visual } = service;
  return (
    <Link
      to={`/services?category=${service.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-[linear-gradient(160deg,rgba(107,37,8,0.4)_0%,rgba(20,8,3,0.85)_35%,#000_70%)] p-3 transition duration-500 hover:-translate-y-1.5 hover:border-accent-from/40 hover:shadow-[0_20px_60px_-15px_rgba(255,122,26,0.35)]"
    >
      {/* Live illustration */}
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0d0d0d]">
        <Visual />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-6 md:px-4">
        <h3 className="font-heading text-2xl font-extrabold uppercase leading-tight text-white md:text-[1.7rem]">
          {service.title}{" "}
          <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">
            {service.highlight}
          </span>
        </h3>
        <p className="mt-3 text-[15px] leading-relaxed text-body-dim">{service.description}</p>

        <ul className="mt-5 flex flex-wrap gap-2">
          {service.pills.map((pill) => (
            <li
              key={pill}
              className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/85"
            >
              {pill}
            </li>
          ))}
        </ul>

        <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-xs font-bold uppercase tracking-[0.12em] text-accent-from">
          Explore Service
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function Services() {
  // Pause every illustration while the section is off screen.
  const ref = useRef(null);
  const [onScreen, setOnScreen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="services" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto max-w-5xl px-4 text-center md:px-10">
        <SplitText
          as="h2"
          className="whitespace-nowrap font-heading text-[2rem] leading-tight tracking-tight text-white sm:text-4xl md:text-6xl"
        >
          What We <span className="text-accent-from">Master.</span>
        </SplitText>
        <Reveal
          as="p"
          y={24}
          delay={0.12}
          className="mx-auto mt-6 max-w-xl text-lg font-light leading-relaxed text-body-dim"
        >
          Automation that saves time. Web experiences that convert. Designs
          that leave a lasting impression.
        </Reveal>
      </div>

      <Reveal
        stagger={0.12}
        y={40}
        blur={8}
        className={`mx-auto mt-16 grid max-w-[1400px] grid-cols-1 gap-6 px-4 md:mt-20 md:grid-cols-3 md:px-10 ${
          onScreen ? "" : "svc-paused"
        }`}
      >
        {SERVICES.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </Reveal>
    </section>
  );
}
