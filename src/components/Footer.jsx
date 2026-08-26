import { Link } from "react-router-dom";
import nexorynFullLogo from "../assets/nexoryn-full-logo.png";
import { ContactShortcuts } from "./ui/ContactShortcuts";

// Links get a real href wherever a matching page/account exists; FAQ has no
// dedicated page yet (it lives inline on the Contact page) so it stays an
// inert placeholder.
const COLUMNS = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Portfolio", href: "/portfolio" },
      { label: "Review", href: "/reviews" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    heading: "Socials",
    links: [
      {
        label: "Facebook",
        href: "https://www.facebook.com/profile.php?id=61592138765653",
        external: true,
      },
      {
        label: "Instagram",
        href: "https://www.instagram.com/nexoryn.ai/",
        external: true,
      },
      {
        label: "Threads",
        href: "https://www.threads.com/@nexoryn.ai",
        external: true,
      },
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/company/nexoryn-ai/",
        external: true,
      },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Cookie Policy", href: "/cookie-policy" },
    ],
  },
  {
    heading: "Get Started",
    links: [
      { label: "Book a Call", href: "/contact" },
      { label: "Contact Us", href: "/contact" },
      "FAQ",
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black pb-8 pt-10 sm:pt-16">
      <div className="relative z-10 w-full px-4 md:px-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between lg:gap-12">
          {/* Left: logo + copyright */}
          <div>
            <Link to="/" className="flex items-center" aria-label="Nexoryn home">
              {/* Grayscale + brightened on mobile only — the full-color mark
                  reads too dark/low-contrast against the black footer on
                  small screens; md+ keeps the original logo untouched. */}
              <img
                src={nexorynFullLogo}
                alt="Nexoryn"
                className="h-12 w-auto grayscale brightness-200 md:grayscale-0 md:brightness-100"
              />
            </Link>
            <p className="mt-4 text-sm text-white/50">
              © Nexoryn 2026. All rights reserved.
            </p>
          </div>

          {/* Right: 4 link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:gap-x-8 sm:gap-y-10 md:grid-cols-4 md:gap-x-12 lg:gap-x-16">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                  {col.heading}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => {
                    const label = typeof link === "string" ? link : link.label;
                    const href = typeof link === "string" ? null : link.href;
                    const external = typeof link === "object" && link.external;
                    return (
                      <li key={label}>
                        {external ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-white/60 transition-colors duration-300 hover:text-orange-400"
                          >
                            {label}
                          </a>
                        ) : href ? (
                          <Link
                            to={href}
                            className="text-sm text-white/60 transition-colors duration-300 hover:text-orange-400"
                          >
                            {label}
                          </Link>
                        ) : (
                          <a
                            href="#"
                            onClick={(e) => e.preventDefault()}
                            className="text-sm text-white/60 transition-colors duration-300 hover:text-orange-400"
                          >
                            {label}
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Same component, same spot, on every page — Call Us / WhatsApp Us
            live in the footer instead of floating over page content. */}
        <ContactShortcuts className="mt-8 sm:mt-12" />
      </div>

      {/* Giant faint decorative wordmark, clipped so only the top of the
          letters shows before it's cut off at the section's bottom edge */}
      <div
        aria-hidden="true"
        className="relative mt-10 h-[70px] select-none overflow-hidden text-center sm:h-[110px] sm:mt-14 md:h-[150px] md:mt-16 lg:h-[190px]"
      >
        <span
          className="pointer-events-none absolute inset-x-0 top-0 font-heading-hero leading-none text-white/[0.05]"
          style={{ fontSize: "clamp(4rem, 16vw, 14rem)" }}
        >
          NEXORYN
        </span>
      </div>
    </footer>
  );
}
