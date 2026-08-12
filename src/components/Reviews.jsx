import { TestimonialsSection } from "./TestimonialsSection";
import SplitText from "./ui/SplitText";
import Reveal from "./ui/Reveal";

const TESTIMONIALS = [
  {
    author: {
      name: "Sarah Mitchell",
      handle: "Ops Manager, Brightline Logistics",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    text: "Nexoryn cut our weekly data entry from 15 hours to almost nothing. The team actually gets to do their jobs now.",
  },
  {
    author: {
      name: "Marcus Chen",
      handle: "Head of Sales, Vantage Group",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    text: "Leads get a reply in under two minutes, day or night. Our close rate jumped within the first month.",
  },
  {
    author: {
      name: "Priya Raghavan",
      handle: "Founder, Loop & Ledger",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    text: "They connected the six tools we'd been juggling manually. Everything just… flows now.",
  },
  {
    author: {
      name: "Dana Kowalski",
      handle: "Support Lead, Fernhill SaaS",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
    text: "Ticket triage is fully automated. Response times went from hours to minutes and the backlog is simply gone.",
  },
  {
    author: {
      name: "Leo Fontaine",
      handle: "Finance Director, Meridian Co",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    text: "Invoices go out on time, reminders send themselves, and we stopped chasing payments entirely.",
  },
  {
    author: {
      name: "Ava Thompson",
      handle: "Marketing Lead, Northbeam",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    text: "The weekly report that used to eat a full day now lands in Slack every Monday at 9am, done.",
  },
  {
    author: {
      name: "Tom Barrett",
      handle: "Owner, Barrett & Co",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    text: "Double bookings vanished the week the new scheduling flow went live. Worth every penny.",
  },
];

export default function Reviews() {
  return (
    <section
      id="reviews"
      className="relative scroll-mt-24 pb-12 pt-24 lg:pb-16 lg:pt-32"
    >
      <div className="flex w-full flex-col items-center px-4 text-center md:px-10">
        <SplitText className="mt-6 max-w-2xl font-heading text-4xl leading-tight tracking-tight text-white md:text-5xl">
          Loved by <span className="text-accent-from">businesses</span> we've
          automated.
        </SplitText>
        <Reveal
          as="p"
          y={24}
          delay={0.12}
          className="mt-5 max-w-xl text-lg font-light leading-relaxed text-body-dim"
        >
          Real feedback from teams who no longer do the busywork.
        </Reveal>
      </div>

      <Reveal y={40} duration={1.1}>
        <TestimonialsSection testimonials={TESTIMONIALS} className="mt-12" />
      </Reveal>

      {/* Soft blend into the CTA section below, mirroring the Hero's own
          bottom-edge fade into the section beneath it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-black md:h-40"
      />
    </section>
  );
}
