import { useEffect, useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  MessageCircleQuestion,
  CalendarClock,
  Rocket,
  CheckCircle2,
  Check,
  Mail,
  Phone,
  MessageCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import FaqAccordion from "../components/ui/FaqAccordion";
import { SectionsBackground } from "../components/SectionsBackground";
import { FloatingInput, FloatingSelect } from "../components/ui/FloatingField";
import Footer from "../components/Footer";
import { sendContactEmail, CONTACT_EMAIL } from "../lib/sendContactEmail";

const EMAIL = CONTACT_EMAIL;
const GMAIL_COMPOSE_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}`;

const PHONE_DISPLAY = "+92 302 3858945";
const PHONE_E164 = "+923023858945";
const PHONE_TEL = `tel:${PHONE_E164}`;
const WHATSAPP_URL = "https://wa.me/923023858945";

const PANEL = "rounded-[2rem] border border-white/[0.08] bg-[#111111]/95 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)]";
const CARD_BG = "bg-[linear-gradient(150deg,#3a1406_0%,#140803_35%,#070707_70%)]";

// Phones dial straight through on tap. Desktop has no dialer, so a click
// there copies the number instead and shows a brief "Copied" confirmation.
function PhoneLink({ className = "font-medium text-accent-to transition-colors duration-300 hover:text-accent-from" }) {
  const [copied, setCopied] = useState(false);

  const handleClick = (e) => {
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    if (isTouchDevice) return;

    e.preventDefault();
    navigator.clipboard?.writeText(PHONE_E164).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <span className="relative inline-flex items-center gap-1">
      <a
        href={PHONE_TEL}
        onClick={handleClick}
        className={className}
      >
        {PHONE_DISPLAY}
      </a>
      <AnimatePresence>
        {copied && (
          <m.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-status-green/90 px-2.5 py-1 text-[10px] font-semibold text-black"
          >
            <Check className="h-3 w-3" />
            Copied
          </m.span>
        )}
      </AnimatePresence>
    </span>
  );
}

const FORMS = [
  {
    id: "question",
    label: "Ask a Question",
    icon: MessageCircleQuestion,
    submitLabel: "Send Message",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Contact Number", type: "tel" },
      { name: "country", label: "Country" },
      { name: "city", label: "City", full: true },
      { name: "message", label: "Message", textarea: true, required: true, full: true },
    ],
  },
  {
    id: "consultation",
    label: "Book a Consultation",
    icon: CalendarClock,
    submitLabel: "Book Consultation",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "company", label: "Company (optional)" },
      { name: "phone", label: "Contact Number", type: "tel" },
      { name: "country", label: "Country" },
      { name: "city", label: "City" },
      { name: "datetime", label: "Preferred Date & Time", required: true, full: true },
      { name: "message", label: "Notes", textarea: true, full: true },
    ],
  },
  {
    id: "start",
    label: "Let's Start",
    icon: Rocket,
    submitLabel: "Start My Project",
    fields: [
      { name: "name", label: "Name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "company", label: "Company", required: true },
      { name: "phone", label: "Contact Number", type: "tel" },
      { name: "country", label: "Country" },
      { name: "city", label: "City" },
      {
        name: "projectType",
        label: "Project Type",
        select: true,
        required: true,
        options: ["Automation", "Web Development", "Graphic Design"],
      },
      {
        name: "budget",
        label: "Budget Range",
        select: true,
        required: true,
        options: ["Under $5K", "$5K – $15K", "$15K – $50K", "$50K+"],
      },
      { name: "details", label: "Project Details", textarea: true, required: true, full: true },
    ],
  },
];

function FormTab({ label, icon: Icon, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative isolate flex flex-1 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors duration-300 lg:text-xs ${
        active ? "text-black" : "text-white/65 hover:text-white"
      }`}
    >
      {active && (
        <m.span
          layoutId="contact-form-pill"
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-accent-from to-accent-to"
        />
      )}
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

function ContactFormPanel() {
  const [activeTab, setActiveTab] = useState(FORMS[0].id);
  const [values, setValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  const currentForm = FORMS.find((f) => f.id === activeTab);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setValues({});
    setSubmitted(false);
    setError(false);
  };

  // Mobile-only dropdown replaces the tab bar — FloatingSelect works off the
  // option's label text, so map back to the form's id from that.
  const handleFormTypeSelect = (e) => {
    const form = FORMS.find((f) => f.label === e.target.value);
    if (form) handleTabClick(form.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  // Spam decoy. The backend has always checked for this field (checkHoneypot in
  // backend/src/middleware/honeypot.ts) but the form never rendered one, so the
  // check could never fire. A real visitor can't see or tab into this; a bot
  // filling every input it finds will, and the server then quietly discards the
  // submission while still answering as though it worked.
  const [honeypot, setHoneypot] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      await sendContactEmail(activeTab, values, honeypot);
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Mobile-only: replaces the tab bar with a compact form-type picker */}
      <div className={`${PANEL} mb-4 p-4 md:hidden`}>
        <FloatingSelect
          label="Choose Form Type"
          name="formType"
          value={currentForm.label}
          onChange={handleFormTypeSelect}
          options={FORMS.map((f) => f.label)}
        />
      </div>

      <div className={`${PANEL} p-5 md:p-8 lg:p-10`}>
        <div className="no-scrollbar hidden gap-1 overflow-x-auto rounded-full border border-white/10 bg-black/60 p-1 md:flex">
          {FORMS.map((form) => (
            <FormTab
              key={form.id}
              label={form.label}
              icon={form.icon}
              active={activeTab === form.id}
              onClick={() => handleTabClick(form.id)}
            />
          ))}
        </div>

        <div className="min-h-[420px] md:mt-8">
          <AnimatePresence mode="wait" initial={false}>
            {submitted ? (
              <m.div
                key="success"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center py-14 text-center"
              >
                <m.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full border border-status-green/30 bg-emerald-500/10"
                >
                  <CheckCircle2 className="h-8 w-8 text-status-green" />
                </m.div>
                <h3 className="mt-5 font-heading text-xl text-white">Message sent</h3>
                <p className="mt-2 max-w-xs text-sm font-light leading-relaxed text-body-dim">
                  Thanks, we'll be in touch shortly.
                </p>
              </m.div>
            ) : (
              <m.form
                key={activeTab}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -12, scale: 0.98 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2"
              >
                {/* Honeypot — positioned off-screen rather than display:none or
                    type="hidden", both of which the better bots know to skip.
                    aria-hidden and tabIndex={-1} keep it away from screen
                    readers and keyboard navigation, so it costs real visitors
                    nothing. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[-9999px] h-0 w-0 overflow-hidden"
                >
                  <label htmlFor="company-website">
                    Do not fill this in
                    <input
                      id="company-website"
                      type="text"
                      name="company-website"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </label>
                </div>

                {currentForm.fields.map((field) => (
                  <div key={field.name} className={field.full ? "sm:col-span-2" : ""}>
                    {field.select ? (
                      <FloatingSelect
                        label={field.label}
                        name={field.name}
                        value={values[field.name] || ""}
                        onChange={handleChange}
                        options={field.options}
                        required={field.required}
                      />
                    ) : (
                      <FloatingInput
                        label={field.label}
                        name={field.name}
                        type={field.type}
                        textarea={field.textarea}
                        value={values[field.name] || ""}
                        onChange={handleChange}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}

                {error && (
                  <p className="text-center text-xs font-medium text-red-400 sm:col-span-2">
                    Something went wrong sending your message — please try
                    again, or reach us directly using the details below.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 w-full rounded-full bg-gradient-to-r from-accent-from to-accent-to py-3.5 text-base font-bold uppercase tracking-wide text-black transition duration-300 hover:scale-[1.02] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:brightness-100 sm:col-span-2"
                >
                  {submitting ? "Sending…" : currentForm.submitLabel}
                </button>
              </m.form>
            )}
          </AnimatePresence>
        </div>

      </div>
    </>
  );
}

/** One way to reach us: icon tile, label, value and an arrow. */
function ContactCard({ icon: Icon, label, children, href, external }) {
  const body = (
    <>
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent-from/30 bg-gradient-to-b from-[#2a1608] to-[#0d0703] text-accent-from shadow-[0_0_24px_-6px_rgba(255,122,26,0.45)]">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">{label}</span>
        <span className="mt-1 block truncate text-[15px] font-semibold text-white">{children}</span>
      </span>
      {href && (
        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/40 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-from" />
      )}
    </>
  );
  const cls = `group flex items-center gap-4 rounded-3xl border border-white/[0.08] p-4 transition duration-500 hover:-translate-y-0.5 hover:border-accent-from/40 ${CARD_BG}`;
  return href ? (
    <a href={href} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined} className={cls}>
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact - Nexoryn";
    // No local scroll reset — the global ScrollToTop already resets on every
    // route change (see ScrollToTop.jsx), so there is nothing to reset here.
  }, []);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-10 w-full px-4 pb-24 pt-32 md:px-10 lg:px-[7.8vw] lg:pt-40">
          {/* Hero */}
          <div className="mx-auto max-w-4xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="font-heading text-4xl leading-tight tracking-tight text-white md:text-6xl"
            >
              Let's build <span className="text-accent-from">something</span>.
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.2}
              animateOnMount
              className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-body-dim"
            >
              Ask a quick question, book a consultation, or tell us about your
              project, pick whichever fits.
            </Reveal>
          </div>

          {/* Form + ways to reach us */}
          <div className="mt-14 grid grid-cols-1 items-start gap-6 md:mt-16 lg:grid-cols-[1.5fr_1fr] lg:gap-8">
            <m.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <ContactFormPanel />
            </m.div>

            <Reveal stagger={0.08} y={24} delay={0.3} animateOnMount className="flex flex-col gap-3 lg:sticky lg:top-28">
              <div className={`${PANEL} p-6 md:p-7`}>
                <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-from">Reach us directly</span>
                <h2 className="mt-3 font-heading text-2xl font-extrabold uppercase leading-tight text-white">
                  Prefer to <span className="bg-gradient-to-r from-accent-from to-accent-to bg-clip-text text-transparent">talk?</span>
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-body-dim">
                  Skip the form and reach the team the way that suits you.
                </p>
              </div>
              <ContactCard icon={Mail} label="Email" href={GMAIL_COMPOSE_URL} external>
                {EMAIL}
              </ContactCard>
              <ContactCard icon={Phone} label="Call">
                <PhoneLink className="text-white transition-colors duration-300 hover:text-accent-to" />
              </ContactCard>
              <ContactCard icon={MessageCircle} label="WhatsApp" href={WHATSAPP_URL} external>
                Message us on WhatsApp
              </ContactCard>
              <ContactCard icon={Clock} label="Response time">
                We typically respond within a few hours.
              </ContactCard>
            </Reveal>
          </div>

          {/* FAQ */}
          <section className={`${PANEL} mt-20 grid grid-cols-1 gap-8 p-6 md:mt-28 md:p-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16 lg:p-14`}>
            <Reveal y={24}>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent-from">FAQ</span>
              <h2 className="mt-4 font-heading text-4xl leading-tight tracking-tight text-white md:text-5xl">
                Frequently asked <span className="text-accent-from">questions</span>
              </h2>
              <p className="mt-5 text-base font-light leading-relaxed text-body-dim">
                Quick answers before you reach out, tap a question to expand.
              </p>
            </Reveal>
            <FaqAccordion />
          </section>
        </div>
      </div>

      <Footer />
    </>
  );
}
