import { createContext, useContext } from "react";

/**
 * Whether the preloader has handed off to the page.
 *
 * The hero's entrance has to wait for this: it mounts behind the plate, so
 * animating on mount would spend the whole reveal hidden and the hero would be
 * sitting there already finished when the plate lifts.
 *
 * Defaults to `true` so any page rendered without the provider (or after the
 * intro is gone) still animates normally rather than staying invisible.
 */
const IntroContext = createContext(true);

export const IntroProvider = IntroContext.Provider;

export function useIntroDone() {
  return useContext(IntroContext);
}
