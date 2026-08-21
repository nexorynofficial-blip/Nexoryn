import { FeatureRow } from "./ui/FeatureRow";
import { AnimatedList } from "./ui/AnimatedList";
import { ProblemNotification } from "./ProblemNotification";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import {
  ClipboardIcon,
  TrendingDownIcon,
  PlugIcon,
  ClockIcon,
} from "./ui/Icons";

const PAIN_POINTS = [
  {
    icon: <ClipboardIcon />,
    title: "Manual data entry",
    description:
      "Hours lost every week to copy-paste work that software should be doing.",
  },
  {
    icon: <TrendingDownIcon />,
    title: "Leads going cold",
    description:
      "Slow follow-up quietly kills deals before your team even opens them.",
  },
  {
    icon: <PlugIcon />,
    title: "Disconnected tools",
    description:
      "CRMs, spreadsheets, and inboxes that don't talk to each other.",
  },
  {
    icon: <ClockIcon />,
    title: "Inconsistent response times",
    description:
      "Customers wait hours, or days, depending on who's on shift.",
  },
];

const NOTIFICATIONS = [
  {
    name: "Sarah - Ops Manager",
    description: "We're spending 15+ hrs/week on manual data entry",
    icon: "🧾",
    color: "#b45309",
    time: "2m ago",
  },
  {
    name: "Marcus - Sales Lead",
    description: "Losing leads because follow-ups take too long",
    icon: "📉",
    color: "#c2410c",
    time: "5m ago",
  },
  {
    name: "Priya - Founder",
    description: "Our tools don't talk to each other, everything's manual",
    icon: "🔌",
    color: "#57534e",
    time: "9m ago",
  },
  {
    name: "Dana - Support Lead",
    description: "Support tickets are piling up, no automation",
    icon: "📨",
    color: "#475569",
    time: "14m ago",
  },
  {
    name: "Leo - Finance",
    description: "Invoicing is a mess, always chasing payments",
    icon: "💸",
    color: "#a16207",
    time: "18m ago",
  },
  {
    name: "Ava - Marketing",
    description: "Weekly reports take a full day to assemble",
    icon: "📊",
    color: "#7c2d12",
    time: "23m ago",
  },
  {
    name: "Tom - Owner",
    description: "Double bookings keep slipping through the calendar",
    icon: "🗓️",
    color: "#44403c",
    time: "31m ago",
  },
  {
    name: "Nina - Ops",
    description: "Onboarding a new client takes 12 separate steps",
    icon: "🧩",
    color: "#92400e",
    time: "36m ago",
  },
];

const FEED_ITEMS = NOTIFICATIONS.map((n) => (
  <ProblemNotification key={n.name} {...n} />
));

export default function Problems() {
  return (
    <section id="problems" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="relative mx-auto grid w-full max-w-[1400px] items-center gap-[60px] px-4 md:px-[80px] lg:grid-cols-2 lg:items-stretch">
        {/* Text column */}
        <div className="order-last lg:order-first">
          <SplitText className="mt-6 font-heading text-4xl leading-tight tracking-tight text-white md:text-5xl">
            Running a <span className="text-accent-from">business</span>{" "}
            shouldn't feel this{" "}
            <span className="text-accent-from">chaotic</span>.
          </SplitText>
          <Reveal
            as="p"
            y={24}
            delay={0.12}
            className="mt-5 max-w-lg text-lg font-light leading-relaxed text-body-dim"
          >
            Every hour your team spends copying data, chasing follow-ups, and
            juggling disconnected tools is an hour not spent growing. Sound
            familiar?
          </Reveal>
          <Reveal stagger={0.09} y={28} className="mt-10 flex flex-col gap-6">
            {PAIN_POINTS.map((point) => (
              <div key={point.title}>
                <FeatureRow {...point} />
              </div>
            ))}
          </Reveal>
        </div>

        {/* Live notification feed */}
        <Reveal
          y={40}
          duration={1.1}
          className="relative order-first h-[560px] overflow-hidden px-1 pt-2 lg:order-last lg:h-auto [mask-image:linear-gradient(to_bottom,black_65%,transparent_98%)]"
        >
          <AnimatedList
            items={FEED_ITEMS}
            delay={1800}
            maxVisible={7}
            initialCount={4}
          />
        </Reveal>
      </div>
    </section>
  );
}
