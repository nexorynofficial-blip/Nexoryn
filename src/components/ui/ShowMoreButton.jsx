import { ChevronDown } from "lucide-react";

export function ShowMoreButton({ onClick, label = "Show More" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 rounded-full glass-panel px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-orange-400/40 hover:bg-white/10"
    >
      {label}
      <ChevronDown className="h-4 w-4 text-accent-to" />
    </button>
  );
}
