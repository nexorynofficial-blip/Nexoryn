import { useEffect, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  MessageCircleQuestion,
  CalendarClock,
  Rocket,
  CheckCircle2,
} from "lucide-react";
import { blurFadeIn } from "../lib/motion";
import SplitText from "../components/ui/SplitText";
import Reveal from "../components/ui/Reveal";
import { SectionsBackground } from "../components/SectionsBackground";
import { ContactShortcuts } from "../components/ui/ContactShortcuts";
import { FloatingInput, FloatingSelect } from "../components/ui/FloatingField";
import Footer from "../components/Footer";
import contactPhoto from "../assets/contact-photo.png";

const EMAIL = "hello@nexoryn.com";

// `full: true` fields span both grid columns; everything else pairs up two
// per row, so each form reads as a mixed 1-and-2-per-row layout rather than
// a uniform single-column stack.
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

// Cursor-driven parallax + blur fade-in on the left-hand photo. The mask
// fades the right edge (the side facing the form) into the background
// instead of ending in a hard rectangular cut.
function ContactPhoto() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 40, damping: 20, mass: 1 });
  const springY = useSpring(mouseY, { stiffness: 40, damping: 20, mass: 1 });
  const x = useTransform(springX, [-0.5, 0.5], [-10, 10]);
  const y = useTransform(springY, [-0.5, 0.5], [-8, 8]);

  useEffect(() => {
    const handleMove = (e) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", handleMove);
    return () => window.removeEventListener("pointermove", handleMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      variants={blurFadeIn}
      initial="hidden"
      animate="show"
      style={{ x, y }}
      className="relative z-10 h-[280px] w-full overflow-hidden rounded-3xl sm:h-[360px] lg:h-auto lg:min-h-[600px]"
    >
      <img
        src={contactPhoto}
        alt="A member of the Nexoryn team, ready to help"
        className="h-full w-full object-cover"
        style={{ objectPosition: "45% 12%" }}
      />
    </motion.div>
  );
}

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

  const currentForm = FORMS.find((f) => f.id === activeTab);

  const handleTabClick = (id) => {
    setActiveTab(id);
    setValues({});
    setSubmitted(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl md:p-8">
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
              <h3 className="mt-5 font-heading text-xl text-white">
                Message sent
              </h3>
              <p className="mt-2 max-w-xs text-sm font-light leading-relaxed text-body-dim">
                Thanks — we'll be in touch shortly.
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

              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-gradient-to-r from-accent-from to-accent-to py-3.5 text-base font-bold uppercase tracking-wide text-black transition duration-300 hover:scale-[1.02] hover:brightness-110 sm:col-span-2"
              >
                {currentForm.submitLabel}
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
          href={`mailto:${EMAIL}`}
          className="font-medium text-accent-to transition-colors duration-300 hover:text-accent-from"
        >
          {EMAIL}
        </a>
      </p>
    </div>
  );
}

export default function ContactPage() {
  useEffect(() => {
    document.title = "Contact — Nexoryn";
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <div className="relative">
        <SectionsBackground />
        <div className="relative z-10 w-full px-4 pb-24 pt-32 md:px-10 lg:pt-40">
          {/* Header */}
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
              project — pick whichever fits.
            </Reveal>
          </div>

          {/* Photo + form — form column is wider than the photo column */}
          <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-[5fr_6fr] lg:items-stretch lg:gap-12">
            <ContactPhoto />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            >
              <ContactFormPanel />
            </motion.div>
          </div>
        </div>
      </div>

      <ContactShortcuts />
      <Footer />
    </>
  );
}
