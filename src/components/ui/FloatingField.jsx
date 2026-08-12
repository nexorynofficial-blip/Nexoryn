import { useState } from "react";
import { ChevronDown } from "lucide-react";

const fieldClasses =
  "peer w-full rounded-lg border border-white/10 bg-white/[0.04] px-4 pb-2.5 pt-6 text-sm text-white outline-none transition-colors duration-300 focus:border-orange-400/50";

const labelClasses = (active) =>
  `pointer-events-none absolute left-4 font-sans transition-all duration-200 ${
    active ? "top-2.5 text-[11px] text-accent-to" : "top-1/2 -translate-y-1/2 text-sm text-white/40"
  }`;

export function FloatingInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  textarea = false,
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  const Tag = textarea ? "textarea" : "input";

  return (
    <div className="relative">
      <Tag
        name={name}
        type={textarea ? undefined : type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        rows={textarea ? 4 : undefined}
        className={`${fieldClasses} ${textarea ? "resize-none" : ""}`}
      />
      <label className={labelClasses(active)}>
        {label}
        {required ? " *" : ""}
      </label>
    </div>
  );
}

export function FloatingSelect({ label, name, value, onChange, options, required = false }) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        required={required}
        className={`${fieldClasses} appearance-none`}
      >
        <option value="" disabled hidden />
        {options.map((opt) => (
          <option key={opt} value={opt} className="bg-night text-white">
            {opt}
          </option>
        ))}
      </select>
      <label className={labelClasses(active)}>
        {label}
        {required ? " *" : ""}
      </label>
      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
    </div>
  );
}
