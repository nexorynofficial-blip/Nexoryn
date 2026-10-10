import { AnimatedList } from "./ui/AnimatedList";
import { ProblemNotification } from "./ProblemNotification";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";
import { PhoneMockup } from "./ui/PhoneMockup";
import { HighlightCard } from "./ui/HighlightCard";
import {
  ClipboardIcon,
  TrendingDownIcon,
  PlugIcon,
  ClockIcon,
} from "./ui/Icons";

const PAIN_POINTS = [
  {
    icon: <ClipboardIcon />,
    title: "Manual",
    highlight: "Data Entry",
    description:
      "Hours lost every week to copy-paste busywork.",
  },
  {
    icon: <TrendingDownIcon />,
    title: "Leads",
    highlight: "Going Cold",
    description:
      "Slow follow-ups quietly kill your deals.",
  },
  {
    icon: <PlugIcon />,
    title: "Disconnected",
    highlight: "Tools",
    description:
      "CRMs and inboxes that don't connect.",
  },
  {
    icon: <ClockIcon />,
    title: "Inconsistent",
    highlight: "Response",
    description:
      "Customers wait hours, or days, for a reply.",
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


// Hand-drawn style label with an arrow pointing at the phone.
function Annotation({ children, className, arrowClassName, flip = false }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute hidden xl:block ${className}`}>
      <p className="whitespace-nowrap font-hand text-2xl leading-tight text-white/80">{children}</p>
      <svg
        viewBox="0 0 60 50"
        className={`mt-1 h-12 w-14 text-accent-from ${flip ? "-scale-x-100" : ""} ${arrowClassName ?? ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 4 C 6 26, 22 40, 52 44" />
        <path d="M42 36 L52 44 L41 49" />
      </svg>
    </div>
  );
}

export default function Problems() {
  return (
    <section id="problems" className="relative scroll-mt-24 py-24 lg:py-32">
      <div className="relative mx-auto grid w-full items-center gap-16 px-4 md:px-8 lg:grid-cols-2 lg:gap-10 wide:grid-cols-[1.1fr_1fr] lg:px-5 xl:pl-[200px]">
        {/* Pain points — the heading is a small lead-in; the points are the content */}
        <div>
          <SplitText className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl">
            Sound <span className="text-accent-from">Familiar?</span>
          </SplitText>
          <Reveal
            as="p"
            y={24}
            delay={0.12}
            className="mt-6 max-w-xl text-lg font-light leading-relaxed text-body-dim"
          >
            Every hour your team spends copying data, chasing follow-ups, and
            juggling disconnected tools is an hour not spent growing.
          </Reveal>
          <Reveal stagger={0.09} y={28} className="mt-20 grid gap-4 sm:grid-cols-2">
            {PAIN_POINTS.map((point) => (
              <div key={point.title}>
                <HighlightCard {...point} />
              </div>
            ))}
          </Reveal>
        </div>

        {/* The same client messages, arriving on a phone's lock screen */}
        <Reveal y={40} duration={1.1} className="relative flex justify-center">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-from/20 blur-[90px]"
          />
          <div className="relative">
            <Annotation className="right-full top-[24%] mr-6 text-right" arrowClassName="ml-auto">
              Drowning in
              <br />
              Messages
            </Annotation>
            <Annotation className="left-full top-[40%] ml-6" flip>
              No Time
              <br />
              to Reply
            </Annotation>
            <Annotation className="left-full top-[70%] ml-6" flip>
              Losing
              <br />
              Clients
            </Annotation>

            <PhoneMockup className="h-[680px] w-[340px] max-w-full">
              <AnimatedList
                items={FEED_ITEMS}
                delay={2600}
                maxVisible={6}
                initialCount={4}
              />
            </PhoneMockup>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
