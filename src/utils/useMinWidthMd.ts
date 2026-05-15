import { useSyncExternalStore } from "react";

/** Matches Tailwind `md` (48rem). */
const MD_MIN_WIDTH_QUERY = "(min-width: 48rem)";

/**
 * True when viewport is at least Tailwind `md`.
 * Used only when CSS alone cannot drive a11y attributes (e.g. `aria-hidden` / `inert`).
 */
export function useMinWidthMd(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      const mq = window.matchMedia(MD_MIN_WIDTH_QUERY);
      mq.addEventListener("change", onStoreChange);
      return () => mq.removeEventListener("change", onStoreChange);
    },
    () => window.matchMedia(MD_MIN_WIDTH_QUERY).matches,
    () => false,
  );
}
