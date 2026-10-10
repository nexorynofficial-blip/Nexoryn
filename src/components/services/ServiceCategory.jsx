import { useState } from "react";
import { AnimatePresence, m } from "framer-motion";
import {
  AppWindow,
  Bot,
  Check,
  ChevronDown,
  Code2,
  Database,
  Film,
  Gauge,
  Layout,
  LayoutTemplate,
  Megaphone,
  Package,
  Palette,
  PenTool,
  PhoneCall,
  Plug,
  ShoppingCart,
  Workflow,
  Zap,
} from "lucide-react";
import Reveal from "../ui/Reveal";

export const ICONS = {
  Zap,
  Code2,
  PenTool,
  Workflow,
  PhoneCall,
  Bot,
  Layout,
  AppWindow,
  ShoppingCart,
  Database,
  Gauge,
  Plug,
  Palette,
  Megaphone,
  LayoutTemplate,
  Package,
  Film,
};

export const pad = (n) => String(n).padStart(2, "0");

// "Web Development" -> ["Web", "Development"]: the last word takes the orange.
export function splitLast(text = "") {
  const words = text.trim().split(" ");
  return words.length > 1 ? [words.slice(0, -1).join(" "), words.at(-1)] : ["", words[0]];
}

const CARD_BG = "bg-[linear-gradient(150deg,#3a1406_0%,#140803_32%,#070707_65%)]";

function IconTile({ icon, active = false, size = "md" }) {
  const Icon = ICONS[icon] ?? Zap;
  const box = size === "lg" ? "h-14 w-14 rounded-2xl" : "h-11 w-11 rounded-xl";
  return (
    <span
      className={`flex shrink-0 items-center justify-center border bg-gradient-to-b from-[#2a1608] to-[#0d0703] text-accent-from transition-[border-color,box-shadow] duration-300 ${box} ${
        active
          ? "border-accent-from/60 shadow-[0_0_24px_-4px_rgba(255,122,26,0.55)]"
          : "border-accent-from/25 shadow-[0_0_18px_-8px_rgba(255,122,26,0.35)]"
      }`}
    >
      <Icon className={size === "lg" ? "h-6 w-6" : "h-5 w-5"} strokeWidth={1.75} />
    </span>
  );
}

function Label({ children }) {
  return (
    <h4 className="font-heading text-xs font-extrabold uppercase tracking-[0.22em] text-accent-to">
      {children}
    </h4>
  );
}

/** Everything about one sub-service: description, process, deliverables, tools. */
function ServiceDetail({ sub, index, total, showHeader = true }) {
  const [lead, last] = splitLast(sub.name);
  return (
    <div>
      {showHeader && (
        <div className="flex items-start gap-4">
          <IconTile icon={sub.icon} active size="lg" />
          <div className="min-w-0">
            <span className="font-mono-tech text-xs font-semibold tracking-[0.2em] text-white/45">
              {pad(index + 1)} / {pad(total)}
            </span>
            <h3 className="mt-1 font-heading text-2xl font-extrabold uppercase leading-tight text-white md:text-3xl">
              {lead}{" "}
              <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">{last}</span>
            </h3>
          </div>
        </div>
      )}

      <p className={`${showHeader ? "mt-6" : ""} text-[15px] leading-relaxed text-body-dim md:text-base`}>{sub.description}</p>

      <div className="mt-8 grid gap-10 xl:grid-cols-[1fr_1.1fr]">
        {/* Process as a numbered timeline */}
        <div>
          <Label>How We Work</Label>
          <ol className="relative mt-5 flex flex-col gap-5">
            <span aria-hidden="true" className="absolute bottom-3 left-[13px] top-3 w-px bg-gradient-to-b from-accent-from/60 via-accent-from/20 to-transparent" />
            {sub.howWeWork?.map((step, i) => (
              <li key={step} className="relative flex gap-4">
                <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent-from/50 bg-[#140803] font-mono-tech text-[11px] font-bold text-accent-from">
                  {i + 1}
                </span>
                <span className="pt-0.5 text-sm leading-relaxed text-white/80">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Deliverables */}
        <div>
          <Label>What You Get</Label>
          <ul className="mt-5 grid gap-x-5 gap-y-3 sm:grid-cols-2">
            {sub.whatYouGet?.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-snug text-white/80">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-from/15">
                  <Check className="h-3 w-3 text-accent-from" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {sub.platforms?.length > 0 && (
        <div className="mt-9 border-t border-white/[0.07] pt-6">
          <Label>Platforms We Use</Label>
          <ul className="mt-4 flex flex-wrap gap-2">
            {sub.platforms.map((p) => (
              <li
                key={p}
                className="rounded-full border border-white/15 bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/85 transition-colors duration-300 hover:border-accent-from/50 hover:text-accent-to"
              >
                {p}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Desktop: sticky list of sub-services on the left, detail panel on the right. */
function Explorer({ category }) {
  const [active, setActive] = useState(0);
  const subs = category.subServices ?? [];
  const sub = subs[active];

  return (
    <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(300px,380px)_1fr]">
      <ul className="sticky top-40 flex flex-col gap-2 self-start">
        {subs.map((s, i) => {
          const on = i === active;
          return (
            <li key={s.id ?? s.name}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-pressed={on}
                className="group relative isolate flex w-full cursor-pointer items-center gap-3.5 rounded-2xl p-2.5 pr-4 text-left"
              >
                {on && (
                  <m.span
                    layoutId={`svc-active-${category.id}`}
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                    className="absolute inset-0 -z-10 rounded-2xl border border-accent-from/30 bg-[linear-gradient(90deg,rgba(107,37,8,0.55)_0%,rgba(42,15,4,0.6)_35%,rgba(10,10,10,0.9)_75%)]"
                  />
                )}
                <IconTile icon={s.icon} active={on} />
                <span
                  className={`font-heading text-[13px] font-extrabold uppercase leading-tight transition-colors duration-300 ${
                    on ? "text-white" : "text-white/55 group-hover:text-white/85"
                  }`}
                >
                  {s.name}
                </span>
                <span className={`ml-auto font-mono-tech text-[11px] ${on ? "text-accent-from" : "text-white/25"}`}>
                  {pad(i + 1)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={`relative min-h-[560px] overflow-hidden rounded-3xl border border-white/[0.08] p-8 xl:p-10 ${CARD_BG}`}>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={active}
            initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {sub && <ServiceDetail sub={sub} index={active} total={subs.length} />}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Phones and tablets: the same sub-services as an accordion. */
function Accordion({ category }) {
  const [open, setOpen] = useState(0);
  const subs = category.subServices ?? [];
  return (
    <ul className="flex flex-col gap-3 lg:hidden">
      {subs.map((s, i) => {
        const on = open === i;
        return (
          <li key={s.id ?? s.name} className={`overflow-hidden rounded-2xl border transition-colors duration-300 ${on ? `border-accent-from/30 ${CARD_BG}` : "border-white/[0.08] bg-black/50"}`}>
            <button
              type="button"
              onClick={() => setOpen(on ? -1 : i)}
              aria-expanded={on}
              className="flex w-full cursor-pointer items-center gap-3.5 p-3 pr-4 text-left"
            >
              <IconTile icon={s.icon} active={on} />
              <span className="font-heading text-[13px] font-extrabold uppercase leading-tight text-white">{s.name}</span>
              <ChevronDown className={`ml-auto h-5 w-5 shrink-0 text-accent-from transition-transform duration-300 ${on ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {on && (
                <m.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="px-4 pb-6 pt-1">
                    <ServiceDetail sub={s} index={i} total={subs.length} showHeader={false} />
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}

// Display names for the discipline headings.
const TITLES = { automation: "AI Automation" };

/** One discipline, boxed in its own dark panel: its name, then its sub-services. */
export default function ServiceCategory({ category, index, highlighted }) {
  const [lead, last] = splitLast(TITLES[category.id] ?? category.serviceName);

  return (
    <section
      id={`service-${category.id}`}
      data-category={category.id}
      className="relative scroll-mt-40 py-3 md:py-4"
    >
      <div className="rounded-[2rem] border border-white/[0.08] bg-[#111111]/95 p-5 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] md:p-8 lg:p-10">
        <Reveal y={28}>
          <div className="flex items-center gap-3">
            <span className="font-mono-tech text-sm font-semibold tracking-[0.2em] text-accent-from">{pad(index + 1)}</span>
            <span className="h-px w-10 bg-white/20" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">Discipline</span>
          </div>
          <h2
            className={`mt-5 whitespace-nowrap font-heading text-[1.75rem] leading-tight tracking-tight text-white sm:text-4xl md:text-6xl ${
              highlighted ? "drop-shadow-[0_0_30px_rgba(255,122,26,0.35)]" : ""
            }`}
          >
            {lead && <>{lead} </>}
            <span className="text-accent-from">{last}</span>
          </h2>
        </Reveal>

        <div className="mt-10 md:mt-12">
          <Explorer category={category} />
          <Accordion category={category} />
        </div>
      </div>
    </section>
  );
}
