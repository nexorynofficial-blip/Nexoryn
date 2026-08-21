import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    id: "services",
    question: "What services does Nexoryn offer?",
    answer:
      "We build workflow automation, AI agents, custom websites and web apps, and brand/graphic design, all tailored to how your business actually runs, not off-the-shelf templates.",
  },
  {
    id: "timeline",
    question: "How long does a typical project take?",
    answer:
      "It really depends on the project details. A small automation build can be delivered in about a week, while a larger website or platform can take anywhere from 3 to 6 weeks depending on the scope. We'll give you a clear timeline after the first consultation.",
  },
  {
    id: "business-size",
    question: "Do you work with small businesses?",
    answer:
      "Yes. Most of our clients are lean teams that want enterprise-grade systems without enterprise headcount. We scope every project to fit your size and budget.",
  },
  {
    id: "process",
    question: "How does the automation process work?",
    answer:
      "We map your current workflow, identify the highest-leverage tasks to automate first, build and test the system with your team, then deploy and iterate until it runs reliably in the background.",
  },
  {
    id: "consultation",
    question: "What's included in a free consultation?",
    answer:
      "A 30-minute call to understand your goals, walk through your current tools and pain points, and outline what we'd automate or build first, with no obligation to move forward.",
  },
];

export default function FaqAccordion({ items = FAQ_ITEMS, className = "" }) {
  const [openId, setOpenId] = useState(null);

  const toggle = (id) => setOpenId((current) => (current === id ? null : id));

  return (
    <div className={`glass-panel overflow-hidden rounded-3xl ${className}`}>
      {items.map((item) => {
        const isOpen = openId === item.id;

        return (
          <div key={item.id} className="border-b border-white/10 last:border-b-0">
            <button
              type="button"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-300 hover:bg-white/[0.03] md:px-8 md:py-6"
            >
              <span className="font-heading text-sm tracking-tight text-white md:text-base">
                {item.question}
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-accent-from transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-6 pb-5 text-sm font-light leading-relaxed text-body-dim md:px-8 md:pb-6 md:text-base">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
