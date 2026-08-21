import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CardStack } from "./ui/CardStack";
import SplitText from "./ui/SplitText";
import { getProjectBySlug } from "../data/projects";

// Fixed home-page teaser: always exactly 3 automation projects + 2 web
// development projects, regardless of how many more get added to PROJECTS
// later. The full set is always available on the /portfolio grid page.
const FEATURED_SLUGS = [
  "ai-customer-support-chatbot",
  "personalized-cold-email-outreach",
  "intelligent-content-repurposing-approval-workflow",
  "aurum-luxury-ecommerce-platform",
  "analytics-hub-saas-dashboard-platform",
];

const FEATURED_PROJECTS = FEATURED_SLUGS.map(getProjectBySlug).filter(Boolean);

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

      <div className="mx-auto mt-8 max-w-[1400px] px-4 md:px-10">
        <CardStack
          items={FEATURED_PROJECTS.map((project) => ({
            id: project.slug,
            title: project.title,
            description: project.service,
            imageSrc: project.photo,
            href: `/portfolio/${project.slug}`,
          }))}
          cardWidth={520}
          cardHeight={380}
          showDots
        />
      </div>

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
