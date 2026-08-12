import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import StickyCardStack from "./ui/StickyCardStack";
import SplitText from "./ui/SplitText";

// Trimmed to 4: one from each discipline plus a second automation project,
// since the site's one real case study is itself an automation build.
const PROJECTS = [
  {
    common: "Fintech Onboarding Automation",
    binomial: "Workflow Automation",
    photo: {
      url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80",
      text: "Analytics dashboard on a laptop screen",
      by: "Nexoryn Studio",
    },
  },
  {
    common: "E-Commerce Storefront Rebuild",
    binomial: "Web Development",
    photo: {
      url: "https://images.unsplash.com/photo-1487014679447-9f8336841d58?w=1200&auto=format&fit=crop&q=80",
      text: "Code editor on a dark laptop screen",
      by: "Nexoryn Studio",
    },
  },
  {
    common: "Brand Identity — Aurora Coffee Co.",
    binomial: "Brand & Graphic Design",
    photo: {
      url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&auto=format&fit=crop&q=80",
      text: "Branding mockups laid out on a desk",
      by: "Nexoryn Studio",
    },
  },
  {
    common: "Support Ticket Auto-Triage",
    binomial: "Workflow Automation",
    photo: {
      url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&auto=format&fit=crop&q=80",
      text: "Team reviewing analytics on screens",
      by: "Nexoryn Studio",
    },
  },
];

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative scroll-mt-24 pb-16 lg:pb-24">
      <div className="mx-auto max-w-4xl px-4 pt-8 text-center md:px-10 lg:pt-12">
        <SplitText
          as="h2"
          className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
        >
          Work that speaks for <span className="text-accent-from">itself</span>.
        </SplitText>
      </div>

      <StickyCardStack projects={PROJECTS} />

      <div className="relative z-10 mt-[30px] flex justify-center">
        <Link
          to="/portfolio"
          className="group/link inline-flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-accent-from"
        >
          <span className="relative pb-1">
            View All Projects
            <span className="absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 bg-gradient-to-r from-accent-from to-accent-to transition-transform duration-300 ease-out group-hover/link:scale-x-100" />
          </span>
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" />
        </Link>
      </div>

      {/* Trailing scroll room so the last sticky card can release — kept after
          the link so it doesn't add gap between cards and the hyperlink */}
      <div aria-hidden="true" className="h-[8vh]" />
    </section>
  );
}
