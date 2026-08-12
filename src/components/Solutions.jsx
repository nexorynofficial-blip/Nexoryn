import { FeatureRow } from "./ui/FeatureRow";
import BeforeAfterCard from "./BeforeAfterCard";
import { RefreshIcon, ZapIcon, WorkflowIcon } from "./ui/Icons";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import Parallax from "./ui/Parallax";

const SOLUTION_POINTS = [
  {
    icon: <RefreshIcon />,
    title: "Automated data entry & syncing",
    description:
      "Every record captured, cleaned, and synced across your stack — hands-free.",
  },
  {
    icon: <ZapIcon />,
    title: "Instant lead follow-up",
    description:
      "New leads get a personal response within minutes, around the clock.",
  },
  {
    icon: <WorkflowIcon />,
    title: "Unified workflow automation",
    description:
      "One connected pipeline from first click to paid invoice.",
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="mx-auto grid w-full max-w-[1400px] items-center gap-[60px] px-4 md:px-[80px] lg:grid-cols-2">
        {/* Before/After card — left on desktop, first on mobile. The gentle
            parallax drift is what keeps the two columns from reading as one
            flat slab as they scroll past. */}
        <Parallax speed={0.1} className="flex justify-center lg:justify-start">
          <Reveal scale={0.96} duration={1.1}>
            <BeforeAfterCard />
          </Reveal>
        </Parallax>

        {/* Text column */}
        <div>
          <SplitText className="mt-6 font-heading text-4xl leading-tight tracking-tight text-white md:text-5xl">
            We turn chaos into{" "}
            <span className="text-accent-from">clockwork</span>.
          </SplitText>
          <Reveal
            as="p"
            y={24}
            delay={0.12}
            className="mt-5 max-w-lg text-lg font-light leading-relaxed text-body-dim"
          >
            Nexoryn designs automation systems that plug into the tools you
            already use — so data moves itself, leads hear back instantly, and
            your team gets its week back.
          </Reveal>
          <Reveal stagger={0.09} y={28} className="mt-10 flex flex-col gap-6">
            {SOLUTION_POINTS.map((point) => (
              <div key={point.title}>
                <FeatureRow {...point} />
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
