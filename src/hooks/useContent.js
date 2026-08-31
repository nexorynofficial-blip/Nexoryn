import { useEffect, useState } from "react";

/**
 * Renders the bundled static content immediately, then swaps in whatever the
 * API returns once it arrives.
 *
 * Deliberately not a loading state: the static data is already in the bundle
 * and is nearly always identical to what the API will send, so showing a
 * spinner would trade a correct first paint for a slower one. If the API is
 * down the page simply keeps the static copy and nobody notices.
 *
 * @param {() => Promise<T|null>} fetcher async getter from src/lib/content.js
 * @param {T} initial the static value to paint with
 * @returns {T}
 * @template T
 */
export function useContent(fetcher, initial) {
  const [data, setData] = useState(initial);

  useEffect(() => {
    let alive = true;
    fetcher()
      .then((result) => {
        if (alive && result) setData(result);
      })
      .catch(() => {
        /* keep the static value */
      });
    return () => {
      alive = false;
    };
    // Getters are module-level and stable; re-running on identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return data;
}

export default useContent;
