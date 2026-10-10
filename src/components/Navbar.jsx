import { useRef, useState } from "react";
import { m, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import nexorynLogo from "../assets/nexoryn-logo-sm.webp";

const LEFT_LINKS = ["HOME", "SERVICES", "PORTFOLIO"];
const RIGHT_LINKS = ["REVIEWS", "ABOUT", "CONTACT"];
const ALL_LINKS = [...LEFT_LINKS, ...RIGHT_LINKS];

const ROUTES = {
  HOME: "/",
  SERVICES: "/services",
  PORTFOLIO: "/portfolio",
  REVIEWS: "/reviews",
  ABOUT: "/about",
  CONTACT: "/contact",
};

// Scroll down past COLLAPSE_AFTER and the notch tucks its links away, leaving
// just the logo; scroll back up by EXPAND_AFTER (or click it) and it opens.
const COLLAPSE_AFTER = 150;
const EXPAND_AFTER = 80;

const spring = { type: "spring", damping: 22, stiffness: 260 };

// Solid black throughout.
const BAR_GRADIENT = "#000";
const NOTCH_GRADIENT = "#000";

/**
 * One side of the notch: an S-curve from the thin top bar down to the notch's
 * full depth. Drawn for the left side; the right one is the same shape mirrored.
 */
function Shoulder({ side, className }) {
  const id = `notch-shoulder-${side}`;
  return (
    <svg
      viewBox="0 0 140 56"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`block shrink-0 ${side === "right" ? "-scale-x-100" : ""} ${className}`}
    >
      <defs>
        <linearGradient id={id} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.55" stopColor="#000" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      </defs>
      <path d="M0,0 H140 V56 C82,56 70,6 0,6 Z" fill={`url(#${id})`} />
    </svg>
  );
}

function NavLink({ label, active, onClick, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative isolate cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] font-bold uppercase tracking-wide transition-colors duration-300 ${
        active ? "text-accent-from" : "text-white hover:text-accent-to"
      } ${className}`}
    >
      {label}
    </button>
  );
}

const linkGroup = {
  expanded: { width: "auto", opacity: 1, transition: { ...spring, opacity: { duration: 0.25, delay: 0.1 } } },
  collapsed: { width: 0, opacity: 0, transition: { ...spring, opacity: { duration: 0.15 } } },
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const lastY = useRef(0);
  const collapsedAt = useRef(0);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = lastY.current;
    if (expanded && y > prev && y > COLLAPSE_AFTER) {
      setExpanded(false);
      setMenuOpen(false);
      collapsedAt.current = y;
    } else if (!expanded && (y < COLLAPSE_AFTER || (y < prev && collapsedAt.current - y > EXPAND_AFTER))) {
      setExpanded(true);
    }
    if (y < prev) collapsedAt.current = Math.max(collapsedAt.current, y);
    lastY.current = y;
  });

  const active =
    ALL_LINKS.find((l) => l !== "HOME" && location.pathname.startsWith(ROUTES[l])) ??
    (location.pathname === "/" ? "HOME" : null);

  const go = (label) => {
    setMenuOpen(false);
    navigate(ROUTES[label]);
  };

  const renderLinks = (links) =>
    links.map((label) => (
      <NavLink key={label} label={label} active={active === label} onClick={() => go(label)} />
    ));

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Thin bar across the full width */}
      <div className="h-1.5 w-full" style={{ background: BAR_GRADIENT }} />

      {/* The notch hangs from the bar, centred */}
      <div className="absolute inset-x-0 top-0 flex justify-center">
        <Shoulder side="left" className="h-11 w-20 lg:h-14 lg:w-36" />

        <m.nav
          aria-label="Main"
          onClick={() => !expanded && setExpanded(true)}
          className={`pointer-events-auto relative flex h-11 items-center lg:h-14 ${
            expanded ? "" : "cursor-pointer"
          }`}
          style={{ background: NOTCH_GRADIENT }}
        >
          {/* Desktop: links either side of the logo */}
          <m.div
            variants={linkGroup}
            initial={false}
            animate={expanded ? "expanded" : "collapsed"}
            className="hidden overflow-hidden lg:block"
          >
            <div className="flex items-center gap-1 pr-6">{renderLinks(LEFT_LINKS)}</div>
          </m.div>

          {/* Mobile: balances the menu button so the logo stays centred */}
          <span aria-hidden="true" className="w-8 lg:hidden" />

          <Link
            to="/"
            onClick={(e) => {
              if (!expanded) {
                e.preventDefault();
                setExpanded(true);
              }
            }}
            aria-label="Nexoryn home"
            className="group flex shrink-0 items-center px-3"
          >
            <m.img
              src={nexorynLogo}
              alt="Nexoryn"
              width={256}
              height={256}
              animate={{ rotate: expanded ? 0 : -360 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="h-9 w-9 transition-transform duration-300 group-hover:scale-110 lg:h-11 lg:w-11"
            />
          </Link>

          <m.div
            variants={linkGroup}
            initial={false}
            animate={expanded ? "expanded" : "collapsed"}
            className="hidden overflow-hidden lg:block"
          >
            <div className="flex items-center gap-1 pl-6">{renderLinks(RIGHT_LINKS)}</div>
          </m.div>

          {/* Mobile / tablet: a menu button beside the logo */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(true);
              setMenuOpen((o) => !o);
            }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-white lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </m.nav>

        <Shoulder side="right" className="h-11 w-20 lg:h-14 lg:w-36" />
      </div>

      {/* Mobile / tablet menu drops out of the notch */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <m.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
              className="pointer-events-auto fixed inset-0 -z-10 bg-black/60 lg:hidden"
            />
            <m.div
              key="panel"
              initial={{ opacity: 0, y: -12, scaleY: 0.9 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -12, scaleY: 0.9 }}
              transition={spring}
              style={{ originY: 0 }}
              className="pointer-events-auto absolute left-1/2 top-11 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-b-2xl bg-black px-3 pb-4 pt-2 shadow-[0_20px_40px_rgba(0,0,0,0.5)] lg:hidden"
            >
              <m.div
                initial="hidden"
                animate="shown"
                variants={{ shown: { transition: { staggerChildren: 0.05 } } }}
                className="grid grid-cols-2 gap-1"
              >
                {ALL_LINKS.map((label) => (
                  <m.div
                    key={label}
                    variants={{ hidden: { opacity: 0, y: -8 }, shown: { opacity: 1, y: 0 } }}
                  >
                    <NavLink
                      label={label}
                      active={active === label}
                      onClick={() => go(label)}
                      className="w-full py-2.5 text-center"
                    />
                  </m.div>
                ))}
              </m.div>
            </m.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
