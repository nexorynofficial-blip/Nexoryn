import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { CardStack } from "./ui/CardStack";
import { PortfolioMobileDuo } from "./ui/PortfolioMobileDuo";
import SplitText from "./ui/SplitText";
import { getProjectBySlug } from "../data/projects";
import { useMediaQuery } from "../hooks/useMediaQuery";

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
  // Below md, the desktop 3D fan CardStack (drag-driven, fixed 520x380px
  // cards, all 5 featured projects) is swapped for two plain static cards
  // instead — no scroll/stack animation, just one automation project and one
  // web development project. md+ renders the exact original CardStack,
  // untouched.
  const isMobile = useMediaQuery("(max-width: 767px)");

  const items = FEATURED_PROJECTS.map((project) => ({
    id: project.slug,
    title: project.title,
    description: project.service,
    imageSrc: project.photo,
    href: `/portfolio/${project.slug}`,
  }));

  const automationItem = items.find((item) => item.description === "Automation");
  const webDevItem = items.find((item) => item.description === "Web Development");

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

      <div className="mx-auto mt-3 max-w-[1400px] overflow-x-hidden px-4 md:mt-8 md:px-10">
        {isMobile ? (
          <PortfolioMobileDuo automationItem={automationItem} webDevItem={webDevItem} />
        ) : (
          <CardStack items={items} cardWidth={520} cardHeight={380} showDots />
        )}
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

      {/* Trailing scroll room so the desktop CardStack's sticky drag zone can
          release — desktop only. Mobile's two static cards need no such
          buffer, so Reviews follows immediately, same as every other
          section-to-section transition on the page. */}
      <div aria-hidden="true" className="hidden h-[8vh] md:block" />
    </section>
  );
}
