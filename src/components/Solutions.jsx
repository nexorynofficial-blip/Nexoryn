import BeforeAfterCard from "./BeforeAfterCard";
import { RefreshIcon, ZapIcon, WorkflowIcon, ClockIcon } from "./ui/Icons";
import { HighlightCard } from "./ui/HighlightCard";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import Parallax from "./ui/Parallax";

// The answer to each pain point in the Problems section, in the same order.
const SOLUTION_POINTS = [
  {
    icon: <RefreshIcon />,
    title: "Auto",
    highlight: "Data Sync",
    description: "Records synced across your whole stack.",
  },
  {
    icon: <ZapIcon />,
    title: "Instant",
    highlight: "Follow-Up",
    description: "Every new lead hears back within minutes.",
  },
  {
    icon: <WorkflowIcon />,
    title: "Connected",
    highlight: "Tools",
    description: "One pipeline from first click to paid invoice.",
  },
  {
    icon: <ClockIcon />,
    title: "24/7",
    highlight: "Replies",
    description: "AI agents reply day and night.",
  },
];

export default function Solutions() {
  return (
    <section id="solutions" className="relative scroll-mt-24 py-24 lg:py-32">
      {/* Mirrors the Problems section: there the copy sits left with 200px
          before it, here it sits right with 200px after it. */}
      <div className="relative mx-auto grid w-full items-center gap-16 px-4 md:px-8 lg:grid-cols-2 lg:gap-10 lg:px-5 wide:grid-cols-[1fr_1.1fr] xl:pr-[200px]">
        {/* Before/After card — left on desktop, after the copy on mobile (the
            copy reads first, the card illustrates it second). The gentle
            parallax drift is what keeps the two columns from reading as one
            flat slab as they scroll past. */}
        <Parallax speed={0.1} className="order-last flex justify-center lg:order-first">
          <Reveal scale={0.96} duration={1.1}>
            <BeforeAfterCard />
          </Reveal>
        </Parallax>

        {/* Copy — same type scale and card style as "Sound Familiar?" */}
        <div className="order-first lg:order-last">
          <SplitText className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl">
            Chaos, <span className="text-accent-from">Solved.</span>
          </SplitText>
          <Reveal
            as="p"
            y={24}
            delay={0.12}
            className="mt-6 max-w-xl text-lg font-light leading-relaxed text-body-dim"
          >
            Automations that plug into the tools you already use, so your team
            gets its week back.
          </Reveal>
          <Reveal stagger={0.09} y={28} className="mt-20 grid gap-4 sm:grid-cols-2">
            {SOLUTION_POINTS.map((point) => (
              <div key={point.title}>
                <HighlightCard {...point} />
              </div>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
