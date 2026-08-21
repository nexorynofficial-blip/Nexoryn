export function DefaultAvatar({ className = "" }) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-amber-400 ${className}`}
    >
      <svg viewBox="0 0 24 24" className="absolute inset-0 h-full w-full" fill="black" aria-hidden="true">
        <circle cx="12" cy="9" r="4.6" />
        <path d="M1 25c0-6.9 4.9-12.5 11-12.5S23 18.1 23 25H1z" />
      </svg>
    </div>
  );
}
