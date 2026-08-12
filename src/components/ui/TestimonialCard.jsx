import { Avatar, AvatarImage, AvatarFallback } from "./Avatar";

const initials = (name) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

export function TestimonialCard({ author, text, href, className = "" }) {
  const Card = href ? "a" : "div";

  return (
    <Card
      {...(href ? { href } : {})}
      className={`flex max-w-[320px] flex-col rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-start backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/30 sm:p-6 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={author.avatar} alt={author.name} />
          <AvatarFallback>{initials(author.name)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-start">
          <h3 className="font-sans text-base font-semibold leading-none text-white">
            {author.name}
          </h3>
          <p className="mt-1 font-sans text-sm text-white/50">{author.handle}</p>
        </div>
      </div>
      <p className="mt-4 font-sans text-sm text-white/70 sm:text-base">{text}</p>
    </Card>
  );
}
