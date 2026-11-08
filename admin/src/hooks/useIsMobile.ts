import { useEffect, useState } from "react";

// The exact query Tailwind compiles `max-md:` to, so this always agrees with
// every `max-md:` class in the app.
const QUERY = "not all and (min-width: 48rem)";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
