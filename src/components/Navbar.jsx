import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLenis } from "lenis/react";
import nexorynFullLogo from "../assets/nexoryn-full-logo.png";
import MagneticButton from "./ui/MagneticButton";
import { gsap, useGSAP } from "../lib/gsap";

const LINKS = ["HOME", "SERVICES", "PORTFOLIO", "REVIEWS", "ABOUT", "CONTACT"];

// Links that navigate to a real route; the rest stay in-page decorative items
const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  SERVICES: "/services",
  PORTFOLIO: "/portfolio",
  REVIEWS: "/reviews",
  CONTACT: "/contact",
};

function NavLink({ label, active, onClick, mobile = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      className={`group relative w-fit cursor-pointer pb-1.5 font-semibold uppercase tracking-[0.15em] transition-colors duration-300 ${
        active ? "text-accent-from" : "text-white hover:text-accent-to"
      } ${mobile ? "text-base" : "text-sm"}`}
    >
      {label}
      {/* Hover underline, drawn only for inactive links so it can't fight the
          active one. Sweeps in from the left and out to the right rather than
          retracting, so moving along the nav reads as one continuous motion. */}
      {!active && (
        <span className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-accent-from/60 to-accent-to/60 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
      )}
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 w-full origin-left rounded-full bg-gradient-to-r from-accent-from to-accent-to"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </motion.button>
  );
}

function BookACallButton({ className = "", compact = false }) {
  return (
    <MagneticButton strength={0.28} className={className}>
      <Link
        to="/contact"
        className={`pressable block rounded-full bg-gradient-to-r from-accent-from to-accent-to font-bold uppercase tracking-wide text-black shadow-[0_0_0_0_rgba(255,122,26,0.5)] transition-[box-shadow,filter] duration-300 hover:shadow-[0_0_30px_0_rgba(255,122,26,0.45)] hover:brightness-110 ${
          compact ? "px-4 py-2 text-xs" : "px-7 py-3 text-sm"
        }`}
      >
        Book a Call
      </Link>
    </MagneticButton>
  );
}

export default function Navbar() {
  const [clicked, setClicked] = useState("HOME");
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const lenis = useLenis();

  // Hide going down, reveal going up, and thicken the backdrop once the page
  // has left the hero. Driven off Lenis's direction rather than raw scroll
  // deltas, which flicker at the top of a fling.
  useGSAP(
    () => {
      if (!lenis) return undefined;

      const showHide = gsap.quickTo(headerRef.current, "yPercent", {
        duration: 0.45,
        ease: "power3.out",
      });

      const onScroll = () => {
        const y = lenis.scroll;
        // The menu is anchored to the header — hiding it mid-interaction
        // would rip an open menu off the screen.
        const hide = !menuOpen && y > 220 && lenis.direction === 1;
        showHide(hide ? -110 : 0);

        gsap.to(navRef.current, {
          backgroundColor:
            y > 40 ? "rgba(0,0,0,0.62)" : "rgba(0,0,0,0.35)",
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
      };

      lenis.on("scroll", onScroll);
      return () => lenis.off("scroll", onScroll);
    },
    { dependencies: [lenis, menuOpen] }
  );

  // The underline reflects the current route when we're on a routed page,
  // otherwise it falls back to the last-clicked in-page item on the homepage.
  const routeActive = location.pathname.startsWith("/about")
    ? "ABOUT"
    : location.pathname.startsWith("/services")
    ? "SERVICES"
    : location.pathname.startsWith("/portfolio")
    ? "PORTFOLIO"
    : location.pathname.startsWith("/reviews")
    ? "REVIEWS"
    : location.pathname.startsWith("/contact")
    ? "CONTACT"
    : null;
  const active = routeActive ?? clicked;

  const handleClick = (label) => {
    setClicked(label);
    setMenuOpen(false);
    if (ROUTES[label]) navigate(ROUTES[label]);
  };

  return (
    <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 will-change-transform">
      <nav
        ref={navRef}
        className="relative z-10 flex items-center justify-between bg-black/35 px-4 py-4 backdrop-blur-md md:px-10"
      >
        {/* Full logo (icon + wordmark baked into one image) — desktop only.
            Left-most flex child, exactly as before md: this element is the
            only one visible there, so desktop position/markup is untouched. */}
        <Link
          to="/"
          onClick={() => setClicked("HOME")}
          className="hidden items-center md:flex md:group"
          aria-label="Nexoryn home"
        >
          <img
            src={nexorynFullLogo}
            alt="Nexoryn"
            className="h-9 w-auto transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:group-hover:scale-105"
          />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-10 md:flex">
          {LINKS.map((label) => (
            <NavLink
              key={label}
              label={label}
              active={active === label}
              onClick={() => handleClick(label)}
            />
          ))}
        </div>

        <BookACallButton className="hidden md:inline-block" />

        {/* Hamburger — mobile only, first visible flex child there so it
            pins to the left edge (justify-between) */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          className="flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-0.5 w-6 rounded-full bg-white"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0, x: -8 } : { opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="h-0.5 w-6 rounded-full bg-white"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-0.5 w-6 rounded-full bg-white"
          />
        </button>

        {/* Mobile-only Book a Call — no logo in the mobile bar at all now,
            so this is the last (and only other) visible flex child, pinning
            to the right edge opposite the hamburger */}
        <BookACallButton compact className="md:hidden" />
      </nav>

      {/* Mobile menu — full-width animated panel with a dimming backdrop and
          a staggered reveal of each link, so it reads as one deliberate
          motion rather than the whole block popping in at once. */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 z-0 bg-black/70 backdrop-blur-sm md:hidden"
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 overflow-hidden border-t border-glass-border bg-black/80 backdrop-blur-xl md:hidden"
            >
              <motion.div
                variants={{
                  open: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
                  closed: {},
                }}
                initial="closed"
                animate="open"
                className="flex flex-col items-start gap-6 px-6 py-10 text-left"
              >
                {LINKS.map((label) => (
                  <motion.div
                    key={label}
                    variants={{
                      closed: { opacity: 0, y: -12 },
                      open: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    <NavLink
                      label={label}
                      mobile
                      active={active === label}
                      onClick={() => handleClick(label)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
