export function ProblemNotification({ name, description, icon, color, time }) {
  return (
    <figure className="glass-panel relative mx-auto min-h-fit w-full max-w-[420px] rounded-2xl p-4 shadow-[0_-20px_80px_-20px_#ffffff10_inset] transition-all duration-200 ease-in-out hover:scale-[1.02] hover:border-orange-400/30">
      <div className="flex flex-row items-center gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl"
          style={{ backgroundColor: color }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center gap-1 text-sm font-medium text-white">
            {name}
            <span className="mx-1 text-white/30">·</span>
            <span className="text-xs text-white/40">{time}</span>
          </figcaption>
          <p className="text-sm font-normal text-white/60">{description}</p>
        </div>
      </div>
    </figure>
  );
}
