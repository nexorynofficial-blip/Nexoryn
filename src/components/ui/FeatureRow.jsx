export function FeatureRow({ icon, title, description }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-accent-to">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="mt-0.5 text-sm font-light leading-relaxed text-body-dim">
          {description}
        </p>
      </div>
    </div>
  );
}
