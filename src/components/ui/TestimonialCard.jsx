import { DefaultAvatar } from "./DefaultAvatar";
import { truncate } from "../../lib/truncate";

export function TestimonialCard({ author, text, href, className = "" }) {
  const Card = href ? "a" : "div";

  return (
    <Card
      {...(href ? { href } : {})}
      className={`flex h-[220px] w-[320px] shrink-0 flex-col rounded-2xl glass-panel p-4 text-start transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/30 sm:p-6 ${className}`}
    >
      <div className="flex items-center gap-3">
        <DefaultAvatar className="h-12 w-12" />
        <div className="flex flex-col items-start">
          <h3 className="font-sans text-base font-semibold leading-none text-white">
            {author.name}
          </h3>
          <p className="mt-1 font-sans text-sm text-white/50">{author.location}</p>
        </div>
      </div>
      <p className="mt-4 font-sans text-sm text-white/70 sm:text-base">
        {truncate(text, 22)}
      </p>
    </Card>
  );
}
