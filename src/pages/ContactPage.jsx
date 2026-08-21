import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircleQuestion,
  CalendarClock,
  Rocket,
  CheckCircle2,
  Check,
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

const PHONE_DISPLAY = "0334-1236462";
const PHONE_E164 = "+923341236462";
const PHONE_TEL = `tel:${PHONE_E164}`;

// Phones dial straight through on tap. Desktop has no dialer, so a click
// there copies the number instead and shows a brief "Copied" confirmation.
function PhoneLink() {
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
        className="font-medium text-accent-to transition-colors duration-300 hover:text-accent-from"
      >
        {PHONE_DISPLAY}
      </a>
      <AnimatePresence>
        {copied && (
          <motion.span
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute -top-8 left-1/2 flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-status-green/90 px-2.5 py-1 text-[10px] font-semibold text-black"
          >
            <Check className="h-3 w-3" />
            Copied
          </motion.span>
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
      className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap pb-3 text-xs font-semibold transition-colors duration-300 sm:text-sm ${
        active ? "text-accent-from" : "text-white/50 hover:text-white/80"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="font-heading tracking-tight">{label}</span>
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left rounded-full bg-gradient-to-r from-accent-from to-accent-to"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);
    try {
      await sendContactEmail(activeTab, values);
      setSubmitted(true);
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8">
      <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-white/10">
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

      <div className="mt-6 min-h-[420px]">
        <AnimatePresence mode="wait" initial={false}>
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-center py-14 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-status-green/30 bg-emerald-500/10"
              >
                <CheckCircle2 className="h-8 w-8 text-status-green" />
              </motion.div>
              <h3 className="mt-5 font-heading text-xl text-white">Message sent</h3>
              <p className="mt-2 max-w-xs text-sm font-light leading-relaxed text-body-dim">
                Thanks, we'll be in touch shortly.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key={activeTab}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2"
            >
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
            </motion.form>
          )}
        </AnimatePresence>
      </div>

      <p className="mt-6 text-center text-xs text-white/40">
        We typically respond within a few hours.
      </p>
      <p className="mt-2 text-center text-xs text-white/40">
        Prefer email?{" "}
        <a
          href={GMAIL_COMPOSE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-accent-to transition-colors duration-300 hover:text-accent-from"
        >
          {EMAIL}
        </a>
      </p>
      <p className="mt-2 text-center text-xs text-white/40">
        Prefer call? <PhoneLink />
      </p>
    </div>
  );
}

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact - Nexoryn";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-10 w-full px-4 pb-24 pt-32 md:px-10 lg:pt-40">
          <div className="mx-auto max-w-4xl text-center">
            <SplitText
              as="h1"
              animateOnMount
              delay={0.08}
              className="mt-6 font-heading text-2xl leading-tight tracking-tight text-white sm:text-4xl md:text-6xl"
            >
              Let's build <span className="text-accent-from">something</span>.
            </SplitText>
            <Reveal
              as="p"
              y={24}
              delay={0.2}
              animateOnMount
              className="mt-5 text-lg font-light leading-relaxed text-body-dim"
            >
              Ask a quick question, book a consultation, or tell us about your
              project, pick whichever fits.
            </Reveal>
          </div>

          <div className="mx-auto mt-14 grid max-w-7xl grid-cols-1 items-start gap-10 lg:grid-cols-5 lg:gap-12">
            <Reveal y={32} delay={0.1} animateOnMount className="lg:col-span-2">
              <h2 className="font-heading text-2xl tracking-tight text-white md:text-3xl">
                Frequently asked <span className="text-accent-from">questions</span>
              </h2>
              <p className="mt-3 text-sm font-light leading-relaxed text-body-dim md:text-base">
                Quick answers before you reach out, tap a question to expand.
              </p>
              <FaqAccordion className="mt-8" />
            </Reveal>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-3"
            >
              <ContactFormPanel />
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
