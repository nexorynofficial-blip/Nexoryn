// One lock-screen notification, styled after iOS: app tile, sender, time,
// two lines of message and an unread dot.
export function ProblemNotification({ name, description, icon, color, time }) {
  return (
    <figure className="relative rounded-[1.1rem] border border-white/[0.06] bg-white/[0.09] p-3 backdrop-blur-md">
      <div className="flex items-start gap-2.5">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-[0.6rem]"
          style={{ backgroundColor: color }}
        >
          <span className="text-base">{icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <figcaption className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[13px] font-semibold text-white">{name}</span>
            <span className="shrink-0 text-[10px] text-white/45">{time}</span>
          </figcaption>
          <p className="mt-0.5 pr-4 text-[12px] leading-snug text-white/70">{description}</p>
        </div>
      </div>
      <span
        aria-hidden="true"
        className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-accent-from"
      />
    </figure>
  );
}
