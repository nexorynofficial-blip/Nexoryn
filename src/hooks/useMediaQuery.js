import { useEffect, useState } from "react";

// Tracks a CSS media query in JS, for the rare cases a component needs a
// real value at a breakpoint (e.g. numeric px props) rather than a Tailwind
// class swap. SSR-safe: starts false and syncs on mount.
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
