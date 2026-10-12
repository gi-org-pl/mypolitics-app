const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Whether movement on screen has to be left out. It is left out when the
// taker asked the system for less of it, and also where nothing can say what
// they asked for: movement is an extra, so the answer without a source is no.
export const prefersReducedMotion = (): boolean =>
  typeof window.matchMedia !== "function" ||
  window.matchMedia(REDUCED_MOTION_QUERY).matches;
