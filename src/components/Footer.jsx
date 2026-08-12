import { Link } from "react-router-dom";
import nexorynFullLogo from "../assets/nexoryn-full-logo.png";

// Links get a real href wherever a matching page exists; Socials, Legal, and
// FAQ have no real destination yet (no social accounts or legal pages exist
// on the site) so those stay inert placeholders.
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
    links: ["Facebook", "Instagram", "Behance", "Threads", "LinkedIn"],
  },
  {
    heading: "Legal",
    links: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
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
    <footer className="relative overflow-hidden border-t border-white/10 bg-black pt-16 pb-8">
      <div className="relative z-10 w-full px-4 md:px-10">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          {/* Left: logo + copyright */}
          <div>
            <Link to="/" className="flex items-center" aria-label="Nexoryn home">
              <img src={nexorynFullLogo} alt="Nexoryn" className="h-12 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-white/50">
              © Nexoryn 2026. All rights reserved.
            </p>
          </div>

          {/* Right: 4 link columns */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:gap-x-12 lg:gap-x-16">
            {COLUMNS.map((col) => (
              <div key={col.heading}>
                <h3 className="text-sm font-bold uppercase tracking-wide text-white">
                  {col.heading}
                </h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {col.links.map((link) => {
                    const label = typeof link === "string" ? link : link.label;
                    const href = typeof link === "string" ? null : link.href;
                    return (
                      <li key={label}>
                        {href ? (
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
