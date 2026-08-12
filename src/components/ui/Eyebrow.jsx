export function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2.5 rounded-full border border-accent-from/30 bg-accent-from/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent-to">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-from" />
      {children}
    </span>
  );
}
