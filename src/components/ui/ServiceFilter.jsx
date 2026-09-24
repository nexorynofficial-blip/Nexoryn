// Segmented pill control, same visual language as the site's other tab/pill
// selectors (Services page's TabBar, Contact's form tabs) — active pill gets
// the brand gradient, inactive ones sit dim on the shared glass surface.
export const SERVICE_TABS = ["Automation", "Web Development", "Graphic Design"];

export function ServiceFilter({ active, onSelect, options = SERVICE_TABS }) {
  return (
    <div className="mx-auto flex w-fit flex-wrap justify-center gap-3">
      {options.map((service) => (
        <button
          key={service}
          type="button"
          onClick={() => onSelect(service)}
          aria-pressed={active === service}
          className={`glass-panel rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-wide transition-all duration-300 sm:px-6 sm:py-3 sm:text-sm ${
            active === service
              ? // .glass-panel's `background`/`border` are plain (unlayered) CSS,
                // which beats Tailwind's own utility layer regardless of class
                // order — without `!` the gradient/border here were silently
                // losing and every pill just looked like the inactive one.
                "border-transparent! bg-gradient-to-r! from-accent-from! to-accent-to! text-black"
              : "text-white/60 hover:text-white"
          }`}
        >
          {service}
        </button>
      ))}
    </div>
  );
}
