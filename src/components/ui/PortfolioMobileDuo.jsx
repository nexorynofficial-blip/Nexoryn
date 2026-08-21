import { Link } from "react-router-dom";

// Mobile-only portfolio teaser: two plain static cards, one after another —
// no scroll/stack animation. One automation project, one web development
// project, so mobile visitors still see both of Nexoryn's core project types
// without the fan/carousel/stack interactions that don't translate well to
// a quick touch-scroll teaser.
function PortfolioCard({ item, label }) {
  return (
    <Link
      to={item.href}
      className="block overflow-hidden rounded-2xl border border-white/15 bg-white/5 shadow-xl backdrop-blur-xl"
    >
      <div className="aspect-[16/10] w-full overflow-hidden">
        <img
          src={item.imageSrc}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="px-4 py-3.5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-accent-to">
          {label}
        </span>
        <p className="mt-1 truncate text-base font-semibold text-white">
          {item.title}
        </p>
      </div>
    </Link>
  );
}

export function PortfolioMobileDuo({ automationItem, webDevItem }) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-5">
      {automationItem && (
        <PortfolioCard item={automationItem} label="Automation" />
      )}
      {webDevItem && (
        <PortfolioCard item={webDevItem} label="Web Development" />
      )}
    </div>
  );
}
