import { DefaultAvatar } from "./DefaultAvatar";
import { truncate } from "../../lib/truncate";

export function TestimonialCard({ author, text, href, className = "" }) {
  const Card = href ? "a" : "div";

  return (
    <Card
      {...(href ? { href } : {})}
      className={`flex h-[170px] w-[240px] shrink-0 flex-col rounded-2xl glass-panel p-3 text-start transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/30 sm:h-[220px] sm:w-[320px] sm:p-6 ${className}`}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <DefaultAvatar className="h-9 w-9 sm:h-12 sm:w-12" />
        <div className="flex flex-col items-start">
          <h3 className="font-sans text-sm font-semibold leading-none text-white sm:text-base">
            {author.name}
          </h3>
          <p className="mt-1 font-sans text-xs text-white/50 sm:text-sm">{author.location}</p>
        </div>
      </div>
      <p className="mt-3 font-sans text-xs text-white/70 sm:mt-4 sm:text-base">
        {truncate(text, 22)}
      </p>
    </Card>
  );
}
